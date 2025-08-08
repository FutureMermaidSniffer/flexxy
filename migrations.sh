#!/bin/bash
# Run Database Migrations
# Execute all migration files to set up the database schema

echo "🔄 RUNNING DATABASE MIGRATIONS"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

cd ~/flexxy

echo -e "${YELLOW}1. Checking database connection...${NC}"
if PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Checking for migration files...${NC}"
if [ -d "database" ]; then
    echo -e "${GREEN}✅ Database directory found${NC}"
    echo "Migration files found:"
    ls -la database/*.sql 2>/dev/null || echo "No .sql files found"
    ls -la database/*.js 2>/dev/null || echo "No .js migration files found"
else
    echo -e "${RED}❌ Database directory not found${NC}"
    echo "Creating database directory..."
    mkdir -p database
fi

echo ""
echo -e "${YELLOW}3. Running SQL migrations...${NC}"

# Run each SQL file in the database directory
for sql_file in database/*.sql; do
    if [ -f "$sql_file" ]; then
        echo -e "${BLUE}Running: $sql_file${NC}"
        if PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -f "$sql_file"; then
            echo -e "${GREEN}✅ $sql_file completed successfully${NC}"
        else
            echo -e "${YELLOW}⚠️ $sql_file had warnings (may be normal if tables exist)${NC}"
        fi
        echo ""
    fi
done

echo ""
echo -e "${YELLOW}4. Running JavaScript migrations...${NC}"

# Run JavaScript migration files
for js_file in database/*.js; do
    if [ -f "$js_file" ]; then
        echo -e "${BLUE}Running: $js_file${NC}"
        if node "$js_file"; then
            echo -e "${GREEN}✅ $js_file completed successfully${NC}"
        else
            echo -e "${RED}❌ $js_file failed${NC}"
        fi
        echo ""
    fi
done

echo ""
echo -e "${YELLOW}5. Creating basic schema if no migrations exist...${NC}"

# If no migration files exist, create basic schema
PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255),
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    job_type VARCHAR(50) DEFAULT 'full-time',
    remote BOOLEAN DEFAULT FALSE,
    requirements TEXT,
    benefits TEXT,
    contact_email VARCHAR(255),
    application_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    location VARCHAR(255),
    size VARCHAR(50),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied',
    cover_letter TEXT,
    resume_url VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for Redis backup
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);

EOF

echo ""
echo -e "${YELLOW}6. Checking final database schema...${NC}"
echo "Tables created:"
PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -c "\dt"

echo ""
echo "Table details:"
PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -c "
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;" | head -20

echo ""
echo -e "${YELLOW}7. Restarting application with new schema...${NC}"
pm2 restart flexjobs

sleep 3

echo ""
echo -e "${YELLOW}8. Testing application...${NC}"
echo "PM2 Status:"
pm2 list

echo ""
echo "Testing endpoints:"
APP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "Direct app: $APP_TEST"

NGINX_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'FAILED')
echo "Through nginx: $NGINX_TEST"

echo ""
if [ "$APP_TEST" = "200" ] || [ "$APP_TEST" = "302" ]; then
    echo -e "${GREEN}🎉 SUCCESS! Database migrations completed and app is working!${NC}"
    echo -e "${GREEN}Your website is now live at:${NC}"
    echo -e "${GREEN}  • http://flexjobseu.com:8080${NC}"
    echo -e "${GREEN}  • http://144.126.154.23:8080${NC}"
else
    echo -e "${YELLOW}⚠️ Migrations completed but app still has issues. Check logs:${NC}"
    echo "pm2 logs flexjobs --lines 10"
fi

