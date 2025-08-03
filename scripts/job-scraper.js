const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { getMany, insertOne, getOne } = require('../backend/database');
const winston = require('winston');

// Configure logger for scraper
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/scraper.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

class JobScraper {
  constructor() {
    this.browser = null;
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    this.scraped_jobs = [];
    this.companies_cache = new Map();
    this.categories_cache = new Map();
  }

  async init() {
    try {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      // Load categories and companies cache
      await this.loadCaches();
      logger.info('Job scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scraper:', error);
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

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Scrape Indeed jobs
  async scrapeIndeed(searchTerms = ['remote software engineer', 'remote marketing', 'remote customer service'], location = 'Remote') {
    logger.info('Starting Indeed scraping...');
    const jobs = [];

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      for (const searchTerm of searchTerms) {
        try {
          const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}&l=${encodeURIComponent(location)}&remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11`;
          
          logger.info(`Scraping Indeed for: ${searchTerm}`);
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await this.delay(2000);

          // Extract job listings
          const pageJobs = await page.evaluate(() => {
            const jobElements = document.querySelectorAll('[data-jk]');
            const jobs = [];

            jobElements.forEach(element => {
              try {
                const titleElement = element.querySelector('h2 a span[title]');
                const companyElement = element.querySelector('[data-testid="company-name"]');
                const locationElement = element.querySelector('[data-testid="job-location"]');
                const salaryElement = element.querySelector('[data-testid="attribute_snippet_testid"]');
                const summaryElement = element.querySelector('[data-testid="job-snippet"]');
                const linkElement = element.querySelector('h2 a');

                if (titleElement && companyElement) {
                  jobs.push({
                    title: titleElement.getAttribute('title'),
                    company: companyElement.textContent.trim(),
                    location: locationElement ? locationElement.textContent.trim() : 'Remote',
                    salary: salaryElement ? salaryElement.textContent.trim() : null,
                    summary: summaryElement ? summaryElement.textContent.trim() : '',
                    url: linkElement ? 'https://www.indeed.com' + linkElement.getAttribute('href') : null,
                    source: 'Indeed'
                  });
                }
              } catch (error) {
                console.log('Error parsing job element:', error);
              }
            });

            return jobs;
          });

          jobs.push(...pageJobs);
          logger.info(`Found ${pageJobs.length} jobs for "${searchTerm}"`);
          await this.delay(3000); // Be respectful to the site

        } catch (error) {
          logger.error(`Error scraping Indeed for "${searchTerm}":`, error);
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Indeed scraping failed:', error);
    }

    return jobs;
  }

  // Scrape LinkedIn jobs
  async scrapeLinkedIn(searchTerms = ['remote software engineer', 'remote marketing', 'remote customer service']) {
    logger.info('Starting LinkedIn scraping...');
    const jobs = [];

    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      for (const searchTerm of searchTerms) {
        try {
          const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerm)}&location=Worldwide&f_WT=2`; // f_WT=2 is remote
          
          logger.info(`Scraping LinkedIn for: ${searchTerm}`);
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await this.delay(3000);

          // Scroll to load more jobs
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
          await this.delay(2000);

          const pageJobs = await page.evaluate(() => {
            const jobCards = document.querySelectorAll('.job-search-card');
            const jobs = [];

            jobCards.forEach(card => {
              try {
                const titleElement = card.querySelector('.base-search-card__title');
                const companyElement = card.querySelector('.base-search-card__subtitle');
                const locationElement = card.querySelector('.job-search-card__location');
                const linkElement = card.querySelector('.base-card__full-link');

                if (titleElement && companyElement) {
                  jobs.push({
                    title: titleElement.textContent.trim(),
                    company: companyElement.textContent.trim(),
                    location: locationElement ? locationElement.textContent.trim() : 'Remote',
                    url: linkElement ? linkElement.getAttribute('href') : null,
                    source: 'LinkedIn'
                  });
                }
              } catch (error) {
                console.log('Error parsing LinkedIn job:', error);
              }
            });

            return jobs;
          });

          jobs.push(...pageJobs);
          logger.info(`Found ${pageJobs.length} jobs for "${searchTerm}"`);
          await this.delay(4000);

        } catch (error) {
          logger.error(`Error scraping LinkedIn for "${searchTerm}":`, error);
        }
      }

      await page.close();
    } catch (error) {
      logger.error('LinkedIn scraping failed:', error);
    }

    return jobs;
  }

