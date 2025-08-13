#!/bin/bash

# FlexJobs Production Deployment Script
# This script sets up the complete production environment with Nginx, SSL, and security

set -e

echo "🚀 FlexJobs Production Deployment Starting..."
echo "=============================================="

# Configuration
DOMAIN=${1:-"flexjobs.com"}
EMAIL=${2:-"admin@${DOMAIN}"}
APP_ENV=${3:-"production"}

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Environment: $APP_ENV"
echo ""

# Step 1: Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p nginx logs/nginx ssl/certs uploads database/backup

# Step 2: Create Nginx configuration
echo "🔧 Creating Nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
# FlexJobs Production Nginx Configuration
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Upstream
    upstream flexjobs_app {
        server \${API_HOST:-localhost}:\${API_PORT:-3005};
        keepalive 32;
    }
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # HTTP Server (redirects to HTTPS)
    server {
        listen 80;
        server_name _;
        
        # Let's Encrypt ACME Challenge
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }
    
    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name ${DOMAIN} www.${DOMAIN};
        
        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # Static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            root /var/www/html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Frontend routes
        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
        }
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://flexjobs_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Auth routes (rate limited)
        location ~ ^/(login|register|auth) {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://flexjobs_app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Step 3: Install Certbot if not present
echo "🔐 Setting up SSL certificates..."
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y certbot
        # CentOS/RHEL
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install certbot
        fi
    fi
fi

# Step 4: Create environment file template
echo "📝 Creating production environment template..."
cat > .env.production << EOF
# FlexJobs Production Environment
NODE_ENV=production

# Domain Configuration
DOMAIN=${DOMAIN}
BASE_URL=https://${DOMAIN}

# Database Configuration
DB_HOST=flexjobs-db
DB_PORT=5433
DB_NAME=flexjobs_db
DB_USER=postgres
DB_PASSWORD=your_secure_db_password_here

# Application Secrets (Generate with: openssl rand -base64 64)
SESSION_SECRET=your_64_character_session_secret_here
JWT_SECRET=your_64_character_jwt_secret_here

# Redis Configuration
REDIS_HOST=flexjobs-redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
REDIS_DB=0

# Admin Configuration
ADMIN_EMAIL=${EMAIL}
ADMIN_PASSWORD=your_secure_admin_password_here

# SSL Email for Let's Encrypt
SSL_EMAIL=${EMAIL}
EOF

# Step 5: Create SSL certificate generation script
echo "🔒 Creating SSL setup script..."
cat > setup-ssl.sh << 'EOF'
#!/bin/bash

DOMAIN=${1:-"flexjobs.com"}
EMAIL=${2:-"admin@flexjobs.com"}

echo "🔐 Setting up SSL certificates for $DOMAIN..."

# Stop nginx if running
docker-compose -f docker-compose.nginx.yml stop flexjobs-nginx 2>/dev/null || true

# Get SSL certificate
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

echo "✅ SSL certificates obtained!"
echo "📋 Next steps:"
echo "1. Update .env.production with your secrets"
echo "2. Run: docker-compose -f docker-compose.nginx.yml up -d"
EOF

chmod +x setup-ssl.sh

# Step 6: Create deployment script
echo "🚀 Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying FlexJobs to production..."

# Load environment
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Check required variables
required_vars=("DOMAIN" "DB_PASSWORD" "SESSION_SECRET" "JWT_SECRET" "ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose -f docker-compose.nginx.yml pull

# Build application
echo "🔨 Building application..."
docker-compose -f docker-compose.nginx.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.nginx.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.nginx.yml ps

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://$DOMAIN"
EOF

chmod +x deploy.sh

# Step 7: Create monitoring script
echo "📊 Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "📊 FlexJobs Production Monitor"
echo "=============================="

# Service status
echo "🐳 Docker Services:"
docker-compose -f docker-compose.nginx.yml ps

echo ""
echo "💾 Disk Usage:"
df -h

echo ""
echo "🔍 Recent Nginx Logs:"
docker logs flexjobs-nginx --tail 10

echo ""
echo "📈 Container Stats:"
docker stats --no-stream

echo ""
echo "🔗 SSL Certificate Status:"
if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates
else
    echo "No SSL certificate found"
fi
EOF

chmod +x monitor.sh

echo ""
echo "🎉 Production setup complete!"
echo "=============================="
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.production with your actual secrets"
echo "2. Run SSL setup: ./setup-ssl.sh $DOMAIN $EMAIL"
echo "3. Deploy application: ./deploy.sh"
echo "4. Monitor: ./monitor.sh"
echo ""
echo "📁 Files created:"
echo "   • nginx/nginx.conf (Production Nginx config)"
echo "   • .env.production (Environment template)"
echo "   • setup-ssl.sh (SSL certificate setup)"
echo "   • deploy.sh (Deployment script)"
echo "   • monitor.sh (Monitoring script)"
echo ""
echo "🔒 Security Features:"
echo "   • Let's Encrypt SSL certificates"
echo "   • Rate limiting on API and auth routes"
echo "   • Security headers (HSTS, XSS protection)"
echo "   • Gzip compression"
echo "   • Static file caching"
echo ""
echo "🚀 Ready for production deployment!"
