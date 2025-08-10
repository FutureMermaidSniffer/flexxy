#!/bin/bash

# Quick Production Environment Update Script
# Run this on your production server

echo "🔄 FlexJobs Production Environment Update"
echo "========================================"

# 1. Backup current environment
echo "📋 Backing up current .env..."
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
else
    echo "⚠️  No existing .env found"
fi

# 2. Update environment (assumes you've uploaded .env.production.fixed)
if [ -f ".env.production.fixed" ]; then
    echo "📋 Applying new environment configuration..."
    cp .env.production.fixed .env
    echo "✅ New environment applied"
else
    echo "❌ .env.production.fixed not found!"
    echo "💡 Upload it first: scp .env.production.fixed user@server:/path/to/app/"
    exit 1
fi

# 3. Restart application
echo "🔄 Restarting application..."

# Try PM2 first
if command -v pm2 &> /dev/null; then
    echo "📦 Using PM2 restart..."
    pm2 restart all
    echo "✅ PM2 restart completed"
    
# Try systemctl if service exists
elif systemctl is-active --quiet flexjobs; then
    echo "🔧 Using systemctl restart..."
    sudo systemctl restart flexjobs
    echo "✅ Systemctl restart completed"
    
# Manual restart
else
    echo "🔧 Manual restart..."
    
    # Find and kill the process
    PID=$(pgrep -f "node.*server.js")
    if [ ! -z "$PID" ]; then
        echo "🔄 Stopping process $PID..."
        kill -TERM $PID
        sleep 5
        
        # Force kill if still running
        if kill -0 $PID 2>/dev/null; then
            echo "⚠️  Force killing process..."
            kill -KILL $PID
        fi
    fi
    
    # Start the application
    echo "🚀 Starting application..."
    nohup npm start > /dev/null 2>&1 &
    sleep 3
    echo "✅ Application started"
fi

# 4. Verify the application is running
echo "🔍 Verifying application status..."
sleep 5

# Test health endpoint
if curl -f -s http://localhost:3003/health > /dev/null; then
    echo "✅ Application is responding"
    
    # Test detailed health
    echo "🔍 Testing detailed health check..."
    HEALTH_RESPONSE=$(curl -s http://localhost:3003/health/detailed)
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
        echo "✅ All health checks passed"
    else
        echo "⚠️  Health check returned issues:"
        echo "$HEALTH_RESPONSE" | grep -o '"message":"[^"]*"' || echo "Unknown health issue"
    fi
else
    echo "❌ Application is not responding"
    echo "💡 Check logs: pm2 logs OR journalctl -u flexjobs -f"
    exit 1
fi

# 5. Test auth endpoints
echo "🔐 Testing authentication endpoints..."

# Test login endpoint
LOGIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3003/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}')

if [ "$LOGIN_TEST" = "400" ] || [ "$LOGIN_TEST" = "401" ]; then
    echo "✅ Login endpoint responding (got $LOGIN_TEST - expected for wrong credentials)"
elif [ "$LOGIN_TEST" = "500" ]; then
    echo "❌ Login endpoint still returning 500 errors"
    exit 1
else
    echo "⚠️  Login endpoint returned unexpected code: $LOGIN_TEST"
fi

echo ""
echo "🎉 Production update completed successfully!"
echo "🔍 Monitor your application at: https://flexjobseu.com/health/detailed"
echo "🔐 Your authentication issues should now be resolved"
