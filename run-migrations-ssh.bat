@echo off
REM FlexJob.UK Remote Migration Runner (Windows Batch)
REM Run this from Windows Command Prompt to execute migrations on your server

title FlexJob.UK Remote Migration Runner

echo.
echo ====================================================
echo FlexJob.UK Remote Migration Runner (Windows)
echo ====================================================
echo.

REM Configuration (modify these for your setup)
set SERVER=flexjob.uk
set USER=root
set PROJECT_PATH=/root/flexxy

echo Testing SSH connection to %SERVER%...
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no %USER%@%SERVER% "echo SSH connection successful"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Cannot connect to server %SERVER%
    echo Please check:
    echo   - Server is running and accessible
    echo   - SSH keys are configured
    echo   - Username and server address are correct
    pause
    exit /b 1
)

echo SUCCESS: Connected to %SERVER%
echo.

echo Checking project directory...
ssh %USER%@%SERVER% "test -d %PROJECT_PATH% && echo Project directory found"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Project directory %PROJECT_PATH% not found
    pause
    exit /b 1
)

echo.
echo Pulling latest code...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && git pull origin uk"

echo.
echo Installing dependencies...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && npm install --production"

echo.
echo Testing database connection...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/test-connection.js"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Database connection failed
    echo Please check database configuration on server
    pause
    exit /b 1
)

echo.
echo ========================================
echo Running Database Migrations
echo ========================================
echo.

echo 1. Running create-core-schema.js...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/migrations/create-core-schema.js"

echo.
echo 2. Running add-salary-type-column.js...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/migrations/add-salary-type-column.js"

echo.
echo 3. Running add-tags-column.js...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/migrations/add-tags-column.js"

echo.
echo 4. Running create_profile_submissions_table.js...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/migrations/create_profile_submissions_table.js"

echo.
echo 5. Running add-recruiting-consultants-fixed.js...
ssh %USER%@%SERVER% "cd %PROJECT_PATH% && node database/migrations/add-recruiting-consultants-fixed.js"

echo.
echo ========================================
echo Post-Migration Tasks
echo ========================================
echo.

echo Restarting FlexJobs application...
ssh %USER%@%SERVER% "pm2 restart flexjobs-uk 2>nul || echo Application restart attempted"

echo.
echo Checking application status...
ssh %USER%@%SERVER% "pm2 status"

echo.
echo Testing application health...
ssh %USER%@%SERVER% "curl -f http://localhost:3005/health >nul 2>&1 && echo Health check PASSED || echo Health check FAILED"

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Summary:
echo   - Server: %SERVER%
echo   - Project: %PROJECT_PATH%
echo   - All migrations executed
echo   - Application restarted
echo.
echo Next steps:
echo   1. Visit: https://%SERVER%
echo   2. Test admin dashboard
echo   3. Test profile form submission
echo.
echo Troubleshooting:
echo   - SSH to server: ssh %USER%@%SERVER%
echo   - Check logs: ssh %USER%@%SERVER% "cd %PROJECT_PATH% && pm2 logs flexjobs-uk"
echo.

set /p openBrowser="Open https://%SERVER% in browser? (y/N): "
if /i "%openBrowser%"=="y" (
    start https://%SERVER%
)

echo.
echo Press any key to exit...
pause >nul
