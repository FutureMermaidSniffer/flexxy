@echo off
echo FlexJobs Scraping Setup and Test
echo ================================
echo.

echo Installing required dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Running setup validation tests...
node scripts/test-scraping-setup.js
if %errorlevel% neq 0 (
    echo.
    echo SETUP INCOMPLETE: Please fix the issues above
    pause
    exit /b 1
)

echo.
echo ================================
echo Setup completed successfully!
echo ================================
echo.
echo Available scraping commands:
echo   npm run scrape:jobs     - Full comprehensive scraping
echo   npm run scrape:basic    - Basic scraping (no API keys needed)
echo   npm run scrape:schedule - Start scheduled scraping service
echo.
echo To run your first scraping session:
echo   npm run scrape:jobs
echo.
pause
