@echo off
REM Run Database Migration Script for Windows
REM This script runs the database migration locally

echo 🚀 Running FlexJobs database migration...
echo ==========================================

REM Run migration script
echo 📦 Running migration script...
node database/migrations/migrate.js

REM Check if migration was successful
if %ERRORLEVEL% EQU 0 (
  echo ✅ Migration completed successfully!
) else (
  echo ❌ Migration failed!
  exit /b 1
)

echo ==========================================
echo ✨ Database setup complete!
echo You can now start the application with:
echo npm run start
