const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./backend/routes/auth');
const jobRoutes = require('./backend/routes/jobs');
const companyRoutes = require('./backend/routes/companies');
const userRoutes = require('./backend/routes/users');
const applicationRoutes = require('./backend/routes/applications');

const app = express();
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// Serve component files
app.use('/components', express.static(path.join(__dirname, 'frontend/components')));

// Specific page routes
app.get('/why-remote', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'why-remote.html'));
});

app.get('/salary-preference', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'salary-preference.html'));
});

app.get('/where-remote', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'where-remote.html'));
});

app.get('/what-job', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'what-job.html'));
});

app.get('/job-category', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'job-category.html'));
});

app.get('/relevant-experience', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'relevant-experience.html'));
});

app.get('/education-level', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'education-level.html'));
});

app.get('/benefits', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'benefits.html'));
});

app.get('/upload-resume', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'upload-resume.html'));
});

app.get('/remote-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'remote-jobs.html'));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
