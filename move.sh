#!/bin/bash
# Move FlexJobs to Standard Ports (80/443)
# Since flexjobseu.com is dedicated to FlexJobs, use standard ports

echo "🔄 MOVING FLEXJOBS TO STANDARD PORTS"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Since flexjobseu.com is dedicated to FlexJobs, we can use standard ports:${NC}"
echo "• Port 80 (HTTP) for flexjobseu.com"
echo "• Port 443 (HTTPS) for flexjobseu.com"  
echo "• No conflict with your other domain/app"
echo ""
read -p "Continue? (y/N): " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}1. Backing up current configuration...${NC}"
sudo cp /etc/nginx/sites-available/flexjobs /etc/nginx/sites-available/flexjobs.backup.$(date +%Y%m%d-%H%M%S)

echo ""
echo -e "${YELLOW}2. Creating new configuration for standard ports...${NC}"

sudo tee /etc/nginx/sites-available/flexjobs << 'EOF'
# HTTP server on standard port 80
server {
    listen 80;
    listen [::]:80;
    server_name flexjobseu.com www.flexjobseu.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server on standard port 443
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flexjobseu.com www.flexjobseu.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/flexjobseu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flexjobseu.com/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/flexjobseu.com/chain.pem;

    # Proxy to FlexJobs app
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

    # Enhanced security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

echo ""
echo -e "${YELLOW}3. Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}4. Checking for port conflicts...${NC}"
echo "Checking if anything else is using port 80 for flexjobseu.com..."
CONFLICT_80=$(sudo netstat -tlnp | grep ':80 ')
if [ -n "$CONFLICT_80" ]; then
    echo "Port 80 is in use:"
    echo "$CONFLICT_80"
    echo ""
    echo "This should be fine if it's nginx serving different domains."
else
    echo "Port 80 is free."
fi

echo ""
echo "Checking if anything else is using port 443 for flexjobseu.com..."
CONFLICT_443=$(sudo netstat -tlnp | grep ':443 ')
if [ -n "$CONFLICT_443" ]; then
    echo "Port 443 is in use:"
    echo "$CONFLICT_443"
    echo ""
    echo "This should be fine if it's nginx serving different domains."
else
    echo "Port 443 is free."
fi

echo ""
echo -e "${YELLOW}5. Reloading nginx with new configuration...${NC}"
sudo systemctl reload nginx

if systemctl is-active nginx >/dev/null; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Nginx failed to reload${NC}"
    sudo systemctl status nginx --no-pager
    exit 1
fi

echo ""
echo -e "${YELLOW}6. Testing new endpoints...${NC}"

echo "Testing HTTP (should redirect to HTTPS):"
HTTP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost 2>/dev/null || echo 'FAILED')
echo "HTTP port 80: $HTTP_TEST"

echo ""
echo "Testing HTTPS:"
HTTPS_TEST=$(curl -s -o /dev/null -w '%{http_code}' https://localhost 2>/dev/null || echo 'FAILED')
echo "HTTPS port 443: $HTTPS_TEST"

echo ""
echo "Testing direct app:"
APP_TEST=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'FAILED')
echo "App port 3003: $APP_TEST"

echo ""
echo -e "${GREEN}🎉 FLEXJOBS MOVED TO STANDARD PORTS!${NC}"
echo ""
echo -e "${GREEN}Your website is now accessible at:${NC}"
echo -e "${GREEN}• https://flexjobseu.com (standard HTTPS - RECOMMENDED)${NC}"
echo -e "${GREEN}• http://flexjobseu.com (redirects to HTTPS)${NC}"
echo ""
echo -e "${BLUE}No more port numbers needed!${NC}"
echo ""
echo "Legacy URLs still work:"
echo "• https://flexjobseu.com:8443 (old HTTPS port)"
echo "• http://flexjobseu.com:8080 (old HTTP port)"
echo ""
echo -e "${YELLOW}Update your site's internal links and SEO to use the standard URLs${NC}"

