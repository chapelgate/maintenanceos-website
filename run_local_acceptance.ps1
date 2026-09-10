param(
    [string]$EvidenceRoot = "evidence",
    [string]$PythonPath = ".\.venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)] [string]$Path,
        [Parameter(Mandatory = $true)] $Value
    )
    $Value | ConvertTo-Json -Depth 8 | Set-Content -Path $Path -Encoding UTF8
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)] [string]$Root,
        [Parameter(Mandatory = $true)] [string]$Path
    )
    $rootUri = [System.Uri]((Resolve-Path -LiteralPath $Root).Path.TrimEnd('\') + '\')
    $pathUri = [System.Uri]((Resolve-Path -LiteralPath $Path).Path)
    return [System.Uri]::UnescapeDataString($rootUri.MakeRelativeUri($pathUri).ToString()).Replace('/', '\')
}

$root = (Resolve-Path -LiteralPath ".").Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$evidenceDir = Join-Path $EvidenceRoot "local-acceptance-$stamp"
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

$summary = [ordered]@{
    generated_at_local = (Get-Date).ToString("s")
    root = $root
    git_available = $false
    git_status = "not_a_git_repository"
    python_path = $PythonPath
    python_available = $false
    commands = @()
    blockers = @()
}

try {
    $gitProbe = & git -C $root status --short --branch 2>&1
    if ($LASTEXITCODE -eq 0) {
        $summary.git_available = $true
        $summary.git_status = ($gitProbe -join "`n")
    } else {
        $summary.git_status = ($gitProbe -join "`n")
    }
} catch {
    $summary.git_status = $_.Exception.Message
}

$excludeParts = @(
    ".venv",
    "evidence",
    ".pytest_cache",
    "__pycache__",
    ".codex_disposable_critical_regression_20260906_224315"
)
$excludeNames = @(".env", "maintenanceos_v1.db")
$manifestItems = @()
$pendingDirectories = New-Object System.Collections.Generic.Queue[string]
$pendingDirectories.Enqueue($root)
$activeFiles = @()
while ($pendingDirectories.Count -gt 0) {
    $directory = $pendingDirectories.Dequeue()
    Get-ChildItem -LiteralPath $directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.PSIsContainer) {
            if (-not ($excludeParts -contains $_.Name)) {
                $pendingDirectories.Enqueue($_.FullName)
            }
            return
        }
        if (-not ($excludeNames -contains $_.Name)) {
            $activeFiles += $_
        }
    }
}
$activeFiles |
    Sort-Object FullName |
    ForEach-Object {
        $relative = Get-RelativePath -Root $root -Path $_.FullName
        $hash = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
        $manifestItems += [ordered]@{
            path = $relative.Replace('\', '/')
            sha256 = $hash.Hash.ToLowerInvariant()
            bytes = $_.Length
        }
    }

$manifestText = ($manifestItems | ForEach-Object { "$($_.path):$($_.sha256):$($_.bytes)" }) -join "`n"
$manifestBytes = [System.Text.Encoding]::UTF8.GetBytes($manifestText)
$sha = [System.Security.Cryptography.SHA256]::Create()
$sourceDigest = [System.BitConverter]::ToString($sha.ComputeHash($manifestBytes)).Replace("-", "").ToLowerInvariant()
$manifest = [ordered]@{
    generated_at_local = (Get-Date).ToString("s")
    active_file_count = $manifestItems.Count
    active_source_sha256 = $sourceDigest
    files = $manifestItems
}
Write-JsonFile -Path (Join-Path $evidenceDir "source-manifest.json") -Value $manifest
Set-Content -Path (Join-Path $evidenceDir "source-manifest.sha256") -Value ($sourceDigest + "`n") -Encoding ASCII

try {
    $version = & $PythonPath --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $summary.python_available = $true
        $summary.python_version = ($version -join "`n")
    } else {
        $summary.python_error = ($version -join "`n")
        $summary.blockers += "Python interpreter failed to start."
    }
} catch {
    $summary.python_error = $_.Exception.Message
    $summary.blockers += "Python interpreter failed to start."
}

function Invoke-CapturedCommand {
    param(
        [Parameter(Mandatory = $true)] [string]$Name,
        [Parameter(Mandatory = $true)] [string]$CommandLine
    )
    $stdout = Join-Path $evidenceDir "$Name.stdout.txt"
    $stderr = Join-Path $evidenceDir "$Name.stderr.txt"
    $started = Get-Date
    $process = Start-Process -FilePath "powershell" -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command", $CommandLine
    )
    $summary.commands += [ordered]@{
        name = $Name
        command = $CommandLine
        exit_code = $process.ExitCode
        started_at_local = $started.ToString("s")
        finished_at_local = (Get-Date).ToString("s")
        stdout = (Split-Path -Leaf $stdout)
        stderr = (Split-Path -Leaf $stderr)
    }
    return $process.ExitCode
}

if ($summary.python_available) {
    Invoke-CapturedCommand -Name "pytest" -CommandLine "& '$PythonPath' -m pytest -q"
    Invoke-CapturedCommand -Name "readiness-local-closed" -CommandLine "& '$PythonPath' readiness.py --profile local-closed"
    Invoke-CapturedCommand -Name "backup" -CommandLine "& '$PythonPath' backup_restore.py backup '$evidenceDir\maintenanceos_local_backup.db'"
    Invoke-CapturedCommand -Name "backup-verify" -CommandLine "& '$PythonPath' backup_restore.py verify '$evidenceDir\maintenanceos_local_backup.db'"
    Invoke-CapturedCommand -Name "backup-restore" -CommandLine "& '$PythonPath' backup_restore.py restore '$evidenceDir\maintenanceos_local_backup.db' '$evidenceDir\restore_probe.db'"
} else {
    Set-Content -Path (Join-Path $evidenceDir "validation-blocked.txt") -Encoding UTF8 -Value @(
        "Local acceptance validation was blocked before Python commands could run.",
        "Python path: $PythonPath",
        "Error: $($summary.python_error)"
    )
}

$summary.source_manifest = "source-manifest.json"
$summary.active_file_count = $manifestItems.Count
$summary.active_source_sha256 = $sourceDigest
$summary.no_external_actions = $true
Write-JsonFile -Path (Join-Path $evidenceDir "acceptance-summary.json") -Value $summary

if ($summary.blockers.Count -gt 0) {
    Write-Host "BLOCKED: $($summary.blockers -join '; ')"
    Write-Host "Evidence directory: $evidenceDir"
    exit 2
}

$failed = @($summary.commands | Where-Object { $_.exit_code -ne 0 })
if ($failed.Count -gt 0) {
    Write-Host "FAILED: one or more validation commands failed."
    Write-Host "Evidence directory: $evidenceDir"
    exit 1
}

Write-Host "PASSED: local acceptance validation completed."
Write-Host "Evidence directory: $evidenceDir"
exit 0
