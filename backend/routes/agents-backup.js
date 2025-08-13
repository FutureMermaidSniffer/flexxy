const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, deleteOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


function convertQuery(query, params) {
  let convertedQuery = query;
  let convertedParams = [...params];
  
  
  if (process.env.DB_TYPE === 'postgres') {
    let paramIndex = 1;
    convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  
  return { query: convertedQuery, params: convertedParams };
}


router.get('/search/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const searchTerm = `%${query.trim()}%`;
    const searchQuery = `
      SELECT 
        a.id,
        a.agent_name,
        a.display_name,
        a.location,
        a.rating,
        a.specializations
      FROM agents a
      WHERE a.is_active = TRUE 
        AND (
          a.agent_name ILIKE $1 OR 
          a.display_name ILIKE $1 OR
          a.specializations ILIKE $1 OR
          a.location ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN a.agent_name ILIKE $1 THEN 1
          WHEN a.display_name ILIKE $1 THEN 2  
          ELSE 3
        END,
        a.rating DESC
      LIMIT $2
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(searchQuery, [searchTerm, parseInt(limit)]);
    const suggestions = await getMany(convertedQuery, convertedParams);

    res.json({ suggestions });
  } catch (error) {
    console.error('Agent search suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching agent suggestions' });
  }
});


const createAgentValidation = [
  body('agent_name').trim().isLength({ min: 2, max: 255 }),
  body('display_name').trim().isLength({ min: 2, max: 255 }),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('specializations').optional().isArray(),
  body('experience_years').optional().isInt({ min: 0, max: 50 }),
  body('languages').optional().isArray(),
  body('skills').optional().isArray(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('timezone').optional().trim().isLength({ max: 50 })
];

const updateAgentValidation = [
  body('agent_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('display_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('bio').optional().trim().isLength({ max: 2000 }),
  body('specializations').optional().isArray(),
  body('experience_years').optional().isInt({ min: 0, max: 50 }),
  body('languages').optional().isArray(),
  body('skills').optional().isArray(),
  body('location').optional().trim().isLength({ max: 255 }),
  body('timezone').optional().trim().isLength({ max: 50 })
];


router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      specialization,
      min_rating,
      max_rate,
      availability,
      featured,
      sort_by = 'rating',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = ['a.is_active = TRUE'];
    let queryParams = [];

    
    if (search) {
      whereConditions.push(`(
        a.agent_name LIKE ? OR 
        a.display_name LIKE ? OR 
        a.bio LIKE ? OR 
        a.specializations LIKE ? OR
        a.skills LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    
    if (specialization) {
      whereConditions.push('a.specializations LIKE ?');
      queryParams.push(`%"${specialization}"%`);
    }

    
    if (min_rating) {
      whereConditions.push('a.rating >= ?');
      queryParams.push(parseFloat(min_rating));
    }

    
    if (featured === 'true') {
      whereConditions.push('a.is_featured = TRUE');
    }

    
    const validSortFields = ['rating', 'experience_years', 'created_at', 'agent_name'];
    const validSortOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'rating';
    const sortDirection = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agents a 
      ${whereClause}
    `;
    
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, queryParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    
    const agentsQuery = `
      SELECT 
        a.id, a.agent_name, a.display_name, a.bio, a.specializations,
        a.rating, a.total_reviews, a.currency,
        a.languages, a.skills, a.location, a.timezone,
        a.avatar_url, a.is_featured, a.created_at,
        u.first_name, u.last_name, u.email
      FROM agents a
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const { query: convertedAgentsQuery, params: convertedAgentsParams } = convertQuery(agentsQuery, queryParams);
    const agents = await getMany(convertedAgentsQuery, convertedAgentsParams);

    
    const processedAgents = agents.map(agent => ({
      ...agent,
      specializations: agent.specializations ? JSON.parse(agent.specializations) : [],
      languages: agent.languages ? JSON.parse(agent.languages) : [],
      skills: agent.skills ? JSON.parse(agent.skills) : []
    }));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      agents: processedAgents,
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
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error while fetching agents' });
  }
});


