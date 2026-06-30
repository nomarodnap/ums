@echo off
echo ========================================
echo        Git Push Script
echo ========================================
echo.

REM Prompt for commit message
set /p commitMsg="Enter commit message: "

REM If commit message is empty, use a default one
if "%commitMsg%"=="" (
    set commitMsg="Auto update"
    echo Using default commit message: "Auto update"
)

echo.
echo Adding files...
git add .

echo.
echo Committing with message: "%commitMsg%"
git commit -m "%commitMsg%"

echo.
echo Pushing to repository...
git push

echo.
echo ========================================
echo        Done!
echo ========================================
pause
