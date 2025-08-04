# Environment Variables Management

## 🔐 Security Guidelines

### **NEVER commit these files to Git:**
- `.env`
- `.env.production`
- `.env.local`
- Any file containing actual credentials

### **Always commit:**
- `.env.example` - Template with fake/example values
- This documentation file

## 📋 Environment Variables Changelog

### **2025-08-04 - Initial Setup**
- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (3003 for dev, 3000 for production)
- `DB_HOST` - Database hostname
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port (default: 5432)
- `SESSION_SECRET` - Session encryption key

### **Optional Variables Added:**
- `SCRAPE_INDEED` - Enable Indeed job scraping
- `SCRAPE_LINKEDIN` - Enable LinkedIn job scraping
- `GOOGLE_CSE_API_KEY` - Google Custom Search API
- `GOOGLE_CSE_ID` - Google Custom Search Engine ID
- `SERP_API_KEY` - SerpAPI key for Google Jobs

## 🚀 Deployment Instructions

### **For new deployments:**
1. Copy `.env.example` to `.env`
2. Fill in actual production values
3. Keep production `.env` secure and never commit it

### **For environment updates:**
1. Update `.env.example` with new variables (fake values)
2. Document changes in this file's changelog
3. Update actual `.env` files in all environments
4. Commit `.env.example` and this documentation

## 🔄 Syncing Environment Changes

### **When adding new environment variables:**
```bash
# 1. Add to .env.example with fake values
echo "NEW_API_KEY=your_api_key_here" >> .env.example

# 2. Add to actual .env files (don't commit these)
echo "NEW_API_KEY=actual_production_key" >> .env

# 3. Commit the template
git add .env.example ENV_MANAGEMENT.md
git commit -m "Add NEW_API_KEY environment variable"

# 4. Update production servers manually or via platform dashboard
```

## 🎯 Quick Reference

### **Local Development Setup:**
```bash
cp .env.example .env
# Edit .env with your local database credentials
npm run migrate
npm run dev
```

### **Production Deployment:**
```bash
# Option 1: Create .env file on server
cp .env.example .env
# Edit with production values

# Option 2: Use platform environment variables (recommended)
# Set variables in Heroku/Railway/Render dashboard
```
