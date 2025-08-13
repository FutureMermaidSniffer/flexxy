#!/bin/bash
# SSH script to run specific migrations on flexjob.uk server
# Run this script locally - it will SSH to your server and execute migrations

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Server configuration
SERVER="flexjob.uk"
USER="root"  # Change to your SSH user
PROJECT_DIR="~/flexxy"

echo -e "${BLUE}🚀 Running FlexJobs Database Migrations on ${SERVER}${NC}"
echo "=================================================="

# Function to run SSH commands with error checking
run_ssh_command() {
    local command="$1"
    local description="$2"
    
    echo -e "${YELLOW}📋 ${description}${NC}"
    
    if ssh ${USER}@${SERVER} "cd ${PROJECT_DIR} && ${command}"; then
        echo -e "${GREEN}✅ ${description} - SUCCESS${NC}"
        echo ""
    else
        echo -e "${RED}❌ ${description} - FAILED${NC}"
        echo "Stopping migration process due to error."
        exit 1
    fi
}

# Check SSH connection
echo -e "${YELLOW}🔍 Testing SSH connection to ${SERVER}...${NC}"
if ! ssh -o ConnectTimeout=10 ${USER}@${SERVER} "echo 'SSH connection successful'"; then
    echo -e "${RED}❌ SSH connection failed to ${SERVER}${NC}"
    echo "Please check:"
    echo "• Server is accessible"
    echo "• SSH keys are set up correctly"
    echo "• Username and server address are correct"
    exit 1
fi
echo -e "${GREEN}✅ SSH connection established${NC}"
echo ""

# Check if project directory exists
echo -e "${YELLOW}📂 Checking project directory...${NC}"
if ! ssh ${USER}@${SERVER} "[ -d ${PROJECT_DIR} ]"; then
    echo -e "${RED}❌ Project directory ${PROJECT_DIR} not found on server${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Project directory found${NC}"
echo ""

# Check if migration files exist
echo -e "${YELLOW}🔍 Checking migration files...${NC}"
MIGRATION_FILES=(
    "database/migrations/create-core-schema.js"
    "database/migrations/add-salary-type-column.js"
)

for file in "${MIGRATION_FILES[@]}"; do
    if ssh ${USER}@${SERVER} "[ -f ${PROJECT_DIR}/${file} ]"; then
        echo -e "${GREEN}✅ Found: ${file}${NC}"
    else
        echo -e "${RED}❌ Missing: ${file}${NC}"
        exit 1
    fi
done
echo ""

# Backup current database (optional but recommended)
run_ssh_command "pg_dump -h localhost -U postgres flexjobs_db > backup_before_migration_\$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo 'Backup skipped (database might not exist yet)'" "Creating database backup"

# Check database connection
run_ssh_command "node database/test-connection.js" "Testing database connection"

# Run migrations in sequence
echo -e "${BLUE}🔄 Starting Migration Sequence${NC}"
echo "================================"

# 1. Run core schema migration
run_ssh_command "node database/migrations/create-core-schema.js" "Running create-core-schema.js migration"

# 2. Run salary type column migration
run_ssh_command "node database/migrations/add-salary-type-column.js" "Running add-salary-type-column.js migration"

# Verify database schema after migrations
run_ssh_command "node -e \"
const { getConnection } = require('./backend/database');
(async () => {
    try {
        const connection = await getConnection();
        const tables = await connection.query(\\\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'\\\");
        console.log('📊 Database tables after migration:');
        tables.rows.forEach(row => console.log('  •', row.table_name));
        connection.release();
        console.log('✅ Database verification complete');
    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        process.exit(1);
    }
})();
\"" "Verifying database schema"

# Check if jobs table exists and has expected columns
run_ssh_command "node -e \"
const { getConnection } = require('./backend/database');
(async () => {
    try {
        const connection = await getConnection();
        const result = await connection.query(\\\"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs' ORDER BY ordinal_position\\\");
        console.log('📋 Jobs table columns:');
        result.rows.forEach(row => console.log('  • ' + row.column_name + ' (' + row.data_type + ')'));
        connection.release();
        console.log('✅ Jobs table verification complete');
    } catch (error) {
        console.error('❌ Jobs table verification failed:', error.message);
        process.exit(1);
    }
})();
\"" "Verifying jobs table structure"

# Restart the FlexJobs application
run_ssh_command "pm2 restart flexjobs-uk 2>/dev/null || echo 'PM2 restart skipped - app might not be running yet'" "Restarting FlexJobs application"

# Test application health
run_ssh_command "sleep 3 && curl -f http://localhost:3005/health >/dev/null 2>&1 && echo 'Application health check passed' || echo 'Application health check failed - check logs'" "Testing application health"

echo ""
echo -e "${GREEN}🎉 MIGRATION COMPLETE!${NC}"
echo "======================"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "• Created core database schema (users, jobs, companies, etc.)"
echo "• Added salary_type column to jobs table"
echo "• Verified database structure"
echo "• Restarted application"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Test your application: https://flexjob.uk"
echo "2. Check PM2 status: ssh ${USER}@${SERVER} 'pm2 status'"
echo "3. View logs if needed: ssh ${USER}@${SERVER} 'pm2 logs flexjobs-uk'"
echo ""
echo -e "${BLUE}🔍 Troubleshooting commands:${NC}"
echo "• SSH to server: ssh ${USER}@${SERVER}"
echo "• Check database: ssh ${USER}@${SERVER} 'cd ${PROJECT_DIR} && node database/test-connection.js'"
echo "• View migration logs: ssh ${USER}@${SERVER} 'cd ${PROJECT_DIR} && tail -f logs/migration.log'"
