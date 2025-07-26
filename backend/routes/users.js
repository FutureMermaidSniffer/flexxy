const express = require('express');
const { getOne, getMany, updateOne } = require('../database');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Get user profile by ID (public info only)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await getOne(`
      SELECT 
        id, first_name, last_name, user_type, bio, 
        experience_level, location, linkedin_url, portfolio_url,
        created_at
      FROM users 
      WHERE id = ? AND is_active = TRUE
    `, [userId]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If it's a job seeker, get some stats
    if (user.user_type === 'job_seeker') {
      const stats = await getOne(`
        SELECT 
          COUNT(DISTINCT a.id) as applications_count,
          COUNT(DISTINCT sj.id) as saved_jobs_count
        FROM users u
        LEFT JOIN applications a ON u.id = a.user_id
        LEFT JOIN saved_jobs sj ON u.id = sj.user_id
        WHERE u.id = ?
      `, [userId]);

      user.stats = stats;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications (own profile only)
router.get('/:id/applications', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const applications = await getMany(`
      SELECT 
        a.id, a.status, a.applied_at, a.updated_at,
        j.id as job_id, j.title as job_title, j.location as job_location,
        j.job_type, j.remote_type, j.salary_min, j.salary_max,
        c.name as company_name, c.logo as company_logo
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await getOne(
      'SELECT COUNT(*) as total FROM applications WHERE user_id = ?',
      [userId]
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
    console.error('Get user applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's saved jobs (own profile only)
router.get('/:id/saved-jobs', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const savedJobs = await getMany(`
      SELECT 
        sj.id as saved_id, sj.saved_at,
        j.id, j.title, j.description, j.location, j.job_type, j.remote_type,
        j.experience_level, j.salary_min, j.salary_max, j.created_at,
        c.name as company_name, c.logo as company_logo
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE sj.user_id = ? AND j.is_active = TRUE
      ORDER BY sj.saved_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // Get total count
    const countResult = await getOne(
      'SELECT COUNT(*) as total FROM saved_jobs sj JOIN jobs j ON sj.job_id = j.id WHERE sj.user_id = ? AND j.is_active = TRUE',
      [userId]
    );

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      saved_jobs: savedJobs,
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
    console.error('Get user saved jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Only admin can change user status
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const userId = req.params.id;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ message: 'is_active must be a boolean' });
    }

    await updateOne('users', { is_active }, 'id = ?', [userId]);

    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user dashboard stats (own profile only)
router.get('/:id/dashboard', authenticateToken, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.user_type === 'job_seeker') {
      // Job seeker dashboard
      const stats = await getOne(`
        SELECT 
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications,
          COUNT(DISTINCT CASE WHEN a.status = 'interviewed' THEN a.id END) as interviews,
          COUNT(DISTINCT CASE WHEN a.status = 'hired' THEN a.id END) as hired,
          COUNT(DISTINCT sj.id) as saved_jobs
        FROM users u
        LEFT JOIN applications a ON u.id = a.user_id
        LEFT JOIN saved_jobs sj ON u.id = sj.user_id
        WHERE u.id = ?
      `, [userId]);

      // Recent activity
      const recentApplications = await getMany(`
        SELECT 
          a.status, a.applied_at,
          j.title as job_title,
          c.name as company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.user_id = ?
        ORDER BY a.applied_at DESC
        LIMIT 5
      `, [userId]);

      res.json({
        stats,
        recent_applications: recentApplications
      });

    } else if (req.user.user_type === 'employer') {
      // Employer dashboard
      const company = await getOne('SELECT id FROM companies WHERE user_id = ?', [userId]);
      
      if (!company) {
        return res.json({ message: 'No company found. Please create a company first.' });
      }

      const stats = await getOne(`
        SELECT 
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.is_active = TRUE THEN j.id END) as active_jobs,
          COUNT(DISTINCT a.id) as total_applications,
          COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.company_id = ?
      `, [company.id]);

      // Recent jobs
      const recentJobs = await getMany(`
        SELECT 
          id, title, job_type, remote_type, applications_count, views_count, created_at
        FROM jobs
        WHERE company_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [company.id]);

      res.json({
        stats,
        recent_jobs: recentJobs,
        company_id: company.id
      });
    }
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
