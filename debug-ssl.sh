#!/bin/bash
# SSL Certificate Debugging Script for flexjob.uk
# Run this on your server to diagnose SSL certificate issues

echo "🔍 SSL CERTIFICATE DEBUGGING FOR FLEXJOB.UK"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Domain to check
DOMAIN="flexjob.uk"

echo -e "${BLUE}Checking SSL certificate setup for: $DOMAIN${NC}"
echo ""

# 1. Check if certificate files exist
echo -e "${YELLOW}1. Certificate Files Check${NC}"
echo "================================"

CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
FILES_TO_CHECK=(
    "$CERT_DIR/fullchain.pem"
    "$CERT_DIR/privkey.pem"
    "$CERT_DIR/chain.pem"
    "$CERT_DIR/cert.pem"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
        echo "   Size: $(stat -c%s "$file") bytes"
        echo "   Modified: $(stat -c%y "$file")"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

echo ""

# 2. Check certificate permissions
echo -e "${YELLOW}2. Certificate Permissions${NC}"
echo "==========================="

if [ -d "$CERT_DIR" ]; then
    echo "Directory permissions:"
    ls -la "$CERT_DIR"
    echo ""
    
    # Check if nginx user can read certificates
    NGINX_USER=$(ps aux | grep nginx | grep -v grep | head -1 | awk '{print $1}')
    echo "Nginx running as user: $NGINX_USER"
    
    if [ ! -z "$NGINX_USER" ] && [ "$NGINX_USER" != "root" ]; then
        echo "Testing certificate access for nginx user..."
        sudo -u $NGINX_USER test -r "$CERT_DIR/fullchain.pem" && echo -e "${GREEN}✅ Nginx can read fullchain.pem${NC}" || echo -e "${RED}❌ Nginx cannot read fullchain.pem${NC}"
        sudo -u $NGINX_USER test -r "$CERT_DIR/privkey.pem" && echo -e "${GREEN}✅ Nginx can read privkey.pem${NC}" || echo -e "${RED}❌ Nginx cannot read privkey.pem${NC}"
    fi
else
    echo -e "${RED}❌ Certificate directory not found: $CERT_DIR${NC}"
fi

echo ""

# 3. Check certificate validity
echo -e "${YELLOW}3. Certificate Validity${NC}"
echo "======================="

if [ -f "$CERT_DIR/fullchain.pem" ]; then
    echo "Certificate details:"
    openssl x509 -in "$CERT_DIR/fullchain.pem" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:)"
    echo ""
    
    # Check if certificate is expired
    if openssl x509 -checkend 86400 -noout -in "$CERT_DIR/fullchain.pem"; then
        echo -e "${GREEN}✅ Certificate is valid for at least 24 hours${NC}"
    else
        echo -e "${RED}❌ Certificate will expire within 24 hours${NC}"
    fi
    
    # Check certificate expiry date
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_DIR/fullchain.pem" | cut -d= -f2)
    echo "Certificate expires: $EXPIRY"
else
    echo -e "${RED}❌ Cannot check certificate validity - file not found${NC}"
fi

echo ""

# 4. Check nginx configuration
echo -e "${YELLOW}4. Nginx Configuration${NC}"
echo "====================="

# Test nginx configuration
echo "Testing nginx configuration:"
if nginx -t 2>&1 | head -10; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
fi

echo ""

# Check if nginx is running
echo "Nginx status:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
    echo "Nginx processes:"
    ps aux | grep nginx | grep -v grep
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

echo ""

# 5. Check port bindings
echo -e "${YELLOW}5. Port Bindings${NC}"
echo "==============="

echo "Checking what's listening on ports 80 and 443:"
echo "Port 80:"
sudo netstat -tlnp | grep ':80 ' || echo "Nothing listening on port 80"
echo "Port 443:"
sudo netstat -tlnp | grep ':443 ' || echo "Nothing listening on port 443"

echo ""

# 6. Check application port
echo -e "${YELLOW}6. Application Port Check${NC}"
echo "========================="

echo "Checking what's listening on port 3005 (your application):"
sudo netstat -tlnp | grep ':3005 ' || echo "Nothing listening on port 3005"

# Test if your app responds
echo "Testing application response:"
if curl -f -s http://localhost:3005/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application responds on port 3005${NC}"
else
    echo -e "${RED}❌ Application not responding on port 3005${NC}"
fi

echo ""

# 7. DNS Check
echo -e "${YELLOW}7. DNS Resolution${NC}"
echo "=================="

echo "Checking DNS resolution for $DOMAIN:"
dig +short $DOMAIN A | head -5
echo ""
echo "Checking DNS resolution for www.$DOMAIN:"
dig +short www.$DOMAIN A | head -5

echo ""

# 8. External SSL Test
echo -e "${YELLOW}8. External SSL Test${NC}"
echo "==================="

echo "Testing SSL connection from external perspective:"
echo "This may take a moment..."

# Test SSL connection
if timeout 10 openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ SSL connection successful${NC}"
else
    echo -e "${RED}❌ SSL connection failed${NC}"
    echo "Detailed SSL test:"
    timeout 10 openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>&1 | grep -E "(Verify return code|Certificate chain|subject|issuer)" | head -10
fi

echo ""

# 9. Firewall Check
echo -e "${YELLOW}9. Firewall Status${NC}"
echo "=================="

if command -v ufw >/dev/null 2>&1; then
    echo "UFW Status:"
    sudo ufw status | grep -E "(Status|80|443)"
elif command -v firewalld >/dev/null 2>&1; then
    echo "Firewalld Status:"
    sudo firewall-cmd --list-ports 2>/dev/null | grep -E "(80|443)" || echo "Ports 80/443 not explicitly opened"
else
    echo "No common firewall detected (ufw/firewalld)"
fi

echo ""

# 10. Let's Encrypt Certificate Renewal
echo -e "${YELLOW}10. Let's Encrypt Status${NC}"
echo "========================"

if command -v certbot >/dev/null 2>&1; then
    echo "Certbot version:"
    certbot --version
    echo ""
    echo "Certificate status:"
    sudo certbot certificates | grep -A 10 "$DOMAIN" || echo "No certificates found for $DOMAIN"
    echo ""
    echo "Auto-renewal status:"
    sudo systemctl status certbot.timer 2>/dev/null | head -5 || echo "Certbot timer not found"
else
    echo "Certbot not installed"
fi

echo ""
echo -e "${BLUE}🔧 RECOMMENDED FIXES${NC}"
echo "==================="

echo "Based on your nginx config, here are the main issues:"
echo ""
echo -e "${YELLOW}1. Port Mismatch:${NC}"
echo "   Your nginx proxies to localhost:3000 and localhost:3001"
echo "   But your FlexJobs app runs on port 3005"
echo "   Fix: Change proxy_pass to http://localhost:3005"
echo ""
echo -e "${YELLOW}2. Missing SSL Security:${NC}"
echo "   Your SSL config is basic"
echo "   Fix: Use the corrected nginx-ssl-corrected.conf file"
echo ""
echo -e "${YELLOW}3. Certificate Access:${NC}"
echo "   Check if nginx can read certificate files"
echo "   Fix: sudo chown -R root:nginx /etc/letsencrypt/live/"
echo "        sudo chmod -R 750 /etc/letsencrypt/live/"
echo ""

echo -e "${GREEN}✨ Run this script again after making changes to verify the fixes!${NC}"
