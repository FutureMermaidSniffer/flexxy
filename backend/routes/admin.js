const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');


router.use(authenticateToken);
router.use(requireAdmin);


router.get('/stats', async (req, res) => {
    try {
        
        const queries = [
            
            'SELECT COUNT(*) as count FROM users',
            
            'SELECT COUNT(*) as count FROM jobs',
            
            'SELECT COUNT(*) as count FROM companies',
            
            'SELECT COUNT(*) as count FROM agents',
            
            'SELECT COUNT(*) as count FROM applications'
        ];

        const results = await Promise.allSettled(queries.map(query => executeQuery(query)));
        
        
        const [usersResult, jobsResult, companiesResult, agentsResult, applicationsResult] = results;
        
        const stats = {
            totalUsers: usersResult.status === 'fulfilled' && usersResult.value.length > 0 ? parseInt(usersResult.value[0].count) : 0,
            totalJobs: jobsResult.status === 'fulfilled' && jobsResult.value.length > 0 ? parseInt(jobsResult.value[0].count) : 0,
            totalCompanies: companiesResult.status === 'fulfilled' && companiesResult.value.length > 0 ? parseInt(companiesResult.value[0].count) : 0,
            totalAgents: agentsResult.status === 'fulfilled' && agentsResult.value.length > 0 ? parseInt(agentsResult.value[0].count) : 0,
            totalApplications: applicationsResult.status === 'fulfilled' && applicationsResult.value.length > 0 ? parseInt(applicationsResult.value[0].count) : 0
        };

        
        try {
            
            const activeJobsQuery = `
                SELECT COUNT(*) as count 
                FROM jobs 
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `;
            const activeJobsResult = await executeQuery(activeJobsQuery);
            stats.activeJobs = activeJobsResult.length > 0 ? parseInt(activeJobsResult[0].count) : 0;
        } catch (error) {
            console.warn('Could not fetch active jobs:', error.message);
            stats.activeJobs = 0;
        }

        try {
            
            const newUsersQuery = `
                SELECT COUNT(*) as count 
                FROM users 
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `;
            const newUsersResult = await executeQuery(newUsersQuery);
            stats.newUsers = newUsersResult.length > 0 ? parseInt(newUsersResult[0].count) : 0;
        } catch (error) {
            console.warn('Could not fetch new users:', error.message);
            stats.newUsers = 0;
        }

        res.json({
            message: 'Dashboard stats retrieved successfully',
            data: stats
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard statistics',
            error: error.message 
        });
    }
});


router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `SELECT id, email, CONCAT(first_name, ' ', last_name) as full_name, user_type, 
                            is_active, email_verified, created_at FROM users`;
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        let params = [];

        if (search) {
            query += ' WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1';
            countQuery += ' WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1';
            params = [`%${search}%`];
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [usersResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, search ? [`%${search}%`] : [])
        ]);

        const users = usersResult;
        const total = parseInt(countResult[0].total);

        res.json({
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message 
        });
    }
});


