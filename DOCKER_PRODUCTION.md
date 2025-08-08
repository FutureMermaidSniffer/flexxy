# FlexJobs Production Deployment with Docker

Simple production deployment using Docker Compose with Nginx reverse proxy.

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.production .env

# 2. Update your domain and secrets in .env
nano .env

# 3. Generate SSL certificates (Let's Encrypt)
sudo certbot certonly --standalone -d yourdomain.com

# 4. Deploy
DOMAIN=yourdomain.com docker-compose -f docker-compose.nginx.yml up -d
```

## 📋 Prerequisites

- Docker & Docker Compose
- Domain name pointed to your server
- SSL certificates (Let's Encrypt recommended)

## 🔧 Environment Setup

Update `.env` with your production values:

```bash
DOMAIN=yourdomain.com
SSL_EMAIL=admin@yourdomain.com
DB_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password
JWT_SECRET=your_32_char_jwt_secret
SESSION_SECRET=your_32_char_session_secret
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password
```

Generate secure secrets:
```bash
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

## 🔒 SSL Setup

### Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Self-Signed (Development)
```bash
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/flexjobs.key \
  -out /etc/ssl/certs/flexjobs.crt \
  -subj "/CN=yourdomain.com"
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose -f docker-compose.nginx.yml up -d

# View logs
docker-compose -f docker-compose.nginx.yml logs -f

# Stop services
docker-compose -f docker-compose.nginx.yml down

# Restart application only
docker-compose -f docker-compose.nginx.yml restart flexjobs-app

# Database backup
docker exec flexjobs-db pg_dump -U flexjobs_user flexjobs_production > backup.sql
```

## 🔧 Troubleshooting

### Check service status
```bash
docker-compose -f docker-compose.nginx.yml ps
```

### View logs
```bash
# All services
docker-compose -f docker-compose.nginx.yml logs

# Specific service
docker logs flexjobs-nginx
docker logs flexjobs-app
docker logs flexjobs-db
```

### Test SSL
```bash
curl -I https://yourdomain.com
```

### Database connection
```bash
docker exec -it flexjobs-db psql -U flexjobs_user -d flexjobs_production
```

## 🛡️ Security Notes

- All services run on internal Docker network
- Only ports 80/443 exposed externally
- Database and Redis not accessible from outside
- SSL termination at Nginx
- Rate limiting configured
- Security headers enabled

## 📊 Monitoring

Access your application at:
- **Main site**: https://yourdomain.com
- **Health check**: https://yourdomain.com/health

Nginx logs location in container:
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
