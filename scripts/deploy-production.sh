#!/bin/bash

# FlexJobs Production Deployment Script
# Complete setup for production environment with Nginx reverse proxy

set -e

PROJECT_NAME="flexjobs"
APP_DIR="/var/www/$PROJECT_NAME"
NGINX_CONF="/etc/nginx/sites-available/$PROJECT_NAME"
SYSTEMD_SERVICE="/etc/systemd/system/$PROJECT_NAME.service"
DOMAIN="${1:-flexjobs.local}"
NODE_ENV="${2:-production}"

echo "🚀 Starting FlexJobs production deployment..."
echo "Domain: $DOMAIN"
echo "Environment: $NODE_ENV"

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check if running on Ubuntu/Debian
    if ! command -v apt &> /dev/null; then
        echo "❌ This script requires Ubuntu/Debian with apt package manager"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version 18+ required. Current: $(node --version)"
        exit 1
    fi
    
    echo "✅ Prerequisites checked"
}

# Function to install system dependencies
install_dependencies() {
    echo "📦 Installing system dependencies..."
    
    sudo apt update
    sudo apt install -y \
        nginx \
        postgresql \
        redis-server \
        git \
        curl \
        unzip \
        software-properties-common \
        ufw \
        fail2ban
    
    # Enable services
    sudo systemctl enable nginx postgresql redis-server
    sudo systemctl start nginx postgresql redis-server
    
    echo "✅ System dependencies installed"
}

# Function to setup application directory
setup_app_directory() {
    echo "📁 Setting up application directory..."
    
    # Create app directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Copy application files
    rsync -av --exclude='node_modules' --exclude='logs' --exclude='.git' \
        ./ $APP_DIR/
    
    # Set proper permissions
    find $APP_DIR -type f -name "*.sh" -exec chmod +x {} \;
    
    echo "✅ Application directory setup complete"
}

# Function to configure database
configure_database() {
    echo "🗄️  Configuring PostgreSQL database..."
    
    # Create database user and database
    sudo -u postgres psql << EOF
CREATE USER $PROJECT_NAME WITH PASSWORD '$PROJECT_NAME$(date +%s)';
CREATE DATABASE $PROJECT_NAME OWNER $PROJECT_NAME;
GRANT ALL PRIVILEGES ON DATABASE $PROJECT_NAME TO $PROJECT_NAME;
ALTER USER $PROJECT_NAME CREATEDB;
\q
EOF
    
    # Update PostgreSQL to listen on custom port
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
    PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
    
    if [ -f "$PG_CONF" ]; then
        sudo sed -i "s/#port = 5432/port = 5433/" $PG_CONF
        sudo systemctl restart postgresql
        echo "✅ PostgreSQL configured on port 5433"
    fi
    
    echo "✅ Database configuration complete"
}

# Function to configure Redis
configure_redis() {
    echo "🔴 Configuring Redis..."
    
    # Configure Redis for production
    sudo tee /etc/redis/redis.conf > /dev/null << 'EOF'
# Redis production configuration for FlexJobs
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300
daemonize yes
supervised systemd
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF
    
    sudo systemctl restart redis-server
    echo "✅ Redis configuration complete"
}

# Function to setup environment
setup_environment() {
    echo "🔧 Setting up environment configuration..."
    
    # Create production environment file
    cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=3003
DB_HOST=localhost
DB_PORT=5433
DB_NAME=$PROJECT_NAME
DB_USER=$PROJECT_NAME
DB_PASSWORD=$PROJECT_NAME$(date +%s)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
SITE_URL=https://$DOMAIN
API_URL=https://$DOMAIN/api
ADMIN_EMAIL=admin@$DOMAIN
ADMIN_PASSWORD=$(openssl rand -base64 12)
EOF
    
    # Set proper permissions
    chmod 600 $APP_DIR/.env
    
    echo "✅ Environment configuration complete"
}

# Function to install Node.js dependencies
install_node_dependencies() {
    echo "📦 Installing Node.js dependencies..."
    
    cd $APP_DIR
    npm ci --only=production
    
    echo "✅ Node.js dependencies installed"
}

