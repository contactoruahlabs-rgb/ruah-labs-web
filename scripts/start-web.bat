@echo off
cd /d "%~dp0..\src"
node "%~dp0..\node_modules\http-server\bin\http-server" . -p 8000 --cors -c-1
