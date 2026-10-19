@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Run-BlackDuckSEWorkspace-Full-Robot-v22.3.1.4.ps1" %*
exit /b %ERRORLEVEL%
