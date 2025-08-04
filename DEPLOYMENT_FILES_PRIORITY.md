# FlexJobs Deployment Files Priority Guide

## 🚨 Essential Migration Files (CRITICAL)
```
database/migrate.js                    # CRITICAL - Updated production migration
database/snapshots/schema_snapshot_*.sql  # Current database schema backup
```

## 🏗️ Core Application Files (REQUIRED)
```
server.js                             # Main application entry point
backend/database.js                   # Database connection & utilities
backend/routes/                       # All API endpoints
backend/middleware/                   # Authentication & validation
```

## 🌐 Frontend Files (REQUIRED)
```
frontend/index.html                   # Main SPA
frontend/js/auth.js                   # Authentication handling
frontend/js/jobs.js                   # Job listings functionality
frontend/js/main.js                   # Core utilities
frontend/css/style.css                # Custom styling
```

## ⚙️ Configuration Files (REQUIRED)
```
package.json                          # Dependencies & scripts
.env                                  # Environment variables (CREATE ON SERVER)
```

## 📋 Deployment Priority Levels

### **🔴 Level 1: Cannot Deploy Without These**
1. `database/migrate.js` - **MOST CRITICAL** - Updated migration with 13 tables
2. `server.js` - Main application entry point
3. `package.json` - Dependencies and npm scripts
4. `backend/database.js` - Database connection logic
5. `.env` file - Environment variables (create new on production server)

### **🟡 Level 2: Core Functionality (Required for Full Features)**
6. `backend/routes/` - Complete folder with all API endpoints
7. `backend/middleware/` - Complete folder with auth & validation
8. `frontend/` - Complete folder with all frontend files
9. `backend/models/` - Database models (if exists)
10. `backend/services/` - Business logic services (if exists)

### **🟢 Level 3: Optional (Can Add Later)**
11. `scripts/` - Job scraping system (currently disabled)
12. `database/snapshots/` - Database backup files
13. `logs/` - Log files directory
14. Documentation files (`.md` files)
15. Test files

## 🎯 Minimum Viable Deployment Package

**Absolute minimum files to get your FlexJobs site running:**

```
✅ database/migrate.js          # Fixed migration system
✅ server.js                    # Main app
✅ package.json                 # Dependencies
✅ backend/ (entire folder)     # All backend logic
✅ frontend/ (entire folder)    # Complete frontend
✅ .env (create on server)      # Environment configuration
```

## 🚀 Quick Deployment Checklist

### **Pre-Deployment (On Your Current PC)**
- [ ] Ensure `database/migrate.js` has been updated (completed 2025-08-04)
- [ ] Commit and push all changes to repository
- [ ] Verify `package.json` has correct scripts

### **On Production Server**
- [ ] Clone/pull repository: `git pull origin master`
- [ ] Create `.env` file with production database credentials
- [ ] Run: `npm install`
- [ ] Run: `npm run migrate` (should create 13 tables)
- [ ] Run: `npm start` or `npm run dev`

## 🔧 Critical Files Changed (2025-08-04)

### **Updated Files**
- ✅ `database/migrate.js` - **CRITICAL UPDATE** - Now creates complete 13-table schema
- ✅ `database/migrate-production.js` - Production version (source for migrate.js)
- ✅ `database/migrate-old.js.backup` - Original 6-table migration preserved

### **New Files Created**
- ✅ `scripts/job-scraper.js` - Comprehensive job scraping system
- ✅ `scripts/comprehensive-scraper.js` - Multi-source scraping orchestrator
- ✅ `database/snapshots/` - Database backup and analysis files
- ✅ `PRODUCTION_DEPLOYMENT_STATUS.md` - Deployment guide

## ⚠️ Critical Deployment Notes

### **Database Migration Priority**
The **#1 most important change** is the updated `database/migrate.js`. The old version only created 6 tables, but your working system has 13 tables including:
- Agent consultation system (3 tables)
- Subscription system (2 tables)
- Enhanced job features (2 additional tables)

### **Environment Variables Required**
```bash
DB_HOST=your_production_host
DB_PORT=5432
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=flexjobs_db
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=production
PORT=3000
```

### **Post-Deployment Verification**
After running `npm run migrate`, you should see:
```
✅ Found 13 tables: agent_bookings, agent_reviews, agents, applications, 
   categories, companies, job_skills, jobs, password_reset_tokens, 
   saved_jobs, subscription_plans, user_subscriptions, users
```

If you see only 6 tables, the migration didn't update properly.

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] Database has 13 tables (not 6)
- [ ] Application starts without errors
- [ ] Frontend loads and shows job board
- [ ] User registration/login works
- [ ] All current features are preserved

**Deploy with confidence!** The migration system now matches your current working database exactly.
