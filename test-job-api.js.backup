// Test job details API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/jobs/3',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Job Details API Response:');
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('❌ API Error:', error);
});

req.end();
