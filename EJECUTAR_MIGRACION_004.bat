@echo off
echo.
echo ====================================================
echo  RUAH LABS - Migracion 004 (Fix RLS Recursion)
echo ====================================================
echo.
echo 1. Abre este link en tu navegador:
echo    https://supabase.com/dashboard/project/txrpxzsqqomdlnxmyvxn/sql/new
echo.
echo 2. Copia TODO el contenido del archivo:
echo    migrations\004_fix_rls_recursion.sql
echo.
echo 3. Pegalo en el editor de Supabase y presiona RUN
echo.
echo Abriendo el archivo SQL para que lo copies...
echo.
type "%~dp0migrations\004_fix_rls_recursion.sql"
echo.
echo ====================================================
echo Copiando al portapapeles...
type "%~dp0migrations\004_fix_rls_recursion.sql" | clip
echo LISTO - El SQL ya esta en tu portapapeles (Ctrl+V para pegar)
echo.
start "" "https://supabase.com/dashboard/project/txrpxzsqqomdlnxmyvxn/sql/new"
echo.
pause
