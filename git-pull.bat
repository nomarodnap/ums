@echo off
echo ========================================
echo      Git Pull ^& Build Script
echo ========================================
echo.

echo [1/4] Pulling latest changes from repository...
git pull

echo.
echo [2/4] Installing dependencies (just in case)...
call npm install

echo.
echo [3/4] Generating Prisma Client...
call npx prisma generate

echo.
echo [4/4] Building project...
call npm run build

echo.
echo ========================================
echo        All Done!
echo ========================================
pause
