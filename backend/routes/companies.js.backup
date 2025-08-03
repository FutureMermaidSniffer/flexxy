const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne } = require('../database');
const { authenticateToken, requireEmployer } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Validation rules
const companyValidation = [
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('description').optional().trim(),
  body('website').optional().isURL(),
  body('industry').optional().trim(),
  body('company_size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  body('location').optional().trim(),
  body('founded_year').optional().isInt({ min: 1800, max: new Date().getFullYear() })
];

// Get all companies with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (req.query.search) {
      whereClause = 'WHERE name LIKE ? OR industry LIKE ?';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const countResult = await getOne(countQuery, params);
    const total = countResult.total;

    // Get companies
    const companiesQuery = `
      SELECT 
        id, name, description, logo, industry, company_size, 
        location, founded_year, is_verified, created_at
      FROM companies 
      ${whereClause}
      ORDER BY is_verified DESC, name ASC
      LIMIT ? OFFSET ?
    `;
    
    const companies = await getMany(companiesQuery, [...params, limit, offset]);

    // Get job counts for each company
    for (let company of companies) {
      const jobCount = await getOne(
        'SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND is_active = TRUE',
        [company.id]
      );
      company.active_jobs_count = jobCount.count;
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company by ID
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.params.id;

    const company = await getOne(`
      SELECT 
        c.*, 
        u.first_name as contact_first_name, 
        u.last_name as contact_last_name,
        u.email as contact_email
      FROM companies c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [companyId]);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get company statistics
    const stats = await getOne(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_jobs,
        AVG(salary_min) as avg_salary_min,
        AVG(salary_max) as avg_salary_max
      FROM jobs 
      WHERE company_id = ?
    `, [companyId]);

    // Get recent jobs
    const recentJobs = await getMany(`
      SELECT 
        id, title, location, job_type, remote_type, 
        experience_level, created_at
      FROM jobs 
      WHERE company_id = ? AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 5
    `, [companyId]);

    res.json({ 
      company: {
        ...company,
        stats,
        recent_jobs: recentJobs
      }
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new company (employers only)
router.post('/', authenticateToken, requireEmployer, companyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, website, industry, company_size,
      location, founded_year
    } = req.body;

    // Check if user already has a company
    const existingCompany = await getOne('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (existingCompany) {
      return res.status(400).json({ message: 'User already has a company registered' });
    }

    const companyData = {
      name,
      description: description || null,
      website: website || null,
      industry: industry || null,
      company_size: company_size || '1-10',
      location: location || null,
      founded_year: founded_year || null,
      user_id: req.user.id
    };

    const companyId = await insertOne('companies', companyData);

    res.status(201).json({ 
      message: 'Company created successfully', 
      companyId 
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company (owner only)
router.put('/:id', authenticateToken, requireEmployer, companyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const companyId = req.params.id;

    // Verify company belongs to user (unless admin)
    let company;
    if (req.user.user_type === 'admin') {
      company = await getOne('SELECT id FROM companies WHERE id = ?', [companyId]);
    } else {
      company = await getOne('SELECT id FROM companies WHERE id = ? AND user_id = ?', [companyId, req.user.id]);
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found or access denied' });
    }

    const {
      name, description, website, industry, company_size,
      location, founded_year
    } = req.body;

    const updateData = {
      name,
      description: description || null,
      website: website || null,
      industry: industry || null,
      company_size: company_size || '1-10',
      location: location || null,
      founded_year: founded_year || null
    };

    await updateOne('companies', updateData, 'id = ?', [companyId]);

    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's company
router.get('/user/my-company', authenticateToken, requireEmployer, async (req, res) => {
  try {
    const company = await getOne('SELECT * FROM companies WHERE user_id = ?', [req.user.id]);
    
    if (!company) {
      return res.status(404).json({ message: 'No company found for this user' });
    }

    // Get company statistics
    const stats = await getOne(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_jobs,
        SUM(applications_count) as total_applications
      FROM jobs 
      WHERE company_id = ?
    `, [company.id]);

    res.json({ 
      company: {
        ...company,
        stats
      }
    });
  } catch (error) {
    console.error('Get user company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company jobs
router.get('/:id/jobs', async (req, res) => {
  try {
    const companyId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await getOne(
      'SELECT COUNT(*) as total FROM jobs WHERE company_id = ? AND is_active = TRUE',
      [companyId]
    );
    const total = countResult.total;

    // Get jobs
    const jobs = await getMany(`
      SELECT 
        j.id, j.title, j.location, j.job_type, j.remote_type,
        j.experience_level, j.salary_min, j.salary_max, j.salary_currency,
        j.created_at, j.applications_count, j.views_count,
        cat.name as category_name
      FROM jobs j
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE j.company_id = ? AND j.is_active = TRUE
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `, [companyId, limit, offset]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured companies
router.get('/featured/list', async (req, res) => {
  try {
    const companies = await getMany(`
      SELECT 
        c.id, c.name, c.logo, c.industry, c.location,
        COUNT(j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = TRUE
      WHERE c.is_verified = TRUE
      GROUP BY c.id, c.name, c.logo, c.industry, c.location
      HAVING COUNT(j.id) > 0
      ORDER BY COUNT(j.id) DESC, c.name ASC
      LIMIT 12
    `);

    res.json({ companies });
  } catch (error) {
    console.error('Get featured companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