router.get('/jobs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `SELECT j.id, j.title, c.name as company_name, j.location, j.salary_min, j.salary_max, 
                            j.job_type, j.remote_type, j.is_active, j.is_featured, j.created_at 
                     FROM jobs j 
                     LEFT JOIN companies c ON j.company_id = c.id`;
        let countQuery = 'SELECT COUNT(*) as total FROM jobs j LEFT JOIN companies c ON j.company_id = c.id';
        let params = [];

        if (search) {
            query += ' WHERE j.title ILIKE $1 OR c.name ILIKE $1 OR j.location ILIKE $1';
            countQuery += ' WHERE j.title ILIKE $1 OR c.name ILIKE $1 OR j.location ILIKE $1';
            params = [`%${search}%`];
        }

        query += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [jobsResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, search ? [`%${search}%`] : [])
        ]);

        const jobs = jobsResult || [];
        const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

        res.json({
            message: 'Jobs retrieved successfully',
            data: {
                jobs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ 
            message: 'Error fetching jobs',
            error: error.message 
        });
    }
});


router.get('/agents', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT a.id, a.agent_name, a.display_name, a.bio, a.avatar_url,
                   a.experience_years, a.rating, a.total_reviews, a.currency,
                   a.languages, a.skills, a.certifications, a.location, a.timezone,
                   a.linkedin_url, a.portfolio_url, a.specializations,
                   a.is_featured, a.is_active, a.created_at, a.updated_at,
                   u.email
            FROM agents a
            LEFT JOIN users u ON a.user_id = u.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM agents a LEFT JOIN users u ON a.user_id = u.id';
        let params = [];

        if (search) {
            query += ` WHERE a.agent_name ILIKE $1 OR a.display_name ILIKE $1 OR 
                      a.specializations ILIKE $1 OR a.location ILIKE $1 OR 
                      a.skills ILIKE $1 OR u.email ILIKE $1`;
            countQuery += ` WHERE a.agent_name ILIKE $1 OR a.display_name ILIKE $1 OR 
                           a.specializations ILIKE $1 OR a.location ILIKE $1 OR 
                           a.skills ILIKE $1 OR u.email ILIKE $1`;
            params = [`%${search}%`];
        }

        query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [agentsResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, search ? [`%${search}%`] : [])
        ]);

        const agents = agentsResult || [];
        const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

        res.json({
            message: 'Agents retrieved successfully',
            data: {
                agents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ 
            message: 'Error fetching agents',
            error: error.message 
        });
    }
});


router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        
        const userResult = await executeQuery('SELECT id FROM users WHERE id = $1', [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        await executeQuery('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            message: 'Error deleting user',
            error: error.message 
        });
    }
});


router.delete('/jobs/:id', async (req, res) => {
    try {
        const jobId = req.params.id;

        
        const jobResult = await executeQuery('SELECT id FROM jobs WHERE id = $1', [jobId]);
        if (jobResult.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        
        await executeQuery('DELETE FROM jobs WHERE id = $1', [jobId]);

        res.json({ message: 'Job deleted successfully' });

    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ 
            message: 'Error deleting job',
            error: error.message 
        });
    }
});


router.post('/agents', [
    body('agent_name').notEmpty().withMessage('Agent name is required'),
    body('display_name').notEmpty().withMessage('Display name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            agent_name, display_name, email, location, timezone, avatar_url,
            bio, experience_years = 0, currency = 'USD', specializations,
            skills, languages, certifications, linkedin_url, portfolio_url,
            is_active = true, is_featured = false, is_verified = false
        } = req.body;

        
        let userResult = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
        let userId;

        if (userResult.length === 0) {
            
            const userQuery = `
                INSERT INTO users (email, first_name, last_name, user_type, password_hash, is_active)
                VALUES ($1, $2, $3, 'agent', 'temp_hash', true)
                RETURNING id
            `;
            const nameParts = agent_name.split(' ');
            const firstName = nameParts[0] || agent_name;
            const lastName = nameParts.slice(1).join(' ') || '';
            
            userResult = await executeQuery(userQuery, [email, firstName, lastName]);
            userId = userResult[0].id;
        } else {
            userId = userResult[0].id;
        }

        
        const agentQuery = `
            INSERT INTO agents (
                user_id, agent_name, display_name, bio, avatar_url,
                experience_years, currency, languages, skills, certifications,
                location, timezone, linkedin_url, portfolio_url, specializations,
                is_featured, is_active, rating, total_reviews
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 0.00, 0)
            RETURNING id
        `;

        const agentResult = await executeQuery(agentQuery, [
            userId, agent_name, display_name, bio, avatar_url,
            experience_years, currency, languages, skills, certifications,
            location, timezone, linkedin_url, portfolio_url, specializations,
            is_featured, is_active
        ]);

        res.status(201).json({
            message: 'Agent created successfully',
            data: { id: agentResult[0].id }
        });

    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({
            message: 'Error creating agent',
            error: error.message
        });
    }
});


router.get('/agents/:id', async (req, res) => {
    try {
        const agentId = req.params.id;

        const query = `
            SELECT a.*, u.email
            FROM agents a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = $1
        `;

        const result = await executeQuery(query, [agentId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        res.json(result[0]);

    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({
            message: 'Error fetching agent',
            error: error.message
        });
    }
});


router.put('/agents/:id', [
    body('agent_name').notEmpty().withMessage('Agent name is required'),
    body('display_name').notEmpty().withMessage('Display name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const agentId = req.params.id;
        const {
            agent_name, display_name, email, location, timezone, avatar_url,
            bio, experience_years, currency, specializations, skills, languages,
            certifications, linkedin_url, portfolio_url, is_active, is_featured
        } = req.body;

        
        const agentCheck = await executeQuery('SELECT user_id FROM agents WHERE id = $1', [agentId]);
        if (agentCheck.length === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        const userId = agentCheck[0].user_id;

        
        await executeQuery('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);

        
        const updateQuery = `
            UPDATE agents SET
                agent_name = $1, display_name = $2, bio = $3, avatar_url = $4,
                experience_years = $5, currency = $6, languages = $7, skills = $8,
                certifications = $9, location = $10, timezone = $11, linkedin_url = $12,
                portfolio_url = $13, specializations = $14, is_featured = $15, is_active = $16,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $17
        `;

        await executeQuery(updateQuery, [
            agent_name, display_name, bio, avatar_url, experience_years,
            currency, languages, skills, certifications, location, timezone,
            linkedin_url, portfolio_url, specializations, is_featured, is_active,
            agentId
        ]);

        res.json({ message: 'Agent updated successfully' });

    } catch (error) {
        console.error('Error updating agent:', error);
        res.status(500).json({
            message: 'Error updating agent',
            error: error.message
        });
    }
});


router.delete('/agents/:id', async (req, res) => {
    try {
        const agentId = req.params.id;

        
        const agentResult = await executeQuery('SELECT id FROM agents WHERE id = $1', [agentId]);
        if (agentResult.length === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        
        await executeQuery('DELETE FROM agents WHERE id = $1', [agentId]);

        res.json({ message: 'Agent deleted successfully' });

    } catch (error) {
        console.error('Error deleting agent:', error);
        res.status(500).json({ 
            message: 'Error deleting agent',
            error: error.message 
        });
    }
});

module.exports = router;
