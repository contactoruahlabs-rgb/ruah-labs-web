@echo off
echo Copiando migracion SQL al portapapeles...
type "%~dp0migrations\FULL_MIGRATION.sql" | clip
echo.
echo LISTO - El SQL ya esta en tu portapapeles (Ctrl+V para pegar)
echo.
echo Ahora ve a:
echo https://supabase.com/dashboard/project/txrpxzsqqomdlnxmyvxn/sql/new
echo.
echo Pega con Ctrl+V y haz clic en "Run"
echo.
pause
