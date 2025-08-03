#!/usr/bin/env node

const { getMany, insertOne, getOne } = require('../backend/database');

async function testScrapingSetup() {
  console.log('🧪 Testing FlexJobs Scraping Setup...\n');
  
  let allTestsPassed = true;

  try {
    // Test 1: Database Connection
    console.log('1️⃣  Testing database connection...');
    const dbTest = await getMany('SELECT 1 as test', []);
    if (dbTest.length > 0) {
      console.log('   ✅ Database connection successful');
    } else {
      console.log('   ❌ Database connection failed');
      allTestsPassed = false;
    }

    // Test 2: Check required tables exist
    console.log('\n2️⃣  Checking required tables...');
    const tables = ['users', 'companies', 'categories', 'jobs'];
    
    for (const table of tables) {
      try {
        await getMany(`SELECT COUNT(*) as count FROM ${table}`, []);
        console.log(`   ✅ Table '${table}' exists`);
      } catch (error) {
        console.log(`   ❌ Table '${table}' missing or inaccessible`);
        allTestsPassed = false;
      }
    }

    // Test 3: Check categories
    console.log('\n3️⃣  Checking job categories...');
    const categories = await getMany('SELECT * FROM categories', []);
    console.log(`   📊 Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('   ⚠️  No categories found. Run the scraper to create them.');
    } else {
      categories.forEach(cat => {
        console.log(`   • ${cat.name}: ${cat.description}`);
      });
    }

    // Test 4: Check companies
    console.log('\n4️⃣  Checking companies...');
    const companies = await getMany('SELECT COUNT(*) as count FROM companies', []);
    console.log(`   🏢 Found ${companies[0].count} companies in database`);

    // Test 5: Check existing jobs
    console.log('\n5️⃣  Checking existing jobs...');
    const jobs = await getMany('SELECT COUNT(*) as count FROM jobs WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)', []);
    console.log(`   💼 Found ${jobs[0].count} jobs from last 30 days`);

    // Test 6: Test job insertion
    console.log('\n6️⃣  Testing job insertion...');
    
    // Create test company if it doesn't exist
    let testCompany = await getOne('SELECT id FROM companies WHERE name = ?', ['Test Scraper Company']);
    if (!testCompany) {
      const companyId = await insertOne('companies', {
        name: 'Test Scraper Company',
        description: 'Test company for scraper validation',
        website: 'https://example.com',
        user_id: 1
      });
      testCompany = { id: companyId };
      console.log('   ✅ Created test company');
    } else {
      console.log('   ✅ Test company exists');
    }

    // Test inserting a job
    const testJobTitle = `Test Job ${Date.now()}`;
    try {
      await insertOne('jobs', {
        title: testJobTitle,
        description: 'This is a test job created by the scraper validation script',
        company_id: testCompany.id,
        location: 'Remote',
        job_type: 'full-time',
        remote_type: 'remote',
        is_active: true,
        created_by: 1
      });
      console.log('   ✅ Test job insertion successful');
      
      // Clean up test job
      await getMany('DELETE FROM jobs WHERE title = ?', [testJobTitle]);
      console.log('   🧹 Test job cleaned up');
      
    } catch (error) {
      console.log('   ❌ Test job insertion failed:', error.message);
      allTestsPassed = false;
    }

    // Test 7: Check required dependencies
    console.log('\n7️⃣  Checking required dependencies...');
    const requiredPackages = ['axios', 'cheerio', 'puppeteer', 'winston', 'node-cron'];
    
    for (const pkg of requiredPackages) {
      try {
        require(pkg);
        console.log(`   ✅ ${pkg} installed`);
      } catch (error) {
        console.log(`   ❌ ${pkg} missing - run 'npm install'`);
        allTestsPassed = false;
      }
    }

    // Test 8: Check environment variables
    console.log('\n8️⃣  Checking environment configuration...');
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} configured`);
      } else {
        console.log(`   ❌ ${envVar} missing in .env file`);
        allTestsPassed = false;
      }
    }

    // Optional API keys
    const optionalEnvVars = ['GOOGLE_CSE_API_KEY', 'GOOGLE_CSE_ID', 'SERP_API_KEY'];
    console.log('\n   📋 Optional API keys (for enhanced scraping):');
    
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar} configured`);
      } else {
        console.log(`   ⚪ ${envVar} not configured (optional)`);
      }
    }

    // Test 9: Test scraper initialization
    console.log('\n9️⃣  Testing scraper initialization...');
    try {
      const JobScraper = require('../scripts/job-scraper');
      const scraper = new JobScraper();
      await scraper.init();
      console.log('   ✅ Main scraper initializes successfully');
      await scraper.close();
    } catch (error) {
      console.log('   ❌ Main scraper initialization failed:', error.message);
      allTestsPassed = false;
    }

    try {
      const GoogleJobsScraper = require('../scripts/google-jobs-scraper');
      const googleScraper = new GoogleJobsScraper();
      await googleScraper.init();
      console.log('   ✅ Google scraper initializes successfully');
    } catch (error) {
      console.log('   ❌ Google scraper initialization failed:', error.message);
      allTestsPassed = false;
    }

    // Final Results
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! 🎉');
      console.log('✅ Your scraping setup is ready to use.');
      console.log('\n💡 Next steps:');
      console.log('   1. Run: npm run scrape:jobs');
      console.log('   2. Check your FlexJobs site for new listings');
      console.log('   3. Set up automated scraping with cron');
    } else {
      console.log('❌ SOME TESTS FAILED');
      console.log('⚠️  Please fix the issues above before running the scraper');
      console.log('\n🔧 Common fixes:');
      console.log('   • Run database migrations: npm run db:setup');
      console.log('   • Install dependencies: npm install');  
      console.log('   • Check .env configuration');
    }
    console.log('='.repeat(50));

    return allTestsPassed;

  } catch (error) {
    console.error('\n❌ Test setup failed:', error.message);
    console.error('📋 Error details:', error);
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  testScrapingSetup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testScrapingSetup };