  // Scrape RemoteOK jobs
  async scrapeRemoteOK() {
    logger.info('Starting RemoteOK scraping...');
    const jobs = [];

    try {
      const response = await axios.get('https://remoteok.io/api', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const apiJobs = response.data.slice(1); // First item is legal notice

      for (const job of apiJobs.slice(0, 50)) { // Limit to 50 jobs
        try {
          jobs.push({
            title: job.position,
            company: job.company,
            location: job.location || 'Remote',
            salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : null,
            summary: job.description,
            url: `https://remoteok.io/remote-jobs/${job.id}`,
            tags: job.tags || [],
            source: 'RemoteOK'
          });
        } catch (error) {
          logger.error('Error parsing RemoteOK job:', error);
        }
      }

      logger.info(`Found ${jobs.length} jobs from RemoteOK`);
    } catch (error) {
      logger.error('RemoteOK scraping failed:', error);
    }

    return jobs;
  }

  // Scrape WeWorkRemotely
  async scrapeWeWorkRemotely() {
    logger.info('Starting WeWorkRemotely scraping...');
    const jobs = [];

    try {
      const response = await axios.get('https://weworkremotely.com/remote-jobs.rss');
      const $ = cheerio.load(response.data, { xmlMode: true });

      $('item').each((i, element) => {
        try {
          const title = $(element).find('title').text();
          const description = $(element).find('description').text();
          const link = $(element).find('link').text();
          const pubDate = $(element).find('pubDate').text();

          // Parse title to extract company and position
          const titleParts = title.split(':');
          const company = titleParts[0] ? titleParts[0].trim() : 'Unknown Company';
          const position = titleParts[1] ? titleParts[1].trim() : title;

          jobs.push({
            title: position,
            company: company,
            location: 'Remote',
            summary: description,
            url: link,
            publishDate: pubDate,
            source: 'WeWorkRemotely'
          });
        } catch (error) {
          logger.error('Error parsing WeWorkRemotely job:', error);
        }
      });

      logger.info(`Found ${jobs.length} jobs from WeWorkRemotely`);
    } catch (error) {
      logger.error('WeWorkRemotely scraping failed:', error);
    }

    return jobs;
  }

  // Enhanced job processing with better data extraction
  async processAndSaveJobs(rawJobs) {
    logger.info(`Processing ${rawJobs.length} raw jobs...`);
    let savedCount = 0;

    for (const rawJob of rawJobs) {
      try {
        // Skip if missing essential data
        if (!rawJob.title || !rawJob.company) {
          continue;
        }

        // Get or create company
        const companyId = await this.getOrCreateCompany(rawJob.company, rawJob.url);
        if (!companyId) continue;

        // Determine category based on job title and description
        const categoryId = this.determineCategory(rawJob.title, rawJob.summary || '');

        // Parse salary
        const { salaryMin, salaryMax } = this.parseSalary(rawJob.salary);

        // Determine remote type
        const remoteType = this.determineRemoteType(rawJob.location, rawJob.title, rawJob.summary || '');

        // Create job object
        const jobData = {
          title: this.cleanText(rawJob.title),
          description: this.cleanText(rawJob.summary || 'No description available'),
          requirements: this.extractRequirements(rawJob.summary || ''),
          company_id: companyId,
          category_id: categoryId,
          location: this.cleanText(rawJob.location || 'Remote'),
          job_type: 'full-time', // Default, could be enhanced
          remote_type: remoteType,
          salary_min: salaryMin,
          salary_max: salaryMax,
          application_url: rawJob.url,
          is_active: true,
          created_by: 1 // Assuming admin user ID is 1
        };

        // Check if job already exists
        const existingJob = await getOne(
          'SELECT id FROM jobs WHERE title = ? AND company_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)',
          [jobData.title, jobData.company_id]
        );

        if (!existingJob) {
          await insertOne('jobs', jobData);
          savedCount++;
          logger.info(`Saved job: ${jobData.title} at ${rawJob.company}`);
        }

        await this.delay(100); // Small delay between database operations

      } catch (error) {
        logger.error(`Error processing job "${rawJob.title}":`, error);
      }
    }

    logger.info(`Successfully saved ${savedCount} new jobs out of ${rawJobs.length} processed`);
    return savedCount;
  }

  async getOrCreateCompany(companyName, websiteUrl = null) {
    const cleanName = this.cleanText(companyName);
    const cacheKey = cleanName.toLowerCase();

    // Check cache first
    if (this.companies_cache.has(cacheKey)) {
      return this.companies_cache.get(cacheKey);
    }

    // Check database
    let company = await getOne('SELECT id FROM companies WHERE name = ?', [cleanName]);
    
    if (!company) {
      try {
        // Create new company
        const companyData = {
          name: cleanName,
          website: websiteUrl,
          description: `Company profile for ${cleanName}`,
          user_id: 1 // Admin user
        };

        const companyId = await insertOne('companies', companyData);
        this.companies_cache.set(cacheKey, companyId);
        logger.info(`Created new company: ${cleanName}`);
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
      'technology': ['software', 'developer', 'engineer', 'programming', 'coding', 'tech', 'it', 'data', 'ai', 'machine learning', 'devops', 'frontend', 'backend'],
      'customer service': ['customer', 'support', 'service', 'success', 'care', 'help desk', 'chat'],
      'marketing': ['marketing', 'social media', 'content', 'seo', 'digital marketing', 'brand', 'campaign'],
      'sales': ['sales', 'business development', 'account manager', 'revenue'],
      'design': ['design', 'ui', 'ux', 'graphic', 'creative', 'visual'],
      'finance': ['finance', 'accounting', 'financial', 'bookkeeping', 'controller'],
      'hr': ['hr', 'human resources', 'recruiting', 'talent', 'people operations'],
      'writing': ['writer', 'content writer', 'copywriter', 'editor', 'journalist'],
      'project management': ['project manager', 'program manager', 'scrum master', 'product manager']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return this.categories_cache.get(category) || null;
      }
    }

    return this.categories_cache.get('technology') || null; // Default to technology
  }

  determineRemoteType(location, title, description) {
    const text = (location + ' ' + title + ' ' + description).toLowerCase();
    
    if (text.includes('hybrid') || text.includes('part remote')) {
      return 'hybrid';
    } else if (text.includes('remote') || text.includes('work from home') || text.includes('distributed')) {
      return 'remote';
    } else {
      return 'remote'; // Default for our remote job board
    }
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

  extractRequirements(description) {
    if (!description) return null;

    const text = description.toLowerCase();
    const requirements = [];

    // Common requirement patterns
    const patterns = [
      /(\d+)\+?\s*years?\s*(of\s*)?experience/g,
      /bachelor'?s?\s*degree/g,
      /master'?s?\s*degree/g,
      /(proficient|experience)\s*in\s*([^.]+)/g
    ];

    patterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        requirements.push(...matches);
      }
    });