router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const query = `
      SELECT 
        a.id, a.agent_name, a.display_name, a.bio, a.specializations,
        a.rating, a.total_reviews, a.currency,
        a.avatar_url, a.location
      FROM agents a
      WHERE a.is_active = TRUE AND a.is_featured = TRUE
      ORDER BY a.rating DESC, a.total_reviews DESC
      LIMIT ?
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(query, [parseInt(limit)]);
    const agents = await getMany(convertedQuery, convertedParams);

    
    const processedAgents = agents.map(agent => ({
      ...agent,
      specializations: agent.specializations ? JSON.parse(agent.specializations) : []
    }));

    res.json({ agents: processedAgents });
  } catch (error) {
    console.error('Get featured agents error:', error);
    res.status(500).json({ message: 'Server error while fetching featured agents' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const agentId = req.params.id;

    const query = `
      SELECT 
        a.*, u.first_name, u.last_name, u.email, u.linkedin_url
      FROM agents a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND a.is_active = TRUE
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(query, [agentId]);
    const agent = await getOne(convertedQuery, convertedParams);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    
    const processedAgent = {
      ...agent,
      specializations: agent.specializations ? JSON.parse(agent.specializations) : [],
      languages: agent.languages ? JSON.parse(agent.languages) : [],
      skills: agent.skills ? JSON.parse(agent.skills) : [],
      certifications: agent.certifications ? JSON.parse(agent.certifications) : []
    };

    
    const reviewsQuery = `
      SELECT 
        r.rating, r.review_text, r.created_at,
        CASE WHEN r.is_anonymous = TRUE THEN 'Anonymous' 
             ELSE CONCAT(u.first_name, ' ', u.last_name) END as reviewer_name
      FROM agent_reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.agent_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const { query: convertedReviewsQuery, params: convertedReviewsParams } = convertQuery(reviewsQuery, [agentId]);
    const reviews = await getMany(convertedReviewsQuery, convertedReviewsParams);

    res.json({
      agent: processedAgent,
      reviews
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Server error while fetching agent' });
  }
});


router.post('/', authenticateToken, createAgentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;

    
    const existingAgent = await getOne('SELECT id FROM agents WHERE user_id = ?', [userId]);
    if (existingAgent) {
      return res.status(400).json({ message: 'User already has an agent profile' });
    }

    const {
      agent_name,
      display_name,
      bio,
      specializations = [],
      experience_years = 0,
      languages = [],
      skills = [],
      certifications = [],
      location,
      timezone,
      linkedin_url,
      portfolio_url
    } = req.body;

    const agentData = {
      user_id: userId,
      agent_name,
      display_name,
      bio: bio || null,
      specializations: JSON.stringify(specializations),
      experience_years,
      languages: JSON.stringify(languages),
      skills: JSON.stringify(skills),
      certifications: JSON.stringify(certifications),
      location: location || null,
      timezone: timezone || null,
      linkedin_url: linkedin_url || null,
      portfolio_url: portfolio_url || null
    };

    const agentId = await insertOne('agents', agentData);

    res.status(201).json({
      message: 'Agent profile created successfully',
      agent_id: agentId
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error while creating agent profile' });
  }
});


router.put('/:id', authenticateToken, updateAgentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const agentId = req.params.id;
    const userId = req.user.id;

    
    const agent = await getOne('SELECT user_id FROM agents WHERE id = ?', [agentId]);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    
    if (agent.user_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    const allowedFields = [
      'agent_name', 'display_name', 'bio', 'experience_years',
      'location', 'timezone', 'linkedin_url', 'portfolio_url'
    ];

    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    
    const arrayFields = ['specializations', 'languages', 'skills', 'certifications'];
    arrayFields.forEach(field => {
      if (req.body[field] !== undefined && Array.isArray(req.body[field])) {
        updateData[field] = JSON.stringify(req.body[field]);
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    await updateOne('agents', updateData, 'id = ?', [agentId]);

    res.json({ message: 'Agent profile updated successfully' });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error while updating agent profile' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const agentId = req.params.id;
    const userId = req.user.id;

    
    const agent = await getOne('SELECT user_id FROM agents WHERE id = ?', [agentId]);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    
    if (agent.user_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteOne('agents', 'id = ?', [agentId]);

    res.json({ message: 'Agent profile deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error while deleting agent profile' });
  }
});


router.put('/:id/featured', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const agentId = req.params.id;
    const { is_featured } = req.body;

    if (typeof is_featured !== 'boolean') {
      return res.status(400).json({ message: 'is_featured must be a boolean' });
    }

    await updateOne('agents', { is_featured }, 'id = ?', [agentId]);

    res.json({ 
      message: `Agent ${is_featured ? 'featured' : 'unfeatured'} successfully` 
    });
  } catch (error) {
    console.error('Update agent featured status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
