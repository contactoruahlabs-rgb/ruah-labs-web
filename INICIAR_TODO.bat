@echo off
cd /d "%~dp0"

echo Deteniendo servidores anteriores...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>&1
timeout /t 1 /nobreak >nul

echo Iniciando API Server (puerto 3001)...
start "RUAH API" cmd /k "%~dp0scripts\start-api.bat"
timeout /t 2 /nobreak >nul

echo Iniciando Web Server (puerto 8000)...
start "RUAH WEB" cmd /k "%~dp0scripts\start-web.bat"

echo.
echo  Web:  http://localhost:8000
echo  API:  http://localhost:3001/api/health
echo.
pause
