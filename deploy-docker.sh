#!/bin/bash

# FlexJobs Docker Deployment Script

echo "🐳 Starting FlexJobs Docker Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.docker ]; then
    echo "📝 Creating .env.docker file from template..."
    cp .env.docker.example .env.docker
    echo "⚠️  Please edit .env.docker with your production values before continuing!"
    echo "   Required: DB_PASSWORD, JWT_SECRET, SESSION_SECRET"
    read -p "Press Enter after editing .env.docker..."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads logs database/backup

# Build and start containers
echo "🏗️  Building FlexJobs application..."
docker-compose --env-file .env.docker build

echo "🚀 Starting FlexJobs containers..."
docker-compose --env-file .env.docker up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose --env-file .env.docker exec flexjobs-app npm run migrate

# Show container status
echo "📊 Container Status:"
docker-compose --env-file .env.docker ps

# Show application URL
echo ""
echo "🎉 FlexJobs deployment completed!"
echo "📱 Application URL: http://your-server-ip:3003"
echo "🗄️  Database accessible on port: 8694"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose --env-file .env.docker logs -f flexjobs-app"
echo "   Stop: docker-compose --env-file .env.docker down"
echo "   Restart: docker-compose --env-file .env.docker restart"
echo "   Database backup: docker-compose --env-file .env.docker exec flexjobs-db pg_dump -U flexjobs_user flexjobs_db > backup.sql"
