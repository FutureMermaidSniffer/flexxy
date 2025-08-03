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
const PORT = process.env.PORT || 3000;


app.use(helmet());
app.use(cors());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'frontend')));

console.log('Mounting API routes...');


app.use('/api/auth', authRoutes);
console.log('Auth routes mounted');

app.use('/api/jobs', jobRoutes);
console.log('Job routes mounted');

app.use('/api/companies', companyRoutes);
console.log('Company routes mounted');

app.use('/api/users', userRoutes);
console.log('User routes mounted');

app.use('/api/applications', applicationRoutes);
console.log('Application routes mounted');

console.log('All routes mounted successfully! Starting server...');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