# Function to setup systemd service
setup_systemd_service() {
    echo "⚙️  Setting up systemd service..."
    
    sudo tee $SYSTEMD_SERVICE > /dev/null << EOF
[Unit]
Description=FlexJobs Node.js Application
Documentation=https://github.com/flexjobs/flexjobs
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$PROJECT_NAME

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start service
    sudo systemctl daemon-reload
    sudo systemctl enable $PROJECT_NAME
    
    echo "✅ Systemd service configured"
}

# Function to setup logging
setup_logging() {
    echo "📝 Setting up logging..."
    
    # Create log directory
    sudo mkdir -p /var/log/$PROJECT_NAME
    sudo chown $USER:$USER /var/log/$PROJECT_NAME
    
    # Setup logrotate
    sudo tee /etc/logrotate.d/$PROJECT_NAME > /dev/null << EOF
/var/log/$PROJECT_NAME/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        systemctl reload $PROJECT_NAME
    endscript
}
EOF
    
    echo "✅ Logging configuration complete"
}

# Function to run database migrations
run_migrations() {
    echo "🏗️  Running database migrations..."
    
    cd $APP_DIR
    
    # Run database setup
    if [ -f "database/migrate.js" ]; then
        node database/migrate.js
    fi
    
    # Create admin user
    if [ -f "create-admin.js" ]; then
        node create-admin.js
    fi
    
    echo "✅ Database migrations complete"
}

# Function to setup security
setup_security() {
    echo "🛡️  Configuring security..."
    
    # Configure fail2ban for nginx
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF
    
    # Configure UFW firewall
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    # Start fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    echo "✅ Security configuration complete"
}

# Function to deploy
deploy() {
    echo "🚀 Starting deployment..."
    
    # Stop existing service if running
    sudo systemctl stop $PROJECT_NAME || true
    
    # Start the application
    sudo systemctl start $PROJECT_NAME
    
    # Check if service started successfully
    sleep 5
    if sudo systemctl is-active --quiet $PROJECT_NAME; then
        echo "✅ Application started successfully"
    else
        echo "❌ Application failed to start"
        sudo systemctl status $PROJECT_NAME
        exit 1
    fi
    
    echo "✅ Deployment complete"
}

# Function to show status
show_status() {
    echo ""
    echo "📊 Deployment Status:"
    echo "===================="
    echo "Application: $(sudo systemctl is-active $PROJECT_NAME)"
    echo "Nginx: $(sudo systemctl is-active nginx)"
    echo "PostgreSQL: $(sudo systemctl is-active postgresql)"
    echo "Redis: $(sudo systemctl is-active redis-server)"
    echo ""
    echo "🌐 Access your application:"
    echo "   HTTP: http://$DOMAIN"
    echo "   HTTPS: https://$DOMAIN (after SSL setup)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run SSL setup: ./scripts/setup-ssl.sh $DOMAIN"
    echo "2. Configure your domain DNS"
    echo "3. Test the application"
    echo ""
    echo "📂 Important paths:"
    echo "   App directory: $APP_DIR"
    echo "   Logs: /var/log/$PROJECT_NAME/"
    echo "   Service: $SYSTEMD_SERVICE"
    echo "   Nginx config: $NGINX_CONF"
    echo ""
    echo "🔧 Management commands:"
    echo "   Start: sudo systemctl start $PROJECT_NAME"
    echo "   Stop: sudo systemctl stop $PROJECT_NAME"
    echo "   Restart: sudo systemctl restart $PROJECT_NAME"
    echo "   Status: sudo systemctl status $PROJECT_NAME"
    echo "   Logs: sudo journalctl -u $PROJECT_NAME -f"
}

# Main deployment function
main() {
    check_prerequisites
    install_dependencies
    setup_app_directory
    configure_database
    configure_redis
    setup_environment
    install_node_dependencies
    setup_systemd_service
    setup_logging
    run_migrations
    setup_security
    deploy
    show_status
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Don't run this script as root. It will use sudo when needed."
    exit 1
fi

main
