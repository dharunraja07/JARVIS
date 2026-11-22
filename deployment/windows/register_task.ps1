# ==============================================================================
# J.A.R.V.I.S. Windows Task Scheduler Registration Script
# Registers background companion process to launch silently on user logon
# ==============================================================================

$TaskName = "JARVIS_Windows_Companion"
$ProjectDir = (Get-Item "$PSScriptRoot\..\..").FullName
$UvPath = (Get-Command uv -ErrorAction SilentlyContinue).Source

if (-not $UvPath) {
    Write-Host "[!] 'uv' executable not found in PATH. Please install uv or specify path." -ForegroundColor Red
    Exit 1
}

$Action = New-ScheduledTaskAction `
    -Execute $UvPath `
    -Argument "run python src/windows_companion.py" `
    -WorkingDirectory $ProjectDir

$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Description "J.A.R.V.I.S. Windows Host Hardware Diagnostics & Cloud Telemetry Relay"
    
    Write-Host "[✓] Successfully registered '$TaskName' in Windows Task Scheduler." -ForegroundColor Green
    Write-Host "[✓] Task will automatically run silently on user logon." -ForegroundColor Cyan
} catch {
    Write-Host "[!] Failed to register scheduled task: $_" -ForegroundColor Red
}
