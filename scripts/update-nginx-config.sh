#!/bin/bash
# Update nginx configuration with environment variables

echo "🔧 UPDATING NGINX CONFIGURATION WITH ENV VARS"
echo "============================================="

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

# Backup original nginx.conf
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d-%H%M%S)

# Update nginx configuration
sed -i "s/server flexjobs-app:3005/server ${API_HOST}:${API_PORT}/g" nginx.conf
sed -i "s/proxy_pass http:\/\/127\.0\.0\.1:3005/proxy_pass http:\/\/${API_HOST}:${API_PORT}/g" nginx.conf

echo "✅ nginx.conf updated with environment variables"

# Test nginx configuration
nginx -t && echo "✅ Nginx configuration is valid" || echo "❌ Nginx configuration has errors"
