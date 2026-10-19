@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-BlackDuckSEWorkspace-Intelligence-Robot-v22.3.3.1.ps1"
exit /b %ERRORLEVEL%
