#!/bin/bash

##############################################################################
# PostgreSQL Installation and Database Setup Script for FlexJob.UK
# Ubuntu/Debian Server Setup
##############################################################################

set -e  # Exit on any error

echo "🚀 FlexJob.UK PostgreSQL Setup Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update package list
print_info "Updating package list..."
sudo apt update

# Install PostgreSQL
print_info "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
print_info "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

print_status "PostgreSQL installed and started successfully!"

# Check PostgreSQL version
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | head -1)
print_info "PostgreSQL Version: $PG_VERSION"

# Database configuration
DB_NAME="flexjobs_db"
DB_USER="flexjobs_user"
DB_PASSWORD=$(openssl rand -base64 32)

print_info "Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

print_status "Database '$DB_NAME' and user '$DB_USER' created successfully!"

# Configure PostgreSQL for remote connections (if needed)
PG_VERSION_NUM=$(sudo -u postgres psql -t -c "SHOW server_version_num;" | tr -d ' ')
PG_MAJOR_VERSION=$(echo $PG_VERSION_NUM | cut -c1-2)

PG_CONFIG_DIR="/etc/postgresql/$PG_MAJOR_VERSION/main"

print_info "Configuring PostgreSQL for connections..."

# Backup original config files
sudo cp $PG_CONFIG_DIR/postgresql.conf $PG_CONFIG_DIR/postgresql.conf.backup
sudo cp $PG_CONFIG_DIR/pg_hba.conf $PG_CONFIG_DIR/pg_hba.conf.backup

# Configure postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" $PG_CONFIG_DIR/postgresql.conf
sudo sed -i "s/#port = 5432/port = 5433/" $PG_CONFIG_DIR/postgresql.conf

# Configure pg_hba.conf for local connections
echo "# FlexJob.UK local connections" | sudo tee -a $PG_CONFIG_DIR/pg_hba.conf
echo "local   $DB_NAME    $DB_USER                     md5" | sudo tee -a $PG_CONFIG_DIR/pg_hba.conf
echo "host    $DB_NAME    $DB_USER    127.0.0.1/32    md5" | sudo tee -a $PG_CONFIG_DIR/pg_hba.conf

# Restart PostgreSQL to apply changes
print_info "Restarting PostgreSQL..."
sudo systemctl restart postgresql

print_status "PostgreSQL configuration updated!"

# Test connection
print_info "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5433 -U $DB_USER -d $DB_NAME -c "SELECT 'Connection successful!' as status;"

if [ $? -eq 0 ]; then
    print_status "Database connection test successful!"
else
    print_error "Database connection test failed!"
    exit 1
fi

# Create .env file
print_info "Creating .env configuration..."

cat > .env.production << EOF
# FlexJob.UK Production Configuration
NODE_ENV=production
PORT=3003

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Domain Configuration
DOMAIN=flexjob.uk
BASE_URL=https://flexjob.uk

# Security
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@flexjob.uk
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@flexjob.uk

# File Upload
UPLOAD_DIR=/var/www/flexjob.uk/uploads
MAX_FILE_SIZE=5242880

# SSL
SSL_CERT_PATH=/etc/ssl/certs/flexjob.uk.crt
SSL_KEY_PATH=/etc/ssl/private/flexjob.uk.key
EOF

print_status ".env.production file created!"

# Display summary
echo ""
echo "🎉 PostgreSQL Setup Complete!"
echo "=============================="
echo ""
print_info "Database Details:"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo "  Database Password: $DB_PASSWORD"
echo "  Database Port: 5433"
echo ""
print_info "Configuration Files:"
echo "  .env.production - Production environment variables"
echo ""
print_warning "IMPORTANT SECURITY NOTES:"
echo "  1. Store the database password securely"
echo "  2. Update SMTP settings in .env.production"
echo "  3. Copy .env.production to .env when ready"
echo "  4. Set proper file permissions: chmod 600 .env"
echo ""
print_info "Next Steps:"
echo "  1. cp .env.production .env"
echo "  2. npm install"
echo "  3. node check-production-db.js"
echo "  4. node run-production-migrations.js"
echo "  5. npm start"
echo ""
print_status "PostgreSQL setup completed successfully!"
EOF
