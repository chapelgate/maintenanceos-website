param(
    [string]$EvidenceRoot = "evidence",
    [string]$PythonPath = ".\.venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"

function Write-JsonFile {
    param([string]$Path, $Value)
    $Value | ConvertTo-Json -Depth 10 | Set-Content -Path $Path -Encoding UTF8
}

function Invoke-Captured {
    param([string]$Name, [string]$CommandLine)
    $stdout = Join-Path $script:evidenceDir "$Name.stdout.txt"
    $stderr = Join-Path $script:evidenceDir "$Name.stderr.txt"
    $started = Get-Date
    $process = Start-Process -FilePath "powershell" -WindowStyle Hidden -Wait -PassThru `
        -RedirectStandardOutput $stdout -RedirectStandardError $stderr `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $CommandLine)
    $script:commands += [ordered]@{
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

$root = (Resolve-Path -LiteralPath ".").Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$script:evidenceDir = Join-Path $EvidenceRoot "local-gap-evidence-$stamp"
New-Item -ItemType Directory -Path $script:evidenceDir -Force | Out-Null
$script:commands = @()

$pythonExit = 0
try {
    $pythonVersion = & $PythonPath --version 2>&1
    $pythonExit = $LASTEXITCODE
} catch {
    $pythonVersion = @($_.Exception.Message)
    $pythonExit = 1
}
if ($pythonExit -ne 0) {
    Set-Content -Path (Join-Path $script:evidenceDir "python-blocked.txt") -Value ($pythonVersion -join "`n") -Encoding UTF8
    Write-JsonFile -Path (Join-Path $script:evidenceDir "gap-evidence-summary.json") -Value ([ordered]@{
        generated_at_local = (Get-Date).ToString("s")
        root = $root
        python_path = $PythonPath
        python_available = $false
        python_error = ($pythonVersion -join "`n")
        no_external_actions = $true
        realtime_enabled = $false
        commands = @()
    })
    Write-Host "BLOCKED: Python failed to start. Evidence directory: $script:evidenceDir"
    exit 2
}

Invoke-Captured -Name "acceptance-harness" -CommandLine "& '$PythonPath' local_acceptance_harness.py --output '$script:evidenceDir\acceptance-harness-results.json' --stop-on-hard-failure"
Invoke-Captured -Name "dashboard-synthetic" -CommandLine "& '$PythonPath' verify_dashboard_synthetic.py --database '$script:evidenceDir\dashboard-synthetic.db' --output '$script:evidenceDir\dashboard-synthetic.json'"
Invoke-Captured -Name "mutation-detection" -CommandLine "& '$PythonPath' run_mutation_detection.py --output-dir '$script:evidenceDir\mutations-current' --python '$PythonPath'"

Write-JsonFile -Path (Join-Path $script:evidenceDir "gap-evidence-summary.json") -Value ([ordered]@{
    generated_at_local = (Get-Date).ToString("s")
    root = $root
    python_path = $PythonPath
    python_version = ($pythonVersion -join "`n")
    no_external_actions = $true
    realtime_enabled = $false
    commands = $script:commands
})

$failed = @($script:commands | Where-Object { $_.exit_code -ne 0 })
if ($failed.Count -gt 0) {
    Write-Host "FAILED: one or more gap-evidence commands failed."
    Write-Host "Evidence directory: $script:evidenceDir"
    exit 1
}

Write-Host "PASSED: local gap evidence completed."
Write-Host "Evidence directory: $script:evidenceDir"
exit 0
