@echo off
cls

echo 🚀 Starting FlexJobs Development Server...
echo 📍 Server will run on http://localhost:3003
echo 🔧 Ports 3000 and 3001 are now free for your other projects
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env file has correct port
findstr /c:"PORT=3003" .env >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Updating .env file to use port 3003...
    powershell -Command "(gc .env) -replace 'PORT=300[01]', 'PORT=3003' | Out-File -encoding ASCII .env"
) else (
    echo ✅ Environment configured for port 3003
)

echo.
echo 🎯 Starting server in development mode...
echo 📱 Your site will be available at:
echo    http://localhost:3003
echo.
echo 💡 Pro tip: Your other projects can now use ports 3000 and 3001!
echo.

REM Start the development server
npm run dev
