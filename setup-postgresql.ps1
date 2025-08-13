# PostgreSQL Installation and Database Setup Script for FlexJob.UK
# Windows PowerShell Version

Write-Host "🚀 FlexJob.UK PostgreSQL Setup Script (Windows)" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "This script requires administrator privileges. Please run PowerShell as Administrator."
    exit 1
}

# Check if Chocolatey is installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Info "Installing Chocolatey package manager..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Status "Chocolatey installed successfully!"
}

# Install PostgreSQL using Chocolatey
Write-Info "Installing PostgreSQL..."
choco install postgresql -y --params '/Password:postgres /Port:5433'

Write-Status "PostgreSQL installed successfully!"

# Wait for service to start
Write-Info "Waiting for PostgreSQL service to start..."
Start-Sleep -Seconds 10

# Database configuration
$DB_NAME = "flexjobs_db"
$DB_USER = "flexjobs_user"
$DB_PASSWORD = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_})

Write-Info "Creating database and user..."

# Create SQL script
$sqlScript = @"
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
"@

# Save SQL script to file
$sqlScript | Out-File -FilePath "setup_db.sql" -Encoding UTF8

# Execute SQL script
$env:PGPASSWORD = "postgres"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5433 -U postgres -f setup_db.sql

# Clean up SQL script
Remove-Item "setup_db.sql"

Write-Status "Database '$DB_NAME' and user '$DB_USER' created successfully!"

# Test connection
Write-Info "Testing database connection..."
$env:PGPASSWORD = $DB_PASSWORD
$testResult = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5433 -U $DB_USER -d $DB_NAME -c "SELECT 'Connection successful!' as status;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Status "Database connection test successful!"
} else {
    Write-Error "Database connection test failed!"
    Write-Host $testResult
    exit 1
}

# Generate random secrets
function Generate-RandomString {
    param($Length = 32)
    return -join ((65..90) + (97..122) + (48..57) | Get-Random -Count $Length | ForEach-Object {[char]$_})
}

$JWT_SECRET = Generate-RandomString -Length 64
$SESSION_SECRET = Generate-RandomString -Length 64

# Create .env file
Write-Info "Creating .env configuration..."

$envContent = @"
# FlexJob.UK Production Configuration
NODE_ENV=production
PORT=3003

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Domain Configuration
DOMAIN=flexjob.uk
BASE_URL=https://flexjob.uk

# Security
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@flexjob.uk
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@flexjob.uk

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# SSL (Update paths for Windows)
SSL_CERT_PATH=./ssl/flexjob.uk.crt
SSL_KEY_PATH=./ssl/flexjob.uk.key
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Status ".env.production file created!"

# Display summary
Write-Host ""
Write-Host "🎉 PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Info "Database Details:"
Write-Host "  Database Name: $DB_NAME"
Write-Host "  Database User: $DB_USER"
Write-Host "  Database Password: $DB_PASSWORD"
Write-Host "  Database Port: 5433"
Write-Host ""
Write-Info "Configuration Files:"
Write-Host "  .env.production - Production environment variables"
Write-Host ""
Write-Warning "IMPORTANT SECURITY NOTES:"
Write-Host "  1. Store the database password securely"
Write-Host "  2. Update SMTP settings in .env.production"
Write-Host "  3. Copy .env.production to .env when ready"
Write-Host ""
Write-Info "Next Steps:"
Write-Host "  1. Copy-Item .env.production .env"
Write-Host "  2. npm install"
Write-Host "  3. node check-production-db.js"
Write-Host "  4. node run-production-migrations.js"
Write-Host "  5. npm start"
Write-Host ""
Write-Status "PostgreSQL setup completed successfully!"
