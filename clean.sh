#!/bin/bash
# Clean Up Nginx Configuration - Ensure Single Config
# Remove all conflicting nginx configs and create one clean configuration

echo "🧹 CLEANING UP NGINX CONFIGURATION"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}1. Current nginx configuration status:${NC}"
echo "Active sites-enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled directory"

echo ""
echo "Available sites-available:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "No sites-available directory"

echo ""
echo "Config files in conf.d:"
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "No conf.d directory"

echo ""
echo -e "${YELLOW}2. Stopping nginx temporarily...${NC}"
sudo systemctl stop nginx

echo ""
echo -e "${YELLOW}3. Backing up existing configurations...${NC}"
sudo mkdir -p /etc/nginx/backup-$(date +%Y%m%d-%H%M%S)
sudo cp -r /etc/nginx/sites-* /etc/nginx/backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || echo "No sites directories to backup"
sudo cp -r /etc/nginx/conf.d /etc/nginx/backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || echo "No conf.d to backup"

echo ""
echo -e "${YELLOW}4. Removing ALL existing site configurations...${NC}"
# Remove all sites-enabled
sudo rm -f /etc/nginx/sites-enabled/*

# Remove all sites-available 
sudo rm -f /etc/nginx/sites-available/*

# Remove any flexjobs or default configs in conf.d
sudo rm -f /etc/nginx/conf.d/default.conf
sudo rm -f /etc/nginx/conf.d/flexjobs*

echo -e "${GREEN}✅ All existing configurations removed${NC}"

echo ""
echo -e "${YELLOW}5. Creating single clean FlexJobs configuration...${NC}"

sudo tee /etc/nginx/sites-available/flexjobs << 'EOF'
# HTTP server on port 8080
server {
    listen 8080;
    listen [::]:8080;
    server_name flexjobseu.com www.flexjobseu.com _;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /nginx-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# HTTPS server on port 8443 (ready for SSL certificates)
server {
    listen 8443 ssl http2;
    listen [::]:8443 ssl http2;
    server_name flexjobseu.com www.flexjobseu.com;

    # SSL certificate paths (will be added by SSL script)
    # ssl_certificate /etc/letsencrypt/live/flexjobseu.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/flexjobseu.com/privkey.pem;

    # Temporary self-signed for now
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /nginx-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Enhanced security headers for HTTPS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

echo ""
echo -e "${YELLOW}6. Enabling the single configuration...${NC}"
sudo ln -sf /etc/nginx/sites-available/flexjobs /etc/nginx/sites-enabled/flexjobs

echo ""
echo -e "${YELLOW}7. Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    echo "Configuration errors above need to be fixed"
    exit 1
fi

echo ""
echo -e "${YELLOW}8. Starting nginx with clean configuration...${NC}"
sudo systemctl start nginx

if systemctl is-active nginx >/dev/null; then
    echo -e "${GREEN}✅ Nginx started successfully${NC}"
else
    echo -e "${RED}❌ Nginx failed to start${NC}"
    sudo systemctl status nginx --no-pager
    exit 1
fi

echo ""
echo -e "${YELLOW}9. Final verification...${NC}"
echo "Active configurations:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "Port status:"
sudo netstat -tlnp | grep nginx

echo ""
echo "Testing endpoints:"
HTTP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'FAILED')
echo "HTTP port 8080: $HTTP_TEST"

HTTPS_TEST=$(curl -s -k -o /dev/null -w '%{http_code}' https://localhost:8443 2>/dev/null || echo 'FAILED')
echo "HTTPS port 8443: $HTTPS_TEST"

APP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "App port 3003: $APP_TEST"

echo ""
echo -e "${GREEN}🎉 NGINX CLEANUP COMPLETE!${NC}"
echo ""
echo "Summary of changes:"
echo "• Removed all conflicting nginx configurations"
echo "• Created single clean configuration in /etc/nginx/sites-available/flexjobs"
echo "• Nginx now listens on port 8080 (avoiding conflict with your other app)"
echo "• All traffic proxied to your app on port 3003"
echo ""
echo -e "${YELLOW}Your site should now be accessible at:${NC}"
echo "• http://flexjobseu.com:8080 (HTTP)"
echo "• https://flexjobseu.com:8443 (HTTPS - self-signed cert for now)"
echo "• http://144.126.154.23:8080 (HTTP direct IP)"
echo "• https://144.126.154.23:8443 (HTTPS direct IP)"
echo ""
echo -e "${BLUE}Next step: Run SSL installation script${NC}"

