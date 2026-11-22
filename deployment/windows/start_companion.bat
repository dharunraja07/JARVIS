@echo off
REM ============================================================================
REM J.A.R.V.I.S. Windows Companion Launcher
REM Starts local hardware telemetry service in virtual environment
REM ============================================================================
cd /d "%~dp0\..\.."
echo [J.A.R.V.I.S.] Starting Windows Companion Service...
uv run python src/windows_companion.py
pause
