const axios = require('axios');
const cheerio = require('cheerio');
const { getMany, insertOne, getOne } = require('../backend/database');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/google-scraper.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

class GoogleJobsScraper {
  constructor() {
    this.baseUrl = 'https://www.google.com/search';
    this.companies_cache = new Map();
    this.categories_cache = new Map();
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  }

  async init() {
    try {
      // Load categories and companies cache
      await this.loadCaches();
      logger.info('Google Jobs scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google scraper:', error);
      throw error;
    }
  }

  async loadCaches() {
    try {
      // Load categories
      const categories = await getMany('SELECT * FROM categories', []);
      categories.forEach(cat => {
        this.categories_cache.set(cat.name.toLowerCase(), cat.id);
      });

      // Load companies
      const companies = await getMany('SELECT * FROM companies', []);
      companies.forEach(comp => {
        this.companies_cache.set(comp.name.toLowerCase(), comp.id);
      });

      logger.info(`Loaded ${categories.length} categories and ${companies.length} companies into cache`);
    } catch (error) {
      logger.error('Failed to load caches:', error);
    }
  }

  // Scrape Google for Jobs using search queries
  async scrapeGoogleJobs(searchQueries = [
    'remote software engineer jobs',
    'remote marketing manager jobs', 
    'remote customer service jobs',
    'remote data scientist jobs',
    'remote project manager jobs',
    'hybrid software developer jobs',
    'work from home programmer jobs'
  ], locations = ['United States', 'Worldwide', 'Remote']) {
    
    logger.info('Starting Google Jobs scraping...');
    const allJobs = [];

    for (const query of searchQueries) {
      for (const location of locations) {
        try {
          logger.info(`Searching Google Jobs for: "${query}" in ${location}`);
          
          const jobs = await this.searchGoogleJobsAPI(query, location);
          allJobs.push(...jobs);
          
          // Be respectful to Google's servers
          await this.delay(3000 + Math.random() * 2000);
          
        } catch (error) {
          logger.error(`Error searching for "${query}" in ${location}:`, error);
        }
      }
    }

    logger.info(`Found ${allJobs.length} jobs from Google Jobs`);
    return allJobs;
  }

  // Alternative method using SerpAPI (requires API key)
  async scrapeGoogleJobsWithSerpAPI(searchQueries, locations) {
    const serpApiKey = process.env.SERP_API_KEY;
    if (!serpApiKey) {
      logger.warn('SERP_API_KEY not found. Skipping SerpAPI method.');
      return [];
    }

    logger.info('Using SerpAPI for Google Jobs scraping...');
    const allJobs = [];

    for (const query of searchQueries) {
      for (const location of locations) {
        try {
          const response = await axios.get('https://serpapi.com/search', {
            params: {
              engine: 'google_jobs',
              q: query,
              location: location,
              api_key: serpApiKey,
              num: 20
            }
          });

          const jobs = response.data.jobs_results || [];
          
          const formattedJobs = jobs.map(job => ({
            title: job.title,
            company: job.company_name,
            location: job.location,
            description: job.description,
            salary: job.salary,
            jobType: job.job_type,
            postedDate: job.posted_at,
            url: job.apply_link,
            source: 'Google Jobs (SerpAPI)',
            via: job.via,
            workFromHome: job.work_from_home || false
          }));

          allJobs.push(...formattedJobs);
          logger.info(`Found ${formattedJobs.length} jobs for "${query}" in ${location}`);

          await this.delay(1000); // SerpAPI rate limiting

        } catch (error) {
          logger.error(`SerpAPI error for "${query}" in ${location}:`, error);
        }
      }
    }

    return allJobs;
  }

  // Scrape Google Jobs using direct search (requires careful handling)
  async searchGoogleJobsAPI(query, location) {
    const jobs = [];
    
    try {
      // Use a job search aggregator API or custom scraping
      // For demonstration, using a mock structure - you'd implement actual scraping
      
      const searchUrl = `${this.baseUrl}?q=${encodeURIComponent(query + ' ' + location)}&ibp=htl;jobs`;
      
      // Note: Direct Google scraping is complex and may violate ToS
      // Consider using official APIs or services like:
      // - Google Cloud Talent Solution API
      // - Third-party job aggregator APIs
      // - SerpAPI (as shown above)
      
      logger.info(`Would search: ${searchUrl}`);
      
      // Mock data structure for demonstration
      // In production, implement proper scraping or use APIs
      
    } catch (error) {
      logger.error('Error in searchGoogleJobsAPI:', error);
    }

    return jobs;
  }

