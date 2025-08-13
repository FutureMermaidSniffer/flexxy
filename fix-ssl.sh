#!/bin/bash
# Quick SSL Fix Script for flexjob.uk
# Run this on your server to fix the SSL certificate issues

echo "🔧 QUICK SSL FIX FOR FLEXJOB.UK"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script needs to be run as root or with sudo${NC}"
    echo "Usage: sudo ./fix-ssl.sh"
    exit 1
fi

echo -e "${YELLOW}🔍 Diagnosing current setup...${NC}"

# 1. Backup current nginx config
NGINX_SITE="/etc/nginx/sites-available/flexjob.uk"
if [ -f "$NGINX_SITE" ]; then
    echo -e "${YELLOW}📋 Backing up current nginx config...${NC}"
    cp "$NGINX_SITE" "$NGINX_SITE.backup.$(date +%Y%m%d-%H%M%S)"
    echo -e "${GREEN}✅ Backup created${NC}"
else
    echo -e "${YELLOW}⚠️  Creating new nginx site config${NC}"
fi

# 2. Create corrected nginx configuration
echo -e "${YELLOW}📝 Creating corrected nginx configuration...${NC}"

cat > "$NGINX_SITE" << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name flexjob.uk www.flexjob.uk;
    
    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name flexjob.uk www.flexjob.uk;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/flexjob.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flexjob.uk/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/flexjob.uk/chain.pem;

    # SSL Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Main application proxy - CORRECTED TO PORT 3005
    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin endpoints
    location /admin {
        proxy_pass http://localhost:3005/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3005/health;
        access_log off;
    }
}
EOF

echo -e "${GREEN}✅ Nginx configuration updated${NC}"

# 3. Fix certificate permissions
echo -e "${YELLOW}🔐 Fixing certificate permissions...${NC}"

CERT_DIR="/etc/letsencrypt/live/flexjob.uk"
if [ -d "$CERT_DIR" ]; then
    chown -R root:www-data /etc/letsencrypt/
    chmod -R 750 /etc/letsencrypt/live/
    chmod -R 750 /etc/letsencrypt/archive/
    echo -e "${GREEN}✅ Certificate permissions fixed${NC}"
else
    echo -e "${RED}❌ Certificate directory not found: $CERT_DIR${NC}"
    echo -e "${YELLOW}💡 You may need to obtain SSL certificates first${NC}"
fi

# 4. Enable the site
echo -e "${YELLOW}🔗 Enabling nginx site...${NC}"

if [ ! -L "/etc/nginx/sites-enabled/flexjob.uk" ]; then
    ln -sf "$NGINX_SITE" "/etc/nginx/sites-enabled/flexjob.uk"
    echo -e "${GREEN}✅ Site enabled${NC}"
else
    echo -e "${GREEN}✅ Site already enabled${NC}"
fi

# 5. Remove default nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo -e "${YELLOW}🗑️  Removing default nginx site...${NC}"
    rm -f "/etc/nginx/sites-enabled/default"
    echo -e "${GREEN}✅ Default site removed${NC}"
fi

# 6. Test nginx configuration
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"

if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    echo "Reverting to backup..."
    if [ -f "$NGINX_SITE.backup.*" ]; then
        cp "$NGINX_SITE.backup."* "$NGINX_SITE"
    fi
    exit 1
fi

# 7. Restart nginx
echo -e "${YELLOW}🔄 Restarting nginx...${NC}"

systemctl restart nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
else
    echo -e "${RED}❌ Nginx failed to restart${NC}"
    systemctl status nginx
    exit 1
fi

# 8. Test the setup
echo -e "${YELLOW}🧪 Testing the setup...${NC}"

sleep 2

# Test HTTP redirect
echo "Testing HTTP redirect..."
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://flexjob.uk/)
if [ "$HTTP_TEST" = "301" ] || [ "$HTTP_TEST" = "302" ]; then
    echo -e "${GREEN}✅ HTTP redirect working${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP redirect returned: $HTTP_TEST${NC}"
fi

# Test HTTPS
echo "Testing HTTPS connection..."
if curl -f -s -k https://flexjob.uk/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS connection working${NC}"
else
    echo -e "${RED}❌ HTTPS connection failed${NC}"
fi

# Test if your app is running
echo "Testing application on port 3005..."
if curl -f -s http://localhost:3005/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application responding on port 3005${NC}"
else
    echo -e "${RED}❌ Application not responding on port 3005${NC}"
    echo -e "${YELLOW}💡 Make sure your FlexJobs app is running:${NC}"
    echo "   pm2 status"
    echo "   pm2 restart flexjobs-uk"
fi

echo ""
echo -e "${GREEN}🎉 SSL CONFIGURATION COMPLETE!${NC}"
echo ""
echo -e "${YELLOW}📋 What was fixed:${NC}"
echo "• Nginx now proxies to correct port (3005)"
echo "• SSL certificate permissions corrected"
echo "• Proper SSL security configuration added"
echo "• HTTP to HTTPS redirect configured"
echo ""
echo -e "${YELLOW}🧪 Test your site:${NC}"
echo "• http://flexjob.uk (should redirect to HTTPS)"
echo "• https://flexjob.uk (should load your app)"
echo ""
echo -e "${YELLOW}🔍 If issues persist, run:${NC}"
echo "• ./debug-ssl.sh (for detailed diagnostics)"
echo "• systemctl status nginx"
echo "• tail -f /var/log/nginx/error.log"
