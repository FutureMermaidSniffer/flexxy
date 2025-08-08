#!/bin/bash
# Emergency Fix for Database.js Duplicate Declaration
echo "🚨 EMERGENCY FIX - DUPLICATE POOL DECLARATION"
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}Problem: backend/database.js has duplicate Pool declarations${NC}"
echo -e "${YELLOW}Solution: Replace with clean version${NC}"
echo ""

# Backup current file
echo -e "${YELLOW}1. Creating backup...${NC}"
cp backend/database.js backend/database.js.backup.emergency.$(date +%Y%m%d-%H%M%S)
echo -e "${GREEN}✅ Backup created${NC}"

# Replace with clean version
echo -e "${YELLOW}2. Replacing with clean database.js...${NC}"
cp backend/database-clean.js backend/database.js
echo -e "${GREEN}✅ Clean file installed${NC}"

# Verify fix
echo -e "${YELLOW}3. Verifying syntax...${NC}"
node -c backend/database.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Syntax check passed${NC}"
else
    echo -e "${RED}❌ Syntax check failed${NC}"
    exit 1
fi

# Restart PM2
echo -e "${YELLOW}4. Restarting application...${NC}"
pm2 restart flexjobs

# Wait and check logs
echo -e "${YELLOW}5. Checking application status...${NC}"
sleep 3
pm2 logs flexjobs --lines 10

echo ""
echo -e "${GREEN}🎉 EMERGENCY FIX COMPLETE!${NC}"
echo "The duplicate Pool declaration has been resolved."

