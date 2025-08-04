# Complete Contabo Deployment Guide for FlexJobs

## Overview

This guide will help you deploy your FlexJobs application to your Contabo server with automated deployments via GitHub Actions.

## Prerequisites

✅ **Contabo VPS** with Ubuntu/Debian  
✅ **Domain name** pointed to your Contabo server  
✅ **SSH access** to your server  
✅ **GitHub repository** (FutureMermaidSniffer/flexxy)

## Step 1: Server Setup

### 1.1 Connect to Your Contabo Server

```bash
# SSH into your server
ssh root@your-domain.com
# or
ssh root@your-server-ip
```

### 1.2 Update System and Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install other required packages
apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx git curl

# Install PM2 for process management
npm install -g pm2

# Verify installations
node --version
npm --version
nginx -v
```

### 1.3 Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE flexjobs;
CREATE USER flexjobs_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flexjobs TO flexjobs_user;
\q
```

### 1.4 Configure Firewall

```bash
# Enable firewall
ufw enable

# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 3000  # Node.js app port (optional, nginx will proxy)

# Check status
ufw status
```

## Step 2: Domain and SSL Setup

### 2.1 Point Domain to Server

In your domain registrar (Namecheap, GoDaddy, etc.):
```
A Record: @ → Your_Contabo_Server_IP
A Record: www → Your_Contabo_Server_IP
A Record: assets → Your_Contabo_Server_IP  # For asset subdomain
```

### 2.2 Setup SSL with Let's Encrypt

```bash
# Get SSL certificate for main domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Get SSL certificate for assets subdomain
certbot --nginx -d assets.yourdomain.com
```

## Step 3: Application Deployment

### 3.1 Create Application Directory

```bash
# Create app directory
mkdir -p /var/www/flexjobs
cd /var/www/flexjobs

# Set permissions
chown -R $USER:$USER /var/www/flexjobs
```

### 3.2 Clone Your Repository

```bash
# Clone your repository
git clone https://github.com/FutureMermaidSniffer/flexxy.git .

# Install dependencies (without puppeteer for now)
npm install --omit=optional
```

### 3.3 Create Environment File

```bash
# Create production environment file
nano /var/www/flexjobs/.env
```

Add this content (customize values):
```bash
# Environment
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://flexjobs_user:your_secure_password@localhost:5432/flexjobs

# Security
JWT_SECRET=your_super_long_jwt_secret_key_here_minimum_64_characters_recommended
SESSION_SECRET=your_super_long_session_secret_key_here_minimum_64_characters

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
STRICT_RATE_LIMIT_MAX=5

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Asset Configuration
ASSETS_BASE_URL=https://assets.yourdomain.com

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin User (will be auto-created)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Admin User

# Logging
LOG_LEVEL=info

# Upload Configuration
UPLOAD_PATH=/var/www/flexjobs/uploads
MAX_FILE_SIZE=5242880
```

### 3.4 Setup Database Schema

```bash
# Run database migrations
npm run migrate

# The admin user will be created automatically when server starts
```

### 3.5 Create Uploads Directory

```bash
mkdir -p /var/www/flexjobs/uploads
mkdir -p /var/www/flexjobs/logs
mkdir -p /var/www/assets

# Set permissions
chown -R www-data:www-data /var/www/flexjobs/uploads
chown -R www-data:www-data /var/www/assets
chmod -R 755 /var/www/flexjobs/uploads
chmod -R 755 /var/www/assets
```

## Step 4: Nginx Configuration

### 4.1 Create Main App Configuration

```bash
nano /etc/nginx/sites-available/flexjobs
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (managed by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Main application
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

    # Static files
    location /uploads/ {
        alias /var/www/flexjobs/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        image/svg+xml;
}
```

### 4.2 Create Assets Subdomain Configuration

```bash
nano /etc/nginx/sites-available/assets
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name assets.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name assets.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/assets.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/assets.yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/assets;
    index index.html;

    # Large file handling
    client_max_body_size 100M;

    # CORS headers for assets
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    location ~* \.(mp4|webm|ogg|mov|avi)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
        add_header Accept-Ranges bytes;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript
        image/svg+xml;
}
```

### 4.3 Enable Sites and Restart Nginx

```bash
# Enable the sites
ln -sf /etc/nginx/sites-available/flexjobs /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/assets /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

## Step 5: Start the Application

### 5.1 Start with PM2

```bash
cd /var/www/flexjobs

# Start the application
pm2 start server.js --name flexjobs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you

# Check status
pm2 status
pm2 logs flexjobs
```

## Step 6: GitHub Actions Deployment (Automated)

### 6.1 Generate SSH Key for Deployment

```bash
# On your server, generate deployment key
ssh-keygen -t rsa -b 4096 -f /root/.ssh/deploy_key
cat /root/.ssh/deploy_key.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/deploy_key  # Copy this private key
```

### 6.2 Add GitHub Secrets

Go to your GitHub repository: `Settings > Secrets and variables > Actions`

Add these secrets:
```
SERVER_HOST=yourdomain.com  (or your server IP)
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY----- (the private key from above)
SERVER_PORT=22
DATABASE_URL=postgresql://flexjobs_user:password@localhost:5432/flexjobs
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
ASSETS_BASE_URL=https://assets.yourdomain.com
```

### 6.3 Update Image Configuration

Update your domain in the image config:

```bash
nano /var/www/flexjobs/frontend/js/config/images.js
```

Change:
```javascript
BASE_URL: 'https://assets.yourdomain.com',  // Your actual domain
```

## Step 7: Test Your Deployment

### 7.1 Check Application

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs flexjobs

# Check nginx
systemctl status nginx

# Test database connection
psql -U flexjobs_user -d flexjobs -h localhost
```

### 7.2 Access Your Site

1. **Main Application**: `https://yourdomain.com`
2. **Admin Panel**: `https://yourdomain.com/admin-dashboard.html`
3. **Assets**: `https://assets.yourdomain.com`

## Step 8: Ongoing Maintenance

### 8.1 Automatic Deployments

Every time you push to your GitHub repository, it will automatically:
1. Deploy your application code
2. Upload and optimize assets
3. Restart the application

### 8.2 Monitoring Commands

```bash
# Check application status
pm2 status

# View application logs
pm2 logs flexjobs

# Restart application
pm2 restart flexjobs

# Check nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check disk usage
df -h

# Check memory usage
free -h
```

### 8.3 SSL Certificate Renewal

```bash
# Certificates auto-renew, but you can test:
certbot renew --dry-run

# Check expiry dates
certbot certificates
```

## Troubleshooting

### Common Issues:

1. **Can't connect to database**: Check PostgreSQL service and credentials
2. **502 Bad Gateway**: Check if Node.js app is running with PM2
3. **Assets not loading**: Check nginx configuration and file permissions
4. **SSL issues**: Regenerate certificates with certbot

### Useful Commands:

```bash
# Check what's running on port 3000
lsof -i :3000

# Check nginx configuration
nginx -t

# Restart services
systemctl restart nginx
systemctl restart postgresql
pm2 restart flexjobs

# Check server resources
htop
df -h
```

## Security Considerations

1. **Regular Updates**: Keep server packages updated
2. **Firewall**: Only allow necessary ports
3. **SSH Security**: Consider changing SSH port and disabling password auth
4. **Database Security**: Regularly backup and secure credentials
5. **Monitoring**: Set up log monitoring and alerts

Your FlexJobs application should now be live at your domain! 🚀
