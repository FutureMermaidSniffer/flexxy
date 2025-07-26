const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, deleteOne, executeQuery } = require('../database');
const { authenticateToken, requireEmployer } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Validation rules
const jobValidation = [
  body('title').trim().isLength({ min: 3, max: 255 }),
  body('description').trim().isLength({ min: 10 }),
  body('company_id').isInt({ min: 1 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('location').optional().trim(),
  body('job_type').isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  body('remote_type').isIn(['remote', 'hybrid', 'on-site']),
  body('experience_level').isIn(['entry', 'mid', 'senior', 'executive']),
  body('salary_min').optional().isNumeric(),
  body('salary_max').optional().isNumeric()
];

// Get all jobs with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('job_type').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  query('remote_type').optional().isIn(['remote', 'hybrid', 'on-site']),
  query('experience_level').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  query('category_id').optional().isInt({ min: 1 }),
  query('salary_min').optional().isNumeric(),
  query('salary_max').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause based on filters
    const whereConditions = ['j.is_active = TRUE'];
    const params = [];

    if (req.query.search) {
      whereConditions.push('(j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (req.query.location) {
      whereConditions.push('j.location LIKE ?');
      params.push(`%${req.query.location}%`);
    }

    if (req.query.job_type) {
      whereConditions.push('j.job_type = ?');
      params.push(req.query.job_type);
    }

    if (req.query.remote_type) {
      whereConditions.push('j.remote_type = ?');
      params.push(req.query.remote_type);
    }

    if (req.query.experience_level) {
      whereConditions.push('j.experience_level = ?');
      params.push(req.query.experience_level);
    }

    if (req.query.category_id) {
      whereConditions.push('j.category_id = ?');
      params.push(req.query.category_id);
    }

    if (req.query.salary_min) {
      whereConditions.push('j.salary_max >= ?');
      params.push(req.query.salary_min);
    }

    if (req.query.salary_max) {
      whereConditions.push('j.salary_min <= ?');
      params.push(req.query.salary_max);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countQueryTemplate = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
    `;
    const { query: countQuery, params: countParams } = convertQuery(countQueryTemplate, params);
    const countResult = await getOne(countQuery, countParams);
    const total = countResult.total;

    // Get jobs with pagination
    const jobsQueryTemplate = `
      SELECT 
        j.id, j.title, j.description, j.location, j.job_type, j.remote_type,
        j.experience_level, j.salary_min, j.salary_max, j.salary_currency,
        j.is_featured, j.views_count, j.applications_count, j.created_at,
        c.name as company_name, c.logo as company_logo, c.location as company_location,
        cat.name as category_name, cat.icon as category_icon
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE ${whereClause}
      ORDER BY j.is_featured DESC, j.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const { query: jobsQuery, params: jobsParams } = convertQuery(jobsQueryTemplate, [...params, limit, offset]);
    const jobs = await getMany(jobsQuery, jobsParams);

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
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job categories (specific route before generic :id)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await getMany('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs by company (specific route before generic :id)
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const jobs = await getMany(`
      SELECT 
        j.id, j.title, j.employment_type, j.experience_level, j.location,
        j.salary_min, j.salary_max, j.remote_type, j.is_active,
        j.created_at, j.applications_count,
        cat.name as category_name
      FROM jobs j
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE j.company_id = ? AND j.is_active = TRUE
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `, [companyId, limit, offset]);

    res.json({ jobs });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job by ID (generic route after specific ones)
router.get('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await getOne(`
      SELECT 
        j.*, 
        c.name as company_name, c.description as company_description,
        c.logo as company_logo, c.website as company_website,
        c.industry as company_industry, c.company_size, c.location as company_location,
        cat.name as category_name, cat.icon as category_icon,
        u.first_name as posted_by_first_name, u.last_name as posted_by_last_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      LEFT JOIN users u ON j.created_by = u.id
      WHERE j.id = ? AND j.is_active = TRUE
    `, [jobId]);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get job skills
    const skills = await getMany(
      'SELECT skill_name, is_required FROM job_skills WHERE job_id = ?',
      [jobId]
    );

    // Increment view count
    await executeQuery('UPDATE jobs SET views_count = views_count + 1 WHERE id = ?', [jobId]);

    res.json({ job: { ...job, skills } });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new job (employers only)
router.post('/', authenticateToken, requireEmployer, jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, requirements, responsibilities, company_id,
      category_id, location, job_type, remote_type, experience_level,
      salary_min, salary_max, salary_currency, benefits, application_deadline,
      skills
    } = req.body;

    // Verify company belongs to user (unless admin)
    if (req.user.user_type !== 'admin') {
      const company = await getOne('SELECT id FROM companies WHERE id = ? AND user_id = ?', [company_id, req.user.id]);
      if (!company) {
        return res.status(403).json({ message: 'Company not found or access denied' });
      }
    }

    // Create job
    const jobData = {
      title,
      description,
      requirements: requirements || null,
      responsibilities: responsibilities || null,
      company_id,
      category_id: category_id || null,
      location: location || null,
      job_type,
      remote_type,
      experience_level,
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      salary_currency: salary_currency || 'USD',
      benefits: benefits || null,
      application_deadline: application_deadline || null,
      created_by: req.user.id
    };

    const jobId = await insertOne('jobs', jobData);

    // Add skills if provided
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        await insertOne('job_skills', {
          job_id: jobId,
          skill_name: skill.name,
          is_required: skill.required || false
        });
      }
    }

    res.status(201).json({ 
      message: 'Job created successfully', 
      jobId 
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (employers only)
router.put('/:id', authenticateToken, requireEmployer, jobValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobId = req.params.id;

    // Verify job belongs to user's company (unless admin)
    let job;
    if (req.user.user_type === 'admin') {
      job = await getOne('SELECT id, company_id FROM jobs WHERE id = ?', [jobId]);
    } else {
      job = await getOne(`
        SELECT j.id, j.company_id 
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.id = ? AND c.user_id = ?
      `, [jobId, req.user.id]);
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    const {
      title, description, requirements, responsibilities, category_id,
      location, job_type, remote_type, experience_level,
      salary_min, salary_max, salary_currency, benefits, application_deadline,
      skills
    } = req.body;

    const updateData = {
      title,
      description,
      requirements: requirements || null,
      responsibilities: responsibilities || null,
      category_id: category_id || null,
      location: location || null,
      job_type,
      remote_type,
      experience_level,
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      salary_currency: salary_currency || 'USD',
      benefits: benefits || null,
      application_deadline: application_deadline || null
    };

    await updateOne('jobs', updateData, 'id = ?', [jobId]);

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await deleteOne('job_skills', 'job_id = ?', [jobId]);
      
      // Add new skills
      for (const skill of skills) {
        await insertOne('job_skills', {
          job_id: jobId,
          skill_name: skill.name,
          is_required: skill.required || false
        });
      }
    }

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (employers only)
router.delete('/:id', authenticateToken, requireEmployer, async (req, res) => {
  try {
    const jobId = req.params.id;

    // Verify job belongs to user's company (unless admin)
    let job;
    if (req.user.user_type === 'admin') {
      job = await getOne('SELECT id FROM jobs WHERE id = ?', [jobId]);
    } else {
      job = await getOne(`
        SELECT j.id 
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.id = ? AND c.user_id = ?
      `, [jobId, req.user.id]);
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    // Soft delete (set is_active to false)
    await updateOne('jobs', { is_active: false }, 'id = ?', [jobId]);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