  // Use Google Programmable Search Engine for jobs
  async scrapeGoogleCSE(queries = [
    'remote software engineer jobs site:indeed.com OR site:linkedin.com',
    'remote marketing jobs site:glassdoor.com OR site:monster.com',
    'work from home developer jobs site:stackoverflow.com/jobs',
    'hybrid programmer jobs site:dice.com OR site:careerbuilder.com'
  ]) {
    
    const cseApiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    
    if (!cseApiKey || !cseId) {
      logger.warn('Google CSE credentials not found. Skipping CSE method.');
      return [];
    }

    logger.info('Using Google Custom Search Engine for job search...');
    const allJobs = [];

    for (const query of queries) {
      try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
          params: {
            key: cseApiKey,
            cx: cseId,
            q: query,
            num: 10
          }
        });

        const results = response.data.items || [];
        
        const jobs = results.map(item => ({
          title: this.extractJobTitle(item.title),
          company: this.extractCompany(item.snippet),
          location: this.extractLocation(item.snippet),
          description: item.snippet,
          url: item.link,
          source: 'Google CSE',
          domain: new URL(item.link).hostname
        }));

        allJobs.push(...jobs);
        logger.info(`Found ${jobs.length} jobs for query: "${query}"`);

        await this.delay(1000); // Rate limiting

      } catch (error) {
        logger.error(`CSE error for query "${query}":`, error);
      }
    }

    return allJobs;
  }

  // Extract job title from search result
  extractJobTitle(title) {
    // Remove site names and clean up
    return title
      .replace(/\s*-\s*(Indeed|LinkedIn|Glassdoor|Monster|Dice).*$/i, '')
      .replace(/\s*\|\s*.*$/, '')
      .trim();
  }

  // Extract company name from snippet
  extractCompany(snippet) {
    // Look for company patterns in the snippet
    const companyPatterns = [
      /at\s+([^,.\n]+)/i,
      /by\s+([^,.\n]+)/i,
      /Company:\s*([^,.\n]+)/i,
      /Employer:\s*([^,.\n]+)/i
    ];

    for (const pattern of companyPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Unknown Company';
  }

  // Extract location from snippet
  extractLocation(snippet) {
    const locationPatterns = [
      /in\s+([^,.\n]+(?:,\s*[A-Z]{2})?)/i,
      /Location:\s*([^,.\n]+)/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /(Remote|Work from home|Hybrid)/i
    ];

    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Remote';
  }

  // Process and save jobs (reusing logic from main scraper)
  async processAndSaveJobs(rawJobs) {
    logger.info(`Processing ${rawJobs.length} Google jobs...`);
    let savedCount = 0;

    for (const rawJob of rawJobs) {
      try {
        if (!rawJob.title || !rawJob.company) continue;

        const companyId = await this.getOrCreateCompany(rawJob.company, rawJob.url);
        if (!companyId) continue;

        const categoryId = this.determineCategory(rawJob.title, rawJob.description || '');
        const { salaryMin, salaryMax } = this.parseSalary(rawJob.salary);
        const remoteType = this.determineRemoteType(rawJob.location, rawJob.title, rawJob.description || '');

        const jobData = {
          title: this.cleanText(rawJob.title),
          description: this.cleanText(rawJob.description || 'No description available'),
          company_id: companyId,
          category_id: categoryId,
          location: this.cleanText(rawJob.location || 'Remote'),
          job_type: 'full-time',
          remote_type: remoteType,
          salary_min: salaryMin,
          salary_max: salaryMax,
          application_url: rawJob.url,
          is_active: true,
          created_by: 1
        };

        const existingJob = await getOne(
          'SELECT id FROM jobs WHERE title = ? AND company_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
          [jobData.title, jobData.company_id]
        );

        if (!existingJob) {
          await insertOne('jobs', jobData);
          savedCount++;
          logger.info(`Saved Google job: ${jobData.title} at ${rawJob.company}`);
        }

        await this.delay(100);

      } catch (error) {
        logger.error(`Error processing Google job "${rawJob.title}":`, error);
      }
    }

    logger.info(`Successfully saved ${savedCount} new Google jobs`);
    return savedCount;
  }

  // Helper methods (reused from main scraper)
  async getOrCreateCompany(companyName, websiteUrl = null) {
    const cleanName = this.cleanText(companyName);
    const cacheKey = cleanName.toLowerCase();

    if (this.companies_cache.has(cacheKey)) {
      return this.companies_cache.get(cacheKey);
    }

    let company = await getOne('SELECT id FROM companies WHERE name = ?', [cleanName]);
    
    if (!company) {
      try {
        const companyData = {
          name: cleanName,
          website: websiteUrl,
          description: `Company profile for ${cleanName}`,
          user_id: 1
        };

        const companyId = await insertOne('companies', companyData);
        this.companies_cache.set(cacheKey, companyId);
        return companyId;
      } catch (error) {
        logger.error(`Error creating company "${cleanName}":`, error);
        return null;
      }
    }

    this.companies_cache.set(cacheKey, company.id);
    return company.id;
  }

  determineCategory(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    const categoryKeywords = {
      'technology': ['software', 'developer', 'engineer', 'programming', 'coding', 'tech', 'it', 'data', 'ai', 'devops'],
      'marketing': ['marketing', 'social media', 'content', 'seo', 'digital marketing', 'brand'],
      'customer service': ['customer', 'support', 'service', 'success', 'care'],
      'sales': ['sales', 'business development', 'account manager'],
      'design': ['design', 'ui', 'ux', 'graphic', 'creative'],
      'finance': ['finance', 'accounting', 'financial'],
      'hr': ['hr', 'human resources', 'recruiting'],
      'writing': ['writer', 'content writer', 'copywriter'],
      'project management': ['project manager', 'program manager', 'scrum master']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return this.categories_cache.get(category) || null;
      }
    }

    return this.categories_cache.get('technology') || null;
  }

  determineRemoteType(location, title, description) {
    const text = (location + ' ' + title + ' ' + description).toLowerCase();
    
    if (text.includes('hybrid')) return 'hybrid';
    if (text.includes('remote') || text.includes('work from home')) return 'remote';
    return 'remote';
  }

  parseSalary(salaryText) {
    if (!salaryText) return { salaryMin: null, salaryMax: null };

    const numbers = salaryText.match(/\$?([\d,]+)/g);
    if (!numbers) return { salaryMin: null, salaryMax: null };

    const cleanNumbers = numbers.map(n => parseInt(n.replace(/[$,]/g, '')));
    
    if (cleanNumbers.length >= 2) {
      return {
        salaryMin: Math.min(...cleanNumbers),
        salaryMax: Math.max(...cleanNumbers)
      };
    } else if (cleanNumbers.length === 1) {
      return {
        salaryMin: cleanNumbers[0],
        salaryMax: null
      };
    }

    return { salaryMin: null, salaryMax: null };
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 500);
  }

  // Main method to run all Google-based scraping
  async scrapeAllGoogleSources(options = {}) {
    logger.info('Starting Google-based job scraping...');
    
    const {
      useCSE = true,
      useSerpAPI = true,
      searchQueries = [
        'remote software engineer jobs',
        'remote frontend developer jobs',
        'remote backend developer jobs',
        'remote marketing manager jobs',
        'remote customer service jobs',
        'remote data scientist jobs',
        'remote project manager jobs',
        'work from home programmer jobs',
        'hybrid developer jobs USA',
        'remote startup jobs',
        'freelance developer remote',
        'contract programmer remote'
      ],
      locations = ['United States', 'Canada', 'United Kingdom', 'Remote', 'Worldwide']
    } = options;

    let allJobs = [];

    try {
      // Use Google Custom Search Engine
      if (useCSE) {
        const cseJobs = await this.scrapeGoogleCSE(searchQueries.map(q => q + ' site:indeed.com OR site:linkedin.com OR site:glassdoor.com'));
        allJobs.push(...cseJobs);
      }

      // Use SerpAPI for Google Jobs
      if (useSerpAPI) {
        const serpJobs = await this.scrapeGoogleJobsWithSerpAPI(searchQueries, locations);
        allJobs.push(...serpJobs);
      }

      logger.info(`Total jobs found from Google sources: ${allJobs.length}`);

      // Process and save jobs
      const savedCount = await this.processAndSaveJobs(allJobs);
      
      return {
        totalScraped: allJobs.length,
        totalSaved: savedCount,
        sources: {
          googleCSE: useCSE,
          serpAPI: useSerpAPI
        }
      };

    } catch (error) {
      logger.error('Error in Google scraping:', error);
      throw error;
    }
  }
}

module.exports = GoogleJobsScraper;
