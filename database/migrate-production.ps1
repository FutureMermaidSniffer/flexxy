# FlexJobs Database Migration Script for Windows PowerShell
# This script ensures all database tables are created and migrations are applied

param(
    [string]$EnvFile = ".env"
)

Write-Host "🗄️  FlexJobs Database Migration Starting..." -ForegroundColor Green
Write-Host "=============================================="

# Load environment variables from .env file
if (Test-Path $EnvFile) {
    Write-Host "📁 Loading environment from: $EnvFile"
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  Warning: $EnvFile not found, using defaults" -ForegroundColor Yellow
}

# Database connection parameters
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "flexjobs_db" }

Write-Host "📋 Database Configuration:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST"
Write-Host "   Port: $DB_PORT"
Write-Host "   User: $DB_USER"
Write-Host "   Database: $DB_NAME"
Write-Host ""

# Set PGPASSWORD for non-interactive operations
$env:PGPASSWORD = $DB_PASSWORD

# Function to run SQL file
function Run-SqlFile {
    param($FilePath, $Description)
    
    if (Test-Path $FilePath) {
        Write-Host "   📄 Running: $Description" -ForegroundColor Yellow
        & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $FilePath -q
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Completed: $Description" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Error in: $Description" -ForegroundColor Red
            throw "Migration failed at: $Description"
        }
    } else {
        Write-Host "   ⚠️  Warning: File not found: $FilePath" -ForegroundColor Yellow
    }
}

# Function to run SQL command
function Run-SqlCommand {
    param($Command, $Description)
    
    Write-Host "   📄 Running: $Description" -ForegroundColor Yellow
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $Command -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Completed: $Description" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error in: $Description" -ForegroundColor Red
        throw "Migration failed at: $Description"
    }
}

try {
    # Check if PostgreSQL is accessible
    Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Cyan
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT version();" -q > $null
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot connect to PostgreSQL. Please check your connection settings."
    }
    Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green

    # Check if database exists, create if not
    Write-Host "🔍 Checking database existence..." -ForegroundColor Cyan
    $dbExists = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | Select-String $DB_NAME
    
    if (-not $dbExists) {
        Write-Host "📦 Creating database: $DB_NAME" -ForegroundColor Yellow
        & createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database created successfully" -ForegroundColor Green
        } else {
            throw "Failed to create database"
        }
    } else {
        Write-Host "✅ Database $DB_NAME already exists" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "🚀 Running Database Migrations..." -ForegroundColor Green
    Write-Host "================================="

    # 1. Create main schema (users, companies, jobs, etc.)
    Write-Host "1️⃣  Creating main database schema..." -ForegroundColor Cyan
    Run-SqlFile "database\schema_postgres.sql" "Main database schema"

    # 2. Create agents table
    Write-Host "2️⃣  Creating agents table..." -ForegroundColor Cyan
    Run-SqlFile "database\create_agents_table_postgres.sql" "Agents table"

    # 3. Add wizard fields to users table
    Write-Host "3️⃣  Adding wizard fields..." -ForegroundColor Cyan
    Run-SqlFile "database\add_wizard_fields_migration.sql" "Wizard fields migration"

    # 4. Create additional tables if they exist
    Write-Host "4️⃣  Creating additional tables..." -ForegroundColor Cyan
    Run-SqlFile "database\payment_methods_schema.sql" "Payment methods schema"

    # 5. Populate sample data (optional - only if files exist)
    Write-Host "5️⃣  Populating sample data..." -ForegroundColor Cyan
    Run-SqlFile "database\create_sample_agents.sql" "Sample agents data"
    Run-SqlFile "database\sample_agents_data.sql" "Additional sample agents"

    # 6. Verify tables were created
    Write-Host "6️⃣  Verifying table creation..." -ForegroundColor Cyan
    Write-Host "   📋 Tables in database:" -ForegroundColor Yellow
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

    Write-Host ""
    Write-Host "🎯 Migration Verification..." -ForegroundColor Green
    Write-Host "============================"

    # Check if users table has wizard fields
    Write-Host "   🔍 Checking users table structure..." -ForegroundColor Yellow
    $userColumns = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d users" | Select-String -Pattern "(is_temp_account|created_via_wizard|work_type_preference)"
    if ($userColumns) {
        Write-Host "   ✅ Users table has wizard fields" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Warning: Users table missing wizard fields" -ForegroundColor Yellow
    }

    # Check if agents table exists
    $agentsExists = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt agents" | Select-String "agents"
    if ($agentsExists) {
        Write-Host "   ✅ Agents table exists" -ForegroundColor Green
        $agentCount = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM agents;" -t
        Write-Host "   📊 Agents in database: $($agentCount.Trim())" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Error: Agents table not found" -ForegroundColor Red
        throw "Agents table creation failed"
    }

    Write-Host ""
    Write-Host "🎉 Database Migration Completed Successfully!" -ForegroundColor Green
    Write-Host "============================================="
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Update .env file with correct database settings"
    Write-Host "   2. Test database connection: npm run test:db"
    Write-Host "   3. Start the application: npm start"
    Write-Host "   4. Create admin user if needed"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ Migration Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "   1. Ensure PostgreSQL is running on port $DB_PORT"
    Write-Host "   2. Verify database credentials in .env file"
    Write-Host "   3. Check if user '$DB_USER' has permission to create databases"
    Write-Host "   4. Ensure PostgreSQL client tools (psql, createdb) are in PATH"
    exit 1
}
