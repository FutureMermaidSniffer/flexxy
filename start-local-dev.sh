#!/bin/bash

echo "🚀 Starting FlexJobs Local Development Environment..."
echo "=================================================="

# Load environment variables
if [ -f ".env" ]; then
    echo "✅ Loading environment variables from .env"
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
else
    echo "⚠️  No .env file found, using defaults"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🧹 Cleaning up existing containers..."
docker-compose down --volumes

echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🔍 Checking container status..."
docker-compose ps

echo "📊 Checking logs..."
docker-compose logs --tail=10

echo ""
echo "🎉 Development environment started!"
echo "📱 Application: http://localhost:3003"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop all: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Shell into app: docker exec -it flexjobs-app /bin/sh"
echo "   Database shell: docker exec -it flexjobs-db psql -U postgres -d flexjobs_db"
