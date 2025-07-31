const express = require('express');
const { getOne, getMany, updateOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let convertedQuery = query;
  let convertedParams = [...params];
  
  // If using PostgreSQL, convert ? placeholders to $1, $2, etc.
  if (process.env.DB_TYPE === 'postgres') {
    let paramIndex = 1;
    convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  
  return { query: convertedQuery, params: convertedParams };
}

// Middleware to ensure admin access
const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get dashboard overview stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const userCount = await getOne('SELECT COUNT(*) as total FROM users WHERE is_active = TRUE', []);
    const jobCount = await getOne('SELECT COUNT(*) as total FROM jobs WHERE is_active = TRUE', []);
    const companyCount = await getOne('SELECT COUNT(*) as total FROM companies WHERE is_verified = TRUE', []);
    const agentCount = await getOne('SELECT COUNT(*) as total FROM agents WHERE is_active = TRUE', []);
    const applicationCount = await getOne('SELECT COUNT(*) as total FROM applications', []);
    
    // Get subscription stats
    const activeSubscriptions = await getOne(`
      SELECT COUNT(*) as total 
      FROM user_subscriptions 
      WHERE status = 'active' AND expires_at > NOW()
    `, []);
    
    const monthlyRevenue = await getOne(`
      SELECT COALESCE(SUM(sp.price), 0) as revenue
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status = 'active' 
        AND us.expires_at > NOW()
        AND sp.billing_period = 'monthly'
    `, []);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

    const recentUsers = await getOne(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE created_at >= ?
    `, [dateFilter]);

    const recentJobs = await getOne(`
      SELECT COUNT(*) as total 
      FROM jobs 
      WHERE created_at >= ?
    `, [dateFilter]);

    const recentApplications = await getOne(`
      SELECT COUNT(*) as total 
      FROM applications 
      WHERE applied_at >= ?
    `, [dateFilter]);

    // Get agent stats
    const featuredAgents = await getOne(`
      SELECT COUNT(*) as total 
      FROM agents 
      WHERE is_featured = TRUE AND is_active = TRUE
    `, []);

    const verifiedAgents = await getOne(`
      SELECT COUNT(*) as total 
      FROM agents 
      WHERE is_verified = TRUE AND is_active = TRUE
    `, []);

    // Get top performing metrics
    const topAgents = await getMany(`
      SELECT 
        a.id, a.agent_name, a.display_name, a.rating, a.total_reviews,
        u.first_name, u.last_name
      FROM agents a
      JOIN users u ON a.user_id = u.id
      WHERE a.is_active = TRUE
      ORDER BY a.rating DESC, a.total_reviews DESC
      LIMIT 5
    `, []);

    const recentBookings = await getMany(`
      SELECT 
        ab.id, ab.booking_type, ab.scheduled_at, ab.status,
        a.agent_name, 
        u.first_name as client_first_name, u.last_name as client_last_name
      FROM agent_bookings ab
      JOIN agents a ON ab.agent_id = a.id
      JOIN users u ON ab.client_id = u.id
      ORDER BY ab.created_at DESC
      LIMIT 10
    `, []);

    res.json({
      overview: {
        total_users: userCount.total,
        total_jobs: jobCount.total,
        total_companies: companyCount.total,
        total_agents: agentCount.total,
        total_applications: applicationCount.total,
        active_subscriptions: activeSubscriptions.total,
        monthly_revenue: parseFloat(monthlyRevenue.revenue) || 0
      },
      recent_activity: {
        new_users_30d: recentUsers.total,
        new_jobs_30d: recentJobs.total,
        new_applications_30d: recentApplications.total
      },
      agent_stats: {
        total_agents: agentCount.total,
        featured_agents: featuredAgents.total,
        verified_agents: verifiedAgents.total
      },
      top_agents: topAgents,
      recent_bookings: recentBookings
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// Get users with pagination and filtering
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      user_type,
      is_active,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];

    // Search functionality
    if (search) {
      whereConditions.push(`(
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by user type
    if (user_type) {
      whereConditions.push('user_type = ?');
      queryParams.push(user_type);
    }

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(is_active === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortFields = ['created_at', 'first_name', 'last_name', 'email', 'user_type'];
    const validSortOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, queryParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    // Get users
    const usersQuery = `
      SELECT 
        id, email, first_name, last_name, user_type, phone, location,
        is_active, email_verified, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const { query: convertedUsersQuery, params: convertedUsersParams } = convertQuery(usersQuery, queryParams);
    const users = await getMany(convertedUsersQuery, convertedUsersParams);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get agents for admin management
router.get('/agents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      is_verified,
      is_featured,
      is_active,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];

    // Search functionality
    if (search) {
      whereConditions.push(`(
        a.agent_name LIKE ? OR 
        a.display_name LIKE ? OR 
        u.email LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by verification status
    if (is_verified !== undefined) {
      whereConditions.push('a.is_verified = ?');
      queryParams.push(is_verified === 'true');
    }

    // Filter by featured status
    if (is_featured !== undefined) {
      whereConditions.push('a.is_featured = ?');
      queryParams.push(is_featured === 'true');
    }

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push('a.is_active = ?');
      queryParams.push(is_active === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortFields = ['created_at', 'agent_name', 'rating', 'experience_years'];
    const validSortOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agents a 
      JOIN users u ON a.user_id = u.id 
      ${whereClause}
    `;
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, queryParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    // Get agents
    const agentsQuery = `
      SELECT 
        a.id, a.agent_name, a.display_name, a.experience_years, a.rating, 
        a.total_reviews, a.hourly_rate, a.currency, a.availability_status,
        a.is_verified, a.is_featured, a.is_active, a.created_at,
        u.email, u.first_name, u.last_name
      FROM agents a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const { query: convertedAgentsQuery, params: convertedAgentsParams } = convertQuery(agentsQuery, queryParams);
    const agents = await getMany(convertedAgentsQuery, convertedAgentsParams);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      agents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin agents error:', error);
    res.status(500).json({ message: 'Server error while fetching agents' });
  }
});

// Get jobs for admin management
router.get('/jobs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      is_active,
      is_featured,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let queryParams = [];

    // Search functionality
    if (search) {
      whereConditions.push(`(
        j.title LIKE ? OR 
        j.description LIKE ? OR 
        c.name LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push('j.is_active = ?');
      queryParams.push(is_active === 'true');
    }

    // Filter by featured status
    if (is_featured !== undefined) {
      whereConditions.push('j.is_featured = ?');
      queryParams.push(is_featured === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortFields = ['created_at', 'title', 'views_count', 'applications_count'];
    const validSortOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      ${whereClause}
    `;
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, queryParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    // Get jobs
    const jobsQuery = `
      SELECT 
        j.id, j.title, j.location, j.job_type, j.remote_type, j.experience_level,
        j.salary_min, j.salary_max, j.salary_currency, j.is_active, j.is_featured,
        j.views_count, j.applications_count, j.created_at,
        c.name as company_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY j.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const { query: convertedJobsQuery, params: convertedJobsParams } = convertQuery(jobsQuery, queryParams);
    const jobs = await getMany(convertedJobsQuery, convertedJobsParams);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// Toggle user active status
router.put('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get current status
    const user = await getOne('SELECT is_active FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newStatus = !user.is_active;
    await updateOne('users', { is_active: newStatus }, 'id = ?', [userId]);

    res.json({ 
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle agent verification status
router.put('/agents/:id/toggle-verification', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agentId = req.params.id;
    
    // Get current status
    const agent = await getOne('SELECT is_verified FROM agents WHERE id = ?', [agentId]);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const newStatus = !agent.is_verified;
    await updateOne('agents', { is_verified: newStatus }, 'id = ?', [agentId]);

    res.json({ 
      message: `Agent ${newStatus ? 'verified' : 'unverified'} successfully`,
      is_verified: newStatus
    });
  } catch (error) {
    console.error('Toggle agent verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle agent featured status
router.put('/agents/:id/toggle-featured', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const agentId = req.params.id;
    
    // Get current status
    const agent = await getOne('SELECT is_featured FROM agents WHERE id = ?', [agentId]);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const newStatus = !agent.is_featured;
    await updateOne('agents', { is_featured: newStatus }, 'id = ?', [agentId]);

    res.json({ 
      message: `Agent ${newStatus ? 'featured' : 'unfeatured'} successfully`,
      is_featured: newStatus
    });
  } catch (error) {
    console.error('Toggle agent featured status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system activity logs (recent actions)
router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // This would typically come from an activity log table
    // For now, we'll return recent significant events
    const recentUsers = await getMany(`
      SELECT 'user_registered' as action, email as details, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [parseInt(limit) / 5]);

    const recentJobs = await getMany(`
      SELECT 'job_posted' as action, CONCAT(title, ' by ', c.name) as details, j.created_at
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ORDER BY j.created_at DESC 
      LIMIT ?
    `, [parseInt(limit) / 5]);

    const recentApplications = await getMany(`
      SELECT 'job_application' as action, 
             CONCAT(u.first_name, ' ', u.last_name, ' applied to ', j.title) as details,
             a.applied_at as created_at
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.applied_at DESC 
      LIMIT ?
    `, [parseInt(limit) / 5]);

    const recentBookings = await getMany(`
      SELECT 'agent_booking' as action,
             CONCAT(u.first_name, ' ', u.last_name, ' booked ', ag.agent_name) as details,
             ab.created_at
      FROM agent_bookings ab
      JOIN users u ON ab.client_id = u.id
      JOIN agents ag ON ab.agent_id = ag.id
      ORDER BY ab.created_at DESC 
      LIMIT ?
    `, [parseInt(limit) / 5]);

    // Combine and sort all activities
    const allActivities = [
      ...recentUsers,
      ...recentJobs,
      ...recentApplications,
      ...recentBookings
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ 
      activities: allActivities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Get admin activity error:', error);
    res.status(500).json({ message: 'Server error while fetching activity' });
  }
});

module.exports = router;
