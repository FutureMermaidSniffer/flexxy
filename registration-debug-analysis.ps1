#!/usr/bin/env pwsh
# FlexJobs Registration Troubleshooting Script
# Comprehensive analysis and debugging tool

Write-Host "🔍 FlexJobs Registration Error Analysis & Troubleshooting" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "📋 PHASE 1: Configuration Files Analysis" -ForegroundColor Yellow

# 1. Check all environment files
Write-Host "`n1️⃣ Environment Configuration Analysis:"
$envFiles = @(
    ".env",
    ".env.production", 
    ".env.development",
    ".env.production.template"
)

foreach ($file in $envFiles) {
    $path = "flexjobs\$file"
    if (Test-Path $path) {
        Write-Host "  ✅ Found: $file" -ForegroundColor Green
        $content = Get-Content $path | Select-String "NODE_ENV|DB_PORT|JWT_SECRET|SESSION_SECRET"
        $content | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
    }
}

# 2. Check PM2 configuration
Write-Host "`n2️⃣ PM2 Process Analysis (requires server connection):"
Write-Host "  🔧 Manual Commands to run on production server:"
Write-Host "    pm2 logs flexjobs --lines 50" -ForegroundColor Cyan
Write-Host "    pm2 show flexjobs" -ForegroundColor Cyan
Write-Host "    pm2 monit" -ForegroundColor Cyan

# 3. Database connection test
Write-Host "`n3️⃣ Database Schema Analysis:"
Write-Host "  📝 Required checks:"
Write-Host "    - Verify users table exists with all required columns"
Write-Host "    - Check for wizard migration fields"
Write-Host "    - Validate unique constraints"

Write-Host "`n📋 PHASE 2: Registration Error Analysis" -ForegroundColor Yellow

# Expected frontend data structure
Write-Host "`n4️⃣ Frontend Data Structure Analysis:"
$expectedFields = @(
    "email (required, must be valid email)",
    "password (required, min 6 chars)",
    "first_name (required, min 1 char)",
    "last_name (required, min 1 char)", 
    "user_type (required, must be 'job_seeker' or 'employer')",
    "preferences (optional, JSON object)",
    "is_temp_account (optional, boolean)",
    "created_via_wizard (optional, boolean)"
)

Write-Host "  📋 Expected Registration Fields:"
$expectedFields | ForEach-Object { Write-Host "    • $_" -ForegroundColor Gray }

# Database insertion analysis
Write-Host "`n5️⃣ Database Insertion Analysis:"
Write-Host "  🔧 Manual SQL to test on production server:"
Write-Host @"
    -- Check users table structure
    \d users
    
    -- Test simple insertion
    INSERT INTO users (email, password, first_name, last_name, user_type) 
    VALUES ('test@example.com', 'hashedpassword', 'Test', 'User', 'job_seeker');
"@ -ForegroundColor Cyan

Write-Host "`n📋 PHASE 3: Systematic Debugging Steps" -ForegroundColor Yellow

Write-Host "`n6️⃣ Step-by-Step Debugging Protocol:"
$debugSteps = @(
    "1. Check PM2 logs: pm2 logs flexjobs --lines 100",
    "2. Verify database connection: psql -U postgres -d flexjobs_db -c '\dt'",
    "3. Test registration endpoint with curl:",
    "   curl -X POST http://localhost:3003/api/auth/register \",
    "   -H 'Content-Type: application/json' \",
    "   -d '{""email"":""test@example.com"",""password"":""testpass123"",""first_name"":""Test"",""last_name"":""User"",""user_type"":""job_seeker""}'",
    "4. Check database for user insertion: SELECT * FROM users WHERE email='test@example.com';",
    "5. Verify JWT_SECRET is set: echo $JWT_SECRET",
    "6. Check for any database constraint violations in logs"
)

$debugSteps | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

Write-Host "`n📋 PHASE 4: Common Issue Checklist" -ForegroundColor Yellow

Write-Host "`n7️⃣ Most Likely Causes & Solutions:"
$commonIssues = @{
    "Database Connection" = @(
        "❌ Wrong DB_PORT (5432 vs 5433)",
        "❌ Missing users table",
        "❌ Missing wizard fields in users table",
        "✅ Run: psql -U postgres -d flexjobs_db -c 'SELECT version();'"
    )
    "Environment Variables" = @(
        "❌ Missing JWT_SECRET",
        "❌ Missing SESSION_SECRET", 
        "❌ Wrong NODE_ENV setting",
        "✅ Check: pm2 show flexjobs (env variables section)"
    )
    "Database Constraints" = @(
        "❌ Unique email constraint violation",
        "❌ Required field missing",
        "❌ Invalid user_type value",
        "✅ Check: pm2 logs flexjobs | grep -i error"
    )
    "Frontend Data Issues" = @(
        "❌ Missing required fields in request",
        "❌ Invalid email format",
        "❌ Password too short",
        "✅ Check browser Network tab for request payload"
    )
}

foreach ($category in $commonIssues.Keys) {
    Write-Host "`n  🔧 $category" -ForegroundColor White
    $commonIssues[$category] | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
}

Write-Host "`n📋 PHASE 5: Production Server Commands" -ForegroundColor Yellow

Write-Host "`n8️⃣ Commands to run on production server:"
$prodCommands = @(
    "# Check current process status",
    "pm2 status",
    "",
    "# View real-time logs",
    "pm2 logs flexjobs --lines 50",
    "",
    "# Test database connection", 
    "psql -U postgres -d flexjobs_db -c '\l'",
    "",
    "# Check users table structure",
    "psql -U postgres -d flexjobs_db -c '\d users'",
    "",
    "# Test simple registration via curl",
    "curl -X POST http://localhost:3003/api/auth/register \",
    "  -H 'Content-Type: application/json' \",
    "  -d '{""email"":""debug@test.com"",""password"":""debug123"",""first_name"":""Debug"",""last_name"":""Test"",""user_type"":""job_seeker""}' \",
    "  -v",
    "",
    "# Check if user was created",
    "psql -U postgres -d flexjobs_db -c 'SELECT id, email, first_name, last_name, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 5;'"
)

$prodCommands | ForEach-Object { 
    if ($_ -eq "") {
        Write-Host ""
    } elseif ($_.StartsWith("#")) {
        Write-Host $_ -ForegroundColor Green
    } else {
        Write-Host $_ -ForegroundColor Cyan
    }
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run production server commands above"
Write-Host "2. Share the output of pm2 logs and curl test"
Write-Host "3. Check browser Network tab for exact registration request data"
Write-Host "4. Verify database has all required wizard fields"

Write-Host "`n✅ Analysis Complete!" -ForegroundColor Green
