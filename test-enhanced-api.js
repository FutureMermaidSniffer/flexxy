// Test script for enhanced jobs API
const http = require('http');

const BASE_URL = 'http://localhost:3003';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error(`JSON Parse Error: ${error.message}`));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function testJobsAPI() {
    console.log('🧪 Testing Enhanced Jobs API\n');

    try {
        // Test 1: Get all jobs
        console.log('1️⃣ Testing: GET /api/jobs (all jobs)');
        const allJobsData = await makeRequest('/api/jobs');
        console.log(`   ✅ Found ${allJobsData.data.length} jobs`);
        console.log(`   📊 Total: ${allJobsData.pagination.total}, Page: ${allJobsData.pagination.page}`);

        // Test 2: Get featured jobs only
        console.log('\n2️⃣ Testing: GET /api/jobs?is_featured=true (featured jobs)');
        const featuredData = await makeRequest('/api/jobs?is_featured=true');
        console.log(`   ⭐ Found ${featuredData.data.length} featured jobs`);
        if (featuredData.data.length > 0) {
            console.log(`   📋 Featured job: "${featuredData.data[0].title}" at ${featuredData.data[0].company_name}`);
        }

        // Test 3: Get jobs with pagination
        console.log('\n3️⃣ Testing: GET /api/jobs?limit=3&page=1 (pagination)');
        const paginatedData = await makeRequest('/api/jobs?limit=3&page=1');
        console.log(`   📄 Page 1: ${paginatedData.data.length} jobs`);
        console.log(`   🔢 Pagination: ${paginatedData.pagination.page}/${paginatedData.pagination.totalPages}`);

        // Test 4: Search jobs
        console.log('\n4️⃣ Testing: GET /api/jobs?search=developer (search functionality)');
        const searchData = await makeRequest('/api/jobs?search=developer');
        console.log(`   🔍 Search results: ${searchData.data.length} jobs`);

        // Test 5: Test exclude parameter
        if (allJobsData.data.length > 0) {
            const excludeJobId = allJobsData.data[0].id;
            console.log(`\n5️⃣ Testing: GET /api/jobs?exclude=${excludeJobId} (exclude functionality)`);
            const excludedData = await makeRequest(`/api/jobs?exclude=${excludeJobId}`);
            console.log(`   🚫 Excluded job ${excludeJobId}: ${excludedData.data.length} jobs returned`);
            
            // Verify the excluded job is not in results
            const excludedJobExists = excludedData.data.some(job => job.id === excludeJobId);
            console.log(`   ✅ Exclusion working: ${!excludedJobExists ? 'YES' : 'NO'}`);
        }

        // Test 6: Check data structure
        if (allJobsData.data.length > 0) {
            const firstJob = allJobsData.data[0];
            console.log('\n6️⃣ Testing: Data structure completeness');
            console.log('   📊 First job data structure:');
            console.log(`   - ID: ${firstJob.id}`);
            console.log(`   - Title: ${firstJob.title}`);
            console.log(`   - Company: ${firstJob.company_name}`);
            console.log(`   - Location: ${firstJob.location}`);
            console.log(`   - Featured: ${firstJob.is_featured}`);
            console.log(`   - Salary: ${firstJob.salary_min ? `$${firstJob.salary_min}-$${firstJob.salary_max}` : 'Not specified'}`);
            console.log(`   - Category: ${firstJob.category_name || 'No category'}`);
            console.log(`   - Tags: ${firstJob.tags || 'No tags'}`);
            console.log(`   - Created: ${new Date(firstJob.created_at).toLocaleDateString()}`);
        }

        console.log('\n🎉 All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        console.log('\n💡 Make sure your server is running on port 3003');
        console.log('   Run: npm run dev');
    }
}

// Run the tests
testJobsAPI();