    return requirements.length > 0 ? requirements.join('. ') : null;
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 500); // Limit length
  }

  // Main scraping method
  async scrapeAllSources(options = {}) {
    const {
      searchTerms = [
        'remote software engineer',
        'remote frontend developer',
        'remote backend developer',
        'remote full stack developer',
        'remote data scientist',
        'remote marketing manager',
        'remote customer success',
        'remote product manager',
        'remote designer',
        'remote content writer',
        'remote sales representative',
        'remote project manager'
      ],
      includeIndeed = true,
      includeLinkedIn = true,
      includeRemoteOK = true,
      includeWeWorkRemotely = true
    } = options;

    logger.info('Starting comprehensive job scraping...');
    let allJobs = [];

    try {
      // Scrape from different sources
      if (includeRemoteOK) {
        const remoteOKJobs = await this.scrapeRemoteOK();
        allJobs.push(...remoteOKJobs);
      }

      if (includeWeWorkRemotely) {
        const wwrJobs = await this.scrapeWeWorkRemotely();
        allJobs.push(...wwrJobs);
      }

      if (includeIndeed) {
        const indeedJobs = await this.scrapeIndeed(searchTerms);
        allJobs.push(...indeedJobs);
      }

      if (includeLinkedIn) {
        const linkedInJobs = await this.scrapeLinkedIn(searchTerms);
        allJobs.push(...linkedInJobs);
      }

      logger.info(`Total jobs scraped from all sources: ${allJobs.length}`);

      // Process and save jobs
      const savedCount = await this.processAndSaveJobs(allJobs);
      
      return {
        totalScraped: allJobs.length,
        totalSaved: savedCount,
        sources: {
          remoteOK: includeRemoteOK,
          weWorkRemotely: includeWeWorkRemotely,
          indeed: includeIndeed,
          linkedIn: includeLinkedIn
        }
      };

    } catch (error) {
      logger.error('Error in scrapeAllSources:', error);
      throw error;
    }
  }
}

module.exports = JobScraper;
