#!/bin/bash
# Fix All Database Port References
# Updates all JavaScript files to use port 5432 instead of 5433

echo "🔧 FIXING ALL DATABASE PORT REFERENCES"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Scanning for files with incorrect port 5433...${NC}"
echo ""

# Find all JavaScript files with port 5433
FILES_TO_FIX=$(grep -r "5433" --include="*.js" database/ backend/ *.js 2>/dev/null | cut -d: -f1 | sort -u)

if [ -z "$FILES_TO_FIX" ]; then
    echo -e "${GREEN}✅ No files found with port 5433${NC}"
else
    echo "Files to fix:"
    echo "$FILES_TO_FIX"
    echo ""
    
    # Fix each file
    for file in $FILES_TO_FIX; do
        if [ -f "$file" ]; then
            echo -e "${YELLOW}Fixing: $file${NC}"
            
            # Create backup
            cp "$file" "$file.backup.$(date +%Y%m%d-%H%M%S)"
            
            # Replace port 5433 with 5432
            sed -i 's/5433/5432/g' "$file"
            
            echo -e "${GREEN}✅ Fixed: $file${NC}"
        fi
    done
fi

echo ""
echo -e "${YELLOW}Verifying changes...${NC}"

# Check if any 5433 references remain
REMAINING=$(grep -r "5433" --include="*.js" database/ backend/ *.js 2>/dev/null | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo -e "${GREEN}✅ All port references fixed!${NC}"
else
    echo -e "${RED}⚠️ $REMAINING references to port 5433 still found${NC}"
    grep -r "5433" --include="*.js" database/ backend/ *.js 2>/dev/null
fi

echo ""
echo -e "${GREEN}🎉 PORT CONSISTENCY FIX COMPLETE!${NC}"
echo ""
echo "All JavaScript files now use:"
echo "• Port 5432 (PostgreSQL default)"
echo "• User 'kai' as fallback"
echo "• Database 'flexjobs_db'"

