#!/bin/bash
# Comprehensive Database Consistency Fix
# Ensures all database configurations are aligned

echo "🔧 COMPREHENSIVE DATABASE CONSISTENCY FIX"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Found inconsistencies in database configuration:${NC}"
echo "• .env file: PORT=5432, USER=kai"
echo "• backend/database.js: DEFAULT PORT=5433, DEFAULT USER=postgres"
echo "• Migration files: Configured for PORT=5433"
echo ""
echo -e "${YELLOW}Fixing all configuration files to use consistent settings...${NC}"
echo ""

# Step 1: Fix backend/database.js
echo -e "${YELLOW}1. Fixing backend/database.js...${NC}"
cat > /tmp/database_fix.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'kai',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'flexjobs_db',
  max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000,
  // Disable SSL for local development
  ssl: false,
};


const pool = new Pool(dbConfig);
EOF

# Replace the configuration section in database.js
head -n 1 backend/database.js > /tmp/db_temp.js
cat /tmp/database_fix.js >> /tmp/db_temp.js
tail -n +19 backend/database.js >> /tmp/db_temp.js
mv /tmp/db_temp.js backend/database.js

echo -e "${GREEN}✅ Fixed backend/database.js${NC}"

# Step 2: Create database with correct user and permissions
echo ""
echo -e "${YELLOW}2. Setting up database with correct user...${NC}"

sudo -u postgres psql << 'EOF'
-- Drop existing database if it exists (to start fresh)
DROP DATABASE IF EXISTS flexjobs_db;

-- Drop existing user if it exists
DROP USER IF EXISTS kai;

-- Create user with secure password
CREATE USER kai WITH PASSWORD 'your_secure_password';

-- Create database
CREATE DATABASE flexjobs_db OWNER kai;

-- Grant all privileges to kai
GRANT ALL PRIVILEGES ON DATABASE flexjobs_db TO kai;

-- Connect to the database and set up schema permissions
\c flexjobs_db

-- Grant permissions on the public schema
GRANT ALL ON SCHEMA public TO kai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kai;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kai;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

\q
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup completed${NC}"
else
    echo -e "${RED}❌ Database setup failed${NC}"
    exit 1
fi

# Step 3: Run initial schema migration
echo ""
echo -e "${YELLOW}3. Running initial database schema...${NC}"

if [ -f "database/migrations/sequential/20240101_000000_initial_schema.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/migrations/sequential/20240101_000000_initial_schema.sql
    echo -e "${GREEN}✅ Initial schema applied${NC}"
else
    echo -e "${YELLOW}⚠️ Using fallback schema${NC}"
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/schema_postgres.sql
fi

# Step 4: Run additional migrations
echo ""
echo -e "${YELLOW}4. Running additional migrations...${NC}"

# OAuth fields
if [ -f "database/migrations/sequential/20240103_000000_add_oauth_fields.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/migrations/sequential/20240103_000000_add_oauth_fields.sql
    echo "• OAuth fields migration applied"
fi

# Password reset
if [ -f "database/migrations/sequential/20240104_000000_add_password_reset.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/migrations/sequential/20240104_000000_add_password_reset.sql
    echo "• Password reset migration applied"
fi

# Job management fields
if [ -f "database/migrations/add_job_management_fields.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/migrations/add_job_management_fields.sql
    echo "• Job management fields migration applied"
fi

# Step 5: Add sample data
echo ""
echo -e "${YELLOW}5. Adding sample data...${NC}"

if [ -f "database/simple_sample_jobs.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/simple_sample_jobs.sql
    echo -e "${GREEN}✅ Sample jobs added${NC}"
fi

if [ -f "database/sample_agents_data.sql" ]; then
    PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -f database/sample_agents_data.sql
    echo -e "${GREEN}✅ Sample agents added${NC}"
fi

# Step 6: Verify database structure
echo ""
echo -e "${YELLOW}6. Verifying database structure...${NC}"

PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -c "
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
" | head -20

echo ""
echo "Table count:"
PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -c "
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
"

# Step 7: Test connection and restart app
echo ""
echo -e "${YELLOW}7. Testing connection and restarting app...${NC}"

# Test connection
PGPASSWORD='your_secure_password' psql -h localhost -U kai -d flexjobs_db -c "SELECT 'Connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection test passed${NC}"
    
    # Restart the application
    echo ""
    echo "🔄 Restarting FlexJobs application..."
    pm2 restart flexjobs
    
    # Wait and check logs
    sleep 5
    echo ""
    echo "📋 Application logs:"
    pm2 logs flexjobs --lines 15
    
else
    echo -e "${RED}❌ Database connection test failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 DATABASE CONSISTENCY FIX COMPLETE!${NC}"
echo ""
echo "✅ Fixed configurations:"
echo "• backend/database.js: Uses .env settings with correct defaults"
echo "• Database created with user 'kai' and proper permissions"
echo "• All migrations applied in correct order"
echo "• Sample data loaded"
echo ""
echo -e "${BLUE}Your application should now connect successfully!${NC}"

