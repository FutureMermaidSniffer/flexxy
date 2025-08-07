#!/bin/bash

# FlexJobs SSL Certificate Setup Script
# Supports both Let's Encrypt and self-signed certificates

set -e

DOMAIN="${1:-flexjobs.local}"
EMAIL="${2:-admin@$DOMAIN}"
SSL_DIR="/etc/ssl"
CERT_DIR="$SSL_DIR/certs"
KEY_DIR="$SSL_DIR/private"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "🔒 Setting up SSL certificates for FlexJobs..."
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

# Create SSL directories
sudo mkdir -p $CERT_DIR $KEY_DIR
sudo chmod 755 $CERT_DIR
sudo chmod 700 $KEY_DIR

# Function to setup Let's Encrypt
setup_letsencrypt() {
    echo "📝 Setting up Let's Encrypt SSL certificate..."
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "Installing certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Stop nginx temporarily
    sudo systemctl stop nginx || true
    
    # Generate certificate
    sudo certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN,api.$DOMAIN
    
    # Copy certificates to our expected locations
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERT_DIR/flexjobs.crt
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $KEY_DIR/flexjobs.key
    
    # Set proper permissions
    sudo chown root:root $CERT_DIR/flexjobs.crt $KEY_DIR/flexjobs.key
    sudo chmod 644 $CERT_DIR/flexjobs.crt
    sudo chmod 600 $KEY_DIR/flexjobs.key
    
    echo "✅ Let's Encrypt certificate generated successfully!"
    
    # Setup auto-renewal
    setup_certbot_renewal
}

# Function to setup self-signed certificate
setup_selfsigned() {
    echo "📝 Setting up self-signed SSL certificate..."
    
    # Generate private key
    sudo openssl genrsa -out $KEY_DIR/flexjobs.key 2048
    
    # Generate certificate signing request
    sudo openssl req -new -key $KEY_DIR/flexjobs.key -out /tmp/flexjobs.csr -subj "/C=US/ST=State/L=City/O=FlexJobs/OU=IT/CN=$DOMAIN"
    
    # Generate self-signed certificate
    sudo openssl x509 -req -days 365 -in /tmp/flexjobs.csr -signkey $KEY_DIR/flexjobs.key -out $CERT_DIR/flexjobs.crt
    
    # Clean up CSR
    sudo rm /tmp/flexjobs.csr
    
    # Set proper permissions
    sudo chown root:root $CERT_DIR/flexjobs.crt $KEY_DIR/flexjobs.key
    sudo chmod 644 $CERT_DIR/flexjobs.crt
    sudo chmod 600 $KEY_DIR/flexjobs.key
    
    echo "✅ Self-signed certificate generated successfully!"
    echo "⚠️  Note: Self-signed certificates will show browser warnings."
}

# Function to setup certbot auto-renewal
setup_certbot_renewal() {
    echo "🔄 Setting up automatic certificate renewal..."
    
    # Create renewal hook script
    sudo tee /etc/letsencrypt/renewal-hooks/deploy/flexjobs-reload.sh > /dev/null << 'EOF'
#!/bin/bash
# Copy renewed certificates to nginx locations
cp /etc/letsencrypt/live/*/fullchain.pem /etc/ssl/certs/flexjobs.crt
cp /etc/letsencrypt/live/*/privkey.pem /etc/ssl/private/flexjobs.key
chown root:root /etc/ssl/certs/flexjobs.crt /etc/ssl/private/flexjobs.key
chmod 644 /etc/ssl/certs/flexjobs.crt
chmod 600 /etc/ssl/private/flexjobs.key
systemctl reload nginx
EOF
    
    sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/flexjobs-reload.sh
    
    # Test renewal
    sudo certbot renew --dry-run
    
    echo "✅ Auto-renewal configured!"
}

# Function to configure nginx
configure_nginx() {
    echo "🌐 Configuring Nginx with SSL..."
    
    # Copy our nginx configuration
    if [ -f "../nginx/nginx.conf" ]; then
        sudo cp ../nginx/nginx.conf $NGINX_AVAILABLE/flexjobs
        
        # Update domain in config if not default
        if [ "$DOMAIN" != "flexjobs.local" ]; then
            sudo sed -i "s/flexjobs\.local/$DOMAIN/g" $NGINX_AVAILABLE/flexjobs
        fi
        
        # Enable site
        sudo ln -sf $NGINX_AVAILABLE/flexjobs $NGINX_ENABLED/
        
        # Remove default site
        sudo rm -f $NGINX_ENABLED/default
        
        # Test nginx configuration
        sudo nginx -t
        
        echo "✅ Nginx configuration updated!"
    else
        echo "❌ Nginx configuration file not found!"
        exit 1
    fi
}

# Function to setup firewall
setup_firewall() {
    echo "🛡️  Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw allow 22/tcp
        echo "✅ Firewall configured!"
    else
        echo "⚠️  UFW not found. Please configure firewall manually:"
        echo "   - Allow port 80 (HTTP)"
        echo "   - Allow port 443 (HTTPS)"
        echo "   - Allow port 22 (SSH)"
    fi
}

# Main setup
main() {
    echo "Select SSL certificate type:"
    echo "1) Let's Encrypt (recommended for production)"
    echo "2) Self-signed (for development/testing)"
    read -p "Enter choice [1-2]: " choice
    
    case $choice in
        1)
            if [ "$DOMAIN" = "flexjobs.local" ]; then
                echo "❌ Let's Encrypt requires a real domain name."
                echo "Please run: $0 yourdomain.com your-email@yourdomain.com"
                exit 1
            fi
            setup_letsencrypt
            ;;
        2)
            setup_selfsigned
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
    
    configure_nginx
    setup_firewall
    
    # Start/restart nginx
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    
    echo ""
    echo "🎉 SSL setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your DNS to point $DOMAIN to this server"
    echo "2. Test the site: https://$DOMAIN"
    echo "3. Check SSL grade: https://www.ssllabs.com/ssltest/"
    echo ""
    echo "📂 Certificate locations:"
    echo "   Certificate: $CERT_DIR/flexjobs.crt"
    echo "   Private key: $KEY_DIR/flexjobs.key"
    echo ""
    
    if [ "$choice" = "1" ]; then
        echo "🔄 Certificate auto-renewal is configured"
        echo "   Test renewal: sudo certbot renew --dry-run"
    fi
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Don't run this script as root. It will use sudo when needed."
    exit 1
fi

main
