# FlexJobs Native Production Deployment Guide

## Overview
This guide covers deploying FlexJobs directly to your server without Docker containers. All Docker-related files have been removed from the project.

## Pre-Deployment Checklist

### 1. Environment Configuration
- ✅ All Docker files removed (Dockerfile, docker-compose.yml, etc.)
- ✅ .env.production updated with PostgreSQL defaults
- ✅ Package.json cleaned of Docker scripts
- ✅ GitIgnore updated to remove Docker references

### 2. Database Requirements
- PostgreSQL server installed and running
- Default credentials: postgres/postgres
- Default port: 5432 (configurable via DB_PORT)
- Database name: flexjobs_db

### 3. Production Environment Variables

#### Central Configuration (.env.production)
All database and application settings are centralized in `.env.production`:

```bash
# Application Configuration
NODE_ENV=production
PORT=3003

# Database Configuration - PostgreSQL defaults
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexjobs_db
DB_PORT=5432

# Domain Configuration
DOMAIN=flexjobseu.com
SSL_EMAIL=admin@flexjobseu.com

# Session Management
USE_REDIS=false

# Security
JWT_SECRET=GenerateSecureJWTSecret32CharactersLong!
SESSION_SECRET=GenerateSecureSessionSecret32CharactersLong!

# Admin Configuration
ADMIN_EMAIL=admin@flexjobseu.com
ADMIN_PASSWORD=GenerateSecureAdminPassword123!
```

## Database Migration Strategy

### Migration Files to Review
1. `database/create_agents_table_postgres.sql` - Core agents table
2. `database/agents_schema_postgres.sql` - Agents schema
3. `database/add_wizard_fields_migration.sql` - Wizard fields
4. All files in `database/` directory

### Migration Execution Order
1. Create main database schema (users, sessions, jobs)
2. Create agents table with all required fields
3. Apply wizard fields migration
4. Populate sample data

## Key Production Considerations

### 1. Agents Functionality
- Ensure agents table has all required columns
- Verify wizard functionality works with database schema
- Test agent creation, editing, and profile management
- Validate image upload and storage paths

### 2. Database Connection
- All database settings centralized in .env file
- Easy to change port, username, password, database name
- No hardcoded database configurations

### 3. Session Management
- Redis disabled (USE_REDIS=false)
- Using memory store for sessions
- Suitable for single-server deployment

### 4. File Uploads
- Static file serving configured
- Image uploads for agent profiles
- Public asset serving

## Deployment Steps

### 1. Server Preparation
```bash
# Install Node.js and npm
# Install PostgreSQL
# Clone repository
# Install dependencies
npm install
```

### 2. Database Setup
```bash
# Create database
createdb -U postgres flexjobs_db

# Run migrations
psql -U postgres -d flexjobs_db -f database/create_users_table.sql
psql -U postgres -d flexjobs_db -f database/create_agents_table_postgres.sql
psql -U postgres -d flexjobs_db -f database/add_wizard_fields_migration.sql
```

### 3. Environment Configuration
```bash
# Copy and configure environment
cp .env.production .env

# Edit .env with your specific settings:
# - Domain name
# - Database credentials (if different from defaults)
# - SSL email
# - Security secrets
```

### 4. Application Start
```bash
# Start application
npm start

# Or for production with PM2
npm install -g pm2
pm2 start server.js --name flexjobs
```

## Environment Customization

### Change Database Settings
Edit `.env` file:
```bash
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_PORT=your-db-port
```

### Change Application Port
Edit `.env` file:
```bash
PORT=your-preferred-port
```

### Change Domain
Edit `.env` file:
```bash
DOMAIN=your-domain.com
SSL_EMAIL=admin@your-domain.com
```

## Security Considerations

### 1. Generate Secure Secrets
```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate session secret (32+ characters)
openssl rand -base64 32
```

### 2. Database Security
- Use strong database passwords in production
- Consider creating dedicated database user instead of postgres
- Enable PostgreSQL authentication methods as needed

### 3. File Permissions
- Ensure proper file permissions on server
- Secure log files and database backups
- Configure firewall rules

## Monitoring and Maintenance

### 1. Logs
- Application logs in `logs/` directory
- Database logs (PostgreSQL standard locations)
- Monitor for errors and performance issues

### 2. Backups
- Regular database backups
- Application file backups
- Configuration file backups

### 3. Updates
- Monitor for security updates
- Test updates in staging environment
- Maintain backup before updates

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
   - Ensure database exists

2. **Agents Table Missing**
   - Run agents table creation script
   - Verify migration completed successfully

3. **Session Issues**
   - Verify USE_REDIS=false in .env
   - Restart application after .env changes

4. **File Upload Issues**
   - Check file permissions
   - Verify upload directory exists
   - Check disk space

## Next Steps After Deployment

1. Test all functionality including:
   - User registration/login
   - Agent profile creation
   - Job posting and browsing
   - Admin functionality

2. Configure SSL/HTTPS
3. Set up monitoring and alerting
4. Configure automated backups
5. Set up domain and DNS
