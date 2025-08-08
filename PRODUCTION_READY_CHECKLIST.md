# FlexJobs Production Deployment Checklist

## ✅ Docker Cleanup Complete
- [x] All Docker files removed (Dockerfile, docker-compose.yml, etc.)
- [x] Docker scripts removed from package.json
- [x] Docker references cleaned from documentation
- [x] Environment files updated for native deployment

## 🗄️ Database Configuration

### Current Environment Settings
Your current `.env` file is configured for **development** with:
- Database: PostgreSQL on localhost:5433
- User: postgres/postgres
- Database name: flexjobs_db

### Production Environment Settings
The `.env.production` template is configured with:
- Database: PostgreSQL on localhost:5432 (standard port)
- User: postgres/postgres (PostgreSQL defaults)
- Database name: flexjobs_db

### Centralized Configuration
All database settings are now centralized in the `.env` file:
```bash
DB_HOST=localhost          # Change for remote database
DB_PORT=5432              # Standard PostgreSQL port
DB_USER=postgres          # PostgreSQL default user
DB_PASSWORD=postgres      # PostgreSQL default password  
DB_NAME=flexjobs_db       # Database name
```

## 🛠️ Migration Scripts Ready

### Available Migration Tools

1. **PowerShell Script** (Windows): `database\migrate-production.ps1`
   ```powershell
   .\database\migrate-production.ps1
   ```

2. **Bash Script** (Linux/macOS): `database\migrate-production.sh`
   ```bash
   chmod +x database/migrate-production.sh
   ./database/migrate-production.sh
   ```

3. **Database Connection Test**: `npm run test:db`
   ```bash
   npm run test:db
   ```

### Migration Script Features
- ✅ Creates database if it doesn't exist
- ✅ Creates all required tables (users, agents, companies, jobs, etc.)
- ✅ Applies wizard fields migration to users table
- ✅ Creates agents table with all required columns
- ✅ Populates sample data
- ✅ Verifies migration success
- ✅ Provides detailed error reporting

## 🎯 Agents Functionality Verification

### Agents Table Schema
The migration ensures the agents table includes all required fields:
- ✅ Basic info: id, user_id, agent_name, display_name
- ✅ Profile: bio, avatar_url, experience_years, rating
- ✅ Skills: specializations, skills, certifications (JSON arrays)
- ✅ Contact: location, timezone, linkedin_url, portfolio_url
- ✅ Languages: languages (JSON array)
- ✅ Status: is_featured, is_active
- ✅ Timestamps: created_at, updated_at

### Wizard Fields for Users
The migration adds wizard functionality to users table:
- ✅ is_temp_account: For temporary wizard accounts
- ✅ created_via_wizard: Track wizard-created accounts
- ✅ Preference fields: work_type, salary, location, job preferences
- ✅ Experience and education level preferences
- ✅ Benefit preferences (JSON)
- ✅ Wizard completion timestamps

## 🚀 Production Deployment Steps

### 1. Environment Setup
```bash
# Copy production template to active .env
cp .env.production .env

# Edit .env with your specific settings:
# - Change DOMAIN to your actual domain
# - Update SSL_EMAIL with your email
# - Generate secure JWT_SECRET and SESSION_SECRET
# - Adjust database settings if needed
```

### 2. Database Migration
```bash
# Test database connection
npm run test:db

# Run full migration (Windows)
.\database\migrate-production.ps1

# Or run full migration (Linux/macOS)
./database/migrate-production.sh
```

### 3. Application Start
```bash
# Install dependencies
npm install

# Start application
npm start
```

## 🔧 Customization Guide

### Change Database Port
Edit `.env`:
```bash
DB_PORT=5432  # Standard PostgreSQL port for production
```

### Change Database Credentials
Edit `.env`:
```bash
DB_USER=your_user
DB_PASSWORD=your_secure_password
```

### Change Database Host (for remote DB)
Edit `.env`:
```bash
DB_HOST=your-database-server.com
DB_PORT=5432
```

### Change Application Port
Edit `.env`:
```bash
PORT=3000  # Or any other port
```

## 🔒 Security Considerations

### Generate Secure Secrets
```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate session secret (32+ characters)
openssl rand -base64 32
```

### Database Security
For production, consider:
- Creating a dedicated database user instead of using 'postgres'
- Using a strong, unique password
- Configuring PostgreSQL authentication (pg_hba.conf)
- Enabling SSL connections if database is remote

## 🔍 Verification Steps

### 1. Test Database Connection
```bash
npm run test:db
```
This will verify:
- ✅ PostgreSQL connection
- ✅ Database exists
- ✅ Required tables exist
- ✅ Agents table structure
- ✅ Users table wizard fields

### 2. Test Agents Functionality
After starting the application:
- ✅ Navigate to agents page
- ✅ Test agent profile creation
- ✅ Test agent profile editing
- ✅ Test agent wizard flow
- ✅ Verify image uploads work

### 3. Test User Wizard
- ✅ Test new user wizard flow
- ✅ Verify preferences are saved
- ✅ Test temporary account conversion

## 📝 Environment File Reference

### Current Development (.env)
```bash
NODE_ENV=development
PORT=3003
DB_HOST=localhost
DB_PORT=5433          # Non-standard port for development
DB_NAME=flexjobs_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### Production Template (.env.production)
```bash
NODE_ENV=production
PORT=3003
DB_HOST=localhost
DB_PORT=5432          # Standard PostgreSQL port
DB_NAME=flexjobs_db
DB_USER=postgres
DB_PASSWORD=postgres
DOMAIN=flexjobseu.com
SSL_EMAIL=admin@flexjobseu.com
USE_REDIS=false       # Using memory sessions
```

## 🚨 Common Issues & Solutions

### Database Connection Issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check port availability: `netstat -an | grep 5432`
- Verify credentials in .env file
- Check PostgreSQL logs for authentication errors

### Migration Failures
- Ensure PostgreSQL user has CREATE DATABASE permissions
- Check if database already exists
- Verify SQL file paths in migration script
- Review migration script output for specific errors

### Agents Table Issues
- Run `npm run test:db` to verify table structure
- Check database logs for constraint violations
- Verify all required columns exist
- Test with sample data insertion

## 📋 Pre-Production Checklist

- [ ] All Docker files removed
- [ ] .env.production configured with your domain and settings
- [ ] PostgreSQL installed and running
- [ ] Database migration completed successfully
- [ ] `npm run test:db` passes all checks
- [ ] Agents functionality tested
- [ ] User wizard functionality tested
- [ ] Security secrets generated and configured
- [ ] SSL certificates prepared (if using HTTPS)
- [ ] Firewall rules configured
- [ ] Backup strategy planned

Your FlexJobs application is now ready for native production deployment! 🎉
