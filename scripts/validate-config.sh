#!/bin/bash
# Configuration Validation Script
# Validates that all configuration uses environment variables correctly

echo "🔍 CONFIGURATION VALIDATION"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ No .env file found${NC}"
    exit 1
fi

# Validation counters
PASS=0
FAIL=0

# Function to validate a configuration
validate_config() {
    local description=$1
    local check_command=$2
    
    echo -n "📋 $description: "
    
    if eval "$check_command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
    fi
}

echo ""
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

# Check required environment variables
validate_config "PORT is set" "[ ! -z \"\$PORT\" ]"
validate_config "API_HOST is set" "[ ! -z \"\$API_HOST\" ]"
validate_config "API_PORT is set" "[ ! -z \"\$API_PORT\" ]"
validate_config "DB_HOST is set" "[ ! -z \"\$DB_HOST\" ]"
validate_config "DB_PORT is set" "[ ! -z \"\$DB_PORT\" ]"
validate_config "DB_NAME is set" "[ ! -z \"\$DB_NAME\" ]"

echo ""
echo -e "${YELLOW}🔍 Validating configuration files...${NC}"

# Check if configuration files exist and are properly configured
validate_config "nginx.conf exists" "[ -f nginx.conf ]"
validate_config "ecosystem.config.js exists" "[ -f ecosystem.config.js ]"
validate_config "server.js uses PORT env var" "grep -q 'process.env.PORT' server.js"

echo ""
echo -e "${YELLOW}🔍 Checking for hardcoded ports...${NC}"

# Check for remaining hardcoded ports (should return empty)
HARDCODED_3005=$(grep -r "localhost:3005" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" . | wc -l)
HARDCODED_3003=$(grep -r "localhost:3003" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" . | wc -l)

validate_config "No hardcoded localhost:3005 (non-backup files)" "[ \$HARDCODED_3005 -eq 0 ]"
validate_config "No hardcoded localhost:3003 (non-backup files)" "[ \$HARDCODED_3003 -eq 0 ]"

echo ""
echo -e "${YELLOW}🔍 Testing connectivity...${NC}"

# Test if the configured port is available
validate_config "Port $API_PORT is available" "! netstat -tlnp 2>/dev/null | grep -q \":$API_PORT \""

# Test database connectivity (if PostgreSQL)
if [ "$DB_HOST" = "localhost" ] && [ "$DB_PORT" = "5432" ]; then
    validate_config "PostgreSQL is running" "pg_isready -h $DB_HOST -p $DB_PORT >/dev/null 2>&1"
fi

echo ""
echo -e "${YELLOW}📊 VALIDATION SUMMARY${NC}"
echo "===================="
echo -e "✅ Passed: ${GREEN}$PASS${NC}"
echo -e "❌ Failed: ${RED}$FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED!${NC}"
    echo -e "${GREEN}Your configuration is properly using environment variables.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  SOME VALIDATIONS FAILED${NC}"
    echo -e "${YELLOW}Please review the failed checks above and update your configuration.${NC}"
    
    if [ $HARDCODED_3005 -gt 0 ] || [ $HARDCODED_3003 -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}📝 Files with remaining hardcoded ports:${NC}"
        if [ $HARDCODED_3005 -gt 0 ]; then
            grep -r "localhost:3005" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" . | head -5
        fi
        if [ $HARDCODED_3003 -gt 0 ]; then
            grep -r "localhost:3003" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.backup.*" . | head -5
        fi
    fi
    
    exit 1
fi
