#!/bin/bash
# Quick PM2 deployment script for FlexJobs
# Run this on your server: ./deploy-pm2.sh

echo "🚀 DEPLOYING FLEXJOBS WITH PM2"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check if a command was successful
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Check if we're in the right directory
if [ ! -f "server.js" ] || [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Error: Not in FlexJobs directory${NC}"
    echo "Please run this script from the FlexJobs project root directory"
    exit 1
fi

echo -e "${YELLOW}📂 Current directory: $(pwd)${NC}"

# Step 2: Stop existing processes
echo -e "${YELLOW}🛑 Stopping existing processes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete flexjobs 2>/dev/null || true
pm2 delete flexjobs-uk 2>/dev/null || true
check_success "Cleaned up existing processes"

# Step 3: Setup environment
echo -e "${YELLOW}🔧 Setting up environment...${NC}"
if [ -f ".env.production" ]; then
    cp .env.production .env
    check_success "Copied production environment"
else
    echo -e "${RED}❌ .env.production file not found${NC}"
    exit 1
fi

# Step 4: Install dependencies (if needed)
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    check_success "Installed dependencies"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Step 5: Start with PM2
echo -e "${YELLOW}🚀 Starting FlexJobs with PM2...${NC}"
pm2 start ecosystem.config.js --env production
check_success "Started FlexJobs with PM2"

# Step 6: Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
check_success "Saved PM2 configuration"

# Step 7: Setup startup script (if not already done)
echo -e "${YELLOW}🔄 Setting up startup script...${NC}"
echo "Running PM2 startup (you may need to run the command it provides as sudo):"
pm2 startup

# Step 8: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
sleep 3

# Check PM2 status
echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status

# Test application
echo -e "${YELLOW}🌐 Testing application...${NC}"
if curl -f http://localhost:3005/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is responding on port 3005${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
    echo "Check logs with: pm2 logs flexjobs-uk"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo "  View status: pm2 status"
echo "  View logs:   pm2 logs flexjobs-uk"
echo "  Restart:     pm2 restart flexjobs-uk"
echo "  Stop:        pm2 stop flexjobs-uk"
echo "  Monitor:     pm2 monit"
echo ""
echo -e "${YELLOW}🌐 Your application should be available at:${NC}"
echo "  https://flexjob.uk"
echo "  http://localhost:3005 (local)"
echo ""
echo -e "${GREEN}✨ FlexJobs is now running persistently with PM2!${NC}"
