#!/bin/bash
# Fresh FlexJobs Native Deployment Script
# Clean deployment without Docker complexity

set -e

echo "🚀 FlexJobs Fresh Native Deployment"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration from your .env file
DB_NAME="flexjobs_db"
DB_USER="kai"
DB_PASSWORD="11223344"
APP_DIR="/var/www/flexjobs"
DOMAIN="flexjobseu.com"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo "  Database: $DB_NAME"
echo "  Port: 8080 (HTTP)"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Run this from your FlexJobs project directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing system packages...${NC}"
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib nginx redis-server curl

echo -e "${YELLOW}🗄️ Setting up PostgreSQL...${NC}"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Wait for PostgreSQL to start
sleep 3

# Setup database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo -e "${YELLOW}📨 Setting up Redis...${NC}"
sudo systemctl start redis-server
sudo systemctl enable redis-server

echo -e "${YELLOW}📁 Setting up application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy files to production directory
cp -r ./* $APP_DIR/
cd $APP_DIR

echo -e "${YELLOW}📚 Installing Node.js dependencies...${NC}"
npm install

echo -e "${YELLOW}⚙️ Creating production environment...${NC}"
# Update .env for production
cat > .env << EOF
NODE_ENV=production
PORT=3003

# Database Configuration
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=5432

# Security Secrets (you should change these)
SESSION_SECRET=your-super-secret-session-key-here
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure

# Site Configuration
SITE_URL=http://$DOMAIN:8080
FRONTEND_URL=http://$DOMAIN:8080
API_URL=http://$DOMAIN:8080

# CORS Configuration
ALLOWED_ORIGINS=http://$DOMAIN:8080,https://$DOMAIN:8443

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Production Settings
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
EOF

echo -e "${YELLOW}🏗️ Setting up database schema...${NC}"
# Run database migrations/schema
if [ -f "database/agents_schema_postgres.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f database/agents_schema_postgres.sql
elif [ -f "database/schema.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f database/schema.sql
fi

# Create sample data if available
if [ -f "database/create_sample_jobs.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f database/create_sample_jobs.sql
fi

echo -e "${YELLOW}📂 Creating directories...${NC}"
mkdir -p uploads logs
chmod 755 uploads logs

echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"
# Create nginx config
sudo tee /etc/nginx/sites-available/flexjobs << EOF
server {
    listen 8080;
    listen [::]:8080;
    server_name $DOMAIN www.$DOMAIN;

    # Basic security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Main application proxy
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file serving
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3003/health;
        access_log off;
    }

    # Nginx health check
    location /nginx-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/flexjobs /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
    sudo systemctl restart nginx
    sudo systemctl enable nginx
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Installing PM2 process manager...${NC}"
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'flexjobs',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
};
EOF

echo -e "${YELLOW}🔥 Setting up firewall...${NC}"
sudo ufw allow 8080
sudo ufw allow 22  # Keep SSH open

echo -e "${YELLOW}�� Starting the application...${NC}"
pm2 delete flexjobs 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup --force

# Wait for app to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 5

# Final tests
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Test app directly
APP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "App (port 3003): $APP_STATUS"

# Test nginx proxy
NGINX_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'FAILED')
echo "Nginx (port 8080): $NGINX_STATUS"

# Get server IP
SERVER_IP=$(curl -s -4 ifconfig.me 2>/dev/null || echo "Unknown")

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT SUMMARY${NC}"
echo "=================================="
echo "Server IP: $SERVER_IP"
echo "App Status: $APP_STATUS"
echo "Nginx Status: $NGINX_STATUS"
echo ""

if [ "$APP_STATUS" = "200" ] && [ "$NGINX_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS! Your FlexJobs site is live!${NC}"
    echo ""
    echo -e "${YELLOW}🧪 Test these URLs:${NC}"
    echo "   http://$SERVER_IP:8080"
    echo "   http://$DOMAIN:8080"
    echo ""
    echo -e "${YELLOW}📊 Service Status:${NC}"
    echo "   PostgreSQL: $(systemctl is-active postgresql)"
    echo "   Redis: $(systemctl is-active redis-server)"
    echo "   Nginx: $(systemctl is-active nginx)"
    echo "   PM2: $(pm2 list | grep -c online) processes running"
else
    echo -e "${RED}❌ Deployment issues detected${NC}"
    echo ""
    echo -e "${YELLOW}�� Troubleshooting:${NC}"
    echo "   Check app logs: pm2 logs flexjobs"
    echo "   Check nginx: sudo nginx -t"
    echo "   Check services: sudo systemctl status postgresql nginx redis-server"
fi

echo ""
echo -e "${YELLOW}📝 Useful Commands:${NC}"
echo "   View logs: pm2 logs flexjobs"
echo "   Restart app: pm2 restart flexjobs"
echo "   Check status: pm2 status"
echo "   Edit config: nano $APP_DIR/.env"

