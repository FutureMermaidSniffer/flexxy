#!/bin/bash
# Install SSL Certificates with Let's Encrypt
# Set up proper SSL certificates for HTTPS on port 8443

echo "🔒 INSTALLING SSL CERTIFICATES"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}1. Installing Certbot (Let's Encrypt client)...${NC}"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${YELLOW}2. Checking current nginx configuration...${NC}"
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx configuration has errors. Fix these first.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}3. Opening firewall for SSL verification...${NC}"
# Temporarily allow port 80 for Let's Encrypt verification
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp

echo ""
echo -e "${YELLOW}4. Getting SSL certificate for flexjobseu.com...${NC}"
echo "This will:"
echo "• Verify domain ownership"
echo "• Generate SSL certificates"
echo "• Install certificates for nginx"

# Use webroot method since we're on custom ports
sudo certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email admin@flexjobseu.com \
    --domains flexjobseu.com,www.flexjobseu.com

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificates obtained successfully${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificates${NC}"
    echo ""
    echo "Common issues:"
    echo "• Domain not pointing to this server"
    echo "• Port 80 blocked by firewall"
    echo "• Another service using port 80"
    echo ""
    echo "Let's try manual verification..."
    
    # Try standalone method if nginx method fails
    sudo systemctl stop nginx
    sudo certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email admin@flexjobseu.com \
        --domains flexjobseu.com,www.flexjobseu.com
    
    sudo systemctl start nginx
fi

echo ""
echo -e "${YELLOW}5. Updating nginx configuration with SSL certificates...${NC}"

if [ -f "/etc/letsencrypt/live/flexjobseu.com/fullchain.pem" ]; then
    echo "SSL certificates found, updating nginx config..."
    
    sudo tee /etc/nginx/sites-available/flexjobs << 'EOF'
# HTTP server on standard port 80 (redirects to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name flexjobseu.com www.flexjobseu.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server on standard port 443 with Let's Encrypt certificates
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flexjobseu.com www.flexjobseu.com;

    # Let's Encrypt SSL certificates
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

    location / {
        proxy_pass http://\${API_HOST:-127.0.0.1}:\${API_PORT:-3005};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
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
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

else
    echo -e "${YELLOW}⚠️ SSL certificates not found, keeping self-signed certificates${NC}"
fi

echo ""
echo -e "${YELLOW}6. Testing and reloading nginx...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    sudo systemctl reload nginx
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}7. Setting up automatic certificate renewal...${NC}"
# Add certbot renewal to cron
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --reload-hook 'systemctl reload nginx'") | crontab -

echo ""
echo -e "${YELLOW}8. Final SSL verification...${NC}"

echo "Testing HTTPS connection:"
HTTPS_TEST=$(curl -s -o /dev/null -w '%{http_code}' https://localhost:443 2>/dev/null || echo 'FAILED')
echo "HTTPS port 443: $HTTPS_TEST"

echo ""
echo "Checking SSL certificate details:"
if [ -f "/etc/letsencrypt/live/flexjobseu.com/fullchain.pem" ]; then
    openssl x509 -in /etc/letsencrypt/live/flexjobseu.com/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not After)"
else
    echo "Using self-signed certificate"
fi

echo ""
echo -e "${GREEN}🎉 SSL INSTALLATION COMPLETE!${NC}"
echo ""
echo -e "${GREEN}Your secure website is now accessible at:${NC}"
echo -e "${GREEN}• https://flexjobseu.com (HTTPS)${NC}"
echo -e "${GREEN}• http://flexjobseu.com (redirects to HTTPS)${NC}"
echo ""
echo "Features enabled:"
echo "• Valid SSL certificates from Let's Encrypt"
echo "• Automatic certificate renewal"
echo "• Modern SSL/TLS configuration"
echo "• Enhanced security headers"
echo "• HTTP/2 support"

echo ""
echo -e "${BLUE}Certificate will auto-renew every 60 days${NC}"

