@echo off
echo ============================================
echo  RUAH LABS - Ejecutar Migraciones Supabase
echo ============================================
echo.

set DB_URL=postgresql://postgres:Ru4hl4bs%%21%%21.@db.txrpxzsqqomdlnxmyvxn.supabase.co:5432/postgres
set SQL_FILE=%~dp0migrations\FULL_MIGRATION.sql
set LOG_FILE=%~dp0migrations\migration_result.txt

echo Ejecutando... (resultado en migration_result.txt)
echo.

node "%~dp0scripts\run-migrations-pg.cjs" > "%LOG_FILE%" 2>&1
set EXIT_CODE=%ERRORLEVEL%

type "%LOG_FILE%"
echo.

if %EXIT_CODE% EQU 0 (
    echo ============================================
    echo  EXITO - Migraciones ejecutadas
    echo ============================================
    echo EXITO >> "%LOG_FILE%"
) else (
    echo ============================================
    echo  Revisa migration_result.txt para detalles
    echo ============================================
    echo ERROR (codigo %EXIT_CODE%) >> "%LOG_FILE%"
)

echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
