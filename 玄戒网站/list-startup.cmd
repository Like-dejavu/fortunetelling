@echo off
setlocal
set "DIR=%~dp0"
set "OUT=%DIR%startup-report.txt"
set "TMP=%DIR%tasks-all.tmp"

break > "%OUT%"

echo === HKCU Run ===>> "%OUT%"
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === HKLM Run ===>> "%OUT%"
reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === HKCU RunOnce ===>> "%OUT%"
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === StartupApproved (HKCU Run) ===>> "%OUT%"
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === StartupApproved (HKCU StartupFolder) ===>> "%OUT%"
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\StartupFolder" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === User Startup folder ===>> "%OUT%"
dir /b "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === Common Startup folder ===>> "%OUT%"
dir /b "%ProgramData%\Microsoft\Windows\Start Menu\Programs\StartUp" >> "%OUT%" 2>&1

echo.>> "%OUT%"
echo === Scheduled tasks matching chatgpt / openai / gpt ===>> "%OUT%"
schtasks /query /fo csv /nh > "%TMP%" 2>&1
findstr /i "chatgpt openai gpt" "%TMP%" >> "%OUT%" 2>&1
if exist "%TMP%" del "%TMP%"

echo.>> "%OUT%"
echo === Done ===>> "%OUT%"

echo.
echo Report written to:
echo   %OUT%
echo.
echo Send that file back and the exact entry can be identified.
echo.
pause
