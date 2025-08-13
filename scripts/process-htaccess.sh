#!/bin/bash
# Process .htaccess template with environment variables

echo "🔧 PROCESSING .HTACCESS WITH ENV VARS"
echo "===================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo "⚠️  No .env file found, using defaults"
    export API_HOST=localhost
    export API_PORT=3005
fi

echo "📝 Using API_HOST: ${API_HOST}"
echo "📝 Using API_PORT: ${API_PORT}"

# Create .htaccess from template
cd frontend

# Backup original .htaccess
if [ -f .htaccess ]; then
    cp .htaccess .htaccess.backup.$(date +%Y%m%d-%H%M%S)
fi

# Process template
cat > .htaccess << EOF
RewriteEngine On

# Security Headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff

# Handle existing files and directories
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Handle API routes (if using Apache as reverse proxy)
RewriteRule ^api/(.*)$ http://${API_HOST}:${API_PORT}/api/\$1 [P,L]

# Handle component requests
RewriteCond %{REQUEST_URI} ^/components/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ 404.html [L,R=404]

# Handle HTML file requests that don't exist
RewriteCond %{REQUEST_URI} \.html$
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ 404.html [L,R=404]

# Main SPA routing - serve index.html for non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/components/
RewriteCond %{REQUEST_URI} !\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$
RewriteRule ^(.*)$ index.html [L,QSA]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType font/woff "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Prevent access to sensitive files
<Files ~ "^\.(env|git|htaccess)">
    Order allow,deny
    Deny from all
</Files>

<Files ~ "\.(md|txt|log|bak|backup)$">
    Order allow,deny
    Deny from all
</Files>

# Prevent directory browsing
Options -Indexes

# Force HTTPS in production
<IfModule mod_rewrite.c>
    RewriteCond %{HTTP_HOST} !^localhost
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Error pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
EOF

echo "✅ .htaccess processed with environment variables"

cd ..
