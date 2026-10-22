@echo off
setlocal
set "DSH=E:\deepseekharness\resources\runtime\cli\bin\dsh.cmd"

echo ============================================================
echo  DSH plugin swap
echo    remove : @ace-zone/dsh-market
echo    add    : dshmarket
echo ============================================================
echo.
echo IMPORTANT: quit DeepSeek Harness completely before proceeding.
echo The profile must not be in use.
echo.
pause

echo.
echo [1/2] removing @ace-zone/dsh-market ...
call "%DSH%" plugin --profile desktop remove @ace-zone/dsh-market
if errorlevel 1 (
  echo.
  echo [WARN] remove failed - see output above.
  echo        If it says the profile is in use, quit DSH and rerun.
  echo.
  pause
)

echo.
echo [2/2] adding dshmarket ...
call "%DSH%" plugin --profile desktop add dshmarket
if errorlevel 1 (
  echo.
  echo [FAILED] add dshmarket failed - copy the output above.
  echo.
  pause
  exit /b 1
)

echo.
echo Done. Start DeepSeek Harness again to load the new market.
echo.
pause
