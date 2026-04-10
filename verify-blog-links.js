// Verify that all blog links are working
// This script will check all the updated links

const https = require('https');
const http = require('http');

const updatedLinks = [
    'https://www.indeed.com/career-advice/news/high-paying-remote-jobs',
    'https://www.indeed.com/career-advice/news/ai-job-search-potential',
    'https://www.linkedin.com/advice/0/how-can-you-optimize-your-linkedin-profile',
    'https://www.forbes.com/sites/rachelwells/2026/08/08/5-free-courses-and-certificates-to-put-on-your-resume-in-2026/',
    'https://www.coursera.org/articles/in-demand-skills',
    'https://www.indeed.com/career-advice/pay-salary/how-to-negotiate-salary',
    'https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself',
    'https://www.indeed.com/career-advice/career-development/work-life-balance',
    'https://www.indeed.com/career-advice/interviewing/most-common-behavioral-interview-questions-and-answers',
    'https://www.indeed.com/career-advice/pay-salary/guide-how-to-ask-for-a-raise',
    'https://www.indeed.com/career-advice/starting-new-job/introduce-yourself-to-new-coworkers',
    'https://www.indeed.com/career-advice/career-development/self-introduction-tips',
    'https://www.indeed.com/career-advice/resumes-cover-letters/how-to-make-a-resume-with-examples'
];

function checkUrl(url) {
    return new Promise((resolve) => {
        const urlObject = new URL(url);
        const client = urlObject.protocol === 'https:' ? https : http;
        
        const req = client.request(url, { method: 'HEAD' }, (res) => {
            resolve({
                url: url,
                status: res.statusCode,
                working: res.statusCode >= 200 && res.statusCode < 400
            });
        });
        
        req.on('error', (err) => {
            resolve({
                url: url,
                status: 'ERROR',
                working: false,
                error: err.message
            });
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                url: url,
                status: 'TIMEOUT',
                working: false,
                error: 'Request timeout'
            });
        });
        
        req.end();
    });
}

async function verifyAllLinks() {
    console.log('🔍 Verifying all blog links...\n');
    
    const results = await Promise.all(updatedLinks.map(checkUrl));
    
    let workingCount = 0;
    let brokenCount = 0;
    
    results.forEach((result, index) => {
        const status = result.working ? '✅ WORKING' : '❌ BROKEN';
        console.log(`${index + 1}. ${status} (${result.status}) - ${result.url}`);
        
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        
        if (result.working) {
            workingCount++;
        } else {
            brokenCount++;
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Working links: ${workingCount}`);
    console.log(`❌ Broken links: ${brokenCount}`);
    console.log(`📈 Success rate: ${Math.round((workingCount / results.length) * 100)}%`);
    
    if (brokenCount === 0) {
        console.log('\n🎉 All blog links are working correctly!');
    } else {
        console.log('\n⚠️  Some links need further attention.');
    }
}

// Run verification
verifyAllLinks().catch(console.error);
