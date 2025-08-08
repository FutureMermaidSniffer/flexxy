#!/bin/bash
# Fix Port Conflict Issues
# Stop all processes using port 3003 and restart properly

echo "🔧 FIXING PORT 3003 CONFLICTS"
echo "============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Checking what's using port 3003...${NC}"
sudo netstat -tlnp | grep ':3003' || echo "Nothing found on port 3003"
sudo lsof -i :3003 2>/dev/null || echo "No processes found using port 3003"

echo ""
echo -e "${YELLOW}2. Stopping all PM2 processes...${NC}"
pm2 stop all
pm2 delete all

echo ""
echo -e "${YELLOW}3. Killing any remaining processes on port 3003...${NC}"
# Kill any processes still using port 3003
sudo pkill -f "node.*3003" 2>/dev/null || echo "No node processes found"
sudo fuser -k 3003/tcp 2>/dev/null || echo "No processes to kill on port 3003"

echo ""
echo -e "${YELLOW}4. Waiting for port to be free...${NC}"
sleep 3

echo "Checking port 3003 again:"
sudo netstat -tlnp | grep ':3003' || echo "✅ Port 3003 is now free"

echo ""
echo -e "${YELLOW}5. Starting application in FORK mode (not cluster)...${NC}"
cd ~/flexxy

# Start in fork mode instead of cluster mode to avoid port conflicts
pm2 start server.js --name flexjobs --instances 1 --exec-mode fork

sleep 5

echo ""
echo -e "${YELLOW}6. Checking final status...${NC}"
echo "PM2 Status:"
pm2 list

echo ""
echo "Port 3003 check:"
PORT_CHECK=$(sudo netstat -tlnp | grep ':3003')
if [ -n "$PORT_CHECK" ]; then
    echo -e "${GREEN}✅ App is now listening on port 3003${NC}"
    echo "$PORT_CHECK"
else
    echo -e "${RED}❌ Still nothing listening on port 3003${NC}"
fi

echo ""
echo "Testing endpoints:"
sleep 3
APP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "Direct app test: $APP_TEST"

NGINX_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'FAILED')
echo "Nginx proxy test: $NGINX_TEST"

echo ""
if [ "$APP_TEST" = "200" ] || [ "$APP_TEST" = "302" ] || [ "$APP_TEST" = "404" ]; then
    echo -e "${GREEN}🎉 SUCCESS! Application is working!${NC}"
    echo -e "${GREEN}Your website is live at:${NC}"
    echo -e "${GREEN}  • http://flexjobseu.com:8080${NC}"
    echo -e "${GREEN}  • http://144.126.154.23:8080${NC}"
else
    echo -e "${YELLOW}⚠️ Still getting $APP_TEST response. Checking logs...${NC}"
    echo ""
    echo "Recent PM2 logs:"
    pm2 logs flexjobs --lines 10 --nostream 2>/dev/null || echo "No logs available"
fi

