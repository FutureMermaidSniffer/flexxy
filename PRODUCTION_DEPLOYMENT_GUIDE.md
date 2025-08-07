# Production Deployment Guide

This guide covers deploying FlexJobs to a production server with Nginx reverse proxy, SSL, and enterprise-grade security.

## 📋 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or Debian 11+
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended
- **Network**: Public IP address with domain name

### Software Requirements
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Nginx 1.18+

## 🚀 Quick Deployment

### 1. Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Git if not present
sudo apt install -y git

# Clone the repository
git clone https://github.com/your-org/flexjobs.git
cd flexjobs
```

### 2. Run Automated Deployment

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy with your domain
./scripts/deploy-production.sh yourdomain.com production
```

### 3. Setup SSL Certificates

```bash
# For production with Let's Encrypt
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com

# For development with self-signed
./scripts/setup-ssl.sh localhost
```

## 🔧 Manual Setup (Advanced)

### 1. System Dependencies

```bash
sudo apt update
sudo apt install -y nginx postgresql redis-server git curl unzip software-properties-common ufw fail2ban

# Enable services
sudo systemctl enable nginx postgresql redis-server
sudo systemctl start nginx postgresql redis-server
```

### 2. Node.js Installation

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be 18.x.x
npm --version
```

### 3. Database Configuration

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER flexjobs WITH PASSWORD 'your_secure_password';
CREATE DATABASE flexjobs OWNER flexjobs;
GRANT ALL PRIVILEGES ON DATABASE flexjobs TO flexjobs;
ALTER USER flexjobs CREATEDB;
\q

# Configure PostgreSQL port (optional)
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change: port = 5433
sudo systemctl restart postgresql
```

### 4. Redis Configuration

```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Key settings for production:
# bind 127.0.0.1
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

sudo systemctl restart redis-server
```

### 5. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/flexjobs
sudo chown $USER:$USER /var/www/flexjobs

# Copy application files
rsync -av --exclude='node_modules' --exclude='logs' --exclude='.git' \
    ./ /var/www/flexjobs/

cd /var/www/flexjobs

# Install dependencies
npm ci --only=production
```

### 6. Environment Configuration

Create `/var/www/flexjobs/.env`:

```env
NODE_ENV=production
PORT=3003

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=flexjobs
DB_USER=flexjobs
DB_PASSWORD=your_secure_db_password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
SESSION_SECRET=your_super_secure_session_secret_here
JWT_SECRET=your_super_secure_jwt_secret_here

# URLs
SITE_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 7. Systemd Service

Create `/etc/systemd/system/flexjobs.service`:

```ini
[Unit]
Description=FlexJobs Node.js Application
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/var/www/flexjobs
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=flexjobs

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/www/flexjobs

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable flexjobs
sudo systemctl start flexjobs
```

### 8. Nginx Configuration

The repository includes production-ready Nginx configuration at `nginx/nginx.conf`.

```bash
# Copy configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/flexjobs

# Update domain name if needed
sudo sed -i 's/flexjobs.local/yourdomain.com/g' /etc/nginx/sites-available/flexjobs

# Enable site
sudo ln -s /etc/nginx/sites-available/flexjobs /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Self-Signed (Development)

```bash
# Generate certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/flexjobs.key \
    -out /etc/ssl/certs/flexjobs.crt \
    -subj "/C=US/ST=State/L=City/O=FlexJobs/CN=yourdomain.com"
```

## 🛡️ Security Configuration

### Firewall (UFW)

```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

### Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure for Nginx
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
EOF

sudo systemctl restart fail2ban
```

## 📊 Monitoring & Logs

### Application Logs

```bash
# View real-time logs
sudo journalctl -u flexjobs -f

# View recent logs
sudo journalctl -u flexjobs --since "1 hour ago"

# Log files location
ls -la /var/log/flexjobs/
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring

```bash
# Check all services
sudo systemctl status flexjobs nginx postgresql redis-server

# Check ports
sudo netstat -tlnp | grep -E ':(80|443|3003|5433|6379)'

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔄 Maintenance

### Application Updates

```bash
cd /var/www/flexjobs

# Pull latest changes
git pull origin main

# Install new dependencies
npm ci --only=production

# Run migrations
node database/migrate.js

# Restart application
sudo systemctl restart flexjobs
```

### Database Backup

```bash
# Create backup
pg_dump -h localhost -p 5433 -U flexjobs flexjobs > backup_$(date +%Y%m%d).sql

# Restore backup
psql -h localhost -p 5433 -U flexjobs flexjobs < backup_20231201.sql
```

### Certificate Renewal

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## 🚨 Troubleshooting

### Application Won't Start

```bash
# Check logs
sudo journalctl -u flexjobs -n 50

# Check environment
cd /var/www/flexjobs && node check-env-vars.js

# Test database connection
cd /var/www/flexjobs && node validate-db.js
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Verify SSL certificates
sudo nginx -T | grep ssl_certificate
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -p 5433 -U flexjobs -d flexjobs

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Performance Issues

```bash
# Check resource usage
htop

# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com"

# Monitor database queries
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 📋 Production Checklist

- [ ] Server meets minimum requirements
- [ ] Domain DNS configured
- [ ] SSL certificates installed and auto-renewal enabled
- [ ] Firewall configured and enabled
- [ ] Application running and accessible
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error pages configured
- [ ] Log rotation configured

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs: `sudo journalctl -u flexjobs -n 100`
3. Check system logs: `sudo dmesg | tail -20`
4. Verify configuration: `sudo nginx -t`
5. Test database: `node validate-db.js`

For additional help, please check the project documentation or create an issue in the repository.
