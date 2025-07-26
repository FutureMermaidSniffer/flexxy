const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, deleteOne, executeQuery } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Apply for a job
router.post('/apply', authenticateToken, [
  body('job_id').isInt({ min: 1 }),
  body('cover_letter').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { job_id, cover_letter } = req.body;
    const user_id = req.user.id;

    // Check if job exists and is active
    const job = await getOne('SELECT id, company_id FROM jobs WHERE id = ? AND is_active = TRUE', [job_id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found or no longer active' });
    }

    // Check if user has already applied
    const existingApplication = await getOne(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [job_id, user_id]
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const applicationId = await insertOne('applications', {
      job_id,
      user_id,
      cover_letter: cover_letter || null,
      status: 'pending'
    });

    // Update job applications count
    await executeQuery('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?', [job_id]);

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a job (employers only)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verify user owns the job or is admin
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

    // Get applications with user details
    const applications = await getMany(`
      SELECT 
        a.id, a.status, a.cover_letter, a.applied_at, a.updated_at,
        u.id as user_id, u.first_name, u.last_name, u.email,
        u.experience_level, u.location, u.linkedin_url, u.portfolio_url
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
      LIMIT ? OFFSET ?
    `, [jobId, limit, offset]);

    // Get total count
    const countResult = await getOne(
      'SELECT COUNT(*) as total FROM applications WHERE job_id = ?',
      [jobId]
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      applications,
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
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (employers only)
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'reviewed', 'interviewed', 'hired', 'rejected']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const applicationId = req.params.id;
    const { status, notes } = req.body;

    // Verify user owns the job or is admin
    let application;
    if (req.user.user_type === 'admin') {
      application = await getOne('SELECT id, job_id FROM applications WHERE id = ?', [applicationId]);
    } else {
      application = await getOne(`
        SELECT a.id, a.job_id 
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id 
        WHERE a.id = ? AND c.user_id = ?
      `, [applicationId, req.user.id]);
    }

    if (!application) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }

    // Update application
    await updateOne('applications', {
      status,
      notes: notes || null
    }, 'id = ?', [applicationId]);

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single application details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Get application with job and user details
    const application = await getOne(`
      SELECT 
        a.*,
        j.title as job_title, j.description as job_description,
        j.location as job_location, j.job_type, j.remote_type,
        j.salary_min, j.salary_max,
        c.name as company_name, c.logo as company_logo,
        u.first_name, u.last_name, u.email, u.phone,
        u.experience_level, u.location as user_location,
        u.linkedin_url, u.portfolio_url, u.bio
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [applicationId]);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check access permissions
    const isOwner = req.user.id === application.user_id;
    const isEmployer = req.user.user_type === 'employer' && await getOne(`
      SELECT c.id FROM companies c 
      JOIN jobs j ON c.id = j.company_id 
      WHERE j.id = ? AND c.user_id = ?
    `, [application.job_id, req.user.id]);
    const isAdmin = req.user.user_type === 'admin';

    if (!isOwner && !isEmployer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application (job seekers only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Verify application belongs to user
    const application = await getOne(
      'SELECT id, job_id FROM applications WHERE id = ? AND user_id = ?',
      [applicationId, req.user.id]
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }

    // Delete application
    await deleteOne('applications', 'id = ?', [applicationId]);

    // Update job applications count
    await executeQuery('UPDATE jobs SET applications_count = applications_count - 1 WHERE id = ?', [application.job_id]);

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a job
router.post('/save-job', authenticateToken, [
  body('job_id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { job_id } = req.body;
    const user_id = req.user.id;

    // Check if job exists
    const job = await getOne('SELECT id FROM jobs WHERE id = ? AND is_active = TRUE', [job_id]);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existingSave = await getOne(
      'SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [job_id, user_id]
    );

    if (existingSave) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Save job
    await insertOne('saved_jobs', {
      job_id,
      user_id
    });

    res.status(201).json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsave a job
router.delete('/save-job/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Delete saved job
    const result = await deleteOne('saved_jobs', 'job_id = ? AND user_id = ?', [jobId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job unsaved successfully' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if job is saved by user
router.get('/saved-status/:jobId', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id;

    const savedJob = await getOne(
      'SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );

    res.json({ is_saved: !!savedJob });
  } catch (error) {
    console.error('Check saved status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
