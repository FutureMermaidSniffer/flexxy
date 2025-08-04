# FlexJobs PostgreSQL Setup Script
# Run this script after PostgreSQL installation

Write-Host "🐘 FlexJobs PostgreSQL Database Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuration
$DB_NAME = "flexjobs"
$DB_USER = "flexjobs_user"
$DB_PASSWORD = "flexjobs_secure_password_2024"  # Change this!
$POSTGRES_PATH = "C:\Program Files\PostgreSQL\17\bin"

# Function to check if PostgreSQL is installed
function Test-PostgreSQLInstalled {
    return Test-Path "$POSTGRES_PATH\psql.exe"
}

# Function to add PostgreSQL to PATH
function Add-PostgreSQLToPath {
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$POSTGRES_PATH*") {
        Write-Host "📝 Adding PostgreSQL to PATH..." -ForegroundColor Yellow
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$POSTGRES_PATH", "User")
        $env:PATH += ";$POSTGRES_PATH"
        Write-Host "✅ PostgreSQL added to PATH" -ForegroundColor Green
    }
}

# Function to test database connection
function Test-DatabaseConnection {
    param($User, $Database = "postgres")
    
    try {
        $env:PGPASSWORD = $DB_PASSWORD
        & "$POSTGRES_PATH\psql.exe" -U $User -d $Database -c "\q" 2>$null
        return $?
    }
    catch {
        return $false
    }
    finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

# Main setup process
try {
    # Check if PostgreSQL is installed
    if (-not (Test-PostgreSQLInstalled)) {
        Write-Host "❌ PostgreSQL not found at $POSTGRES_PATH" -ForegroundColor Red
        Write-Host "Please install PostgreSQL first using:" -ForegroundColor Yellow
        Write-Host "winget install PostgreSQL.PostgreSQL.17" -ForegroundColor Cyan
        exit 1
    }

    Write-Host "✅ PostgreSQL found!" -ForegroundColor Green

    # Add to PATH
    Add-PostgreSQLToPath

    # Check if PostgreSQL service is running
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service -Name "postgresql*" -ErrorAction SilentlyContinue
        Start-Sleep 3
    }

    # Prompt for postgres superuser password
    Write-Host "`n🔑 Setting up database..." -ForegroundColor Cyan
    Write-Host "You'll be prompted for the postgres superuser password."
    Write-Host "This was set during PostgreSQL installation.`n" -ForegroundColor Yellow

    # Create database and user using psql
    $sqlCommands = @"
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the new database
\c $DB_NAME

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- Show databases and users
\l
\du

-- Exit
\q
"@

    # Save SQL commands to temporary file
    $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

    Write-Host "📝 Executing database setup commands..." -ForegroundColor Cyan
    
    # Execute SQL commands
    & "$POSTGRES_PATH\psql.exe" -U postgres -f $tempSqlFile

    # Clean up temp file
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

    # Test connection with new user
    Write-Host "`n🧪 Testing database connection..." -ForegroundColor Cyan
    if (Test-DatabaseConnection -User $DB_USER -Database $DB_NAME) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not verify connection, but database may be set up correctly." -ForegroundColor Yellow
    }

    # Create .env file with database configuration
    Write-Host "`n📄 Creating .env configuration..." -ForegroundColor Cyan
    
    $envContent = @"
# Database Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
"@

    $envFile = Join-Path (Get-Location) ".env.database"
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✅ Database configuration saved to .env.database" -ForegroundColor Green
    
    # Final instructions
    Write-Host "`n🎉 Database setup completed!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Database Name: $DB_NAME" -ForegroundColor Cyan
    Write-Host "Username: $DB_USER" -ForegroundColor Cyan
    Write-Host "Password: $DB_PASSWORD" -ForegroundColor Cyan
    Write-Host "Connection URL: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}" -ForegroundColor Cyan
    
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the DATABASE_URL to your .env file" -ForegroundColor White
    Write-Host "2. Run: npm run migrate" -ForegroundColor White
    Write-Host "3. Start your application: npm start" -ForegroundColor White
    
    Write-Host "`n🔧 Useful Commands:" -ForegroundColor Yellow
    Write-Host "Connect to database: psql -U $DB_USER -d $DB_NAME" -ForegroundColor White
    Write-Host "List databases: psql -U postgres -c '\l'" -ForegroundColor White
    Write-Host "List users: psql -U postgres -c '\du'" -ForegroundColor White

} catch {
    Write-Host "❌ Error during setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error and try again." -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
