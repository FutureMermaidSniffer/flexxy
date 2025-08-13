/**
 * Site Configuration
 * Handles all site URL configurations for different environments
 */

const config = {
  // Base site URL - change this for production
  siteUrl: process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3005',
  
  // API base URL
  apiUrl: process.env.API_URL || process.env.SITE_URL || process.env.FRONTEND_URL || 'http://localhost:3005',
  
  // Admin panel URL
  adminUrl: function() {
    return `${this.siteUrl}/admin-dashboard`;
  },
  
  // Jobs page URL
  jobsUrl: function() {
    return `${this.siteUrl}/remote-jobs`;
  },
  
  // User dashboard URL
  dashboardUrl: function() {
    return `${this.siteUrl}/dashboard`;
  },
  
  // Password reset URL
  resetPasswordUrl: function(token) {
    return `${this.siteUrl}/reset-password?token=${token}`;
  },
  
  // Job details URL
  jobDetailsUrl: function(jobId) {
    return `${this.siteUrl}/job-details?id=${jobId}`;
  },
  
  // Company profile URL
  companyUrl: function(companyId) {
    return `${this.siteUrl}/company-profile?id=${companyId}`;
  },
  
  // Get full URL for any path
  getFullUrl: function(path) {
    return `${this.siteUrl}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  // Get current environment
  environment: process.env.NODE_ENV || 'development',
  
  // Check if running in production
  isProduction: function() {
    return this.environment === 'production';
  }
};

module.exports = config;
