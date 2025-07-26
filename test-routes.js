const express = require('express');

const app = express();

try {
  // Test importing each route file one by one
  console.log('Testing auth routes...');
  const authRoutes = require('./backend/routes/auth');
  console.log('Auth routes OK');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted OK');

  console.log('Testing job routes...');
  const jobRoutes = require('./backend/routes/jobs');
  console.log('Job routes OK');
  app.use('/api/jobs', jobRoutes);
  console.log('Job routes mounted OK');

  console.log('Testing company routes...');
  const companyRoutes = require('./backend/routes/companies');
  console.log('Company routes OK');
  app.use('/api/companies', companyRoutes);
  console.log('Company routes mounted OK');

  console.log('Testing user routes...');
  const userRoutes = require('./backend/routes/users');
  console.log('User routes OK');
  app.use('/api/users', userRoutes);
  console.log('User routes mounted OK');

  console.log('Testing application routes...');
  const applicationRoutes = require('./backend/routes/applications');
  console.log('Application routes OK');
  app.use('/api/applications', applicationRoutes);
  console.log('Application routes mounted OK');

  console.log('All routes imported and mounted successfully!');
} catch (error) {
  console.error('Route error:', error);
}
