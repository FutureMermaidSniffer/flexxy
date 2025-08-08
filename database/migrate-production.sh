#!/bin/bash

# FlexJobs Database Migration Script
# This script ensures all database tables are created and migrations are applied

set -e

echo "🗄️  FlexJobs Database Migration Starting..."
echo "=============================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_NAME=${DB_NAME:-flexjobs_db}

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Set PGPASSWORD for non-interactive operations
export PGPASSWORD=$DB_PASSWORD

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "   📄 Running: $description"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" -q
        echo "   ✅ Completed: $description"
    else
        echo "   ⚠️  Warning: File not found: $file"
    fi
}

# Function to run SQL command
run_sql_command() {
    local command=$1
    local description=$2
    
    echo "   📄 Running: $description"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$command" -q
    echo "   ✅ Completed: $description"
}

# Check if database exists, create if not
echo "🔍 Checking database existence..."
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "no" ]; then
    echo "📦 Creating database: $DB_NAME"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    echo "✅ Database created successfully"
else
    echo "✅ Database $DB_NAME already exists"
fi

echo ""
echo "🚀 Running Database Migrations..."
echo "================================="

# 1. Create main schema (users, companies, jobs, etc.)
echo "1️⃣  Creating main database schema..."
run_sql_file "database/schema_postgres.sql" "Main database schema"

# 2. Create agents table
echo "2️⃣  Creating agents table..."
run_sql_file "database/create_agents_table_postgres.sql" "Agents table"

# 3. Add wizard fields to users table
echo "3️⃣  Adding wizard fields..."
run_sql_file "database/add_wizard_fields_migration.sql" "Wizard fields migration"

# 4. Create additional tables if they exist
echo "4️⃣  Creating additional tables..."
run_sql_file "database/payment_methods_schema.sql" "Payment methods schema"

# 5. Populate sample data (optional - only if files exist)
echo "5️⃣  Populating sample data..."
run_sql_file "database/create_sample_agents.sql" "Sample agents data"
run_sql_file "database/sample_agents_data.sql" "Additional sample agents"

# 6. Verify tables were created
echo "6️⃣  Verifying table creation..."
echo "   📋 Tables in database:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\dt" | grep -E "(users|agents|companies|jobs|categories)"

echo ""
echo "🎯 Migration Verification..."
echo "============================"

# Check if users table has wizard fields
echo "   🔍 Checking users table structure..."
USER_COLUMNS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\d users" | grep -E "(is_temp_account|created_via_wizard|work_type_preference)" | wc -l)
if [ $USER_COLUMNS -gt 0 ]; then
    echo "   ✅ Users table has wizard fields"
else
    echo "   ⚠️  Warning: Users table missing wizard fields"
fi

# Check if agents table exists
AGENTS_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\\dt agents" | grep agents | wc -l)
if [ $AGENTS_EXISTS -gt 0 ]; then
    echo "   ✅ Agents table exists"
    AGENT_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM agents;" -t | tr -d ' ')
    echo "   📊 Agents in database: $AGENT_COUNT"
else
    echo "   ❌ Error: Agents table not found"
    exit 1
fi

echo ""
echo "🎉 Database Migration Completed Successfully!"
echo "============================================="
echo ""
echo "📋 Next Steps:"
echo "   1. Update .env file with correct database settings"
echo "   2. Test database connection: npm run test:db"
echo "   3. Start the application: npm start"
echo "   4. Create admin user if needed"
echo ""
