#!/bin/bash

# FlexJobs Development Setup Script
# This script helps you start the FlexJobs server on port 3003

echo "🚀 Starting FlexJobs Development Server..."
echo "📍 Server will run on http://localhost:3003"
echo "🔧 Ports 3000 and 3001 are now free for your other projects"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists and has correct port
if [ -f ".env" ]; then
    if grep -q "PORT=3003" .env; then
        echo "✅ Environment configured for port 3003"
    else
        echo "⚠️  Updating .env file to use port 3003..."
        sed -i 's/PORT=300[01]/PORT=3003/' .env
    fi
else
    echo "⚠️  Creating .env file..."
    cat > .env << EOL
# Environment Variables for FlexJobs
NODE_ENV=development
PORT=3003

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexjobs_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=24h

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EOL
fi

echo ""
echo "🎯 Starting server in development mode..."
echo "📱 Your site will be available at:"
echo "   http://localhost:3003"
echo ""
echo "💡 Pro tip: Your other projects can now use ports 3000 and 3001!"
echo ""

# Start the development server
npm run dev
