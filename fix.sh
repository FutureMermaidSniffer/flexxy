#!/bin/bash
# Fix Environment Configuration Issues
# Correct database and Redis connection settings

echo "🔧 FIXING ENVIRONMENT CONFIGURATION"
echo "==================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd ~/flexxy

echo -e "${YELLOW}1. Current .env file issues:${NC}"
echo "DB_PORT should be 5432 (not 5433)"
echo "Redis host should be localhost (not flexjobs-redis)"
echo "NODE_ENV should be production"
echo ""

echo -e "${YELLOW}2. Backing up current .env...${NC}"
cp .env .env.backup
echo "Backup saved as .env.backup"

echo -e "${YELLOW}3. Creating corrected .env file...${NC}"
cat > .env << 'EOF'
NODE_ENV=production
PORT=3003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flexjobs_db
DB_USER=kai
DB_PASSWORD=11223344
REDIS_HOST=localhost
REDIS_PORT=6379
SITE_URL=http://flexjobseu.com:8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
SESSION_SECRET=your-super-secret-session-key-change-this-too-2024
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=15
EOF

echo -e "${GREEN}✅ New .env file created${NC}"

echo -e "${YELLOW}4. Verifying configuration...${NC}"
echo "Database connection test:"
if PGPASSWORD=11223344 psql -h localhost -U kai -d flexjobs_db -p 5432 -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection on port 5432 works${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

echo ""
echo "Redis connection test:"
if redis-cli -h localhost -p 6379 ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis connection to localhost:6379 works${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
fi

echo ""
echo -e "${YELLOW}5. Testing app startup manually...${NC}"
echo "Testing if app can start with new config (10 second test)..."
timeout 10s node server.js 2>&1 | head -10

echo ""
echo -e "${YELLOW}6. Restarting PM2 with fixed config...${NC}"
pm2 stop flexjobs 2>/dev/null
pm2 delete flexjobs 2>/dev/null

echo "Starting with corrected environment..."
pm2 start server.js --name flexjobs --instances 1

sleep 5

echo ""
echo -e "${YELLOW}7. Final verification...${NC}"
echo "PM2 Status:"
pm2 list

echo ""
echo "Port 3003 check:"
PORT_CHECK=$(sudo netstat -tlnp | grep ':3003 ')
if [ -n "$PORT_CHECK" ]; then
    echo -e "${GREEN}✅ App is listening on port 3003${NC}"
    echo "$PORT_CHECK"
else
    echo -e "${RED}❌ Nothing listening on port 3003${NC}"
fi

echo ""
echo "App health check:"
sleep 2
APP_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "Direct app test: $APP_RESPONSE"

echo ""
echo "Nginx proxy check:"
NGINX_RESPONSE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'FAILED')
echo "Nginx proxy test: $NGINX_RESPONSE"

echo ""
if [ "$APP_RESPONSE" = "200" ] || [ "$APP_RESPONSE" = "302" ] || [ "$APP_RESPONSE" = "404" ]; then
    echo -e "${GREEN}🎉 SUCCESS! Your application is now running!${NC}"
    echo -e "${GREEN}Access your site at:${NC}"
    echo -e "${GREEN}  • http://flexjobseu.com:8080${NC}"
    echo -e "${GREEN}  • http://144.126.154.23:8080${NC}"
    echo ""
    echo "If the website still doesn't load externally, check your firewall:"
    echo "  sudo ufw allow 8080"
elif [ "$NGINX_RESPONSE" = "502" ]; then
    echo -e "${YELLOW}⚠️  App might still be starting up. Check PM2 logs:${NC}"
    echo "  pm2 logs flexjobs --lines 10"
else
    echo -e "${RED}❌ Still having issues. Check the logs:${NC}"
    echo "Recent PM2 logs:"
    pm2 logs flexjobs --lines 5 --nostream 2>/dev/null || echo "No logs available"
fi

