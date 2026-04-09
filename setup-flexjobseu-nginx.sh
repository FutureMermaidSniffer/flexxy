#!/bin/bash

# Setup script for FlexJobsEU nginx configuration
# This script links the nginx config to sites-enabled and obtains SSL certificates

set -e

echo "==================================="
echo "FlexJobsEU Nginx Setup Script"
echo "==================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Variables
CONFIG_NAME="flexjobseu"
SOURCE_CONFIG="/home/kai/Documents/flexxy/nginx-flexjobseu.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/$CONFIG_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$CONFIG_NAME"
DOMAIN="flexjobseu.com"
EMAIL="admin@flexjobseu.com"

echo ""
echo "Step 1: Copying nginx configuration..."
cp "$SOURCE_CONFIG" "$NGINX_AVAILABLE"
echo "✓ Configuration copied to $NGINX_AVAILABLE"

echo ""
echo "Step 2: Creating symbolic link to sites-enabled..."
if [ -L "$NGINX_ENABLED" ]; then
    echo "Symbolic link already exists, removing old one..."
    rm "$NGINX_ENABLED"
fi
ln -s "$NGINX_AVAILABLE" "$NGINX_ENABLED"
echo "✓ Symbolic link created"

echo ""
echo "Step 3: Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors. Please fix them before continuing."
    exit 1
fi

echo ""
echo "Step 4: Reloading nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"

echo ""
echo "Step 5: Obtaining SSL certificates..."
echo "NOTE: Make sure your domain DNS is pointing to this server!"
read -p "Do you want to obtain SSL certificates now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Comment out SSL lines in config first for initial setup
    sed -i 's/^\s*ssl_certificate/#&/' "$NGINX_AVAILABLE"
    sed -i 's/^\s*ssl_trusted_certificate/#&/' "$NGINX_AVAILABLE"
    nginx -t && systemctl reload nginx
    
    echo "Obtaining certificates..."
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email
    
    # Uncomment SSL lines
    sed -i 's/^#\s*\(ssl_certificate\)/\1/' "$NGINX_AVAILABLE"
    sed -i 's/^#\s*\(ssl_trusted_certificate\)/\1/' "$NGINX_AVAILABLE"
    
    echo "Testing final configuration..."
    nginx -t && systemctl reload nginx
    echo "✓ SSL certificates obtained and configured"
else
    echo "⚠ SSL certificates not obtained. You'll need to run certbot manually:"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Your FlexJobsEU site should now be accessible at:"
echo "  https://$DOMAIN"
echo ""
echo "Make sure your application is running on port 3004:"
echo "  cd /home/kai/Documents/flexxy"
echo "  npm start (or use PM2)"
echo ""
echo "To check nginx status:"
echo "  sudo systemctl status nginx"
echo ""
echo "To view nginx error logs:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""
