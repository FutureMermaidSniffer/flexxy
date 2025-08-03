#!/usr/bin/env node

const JobScraper = require('./job-scraper');
const GoogleJobsScraper = require('./google-jobs-scraper');
const { runJobScraping, ensureCategories } = require('./run-scraper');

async function runComprehensiveScraping() {
  console.log('🚀 Starting comprehensive job scraping for FlexJobs...');
  console.log('📊 Sources: Indeed, LinkedIn, RemoteOK, WeWorkRemotely, Google Jobs');
  console.log('🌍 Coverage: US, Global, Remote, Hybrid positions\n');

  let totalResults = {
    totalScraped: 0,
    totalSaved: 0,
    sourceResults: {}
  };

  try {
    // Step 1: Ensure categories exist
    console.log('1️⃣  Setting up job categories...');
    await ensureCategories();
    console.log('✅ Categories ready\n');

    // Step 2: Run standard job board scraping
    console.log('2️⃣  Scraping traditional job boards...');
    const standardResults = await runJobScraping({
      searchTerms: [
        // High-demand remote roles
        'remote software engineer',
        'remote full stack developer',
        'remote frontend developer',
        'remote backend developer',
        'remote react developer',
        'remote node.js developer',
        'remote python developer',
        'remote javascript developer',
        'remote devops engineer',
        'remote cloud engineer',
        'remote data scientist',
        'remote data analyst',
        'remote machine learning engineer',
        
        // Marketing & Sales
        'remote marketing manager',
        'remote digital marketing specialist',
        'remote content marketing manager',
        'remote social media manager',
        'remote SEO specialist',
        'remote growth marketing',
        'remote sales representative',
        'remote account manager',
        'remote business development',
        
        // Customer & Support
        'remote customer success manager',
        'remote customer support specialist',
        'remote technical support engineer',
        'remote customer service representative',
        
        // Design & Creative
        'remote UI UX designer',
        'remote graphic designer',
        'remote product designer',
        'remote web designer',
        'remote brand designer',
        
        // Content & Writing
        'remote content writer',
        'remote copywriter',
        'remote technical writer',
        'remote blog writer',
        'remote content creator',
        
        // Management & Operations
        'remote project manager',
        'remote product manager',
        'remote operations manager',
        'remote program manager',
        'remote scrum master',
        
        // Finance & Admin
        'remote accountant',
        'remote bookkeeper',
        'remote financial analyst',
        'remote virtual assistant',
        'remote administrative assistant',
        
        // HR & Recruiting
        'remote recruiter',
        'remote hr specialist',
        'remote talent acquisition specialist',
        
        // Hybrid positions
        'hybrid software developer',
        'hybrid marketing manager',
        'hybrid project manager',
        'hybrid data analyst',
        
        // General terms
        'work from home developer',
        'work from home marketing',
        'work from home customer service',
        'telecommute software engineer',
        'distributed team developer',
        'remote first company jobs'
      ],
      includeRemoteOK: true,
      includeWeWorkRemotely: true,
      includeIndeed: process.env.SCRAPE_INDEED !== 'false',
      includeLinkedIn: process.env.SCRAPE_LINKEDIN !== 'false'
    });

    totalResults.totalScraped += standardResults.totalScraped;
    totalResults.totalSaved += standardResults.totalSaved;
    totalResults.sourceResults.standard = standardResults;
    
    console.log(`✅ Standard scraping completed: ${standardResults.totalSaved} new jobs saved\n`);

    // Step 3: Run Google-based scraping (if API keys available)
    console.log('3️⃣  Scraping Google Jobs sources...');
    
    const googleScraper = new GoogleJobsScraper();
    await googleScraper.init();
    
    const googleResults = await googleScraper.scrapeAllGoogleSources({
      useCSE: !!process.env.GOOGLE_CSE_API_KEY,
      useSerpAPI: !!process.env.SERP_API_KEY,
      searchQueries: [
        'remote software engineer jobs 2024',
        'remote developer jobs United States',
        'work from home programmer jobs',
        'remote marketing jobs',
        'remote customer service jobs',
        'remote data scientist jobs',
        'remote project manager jobs',
        'hybrid developer jobs',
        'remote startup jobs',
        'remote tech jobs',
        'freelance remote developer',
        'contract remote programmer',
        'remote full time developer',
        'remote part time jobs'
      ],
      locations: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Remote', 'Worldwide']
    });

    totalResults.totalScraped += googleResults.totalScraped;
    totalResults.totalSaved += googleResults.totalSaved;
    totalResults.sourceResults.google = googleResults;
    
    console.log(`✅ Google scraping completed: ${googleResults.totalSaved} new jobs saved\n`);

    // Step 4: Display comprehensive results
    console.log('🎉 COMPREHENSIVE SCRAPING COMPLETED! 🎉\n');
    console.log('📊 FINAL RESULTS:');
    console.log('════════════════════════════════════════════════');
    console.log(`📈 Total jobs discovered: ${totalResults.totalScraped}`);
    console.log(`💾 New jobs saved to database: ${totalResults.totalSaved}`);
    console.log(`🔄 Duplicate/existing jobs filtered: ${totalResults.totalScraped - totalResults.totalSaved}`);
    console.log('════════════════════════════════════════════════\n');

    console.log('📋 SOURCE BREAKDOWN:');
    if (totalResults.sourceResults.standard) {
      console.log(`   • Traditional Job Boards: ${totalResults.sourceResults.standard.totalSaved} saved`);
      console.log(`     - RemoteOK: ✅`);
      console.log(`     - WeWorkRemotely: ✅`);
      console.log(`     - Indeed: ${totalResults.sourceResults.standard.sources.indeed ? '✅' : '❌'}`);
      console.log(`     - LinkedIn: ${totalResults.sourceResults.standard.sources.linkedIn ? '✅' : '❌'}`);
    }
    
    if (totalResults.sourceResults.google) {
      console.log(`   • Google-based Sources: ${totalResults.sourceResults.google.totalSaved} saved`);
      console.log(`     - Google CSE: ${totalResults.sourceResults.google.sources.googleCSE ? '✅' : '❌'}`);
      console.log(`     - SerpAPI: ${totalResults.sourceResults.google.sources.serpAPI ? '✅' : '❌'}`);
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Visit your FlexJobs site to see new listings');
    console.log('   2. Review job quality and adjust scraping filters if needed');
    console.log('   3. Set up automated scraping with cron jobs');
    console.log('   4. Monitor logs in logs/scraper.log and logs/google-scraper.log');

    if (totalResults.totalSaved === 0) {
      console.log('\n⚠️  NO NEW JOBS SAVED - Possible reasons:');
      console.log('   • All discovered jobs already exist (within 30 days)');
      console.log('   • Data quality filters removed duplicate content');
      console.log('   • Rate limiting or blocking occurred');
      console.log('   • API keys missing for some sources');
    }

    if (!process.env.GOOGLE_CSE_API_KEY) {
      console.log('\n💡 OPTIMIZATION TIP:');
      console.log('   Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID for enhanced Google search');
    }

    if (!process.env.SERP_API_KEY) {
      console.log('   Set SERP_API_KEY for direct Google Jobs API access');
    }

    console.log('\n✅ Scraping process completed successfully!');
    return totalResults;

  } catch (error) {
    console.error('\n❌ SCRAPING FAILED:', error.message);
    console.error('📋 Error details:', error);
    
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   • Check database connection');
    console.log('   • Verify all required dependencies are installed');
    console.log('   • Review logs for detailed error information');
    console.log('   • Ensure sufficient disk space and memory');
    
    throw error;
  }
}

// Schedule automatic scraping
function scheduleAutomaticScraping() {
  const cron = require('node-cron');
  
  // Run every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('🕕 Running scheduled job scraping at 6 AM...');
    try {
      await runComprehensiveScraping();
      console.log('✅ Scheduled scraping completed successfully');
    } catch (error) {
      console.error('❌ Scheduled scraping failed:', error.message);
    }
  });

  // Run every 6 hours for high-frequency updates
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔄 Running high-frequency job update...');
    try {
      // Run a lighter version more frequently
      await runJobScraping({
        searchTerms: [
          'remote software engineer',
          'remote developer',
          'remote marketing manager', 
          'remote customer service',
          'remote data scientist'
        ],
        includeRemoteOK: true,
        includeWeWorkRemotely: true,
        includeIndeed: false, // Skip heavy sources for frequent updates
        includeLinkedIn: false
      });
      console.log('✅ High-frequency update completed');
    } catch (error) {
      console.error('❌ High-frequency update failed:', error.message);
    }
  });

  console.log('⏰ Automatic scraping scheduled:');
  console.log('   • Full scraping: Daily at 6:00 AM');
  console.log('   • Quick updates: Every 6 hours');
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--schedule')) {
    console.log('📅 Starting scheduled job scraping service...');
    scheduleAutomaticScraping();
    console.log('⏳ Service running... Press Ctrl+C to stop.');
    return;
  }
  
  if (args.includes('--help')) {
    console.log(`
FlexJobs Comprehensive Scraper
Usage: node comprehensive-scraper.js [options]

Options:
  --schedule    Start automatic scraping service
  --help        Show this help message

Environment Variables:
  SCRAPE_INDEED=false         Disable Indeed scraping
  SCRAPE_LINKEDIN=false       Disable LinkedIn scraping
  GOOGLE_CSE_API_KEY=xxx      Google Custom Search API key
  GOOGLE_CSE_ID=xxx           Google Custom Search Engine ID
  SERP_API_KEY=xxx            SerpAPI key for Google Jobs

Examples:
  node comprehensive-scraper.js           # Run once
  node comprehensive-scraper.js --schedule # Start scheduled service
    `);
    return;
  }

  try {
    await runComprehensiveScraping();
    process.exit(0);
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Auto-run if called directly
if (require.main === module) {
  main();
}

module.exports = { runComprehensiveScraping, scheduleAutomaticScraping };
