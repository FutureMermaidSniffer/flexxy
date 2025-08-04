#!/bin/bash

# FlexJobs Quick Deployment Script for Contabo
# Run this script on your Contabo server after initial setup

set -e  # Exit on any error

echo "🚀 FlexJobs Contabo Deployment Script"
echo "======================================"

# Configuration
APP_DIR="/var/www/flexjobs"
ASSETS_DIR="/var/www/assets"
REPO_URL="https://github.com/FutureMermaidSniffer/flexxy.git"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (sudo)"
    exit 1
fi

print_status "Starting FlexJobs deployment..."

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
print_status "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Install other required packages
print_status "Installing required packages..."
apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git curl ufw

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
print_status "Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
print_warning "Setting up database (you'll need to enter postgres password if prompted)..."
sudo -u postgres psql -c "CREATE DATABASE flexjobs;" || true
sudo -u postgres psql -c "CREATE USER flexjobs_user WITH PASSWORD 'flexjobs_default_password';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE flexjobs TO flexjobs_user;" || true

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $ASSETS_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/uploads

# Clone repository
print_status "Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO_URL $APP_DIR
fi

cd $APP_DIR

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install --omit=optional --production

# Create environment file
print_status "Creating environment file..."
cat > $APP_DIR/.env << EOF
# Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://flexjobs_user:flexjobs_default_password@localhost:5432/flexjobs

# Security (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your_super_long_jwt_secret_key_here_minimum_64_characters_recommended_change_this
SESSION_SECRET=your_super_long_session_secret_key_here_minimum_64_characters_change_this

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
STRICT_RATE_LIMIT_MAX=5

# CORS (Update with your domain)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com,https://www.yourdomain.com

# Asset Configuration (Update with your domain)
ASSETS_BASE_URL=https://assets.yourdomain.com

# Admin User (Update these)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change_this_admin_password
ADMIN_NAME=Admin User

# Logging
LOG_LEVEL=info

# Upload Configuration
UPLOAD_PATH=$APP_DIR/uploads
MAX_FILE_SIZE=5242880
EOF

print_warning "⚠️  IMPORTANT: Update the .env file with your actual domain and secure passwords!"

# Set permissions
print_status "Setting file permissions..."
chown -R www-data:www-data $APP_DIR/uploads
chown -R www-data:www-data $ASSETS_DIR
chmod -R 755 $APP_DIR/uploads
chmod -R 755 $ASSETS_DIR

# Run database migrations
print_status "Running database migrations..."
npm run migrate || print_warning "Migration failed - you may need to run this manually later"

# Create nginx configuration
print_status "Creating nginx configuration..."
cat > /etc/nginx/sites-available/flexjobs << 'EOF'
server {
    listen 80;
    server_name _;  # Update with your domain
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/flexjobs/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/flexjobs /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Start nginx
systemctl restart nginx
systemctl enable nginx

# Start the application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR
pm2 delete flexjobs 2>/dev/null || true  # Delete if exists
pm2 start server.js --name flexjobs
pm2 save
pm2 startup

print_status "🎉 Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your domain DNS to point to this server"
echo "2. Update .env file with your actual domain and credentials:"
echo "   nano $APP_DIR/.env"
echo "3. Update nginx configuration with your domain:"
echo "   nano /etc/nginx/sites-available/flexjobs"
echo "4. Setup SSL certificate:"
echo "   certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "5. Restart nginx: systemctl restart nginx"
echo ""
echo "🔍 Useful Commands:"
echo "pm2 status          - Check application status"
echo "pm2 logs flexjobs   - View application logs"
echo "pm2 restart flexjobs - Restart application"
echo "nginx -t            - Test nginx configuration"
echo "systemctl restart nginx - Restart nginx"
echo ""
echo "🌐 Your application should be accessible at: http://your-server-ip:80"
echo "📁 Application directory: $APP_DIR"
echo "📁 Assets directory: $ASSETS_DIR"
echo ""
print_warning "Remember to secure your server by updating passwords and setting up SSL!"
