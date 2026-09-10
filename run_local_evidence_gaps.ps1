param(
    [string]$EvidenceRoot = "evidence",
    [string]$PythonPath = ".\.venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"

function Invoke-CapturedCommand {
    param(
        [Parameter(Mandatory = $true)] [string]$Name,
        [Parameter(Mandatory = $true)] [string]$CommandLine,
        [Parameter(Mandatory = $true)] [string]$EvidenceDir
    )
    $stdout = Join-Path $EvidenceDir "$Name.stdout.txt"
    $stderr = Join-Path $EvidenceDir "$Name.stderr.txt"
    $started = Get-Date
    $process = Start-Process -FilePath "powershell" -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-Command", $CommandLine
    )
    return [ordered]@{
        name = $Name
        command = $CommandLine
        exit_code = $process.ExitCode
        started_at_local = $started.ToString("s")
        finished_at_local = (Get-Date).ToString("s")
        stdout = (Split-Path -Leaf $stdout)
        stderr = (Split-Path -Leaf $stderr)
    }
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$evidenceDir = Join-Path $EvidenceRoot "local-evidence-gaps-$stamp"
New-Item -ItemType Directory -Path $evidenceDir -Force | Out-Null

$scenarioInput = Join-Path $evidenceDir "gemini_scenarios_1_90.reconstructed.jsonl"
$harnessJson = Join-Path $evidenceDir "acceptance-harness-current.json"
$harnessSummary = Join-Path $evidenceDir "acceptance-harness-current.txt"
$dashboardJson = Join-Path $evidenceDir "dashboard-synthetic-smoke.json"
$dashboardDb = Join-Path $evidenceDir "dashboard-synthetic.db"

$summary = [ordered]@{
    generated_at_local = (Get-Date).ToString("s")
    evidence_dir = $evidenceDir
    python_path = $PythonPath
    commands = @()
    no_external_actions = $true
    realtime_enabled = $false
}

$summary.commands += Invoke-CapturedCommand -Name "acceptance-harness" -EvidenceDir $evidenceDir -CommandLine "& '$PythonPath' acceptance_harness.py --write-default-input '$scenarioInput' --input '$scenarioInput' --json-output '$harnessJson' --summary-output '$harnessSummary' --stop-on-hard-failure"
$summary.commands += Invoke-CapturedCommand -Name "mutation-evidence" -EvidenceDir $evidenceDir -CommandLine "& '$PythonPath' scripts\run_mutation_evidence.py --root . --evidence-dir '$evidenceDir' --python '$PythonPath' --scenario-input '$scenarioInput'"
$summary.commands += Invoke-CapturedCommand -Name "dashboard-synthetic-smoke" -EvidenceDir $evidenceDir -CommandLine "& '$PythonPath' scripts\dashboard_synthetic_smoke.py '$dashboardJson' '$dashboardDb'"

$failed = @($summary.commands | Where-Object { $_.exit_code -ne 0 })
$summary.passed = ($failed.Count -eq 0)
$summary | ConvertTo-Json -Depth 8 | Set-Content -Path (Join-Path $evidenceDir "local-evidence-gaps-summary.json") -Encoding UTF8

if ($failed.Count -gt 0) {
    Write-Host "FAILED: one or more local evidence gap commands failed."
    Write-Host "Evidence directory: $evidenceDir"
    exit 1
}

Write-Host "PASSED: local evidence gaps closed."
Write-Host "Evidence directory: $evidenceDir"
exit 0
