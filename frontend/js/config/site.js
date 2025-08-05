/**
 * Frontend Site Configuration
 * Provides client-side site configuration and URL helpers
 */

class SiteConfig {
  constructor() {
    this.config = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      const response = await fetch('/api/config');
      this.config = await response.json();
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load site config, using defaults:', error);
      // Fallback configuration
      this.config = {
        siteUrl: window.location.origin,
        adminUrl: window.location.origin + '/admin-dashboard.html',
        jobsUrl: window.location.origin + '/remote-jobs.html',
        dashboardUrl: window.location.origin + '/dashboard.html',
        environment: 'development',
        isProduction: false
      };
      this.initialized = true;
    }
  }

  async getSiteUrl() {
    await this.initialize();
    return this.config.siteUrl;
  }

  async getAdminUrl() {
    await this.initialize();
    return this.config.adminUrl;
  }

  async getJobsUrl() {
    await this.initialize();
    return this.config.jobsUrl;
  }

  async getDashboardUrl() {
    await this.initialize();
    return this.config.dashboardUrl;
  }

  async getJobDetailsUrl(jobId) {
    await this.initialize();
    return `${this.config.siteUrl}/job-details.html?id=${jobId}`;
  }

  async getCompanyUrl(companyId) {
    await this.initialize();
    return `${this.config.siteUrl}/company-profile.html?id=${companyId}`;
  }

  async getFullUrl(path) {
    await this.initialize();
    return `${this.config.siteUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  async isProduction() {
    await this.initialize();
    return this.config.isProduction;
  }

  // Utility method to redirect to admin panel
  async redirectToAdmin() {
    const adminUrl = await this.getAdminUrl();
    window.location.href = adminUrl;
  }

  // Utility method to redirect to jobs page
  async redirectToJobs() {
    const jobsUrl = await this.getJobsUrl();
    window.location.href = jobsUrl;
  }

  // Utility method to redirect to dashboard
  async redirectToDashboard() {
    const dashboardUrl = await this.getDashboardUrl();
    window.location.href = dashboardUrl;
  }

  // Method to generate social sharing URLs
  async generateShareUrls(jobId, jobTitle) {
    const jobUrl = await this.getJobDetailsUrl(jobId);
    const encodedTitle = encodeURIComponent(jobTitle);
    const encodedUrl = encodeURIComponent(jobUrl);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this job: ${jobUrl}`
    };
  }
}

// Create global instance
window.siteConfig = new SiteConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteConfig;
}
