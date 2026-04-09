.env 
___

# FlexJobs Production Environment Variables
# Usage: cp .env.production .env && npm start

# Application Configuration
NODE_ENV=production
PORT=3003
API_HOST=localhost
API_PORT=3003

# Domain & SSL
DOMAIN=flexjob.uk
SSL_EMAIL=admin@flexjob.uk

# API base URL
API_BASE_URL=https://flexjob.uk

# Database Configuration - PostgreSQL defaults for production
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexjobs_db
DB_PORT=5432

# CORS Configuration - CRITICAL FOR AUTH
ALLOWED_ORIGINS=https://flexjob.uk,http://flexjob.uk,https://www.flexjob.uk,http://www.flexjob.uk,http://localhost:3003,http://127.0.0.1:3003,http://localhost:3003,http://127.0.0.1:3003

# Session Management (Redis disabled - using memory store)
USE_REDIS=false

# Security (Generate with: openssl rand -base64 32)
JWT_SECRET=GenerateSecureJWTSecret32CharactersLong!
SESSION_SECRET=GenerateSecureSessionSecret32CharactersLong!

# Admin Configuration
ADMIN_EMAIL=admin@flexjob.uk
ADMIN_PASSWORD=GenerateSecureAdminPassword123!

# Email config

SMTP_HOST=localhost
SMTP_PORT=2587  # Custom submission port
SMTP_USER=noreply@flexjob.uk
SMTP_PASS=your_mail_password
SMTP_SECURE=false
SMTP_TLS=true

# IMAP Configuration (Custom Ports)
IMAP_HOST=localhost
IMAP_PORT=1143  # Custom IMAP port
IMAPS_PORT=1993 # Custom IMAPS port

# Email settings
FROM_EMAIL=noreply@flexjob.uk
FROM_NAME=FlexJob UK
ADMIN_EMAIL=admin@flexjob.uk

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/flexjob.uk/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/flexjob.uk/privkey.pem



___
nginx
____

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name flexjob.uk www.flexjob.uk;
    
    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html/flexjob;
    }
    
    # Redirect everything else to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name flexjob.uk www.flexjob.uk;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/flexjob.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flexjob.uk/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/flexjob.uk/chain.pem;

    # SSL Security Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Main application proxy - CORRECTED TO PORT 3005
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin endpoints
    location /admin {
        proxy_pass http://127.0.0.1:3003/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3003/health;
        access_log off;
    }
}
