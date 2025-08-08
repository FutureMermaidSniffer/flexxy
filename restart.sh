#!/bin/bash
# Quick PM2 Restart - App is working, just need to start it properly

echo "🚀 QUICK PM2 RESTART"
echo "==================="

cd ~/flexxy

echo "Stopping any existing PM2 processes..."
pm2 stop flexjobs 2>/dev/null || echo "No process to stop"
pm2 delete flexjobs 2>/dev/null || echo "No process to delete"

echo ""
echo "Starting FlexJobs with PM2..."
pm2 start server.js --name flexjobs --instances 1

sleep 3

echo ""
echo "✅ Final Status Check:"
pm2 list

echo ""
echo "Port 3003 check:"
sudo netstat -tlnp | grep ':3003 ' || echo 'Checking...'

echo ""
echo "Testing your website:"
echo "Direct app: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3003 2>/dev/null || echo 'Starting...')"
echo "Through nginx: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 2>/dev/null || echo 'Starting...')"

echo ""
echo "🎉 Your website should now be live at:"
echo "   http://flexjobseu.com:8080"
echo "   http://144.126.154.23:8080"

