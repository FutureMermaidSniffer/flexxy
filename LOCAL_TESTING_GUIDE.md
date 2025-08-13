# Local Testing Guide for FlexJobs Site URLs

This guide explains how to test the site URL configuration in different environments before deploying to production.

## 📋 Testing Environments

We've set up three testing environments:

1. **Local Development** (.env.local)
   - Tests on your local machine at http://localhost:3003
   - Fastest for quick development testing

2. **Staging** (.env.staging)
   - Tests on your server at http://144.126.154.23:3003
   - Uses test database and config but with real server 

3. **Production** (.env.production)
   - Identical to your production setup
   - Tests at https://144.126.154.23

## 🔧 How to Test Locally

### Option 1: Using Windows Batch Script

```powershell
# For local development testing
.\test-local.bat local

# For staging server testing
.\test-local.bat staging

# For production-like testing
.\test-local.bat docker
```

### Option 2: Using NPM Scripts

```powershell
# Install required packages
npm install colors axios

# Test local environment
npm run test:local

# Test staging environment
npm run test:staging

# Test production environment
npm run test:prod
```

### Option 3: Using Docker Directly

```powershell
# Test with local configuration
docker-compose --env-file .env.local up -d
npm run test:local
docker-compose down

# Test with staging configuration
docker-compose --env-file .env.staging up -d
npm run test:staging
docker-compose down

# Test with production configuration
docker-compose --env-file .env.docker up -d
npm run test:prod
docker-compose down
```

## 🔍 What Gets Tested

The testing scripts verify:

1. **Health Endpoint** (/health)
2. **Site Configuration Endpoint** (/api/config)
3. **Admin Configuration Endpoint** (/api/admin/site-config)
4. **Static Pages** (/remote-jobs, /why-remote, etc.)
5. **URL Generation Functions** (for admin, jobs, password reset, etc.)

## ❓ Troubleshooting Common Issues

### The test script shows "Connection refused"
- Make sure your server or Docker containers are running
- Check that the port (3003) is not blocked by a firewall

### "Admin config endpoint: Failed"
- This is normal if you're not logged in as an admin
- The admin endpoint requires authentication

### URLs are using wrong domain
- Check your environment files (.env.local, .env.staging, .env.docker)
- Make sure SITE_URL and FRONTEND_URL are set correctly

## 🚀 Deploying to Production

Once tests pass, update your production environment:

1. Edit `.env.docker` with your final production domain:
   ```
   SITE_URL=https://yourproductiondomain.com
   FRONTEND_URL=https://yourproductiondomain.com
   ```

2. Deploy using:
   ```powershell
   docker-compose --env-file .env.docker up -d
   ```

## 🛠️ Testing Environment Settings

| Setting           | Local (.env.local)       | Staging (.env.staging)         | Production (.env.docker)     |
|-------------------|--------------------------|-------------------------------|------------------------------|
| Database          | flexjobs_test_db        | flexjobs_test_db              | flexjobs_db                  |
| Database User     | postgres                 | kai                           | kai                          |
| Site URL          | http://localhost:3003    | http://144.126.154.23:3003    | https://144.126.154.23       |
| Node Environment  | development              | staging                       | production                   |
| Logging Level     | debug                    | debug                         | info                         |
| Admin Email       | admin@test.local         | admin@test.flexjobs          | tommy@flexjobseu.com         |

Remember to always test thoroughly before deploying to your production environment!
