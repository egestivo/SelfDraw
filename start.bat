@echo off
echo ========================================
echo   SelfDraw - Setup y Ejecucion Local
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo Descarga la version LTS y ejecuta el instalador.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js instalado: 
node --version
echo.

REM Verificar si existe package.json
if not exist package.json (
    echo [ERROR] No se encontro package.json
    echo Asegurate de estar en la carpeta correcta del proyecto.
    pause
    exit /b 1
)

REM Verificar si node_modules existe
if not exist node_modules (
    echo [INFO] Instalando dependencias...
    echo Esto puede tomar unos minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Fallo la instalacion de dependencias
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente
    echo.
)

echo ========================================
echo   Iniciando servidor de desarrollo...
echo ========================================
echo.
echo El servidor estara disponible en:
echo   http://localhost:8888
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el servidor
call npm run dev
