#!/bin/bash
# Quick Database Fix
echo "🔧 QUICK DATABASE FIX"
echo "===================="

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE flexjobs_db;
CREATE USER kai WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flexjobs_db TO kai;
\c flexjobs_db
GRANT ALL ON SCHEMA public TO kai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO kai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO kai;
\q
EOF

echo "✅ Database created"
echo "🔄 Restarting app..."
pm2 restart flexjobs

echo "📋 Checking logs..."
sleep 3
pm2 logs flexjobs --lines 10

