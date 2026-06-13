@echo off
echo Iniciando servidor RUAH LABS en http://localhost:8000/src/index.html
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.
cd /d "%~dp0"
npx http-server . -p 8000 --cors -c-1
pause
