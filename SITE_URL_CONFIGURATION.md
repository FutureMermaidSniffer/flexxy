# Site URL Configuration Guide

This guide explains how to configure and use site URLs in your FlexJobs application.

## 📋 Overview

The FlexJobs application now includes a centralized site URL configuration system that:
- Supports different environments (development, production)
- Provides consistent URL generation across the application
- Makes it easy to switch between local and production domains

## 🔧 Configuration Files

### 1. Environment Variables

**For Development (.env):**
```bash
SITE_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3003
```

**For Production (.env.docker):**
```bash
SITE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### 2. Backend Configuration

The backend configuration is located at `backend/config/site.js` and provides:
- `siteUrl` - Base site URL
- `adminUrl()` - Admin dashboard URL
- `jobsUrl()` - Jobs listing page URL
- `dashboardUrl()` - User dashboard URL
- `resetPasswordUrl(token)` - Password reset URL with token
- `jobDetailsUrl(jobId)` - Individual job details URL
- `companyUrl(companyId)` - Company profile URL

### 3. Frontend Configuration

The frontend configuration is located at `frontend/js/config/site.js` and provides similar functionality for client-side usage.

## 🚀 Usage Examples

### Backend Usage

```javascript
const siteConfig = require('./backend/config/site');

// Get admin panel URL
const adminUrl = siteConfig.adminUrl();
// Result: "https://your-domain.com/admin-dashboard.html"

// Get job details URL
const jobUrl = siteConfig.jobDetailsUrl(123);
// Result: "https://your-domain.com/job-details.html?id=123"

// Generate password reset email
const resetUrl = siteConfig.resetPasswordUrl('abc123token');
// Result: "https://your-domain.com/reset-password.html?token=abc123token"
```

### Frontend Usage

```javascript
// Initialize site config (call this once when page loads)
await window.siteConfig.initialize();

// Redirect to admin panel
await window.siteConfig.redirectToAdmin();

// Redirect to jobs page
await window.siteConfig.redirectToJobs();

// Get job details URL
const jobUrl = await window.siteConfig.getJobDetailsUrl(123);

// Generate social sharing URLs
const shareUrls = await window.siteConfig.generateShareUrls(123, 'Software Developer');
console.log(shareUrls.facebook); // Facebook share URL
console.log(shareUrls.twitter);  // Twitter share URL
```

### API Endpoints

**Get Site Configuration:**
```
GET /api/config
```

**Get Admin Site Configuration:**
```
GET /api/admin/site-config
```

Both endpoints return:
```json
{
  "siteUrl": "https://your-domain.com",
  "adminUrl": "https://your-domain.com/admin-dashboard.html",
  "jobsUrl": "https://your-domain.com/remote-jobs.html",
  "dashboardUrl": "https://your-domain.com/dashboard.html",
  "environment": "production",
  "isProduction": true
}
```

## 🌐 Setting Up Your Production Domain

1. **Update Environment Variables:**
   ```bash
   # In .env.docker
   SITE_URL=https://your-actual-domain.com
   FRONTEND_URL=https://your-actual-domain.com
   ```

2. **Update CORS Settings:**
   ```bash
   # In .env.docker
   ALLOWED_ORIGINS=https://your-actual-domain.com,https://www.your-actual-domain.com
   ```

3. **Deploy with Docker:**
   ```bash
   docker-compose --env-file .env.docker up -d
   ```

## 🔗 Key Pages

- **Admin Dashboard:** `/admin-dashboard.html`
- **Jobs Listing:** `/remote-jobs.html`
- **User Dashboard:** `/dashboard.html`
- **Job Details:** `/job-details.html?id={jobId}`
- **Company Profile:** `/company-profile.html?id={companyId}`
- **Password Reset:** `/reset-password.html?token={resetToken}`

## 🛠️ Customization

To add new URL endpoints:

1. **Backend:** Add methods to `backend/config/site.js`
2. **Frontend:** Add methods to `frontend/js/config/site.js`
3. **Routes:** Update your route handlers to use the site config

Example:
```javascript
// In backend/config/site.js
profileUrl: function(userId) {
  return `${this.siteUrl}/profile.html?user=${userId}`;
}

// In frontend/js/config/site.js
async getProfileUrl(userId) {
  await this.initialize();
  return `${this.config.siteUrl}/profile.html?user=${userId}`;
}
```

This system ensures all your URLs are consistent and easily configurable for different environments!
