//  Fix agents query to include agents without user_id
//  Update agents routes to use LEFT JOIN instead of INNER JOIN

const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, deleteOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Function to convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
function convertQuery(query, params) {
  let convertedQuery = query;
  let convertedParams = [...params];
  
  // Convert ? placeholders to $1, $2, etc. for PostgreSQL
  if (process.env.DB_TYPE === 'postgres') {
    let paramIndex = 1;
    convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  
  return { query: convertedQuery, params: convertedParams };
}

// Search suggestions endpoint
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
    
    const suggestions = await getMany(searchQuery, [searchTerm, parseInt(limit)]);
    
    // Helper function to safely parse JSON or return as array (reused from above)
    const safeJsonParse = (value) => {
        if (!value) return [];
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            } catch (e) {
                // If it's not valid JSON, treat it as a single string
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    };
    
    // Process specializations
    const processedSuggestions = suggestions.map(agent => ({
      ...agent,
      specializations: safeJsonParse(agent.specializations)
    }));
    
    res.json({ suggestions: processedSuggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ 
      message: 'Error fetching search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/agents - Main agents listing endpoint
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

    // Search functionality
    if (search) {
      whereConditions.push(`(
        a.agent_name ILIKE ? OR 
        a.display_name ILIKE ? OR 
        a.bio ILIKE ? OR 
        a.specializations ILIKE ? OR
        a.skills ILIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Specialization filter
    if (specialization) {
      whereConditions.push('a.specializations ILIKE ?');
      queryParams.push(`%"${specialization}"%`);
    }

    // Rating filter
    if (min_rating) {
      whereConditions.push('a.rating >= ?');
      queryParams.push(parseFloat(min_rating));
    }

    // Featured filter
    if (featured === 'true') {
      whereConditions.push('a.is_featured = TRUE');
    }

    // Sorting
    const validSortFields = ['rating', 'experience_years', 'created_at', 'agent_name'];
    const validSortOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'rating';
    const sortDirection = validSortOrders.includes(sort_order.toLowerCase()) ? sort_order.toUpperCase() : 'DESC';

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query - get total number of matching agents
    const countQuery = 'SELECT COUNT(*) as total FROM agents a ' + whereClause;
    
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, queryParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    // Main query - FIXED: Use LEFT JOIN to include agents without user_id
    const agentsQuery = 'SELECT a.id, a.agent_name, a.display_name, a.bio, a.specializations, a.rating, a.total_reviews, a.currency, a.languages, a.skills, a.location, a.timezone, a.avatar_url, a.is_featured, a.created_at, u.first_name, u.last_name, u.email FROM agents a LEFT JOIN users u ON a.user_id = u.id ' + whereClause + ' ORDER BY a.' + sortField + ' ' + sortDirection + ' LIMIT ? OFFSET ?';

    queryParams.push(parseInt(limit), offset);
    const { query: convertedAgentsQuery, params: convertedAgentsParams } = convertQuery(agentsQuery, queryParams);
    const agents = await getMany(convertedAgentsQuery, convertedAgentsParams);

    // Helper function to safely parse JSON or return as array
    const safeJsonParse = (value) => {
        if (!value) return [];
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            } catch (e) {
                // If it's not valid JSON, treat it as a single string
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    };

    // Process the results - handle JSON fields and null user data
    const processedAgents = agents.map(agent => ({
      ...agent,
      specializations: safeJsonParse(agent.specializations),
      languages: safeJsonParse(agent.languages),
      skills: safeJsonParse(agent.skills),
      // Handle cases where user data is null
      first_name: agent.first_name || '',
      last_name: agent.last_name || '',
      email: agent.email || ''
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
    console.error('Error fetching agents:', error);
    res.status(500).json({ 
      message: 'Error fetching agents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/agents/:id - Get specific agent details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const agentQuery = `
      SELECT 
        a.*, 
        u.first_name, u.last_name, u.email
      FROM agents a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ? AND a.is_active = TRUE
    `;
    
    const { query: convertedQuery, params: convertedParams } = convertQuery(agentQuery, [id]);
    const agent = await getOne(convertedQuery, convertedParams);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Helper function to safely parse JSON or return as array (reused)
    const safeJsonParse = (value) => {
        if (!value) return [];
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            } catch (e) {
                // If it's not valid JSON, treat it as a single string
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    };

    // Process JSON fields
    const processedAgent = {
      ...agent,
      specializations: safeJsonParse(agent.specializations),
      languages: safeJsonParse(agent.languages),
      skills: safeJsonParse(agent.skills),
      certifications: safeJsonParse(agent.certifications),
      first_name: agent.first_name || '',
      last_name: agent.last_name || '',
      email: agent.email || ''
    };

    res.json({ agent: processedAgent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ 
      message: 'Error fetching agent details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/agents - Create new agent (Admin only)
router.post('/', authenticateToken, [
  body('agent_name').notEmpty().trim().withMessage('Agent name is required'),
  body('display_name').notEmpty().trim().withMessage('Display name is required'),
  body('specializations').isArray().withMessage('Specializations must be an array'),
  body('location').notEmpty().trim().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      user_id,
      agent_name,
      display_name,
      bio,
      specializations,
      avatar_url,
      experience_years,
      rating = 0,
      total_reviews = 0,
      currency = 'USD',
      languages = [],
      skills = [],
      certifications = [],
      location,
      timezone,
      linkedin_url,
      portfolio_url,
      is_featured = false
    } = req.body;

    const insertQuery = `
      INSERT INTO agents (
        user_id, agent_name, display_name, bio, specializations,
        avatar_url, experience_years, rating, total_reviews, currency,
        languages, skills, certifications, location, timezone,
        linkedin_url, portfolio_url, is_featured, is_active, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, TRUE, NOW(), NOW()
      ) RETURNING id
    `;

    const params = [
      user_id || null,
      agent_name,
      display_name,
      bio || '',
      JSON.stringify(specializations),
      avatar_url || '',
      experience_years || 0,
      rating,
      total_reviews,
      currency,
      JSON.stringify(languages),
      JSON.stringify(skills),
      JSON.stringify(certifications),
      location,
      timezone || '',
      linkedin_url || '',
      portfolio_url || '',
      is_featured
    ];

    const { query: convertedQuery, params: convertedParams } = convertQuery(insertQuery, params);
    const result = await insertOne(convertedQuery, convertedParams);

    res.status(201).json({
      message: 'Agent created successfully',
      agent_id: result.id
    });

  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ 
      message: 'Error creating agent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/agents/:id - Update agent (Admin only)
router.put('/:id', authenticateToken, [
  body('agent_name').optional().notEmpty().trim().withMessage('Agent name cannot be empty'),
  body('display_name').optional().notEmpty().trim().withMessage('Display name cannot be empty'),
  body('specializations').optional().isArray().withMessage('Specializations must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Process JSON fields
    if (updateData.specializations) {
      updateData.specializations = JSON.stringify(updateData.specializations);
    }
    if (updateData.languages) {
      updateData.languages = JSON.stringify(updateData.languages);
    }
    if (updateData.skills) {
      updateData.skills = JSON.stringify(updateData.skills);
    }
    if (updateData.certifications) {
      updateData.certifications = JSON.stringify(updateData.certifications);
    }

    // Build dynamic update query
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateQuery = `
      UPDATE agents 
      SET ${updateFields}, updated_at = NOW()
      WHERE id = ?
    `;

    const params = [...Object.values(updateData), id];
    const { query: convertedQuery, params: convertedParams } = convertQuery(updateQuery, params);
    await updateOne(convertedQuery, convertedParams);

    res.json({ message: 'Agent updated successfully' });

  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ 
      message: 'Error updating agent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/agents/:id - Soft delete agent (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteQuery = `
      UPDATE agents 
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ?
    `;
    
    const { query: convertedQuery, params: convertedParams } = convertQuery(deleteQuery, [id]);
    await updateOne(convertedQuery, convertedParams);

    res.json({ message: 'Agent deactivated successfully' });

  } catch (error) {
    console.error('Error deactivating agent:', error);
    res.status(500).json({ 
      message: 'Error deactivating agent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
