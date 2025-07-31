@echo off
REM Metadata Remover - Windows Batch Script
REM Usage: metadata_remover.bat [path] [options]

echo.
echo ================================
echo    Metadata Remover Tool
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if script exists
if not exist "%~dp0metadata_remover.py" (
    echo ERROR: metadata_remover.py not found in current directory
    pause
    exit /b 1
)

REM Install dependencies if needed
echo Checking dependencies...
python -c "import PIL, ffmpeg" >nul 2>&1
if errorlevel 1 (
    echo Installing required dependencies...
    pip install -r "%~dp0requirements.txt"
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM If no arguments, show usage
if "%~1"=="" (
    echo Usage Examples:
    echo   %~n0 "C:\path\to\file.jpg"
    echo   %~n0 "C:\path\to\photos" -r
    echo   %~n0 "C:\path\to\project" --recursive --verbose
    echo.
    echo Options:
    echo   -r, --recursive    Process directories recursively
    echo   --no-backup       Don't create backup files
    echo   -v, --verbose     Show detailed output
    echo.
    echo Drag and drop files/folders onto this batch file to process them!
    echo.
    pause
    exit /b 0
)

REM Run the Python script with all arguments
echo Processing: %1
echo.
python "%~dp0metadata_remover.py" %*

echo.
echo Processing complete!
pause
