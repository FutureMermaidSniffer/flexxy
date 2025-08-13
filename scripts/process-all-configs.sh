#!/bin/bash
# Process all configuration files with environment variables
# This script replaces hardcoded ports with environment variable references

echo "🔧 PROCESSING ALL CONFIG FILES WITH ENV VARS"
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}✅ Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '#' | xargs)
else
    echo -e "${YELLOW}⚠️  No .env file found, using defaults${NC}"
    export API_HOST=localhost
    export API_PORT=3005
    export DB_HOST=localhost
    export DB_PORT=5432
fi

echo -e "${YELLOW}📝 Configuration:${NC}"
echo "   API_HOST: ${API_HOST}"
echo "   API_PORT: ${API_PORT}"
echo "   DB_HOST: ${DB_HOST}"
echo "   DB_PORT: ${DB_PORT}"
echo ""

# Function to backup and process a file
process_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${YELLOW}📝 Processing: $description${NC}"
        
        # Create backup
        cp "$file" "${file}.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Process with envsubst
        envsubst < "$file" > "${file}.tmp"
        mv "${file}.tmp" "$file"
        
        echo -e "${GREEN}✅ Processed: $file${NC}"
    else
        echo -e "${RED}❌ File not found: $file${NC}"
    fi
}

# Process configuration files
echo -e "${YELLOW}🔄 Processing configuration files...${NC}"

# Process nginx.conf
if [ -f "nginx.conf" ]; then
    echo -e "${YELLOW}📝 Processing nginx.conf${NC}"
    cp nginx.conf nginx.conf.backup.$(date +%Y%m%d-%H%M%S)
    
    # Update nginx configuration with environment variables
    sed -i "s/server flexjobs-app:3005/server \${API_HOST}:\${API_PORT}/g" nginx.conf
    sed -i "s/proxy_pass http:\/\/127\.0\.0\.1:3005/proxy_pass http:\/\/\${API_HOST}:\${API_PORT}/g" nginx.conf
    sed -i "s/proxy_pass http:\/\/localhost:3005/proxy_pass http:\/\/\${API_HOST}:\${API_PORT}/g" nginx.conf
    
    echo -e "${GREEN}✅ Processed nginx.conf${NC}"
fi

# Process ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    echo -e "${YELLOW}📝 Processing ecosystem.config.js${NC}"
    cp ecosystem.config.js ecosystem.config.js.backup.$(date +%Y%m%d-%H%M%S)
    
    # Update ecosystem config
    sed -i "s/PORT: 3005/PORT: process.env.PORT || 3005/g" ecosystem.config.js
    sed -i "s/DB_PORT: 5432/DB_PORT: process.env.DB_PORT || 5432/g" ecosystem.config.js
    
    echo -e "${GREEN}✅ Processed ecosystem.config.js${NC}"
fi

# Process scripts that have hardcoded URLs
echo -e "${YELLOW}🔄 Processing scripts with hardcoded URLs...${NC}"

# Create a list of scripts to update
scripts_to_update=(
    "check-port-proxy.sh"
    "diagnose-502.sh"
    "restart.sh"
    "fix-port-conflict.sh"
    "start-local-dev.sh"
    "start-dev.sh"
)

for script in "${scripts_to_update[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${YELLOW}📝 Processing $script${NC}"
        cp "$script" "${script}.backup.$(date +%Y%m%d-%H%M%S)"
        
        # Replace hardcoded localhost:3005 with environment variable reference
        sed -i "s/localhost:3005/\${API_HOST:-localhost}:\${API_PORT:-3005}/g" "$script"
        sed -i "s/localhost:3003/\${API_HOST:-localhost}:\${API_PORT:-3005}/g" "$script"
        sed -i "s/127\.0\.0\.1:3005/\${API_HOST:-127.0.0.1}:\${API_PORT:-3005}/g" "$script"
        sed -i "s/127\.0\.0\.1:3003/\${API_HOST:-127.0.0.1}:\${API_PORT:-3005}/g" "$script"
        
        echo -e "${GREEN}✅ Processed $script${NC}"
    fi
done

# Process frontend .htaccess
if [ -f "frontend/.htaccess" ]; then
    echo -e "${YELLOW}📝 Processing frontend/.htaccess${NC}"
    cd frontend
    cp .htaccess .htaccess.backup.$(date +%Y%m%d-%H%M%S)
    
    # Replace hardcoded port in .htaccess
    sed -i "s/http:\/\/localhost:3005/http:\/\/\${API_HOST:-localhost}:\${API_PORT:-3005}/g" .htaccess
    
    cd ..
    echo -e "${GREEN}✅ Processed frontend/.htaccess${NC}"
fi

echo ""
echo -e "${GREEN}🎉 ALL CONFIGURATION FILES PROCESSED!${NC}"
echo ""
echo -e "${YELLOW}📋 Summary:${NC}"
echo "   • All hardcoded ports replaced with environment variables"
echo "   • Configuration files backed up with timestamps"
echo "   • Scripts now use \${API_HOST} and \${API_PORT} variables"
echo "   • nginx configuration uses environment variables"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "   1. Update your .env file with correct API_HOST and API_PORT"
echo "   2. Restart your application: npm restart"
echo "   3. Test the configuration: curl http://\${API_HOST}:\${API_PORT}/api/health"
echo ""

# Test nginx configuration if nginx is available
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🔍 Testing nginx configuration...${NC}"
    if nginx -t; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}❌ Nginx configuration has errors${NC}"
    fi
fi
