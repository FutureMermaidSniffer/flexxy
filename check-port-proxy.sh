#!/bin/bash
# Check Port and Proxy Configuration
# Verify nginx proxy and firewall settings

echo "🔍 CHECKING PORT AND PROXY CONFIGURATION"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Current PM2 status:${NC}"
pm2 list

echo ""
echo -e "${YELLOW}2. Port listening check:${NC}"
echo "Port 3005 (App):"
sudo netstat -tlnp | grep ':3005' || echo "Nothing listening"

echo ""
echo "Port 8080 (Nginx):"
sudo netstat -tlnp | grep ':8080' || echo "Nothing listening"

echo ""
echo -e "${YELLOW}3. Nginx status and configuration:${NC}"
echo "Nginx status: $(systemctl is-active nginx)"

echo ""
echo "Nginx configuration test:"
sudo nginx -t

echo ""
echo "Active nginx sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo -e "${YELLOW}4. Testing connections locally:${NC}"
echo "Direct app test (localhost:3003):"
curl -s -I http://localhost:3003 | head -3 || echo "Connection failed"

echo ""
echo "Nginx proxy test (localhost:8080):"
curl -s -I http://localhost:8080 | head -3 || echo "Connection failed"

echo ""
echo -e "${YELLOW}5. Firewall status:${NC}"
if command -v ufw &> /dev/null; then
    echo "UFW status:"
    sudo ufw status || echo "UFW not active"
else
    echo "UFW not installed"
fi

echo ""
echo "Checking iptables for port 8080:"
sudo iptables -L -n | grep 8080 || echo "No iptables rules for port 8080"

echo ""
echo -e "${YELLOW}6. Network interface check:${NC}"
echo "Server IP addresses:"
ip addr show | grep "inet " | grep -v "127.0.0.1"

echo ""
echo -e "${YELLOW}7. DNS resolution test:${NC}"
echo "Checking if flexjobseu.com resolves to this server:"
SERVER_IP=$(curl -s -4 ifconfig.me 2>/dev/null || echo "unknown")
DOMAIN_IP=$(nslookup flexjobseu.com | grep "Address:" | tail -1 | awk '{print $2}' 2>/dev/null || echo "unknown")
echo "Server IP: $SERVER_IP"
echo "Domain IP: $DOMAIN_IP"

if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    echo -e "${GREEN}✅ Domain correctly points to this server${NC}"
else
    echo -e "${YELLOW}⚠️ Domain may not point to this server${NC}"
fi

echo ""
echo -e "${YELLOW}8. Quick fixes to try:${NC}"
echo ""
echo "If accessing by domain doesn't work, try:"
echo "  • http://$SERVER_IP:8080 (direct IP)"
echo "  • http://flexjobseu.com:8080 (with port)"
echo ""
echo "If still not working, enable firewall for port 8080:"
echo "  sudo ufw allow 8080"
echo ""
echo "Or restart nginx:"
echo "  sudo systemctl restart nginx"

echo ""
echo -e "${YELLOW}9. External connectivity test:${NC}"
echo "Testing if port 8080 is reachable externally..."
if command -v nc &> /dev/null; then
    timeout 5s nc -zv localhost 8080 2>&1 || echo "Port 8080 not reachable"
else
    echo "netcat not available for port test"
fi

