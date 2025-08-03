#!/usr/bin/env node

const JobScraper = require('./job-scraper');
const { getMany, insertOne } = require('../backend/database');

// Configure required categories if they don't exist
const requiredCategories = [
  { name: 'Technology', description: 'Software development, IT, and technical roles', icon: 'fas fa-code' },
  { name: 'Marketing', description: 'Marketing, advertising, and promotional roles', icon: 'fas fa-bullhorn' },
  { name: 'Customer Service', description: 'Support and customer-facing positions', icon: 'fas fa-headset' },
  { name: 'Sales', description: 'Sales and business development roles', icon: 'fas fa-handshake' },
  { name: 'Design', description: 'UI/UX, graphic design, and creative roles', icon: 'fas fa-palette' },
  { name: 'Finance', description: 'Financial, accounting, and business roles', icon: 'fas fa-calculator' },
  { name: 'HR', description: 'Human resources and talent management', icon: 'fas fa-users' },
  { name: 'Writing', description: 'Content creation and editorial roles', icon: 'fas fa-pen' },
  { name: 'Project Management', description: 'Project and program management roles', icon: 'fas fa-tasks' },
  { name: 'Other', description: 'Miscellaneous remote opportunities', icon: 'fas fa-briefcase' }
];

async function ensureCategories() {
  console.log('Ensuring required categories exist...');
  
  for (const category of requiredCategories) {
    try {
      const existing = await getMany('SELECT id FROM categories WHERE name = ?', [category.name]);
      
      if (existing.length === 0) {
        await insertOne('categories', {
          name: category.name,
          description: category.description,
          icon: category.icon
        });
        console.log(`✓ Created category: ${category.name}`);
      } else {
        console.log(`✓ Category exists: ${category.name}`);
      }
    } catch (error) {
      console.error(`✗ Error with category ${category.name}:`, error.message);
    }
  }
}

async function runJobScraping(options = {}) {
  const scraper = new JobScraper();
  
  try {
    console.log('🚀 Starting FlexJobs scraping process...');
    console.log('⏱️  This may take several minutes...\n');

    // Initialize scraper
    await scraper.init();

    // Ensure categories exist
    await ensureCategories();

    // Configure scraping options
    const scrapingOptions = {
      searchTerms: [
        // Technology roles
        'remote software engineer',
        'remote frontend developer', 
        'remote backend developer',
        'remote full stack developer',
        'remote web developer',
        'remote mobile developer',
        'remote devops engineer',
        'remote data scientist',
        'remote data analyst',
        'remote machine learning engineer',
        'remote cloud architect',
        'remote cybersecurity specialist',
        
        // Marketing roles
        'remote marketing manager',
        'remote digital marketing specialist',
        'remote content marketing manager',
        'remote social media manager',
        'remote SEO specialist',
        'remote marketing coordinator',
        
        // Customer service
        'remote customer success manager',
        'remote customer support specialist',
        'remote customer service representative',
        'remote technical support',
        
        // Sales roles
        'remote sales representative',
        'remote account manager',
        'remote business development',
        'remote sales manager',
        
        // Design roles
        'remote UI designer',
        'remote UX designer',
        'remote graphic designer',
        'remote product designer',
        'remote web designer',
        
        // Writing & Content
        'remote content writer',
        'remote copywriter',
        'remote technical writer',
        'remote editor',
        'remote blogger',
        
        // Management
        'remote project manager',
        'remote product manager',
        'remote operations manager',
        'remote team lead',
        
        // Finance & Admin
        'remote accountant',
        'remote bookkeeper',
        'remote financial analyst',
        'remote virtual assistant',
        'remote administrative assistant',
        
        // HR & Recruiting
        'remote recruiter',
        'remote hr specialist',
        'remote talent acquisition',
        
        // Other popular remote roles
        'remote consultant',
        'remote analyst',
        'remote coordinator',
        'remote specialist',
        'work from home',
        'fully remote'
      ],
      includeRemoteOK: true,
      includeWeWorkRemotely: true,
      includeIndeed: process.env.SCRAPE_INDEED !== 'false', // Can be disabled via env var
      includeLinkedIn: process.env.SCRAPE_LINKEDIN !== 'false',
      ...options
    };

    // Run the scraping
    const results = await scraper.scrapeAllSources(scrapingOptions);

    console.log('\n🎉 Scraping completed successfully!');
    console.log('📊 Results Summary:');
    console.log(`   • Total jobs found: ${results.totalScraped}`);
    console.log(`   • New jobs saved: ${results.totalSaved}`);
    console.log(`   • Sources used: ${Object.entries(results.sources).filter(([k,v]) => v).map(([k,v]) => k).join(', ')}`);

    if (results.totalSaved === 0) {
      console.log('\n💡 No new jobs were saved. This could mean:');
      console.log('   • All found jobs already exist in the database');
      console.log('   • Jobs were found within the last 30 days');
      console.log('   • There were issues with data quality');
    }

    return results;

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    throw error;
  } finally {
    await scraper.close();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--no-indeed')) {
    options.includeIndeed = false;
    console.log('ℹ️  Skipping Indeed (as requested)');
  }
  
  if (args.includes('--no-linkedin')) {
    options.includeLinkedIn = false;
    console.log('ℹ️  Skipping LinkedIn (as requested)');
  }
  
  if (args.includes('--remote-only')) {
    options.includeRemoteOK = true;
    options.includeWeWorkRemotely = true;
    options.includeIndeed = false;
    options.includeLinkedIn = false;
    console.log('ℹ️  Using remote-focused sites only');
  }
  
  if (args.includes('--help')) {
    console.log(`
FlexJobs Scraper - Automated Job Data Collection
Usage: node run-scraper.js [options]

Options:
  --no-indeed      Skip Indeed.com scraping
  --no-linkedin    Skip LinkedIn scraping  
  --remote-only    Only scrape RemoteOK and WeWorkRemotely
  --help          Show this help message

Environment Variables:
  SCRAPE_INDEED=false     Disable Indeed scraping
  SCRAPE_LINKEDIN=false   Disable LinkedIn scraping
  
Examples:
  node run-scraper.js                    # Scrape all sources
  node run-scraper.js --no-linkedin     # Skip LinkedIn
  node run-scraper.js --remote-only     # Only remote-focused sites
    `);
    return;
  }

  try {
    await runJobScraping(options);
    console.log('\n✅ Job scraping completed successfully!');
    console.log('💡 You can now check your FlexJobs site for new job listings.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Job scraping failed:', error.message);
    process.exit(1);
  }
}

// Auto-run if called directly
if (require.main === module) {
  main();
}

module.exports = { runJobScraping, ensureCategories };
