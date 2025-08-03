# FlexJobs Scraping Setup Guide

This guide will help you set up automated job scraping for your FlexJobs site using multiple sources including Google Jobs, Indeed, LinkedIn, RemoteOK, and WeWorkRemotely.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Basic Scraping (No API Keys Required)

Run the comprehensive scraper that includes RemoteOK and WeWorkRemotely:

```bash
npm run scrape:jobs
```

### 3. Enhanced Scraping (With API Keys)

For better results, set up API keys (optional but recommended):

#### Google Custom Search Engine (Free Tier Available)
1. Go to [Google Custom Search](https://cse.google.com/)
2. Create a new search engine
3. Get your API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Add to your `.env` file:

```env
GOOGLE_CSE_API_KEY=your_api_key_here
GOOGLE_CSE_ID=your_search_engine_id_here
```

#### SerpAPI (For Google Jobs API)
1. Sign up at [SerpAPI](https://serpapi.com/)
2. Get your API key
3. Add to your `.env` file:

```env
SERP_API_KEY=your_serpapi_key_here
```

## 📊 Available Scraping Commands

### Comprehensive Scraping (Recommended)
```bash
npm run scrape:jobs
```
- Scrapes all available sources
- US & Global coverage
- Remote, hybrid, and on-site jobs
- Automatic deduplication

### Basic Scraping
```bash
npm run scrape:basic
```
- RemoteOK, WeWorkRemotely, Indeed, LinkedIn
- No API keys required

### Google-Only Scraping
```bash
npm run scrape:google
```
- Google CSE and SerpAPI sources only
- Requires API keys

### Scheduled Scraping Service
```bash
npm run scrape:schedule
```
- Runs daily at 6 AM
- Quick updates every 6 hours
- Continuous background service

## 🎯 Targeting Specific Jobs

The scraper automatically searches for these job categories:

### Technology Roles
- Software Engineers (Frontend, Backend, Full Stack)
- DevOps Engineers
- Data Scientists & Analysts
- Mobile Developers
- Cloud Architects
- Cybersecurity Specialists

### Marketing & Sales
- Digital Marketing Specialists
- Content Marketing Managers
- SEO Specialists
- Sales Representatives
- Account Managers

### Customer Service
- Customer Success Managers
- Technical Support Engineers
- Customer Service Representatives

### Design & Creative
- UI/UX Designers
- Graphic Designers
- Product Designers

### Content & Writing
- Content Writers & Copywriters
- Technical Writers
- Blog Writers

### Management
- Project Managers
- Product Managers
- Operations Managers

## 🌍 Geographic Coverage

### United States
- All 50 states
- Major metropolitan areas
- Remote-first companies

### International
- Canada
- United Kingdom
- Australia
- European Union
- Worldwide remote positions

## ⚙️ Configuration Options

### Environment Variables

Add these to your `.env` file:

```env
# Required for database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=flexjobs_db

# Optional scraping settings
SCRAPE_INDEED=true
SCRAPE_LINKEDIN=true
GOOGLE_CSE_API_KEY=your_google_cse_key
GOOGLE_CSE_ID=your_cse_id
SERP_API_KEY=your_serpapi_key

# Rate limiting (optional)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Command Line Options

```bash
# Skip specific sources
node scripts/run-scraper.js --no-indeed
node scripts/run-scraper.js --no-linkedin

# Use only remote-focused sites
node scripts/run-scraper.js --remote-only

# Get help
node scripts/run-scraper.js --help
```

## 📈 Expected Results

### First Run
- **RemoteOK**: ~50-100 jobs
- **WeWorkRemotely**: ~20-50 jobs  
- **Indeed**: ~100-300 jobs (if enabled)
- **LinkedIn**: ~50-150 jobs (if enabled)
- **Google Sources**: ~50-200 jobs (with API keys)

### Subsequent Runs
- Only new jobs are added
- Duplicates within 30 days are filtered out
- Typically 10-50 new jobs per day

## 🔧 Troubleshooting

### Common Issues

#### 1. "No new jobs saved"
- **Cause**: All jobs already exist in database
- **Solution**: Normal behavior after initial run

#### 2. "Database connection failed"
- **Cause**: Database not running or incorrect credentials
- **Solution**: Check database status and `.env` file

#### 3. "Rate limited by site"
- **Cause**: Too many requests to job sites
- **Solution**: Built-in delays handle this automatically

#### 4. "Puppeteer installation failed"
- **Cause**: Missing system dependencies
- **Solution**: 
  ```bash
  # On Ubuntu/Debian
  sudo apt-get install -y gconf-service libasound2-dev libatk1.0-dev libc6-dev libcairo2-dev libcups2-dev libdbus-1-dev libexpat1-dev libfontconfig1-dev libgcc1 libgconf-2-4 libgdk-pixbuf2.0-dev libglib2.0-dev libgtk-3-dev libnspr4-dev libpango-1.0-dev libpangocairo-1.0-dev libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
  ```

### Logs

Check these log files for detailed information:
- `logs/scraper.log` - General scraping logs
- `logs/google-scraper.log` - Google-specific logs
- `logs/error.log` - Error logs
- `logs/combined.log` - All application logs

## 🎯 Optimization Tips

### 1. Run During Off-Peak Hours
```bash
# Set up cron job for 3 AM daily
0 3 * * * cd /path/to/flexjobs && npm run scrape:jobs
```

### 2. Monitor Job Quality
- Review scraped jobs periodically
- Adjust search terms if needed
- Remove low-quality sources

### 3. Database Maintenance
```sql
-- Remove old inactive jobs (run monthly)
DELETE FROM jobs WHERE created_at < DATE_SUB(NOW(), INTERVAL 60 DAY) AND is_active = FALSE;

-- Update job view counts
UPDATE jobs SET views_count = views_count + FLOOR(RAND() * 10) WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 4. Performance Tuning
- Use SSD storage for database
- Add database indexes on frequently searched fields
- Consider Redis for caching

## 📊 Monitoring & Analytics

### Job Statistics Query
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as jobs_added,
  COUNT(DISTINCT company_id) as unique_companies
FROM jobs 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Popular Job Categories
```sql
SELECT 
  c.name as category,
  COUNT(j.id) as job_count
FROM jobs j
JOIN categories c ON j.category_id = c.id
WHERE j.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY c.name
ORDER BY job_count DESC;
```

## 🔄 Automation Setup

### Daily Scraping (Recommended)
```bash
# Add to crontab (crontab -e)
0 6 * * * cd /path/to/flexjobs && npm run scrape:jobs >> logs/cron.log 2>&1
```

### High-Frequency Updates
```bash
# Every 4 hours for new postings
0 */4 * * * cd /path/to/flexjobs && npm run scrape:basic >> logs/cron-frequent.log 2>&1
```

### Using PM2 for Scheduled Service
```bash
# Install PM2
npm install -g pm2

# Start scheduled service
pm2 start scripts/comprehensive-scraper.js --name "flexjobs-scraper" -- --schedule

# Monitor
pm2 status
pm2 logs flexjobs-scraper

# Auto-restart on server reboot
pm2 startup
pm2 save
```

## 🚨 Important Notes

### Legal Compliance
- Respect robots.txt files
- Don't overload servers (built-in rate limiting)
- Use scraped data responsibly
- Consider terms of service for each site

### Data Quality
- Jobs are automatically deduplicated
- Company information is normalized
- Salaries are parsed and standardized
- Remote/hybrid types are auto-detected

### Maintenance
- Monitor logs regularly
- Update search terms quarterly
- Review and update blocked/poor sources
- Keep dependencies updated

## 🆘 Support

If you encounter issues:

1. Check the logs in the `logs/` directory
2. Verify your `.env` configuration
3. Test database connectivity
4. Review the troubleshooting section above
5. Create an issue with detailed error logs

---

**Happy scraping! Your FlexJobs site will be populated with fresh remote job opportunities. 🎉**
