#!/bin/bash
# Recreate FlexJobs Database
# Create database, user, and grant permissions

echo "🔧 RECREATING FLEXJOBS DATABASE"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Creating database and user...${NC}"

# Create the database and user
sudo -u postgres psql << 'EOF'
-- Drop existing database if it exists (in case of issues)
DROP DATABASE IF EXISTS flexjobs_db;

-- Drop existing user if it exists
DROP USER IF EXISTS kai;

-- Create user
CREATE USER kai WITH PASSWORD '11223344';

-- Create database
CREATE DATABASE flexjobs_db OWNER kai;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE flexjobs_db TO kai;

-- Connect to the database and grant schema permissions
\c flexjobs_db

-- Grant permissions on public schema
GRANT ALL ON SCHEMA public TO kai;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO kai;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO kai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kai;

-- List databases to confirm
\l
EOF

echo ""
echo -e "${YELLOW}2. Testing database connection...${NC}"
if PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    echo -e "${GREEN}✅ Database flexjobs_db created successfully${NC}"
    echo -e "${GREEN}✅ User kai has full access${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database recreation complete!${NC}"
echo ""
echo "You can now run your migrations with:"
echo "  ./run-migrations.sh"

