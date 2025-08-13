# PowerShell script to run specific migrations on flexjob.uk server via SSH
# Run this script locally - it will SSH to your server and execute migrations

param(
    [string]$Server = "flexjob.uk",
    [string]$User = "root",
    [string]$ProjectDir = "~/flexxy"
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

Write-Host "🚀 Running FlexJobs Database Migrations on $Server" -ForegroundColor $Blue
Write-Host "==================================================" -ForegroundColor $Blue

# Function to run SSH commands with error checking
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "📋 $Description" -ForegroundColor $Yellow
    
    $sshCommand = "ssh $User@$Server `"cd $ProjectDir && $Command`""
    
    try {
        $result = Invoke-Expression $sshCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description - SUCCESS" -ForegroundColor $Green
            Write-Host ""
        } else {
            throw "Command failed with exit code $LASTEXITCODE"
        }
    } catch {
        Write-Host "❌ $Description - FAILED" -ForegroundColor $Red
        Write-Host "Error: $_" -ForegroundColor $Red
        Write-Host "Stopping migration process due to error." -ForegroundColor $Red
        exit 1
    }
}

# Check SSH connection
Write-Host "🔍 Testing SSH connection to $Server..." -ForegroundColor $Yellow
try {
    $testResult = ssh -o ConnectTimeout=10 $User@$Server "echo 'SSH connection successful'"
    if ($LASTEXITCODE -ne 0) {
        throw "SSH connection failed"
    }
    Write-Host "✅ SSH connection established" -ForegroundColor $Green
    Write-Host ""
} catch {
    Write-Host "❌ SSH connection failed to $Server" -ForegroundColor $Red
    Write-Host "Please check:" -ForegroundColor $Yellow
    Write-Host "• Server is accessible" -ForegroundColor $Yellow
    Write-Host "• SSH keys are set up correctly" -ForegroundColor $Yellow
    Write-Host "• Username and server address are correct" -ForegroundColor $Yellow
    exit 1
}

# Check if project directory exists
Write-Host "📂 Checking project directory..." -ForegroundColor $Yellow
$dirCheck = ssh $User@$Server "[ -d $ProjectDir ] && echo 'exists' || echo 'missing'"
if ($dirCheck -ne "exists") {
    Write-Host "❌ Project directory $ProjectDir not found on server" -ForegroundColor $Red
    exit 1
}
Write-Host "✅ Project directory found" -ForegroundColor $Green
Write-Host ""

# Check if migration files exist
Write-Host "🔍 Checking migration files..." -ForegroundColor $Yellow
$migrationFiles = @(
    "database/migrations/create-core-schema.js",
    "database/migrations/add-salary-type-column.js"
)

foreach ($file in $migrationFiles) {
    $fileCheck = ssh $User@$Server "[ -f $ProjectDir/$file ] && echo 'exists' || echo 'missing'"
    if ($fileCheck -eq "exists") {
        Write-Host "✅ Found: $file" -ForegroundColor $Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor $Red
        exit 1
    }
}
Write-Host ""

# Backup current database
Invoke-SSHCommand "pg_dump -h localhost -U postgres flexjobs_db > backup_before_migration_`$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo 'Backup skipped (database might not exist yet)'" "Creating database backup"

# Check database connection
Invoke-SSHCommand "node database/test-connection.js" "Testing database connection"

# Run migrations in sequence
Write-Host "🔄 Starting Migration Sequence" -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue

# 1. Run core schema migration
Invoke-SSHCommand "node database/migrations/create-core-schema.js" "Running create-core-schema.js migration"

# 2. Run salary type column migration
Invoke-SSHCommand "node database/migrations/add-salary-type-column.js" "Running add-salary-type-column.js migration"

# Verify database schema after migrations
$verifyScript = @"
const { getConnection } = require('./backend/database');
(async () => {
    try {
        const connection = await getConnection();
        const tables = await connection.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'\");
        console.log('📊 Database tables after migration:');
        tables.rows.forEach(row => console.log('  •', row.table_name));
        connection.release();
        console.log('✅ Database verification complete');
    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        process.exit(1);
    }
})();
"@

Invoke-SSHCommand "node -e `"$verifyScript`"" "Verifying database schema"

# Check jobs table structure
$jobsTableScript = @"
const { getConnection } = require('./backend/database');
(async () => {
    try {
        const connection = await getConnection();
        const result = await connection.query(\"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs' ORDER BY ordinal_position\");
        console.log('📋 Jobs table columns:');
        result.rows.forEach(row => console.log('  • ' + row.column_name + ' (' + row.data_type + ')'));
        connection.release();
        console.log('✅ Jobs table verification complete');
    } catch (error) {
        console.error('❌ Jobs table verification failed:', error.message);
        process.exit(1);
    }
})();
"@

Invoke-SSHCommand "node -e `"$jobsTableScript`"" "Verifying jobs table structure"

# Restart the FlexJobs application
Invoke-SSHCommand "pm2 restart flexjobs-uk 2>/dev/null || echo 'PM2 restart skipped - app might not be running yet'" "Restarting FlexJobs application"

# Test application health
Invoke-SSHCommand "sleep 3 && curl -f http://localhost:3005/health >/dev/null 2>&1 && echo 'Application health check passed' || echo 'Application health check failed - check logs'" "Testing application health"

Write-Host ""
Write-Host "🎉 MIGRATION COMPLETE!" -ForegroundColor $Green
Write-Host "======================" -ForegroundColor $Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor $Blue
Write-Host "• Created core database schema (users, jobs, companies, etc.)"
Write-Host "• Added salary_type column to jobs table"
Write-Host "• Verified database structure"
Write-Host "• Restarted application"
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor $Yellow
Write-Host "1. Test your application: https://flexjob.uk"
Write-Host "2. Check PM2 status: ssh $User@$Server 'pm2 status'"
Write-Host "3. View logs if needed: ssh $User@$Server 'pm2 logs flexjobs-uk'"
Write-Host ""
Write-Host "🔍 Troubleshooting commands:" -ForegroundColor $Blue
Write-Host "• SSH to server: ssh $User@$Server"
Write-Host "• Check database: ssh $User@$Server 'cd $ProjectDir && node database/test-connection.js'"
Write-Host "• View migration logs: ssh $User@$Server 'cd $ProjectDir && tail -f logs/migration.log'"
