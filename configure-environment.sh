#!/bin/bash
# Master Environment Configuration Script
# This script updates your FlexJobs application to use environment variables instead of hardcoded ports

echo "🚀 FLEXJOBS ENVIRONMENT CONFIGURATION MASTER SCRIPT"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This script will:${NC}"
echo "• Update all configuration files to use environment variables"
echo "• Replace hardcoded ports with configurable values"
echo "• Create backup copies of all modified files"
echo "• Validate the final configuration"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

# Step 1: Process all configuration files
echo ""
echo -e "${YELLOW}📋 Step 1: Processing configuration files...${NC}"
./scripts/process-all-configs.sh

# Step 2: Process frontend .htaccess
echo ""
echo -e "${YELLOW}📋 Step 2: Processing frontend configuration...${NC}"
./scripts/process-htaccess.sh

# Step 3: Update nginx configuration
echo ""
echo -e "${YELLOW}📋 Step 3: Updating nginx configuration...${NC}"
./scripts/update-nginx-config.sh

# Step 4: Validate configuration
echo ""
echo -e "${YELLOW}📋 Step 4: Validating configuration...${NC}"
./scripts/validate-config.sh

echo ""
echo -e "${GREEN}🎉 ENVIRONMENT CONFIGURATION COMPLETE!${NC}"
echo ""
echo -e "${BLUE}📝 What was changed:${NC}"
echo "• All hardcoded ports replaced with environment variables"
echo "• Configuration files now use \$API_HOST and \$API_PORT"
echo "• Database connections use \$DB_HOST and \$DB_PORT"
echo "• nginx and deployment scripts updated"
echo "• All original files backed up with timestamps"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Review your .env file and adjust ports if needed:"
echo "   nano .env"
echo ""
echo "2. Restart your application to apply changes:"
echo "   npm run dev (for development)"
echo "   npm start (for production)"
echo ""
echo "3. Test the application:"
echo "   curl http://\${API_HOST:-localhost}:\${API_PORT:-3005}/api/health"
echo ""
echo -e "${GREEN}✨ Your application is now fully configurable via environment variables!${NC}"
