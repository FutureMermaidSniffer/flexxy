#!/bin/bash

# Run Database Migration Script
# This script runs the database migration inside the Docker container

echo "🚀 Running FlexJobs database migration..."
echo "=========================================="

# Check if Docker container is running
CONTAINER_ID=$(docker ps -qf "name=flexjobs-app")

if [ -z "$CONTAINER_ID" ]; then
  echo "❌ FlexJobs app container is not running!"
  echo "Start the container with: docker-compose --env-file .env.docker up -d"
  exit 1
fi

echo "✅ Found container: $CONTAINER_ID"

# Execute migration script in the container
echo "📦 Running migration script..."
docker exec -it $CONTAINER_ID node database/migrations/migrate.js

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
  
  # Check if tables were created
  echo "📊 Checking database tables..."
  TABLE_COUNT=$(docker exec -it $CONTAINER_ID psql -U ${DB_USER:-kai} -d ${DB_NAME:-flexjobs_db} -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" -t | tr -d ' ')
  
  echo "Found $TABLE_COUNT tables in database"
  
  # List tables
  echo "📋 Tables in database:"
  docker exec -it $CONTAINER_ID psql -U ${DB_USER:-kai} -d ${DB_NAME:-flexjobs_db} -c "\dt"
  
else
  echo "❌ Migration failed!"
  exit 1
fi

echo "=========================================="
echo "✨ Database setup complete!"
echo "You can now access the application at:"
echo "https://144.126.154.23"
