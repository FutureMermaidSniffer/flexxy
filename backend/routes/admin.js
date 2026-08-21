const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { executeQuery, getOne, getMany, insertOne, updateOne, deleteOne } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const siteConfig = require('../config/site');

router.use(authenticateToken);
router.use(requireAdmin);

function parsePagination(query, defaultLimit = 25) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    let limit = parseInt(query.limit, 10);
    if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
    limit = Math.min(100, limit);
    return { page, limit, offset: (page - 1) * limit };
}

function paginationMeta(page, limit, total) {
    const safeTotal = Number.isFinite(total) ? total : 0;
    const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit);
    return {
        page,
        limit,
        total: safeTotal,
        pages: totalPages,
        totalPages,
        hasNext: totalPages > 0 && page < totalPages,
        hasPrev: page > 1
    };
}

function stripUserSecrets(user) {
    if (!user) return user;
    const safe = { ...user };
    delete safe.password;
    delete safe.reset_token;
    delete safe.verification_token;
    return safe;
}

function asList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            // plain comma-separated
        }
        return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
}

function processArrayField(field) {
    if (Array.isArray(field)) return JSON.stringify(field);
    if (typeof field === 'string') {
        try {
            JSON.parse(field);
            return field;
        } catch {
            return JSON.stringify(field.split(',').map((s) => s.trim()).filter(Boolean));
        }
    }
    return JSON.stringify([]);
}

function percentChange(current, previous) {
    const cur = Number(current) || 0;
    const prev = Number(previous) || 0;
    if (prev === 0) return cur === 0 ? 0 : 100;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
}

function parseRangeDays(range) {
    const map = { '7d': 7, '30d': 30, '90d': 90 };
    return map[String(range || '30d')] || 30;
}


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
        const { page, limit, offset } = parsePagination(req.query);
        const search = (req.query.search || '').trim();
        const userType = (req.query.user_type || '').trim();
        const isActive = req.query.is_active || '';
        const createdViaWizard = req.query.created_via_wizard || '';
        const country = (req.query.country || '').trim();

        let query = `SELECT id, email, first_name, last_name, CONCAT(first_name, ' ', last_name) as full_name, user_type, 
                            is_active, email_verified, created_at,
                            last_ip, last_country, last_region, last_city, last_lat, last_lng,
                            last_device_type, last_os, last_browser, last_user_agent,
                            last_client_metadata, last_seen_at FROM users`;
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        let whereConditions = [];
        let params = [];

        if (search) {
            whereConditions.push(`(email ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (userType) {
            whereConditions.push(`user_type = $${params.length + 1}`);
            params.push(userType);
        }

        if (isActive === 'true' || isActive === 'false') {
            whereConditions.push(`is_active = $${params.length + 1}`);
            params.push(isActive === 'true');
        }

        if (createdViaWizard === 'true' || createdViaWizard === 'false') {
            whereConditions.push(`created_via_wizard = $${params.length + 1}`);
            params.push(createdViaWizard === 'true');
        }

        if (country) {
            whereConditions.push(`last_country ILIKE $${params.length + 1}`);
            params.push(`%${country}%`);
        }

        if (whereConditions.length > 0) {
            const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
            query += whereClause;
            countQuery += whereClause;
        }

        query += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [usersResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, params.slice(0, -2))
        ]);

        const users = usersResult;
        const total = parseInt(countResult[0].total);

        res.json({
            message: 'Users retrieved successfully',
            data: {
                users,
                pagination: paginationMeta(page, limit, total)
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

// Get specific user's wizard progress
router.get('/users/:id/wizard-progress', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const userResult = await executeQuery('SELECT * FROM users WHERE id = $1', [userId]);
        
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = stripUserSecrets(userResult[0]);

        res.json({
            message: 'Wizard progress retrieved successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Error fetching wizard progress:', error);
        res.status(500).json({ 
            message: 'Error fetching wizard progress',
            error: error.message 
        });
    }
});

// Get profile form submissions
router.get('/profile-forms', async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query);
        const search = req.query.search || '';
        const agentFilter = req.query.agent || '';
        const dateFilter = req.query.date || '';

        let query = `
            SELECT 
                ps.id,
                ps.first_name,
                ps.last_name,
                ps.email,
                ps.phone,
                ps.location,
                ps.work_eligibility,
                ps.experience_level,
                ps.role_type,
                ps.industry,
                ps.employment_types,
                ps.job_preference,
                ps.bio,
                ps.data_processing_consent,
                ps.job_alerts_consent,
                ps.marketing_consent,
                ps.selected_agent_id,
                ps.status,
                ps.created_at,
                ps.updated_at,
                a.agent_name as selected_agent_name,
                a.display_name as selected_agent_display
            FROM profile_submissions ps
            LEFT JOIN agents a ON ps.selected_agent_id = a.id
            WHERE 1=1
        `;
        
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM profile_submissions ps
            LEFT JOIN agents a ON ps.selected_agent_id = a.id
            WHERE 1=1
        `;
        
        let params = [];

        // Search filter
        if (search) {
            const searchCondition = ` AND (ps.first_name ILIKE $${params.length + 1} OR ps.last_name ILIKE $${params.length + 1} OR ps.email ILIKE $${params.length + 1})`;
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        // Agent filter
        if (agentFilter) {
            const agentCondition = ` AND ps.selected_agent_id = $${params.length + 1}`;
            query += agentCondition;
            countQuery += agentCondition;
            params.push(agentFilter);
        }

        // Date filter
        if (dateFilter) {
            let dateCondition = '';
            switch (dateFilter) {
                case 'today':
                    dateCondition = ` AND ps.created_at >= CURRENT_DATE`;
                    break;
                case 'week':
                    dateCondition = ` AND ps.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
                    break;
                case 'month':
                    dateCondition = ` AND ps.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
                    break;
            }
            if (dateCondition) {
                query += dateCondition;
                countQuery += dateCondition;
            }
        }

        const sortDir = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
        query += ` ORDER BY ps.created_at ${sortDir} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [formsResult, countResult] = await Promise.all([
            executeQuery(query, params),
            executeQuery(countQuery, params.slice(0, -2)) // Remove limit and offset for count query
        ]);

        const forms = formsResult || [];
        const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

        // Process the job preferences for each form
        const processedForms = forms.map(form => {
            let jobPreference = null;
            try {
                if (form.job_preference) {
                    // Handle both string and object cases
                    if (typeof form.job_preference === 'string') {
                        jobPreference = JSON.parse(form.job_preference);
                    } else if (typeof form.job_preference === 'object') {
                        jobPreference = form.job_preference;
                    }
                }
            } catch (error) {
                console.error('Error parsing job preference:', error);
                jobPreference = null;
            }

            return {
                ...form,
                job_preference: jobPreference,
                is_complete: !!(form.first_name && form.last_name && form.email && form.location && form.experience_level)
            };
        });

        res.json({
            message: 'Profile forms retrieved successfully',
            data: {
                forms: processedForms,
                pagination: paginationMeta(page, limit, total)
            }
        });

    } catch (error) {
        console.error('Error fetching profile forms:', error);
        res.status(500).json({ 
            message: 'Error fetching profile forms',
            error: error.message 
        });
    }
});

// Export profile forms to CSV
router.get('/profile-forms/export', async (req, res) => {
    try {
        const query = `
            SELECT 
                ps.first_name,
                ps.last_name,
                ps.email,
                ps.phone,
                ps.location,
                ps.work_eligibility,
                ps.experience_level,
                ps.role_type,
                ps.industry,
                ps.employment_types,
                ps.job_preference,
                ps.bio,
                ps.data_processing_consent,
                ps.job_alerts_consent,
                ps.marketing_consent,
                ps.selected_agent_id,
                ps.status,
                ps.created_at,
                ps.updated_at,
                a.agent_name as selected_agent_name
            FROM profile_submissions ps
            LEFT JOIN agents a ON ps.selected_agent_id = a.id
            ORDER BY ps.created_at DESC
        `;

        const results = await executeQuery(query);
        
        // Create CSV content
        const csvHeaders = [
            'First Name', 'Last Name', 'Email', 'Phone', 'Location', 
            'Work Eligibility', 'Experience Level', 'Role Type', 'Industry', 'Employment Types',
            'Selected Agent', 'Status', 'Job Alerts Consent', 'Marketing Consent', 
            'Submitted Date'
        ];

        const csvRows = results.map(row => {
            let jobPreference = null;
            let employmentTypes = '';
            
            try {
                if (row.job_preference) {
                    // Handle both string and object cases
                    if (typeof row.job_preference === 'string') {
                        jobPreference = JSON.parse(row.job_preference);
                    } else if (typeof row.job_preference === 'object') {
                        jobPreference = row.job_preference;
                    }
                }
            } catch (error) {
                console.error('Error parsing job preference:', error);
            }

            // Handle employment_types safely
            try {
                if (row.employment_types) {
                    if (typeof row.employment_types === 'string') {
                        // Try to parse as JSON array first
                        try {
                            const parsed = JSON.parse(row.employment_types);
                            if (Array.isArray(parsed)) {
                                employmentTypes = parsed.join(', ');
                            } else {
                                employmentTypes = row.employment_types;
                            }
                        } catch {
                            // If parsing fails, treat as plain string
                            employmentTypes = row.employment_types;
                        }
                    } else if (Array.isArray(row.employment_types)) {
                        employmentTypes = row.employment_types.join(', ');
                    }
                }
            } catch (error) {
                console.error('Error parsing employment types:', error);
                employmentTypes = row.employment_types || '';
            }

            return [
                row.first_name || '',
                row.last_name || '',
                row.email || '',
                row.phone || '',
                row.location || '',
                row.work_eligibility || '',
                row.experience_level || '',
                row.role_type || '',
                row.industry || '',
                employmentTypes,
                row.selected_agent_name || '',
                row.status || '',
                row.job_alerts_consent ? 'Yes' : 'No',
                row.marketing_consent ? 'Yes' : 'No',
                new Date(row.created_at).toLocaleDateString()
            ].map(field => `"${field}"`).join(',');
        });

        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="profile-forms.csv"');
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting profile forms:', error);
        res.status(500).json({ 
            message: 'Error exporting profile forms',
            error: error.message 
        });
    }
});

// Get individual profile form details
router.get('/profile-forms/:id', async (req, res) => {
    try {
        const submissionId = req.params.id;
        
        const submission = await getOne(`
            SELECT 
                ps.*,
                a.agent_name,
                a.display_name as agent_display_name,
                a.specializations as agent_specializations
            FROM profile_submissions ps
            LEFT JOIN agents a ON ps.selected_agent_id = a.id
            WHERE ps.id = ?
        `, [submissionId]);

        if (!submission) {
            return res.status(404).json({
                message: 'Profile form submission not found'
            });
        }

        // Parse job preference if it exists
        if (submission.job_preference) {
            try {
                // Handle both string and object cases
                if (typeof submission.job_preference === 'string') {
                    submission.job_preference_parsed = JSON.parse(submission.job_preference);
                } else if (typeof submission.job_preference === 'object') {
                    submission.job_preference_parsed = submission.job_preference;
                } else {
                    submission.job_preference_parsed = null;
                }
            } catch (error) {
                console.error('Error parsing job preference:', error);
                submission.job_preference_parsed = null;
            }
        }

        res.json(submission);

    } catch (error) {
        console.error('Error fetching profile form details:', error);
        res.status(500).json({ 
            message: 'Error fetching profile form details',
            error: error.message 
        });
    }
});

router.get('/jobs', async (req, res) => {
    try {
        const { page, limit, offset } = parsePagination(req.query, 10);
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
                pagination: paginationMeta(page, limit, total)
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
        const { page, limit, offset } = parsePagination(req.query);
        const search = req.query.search || '';

        const isActive = req.query.is_active || '';
        const isFeatured = req.query.is_featured || '';

        let query = `
            SELECT a.*, u.email AS user_email
            FROM agents a
            LEFT JOIN users u ON a.user_id = u.id
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM agents a LEFT JOIN users u ON a.user_id = u.id';
        const where = [];
        let params = [];

        if (search) {
            params.push(`%${search}%`);
            where.push(`(a.agent_name ILIKE $${params.length} OR a.display_name ILIKE $${params.length} OR
                      CAST(a.specializations AS TEXT) ILIKE $${params.length} OR a.location ILIKE $${params.length} OR
                      CAST(a.skills AS TEXT) ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
        }
        if (isActive === 'true' || isActive === 'false') {
            params.push(isActive === 'true');
            where.push(`a.is_active = $${params.length}`);
        }
        if (isFeatured === 'true' || isFeatured === 'false') {
            params.push(isFeatured === 'true');
            where.push(`a.is_featured = $${params.length}`);
        }

        if (where.length) {
            const clause = ` WHERE ${where.join(' AND ')}`;
            query += clause;
            countQuery += clause;
        }

        query += ` ORDER BY a.is_active DESC, a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const listParams = [...params, limit, offset];

        const [agentsResult, countResult] = await Promise.all([
            executeQuery(query, listParams),
            executeQuery(countQuery, params)
        ]);

        const agents = (agentsResult || []).map((agent) => {
            const specs = asList(agent.specializations);
            const langs = asList(agent.languages);
            const skills = asList(agent.skills);
            return {
                ...agent,
                email: agent.email || agent.user_email || '',
                specializations: specs.join(', '),
                languages: langs.join(', '),
                skills: skills.join(', '),
                specializations_list: specs,
                is_verified: !!agent.is_verified
            };
        });
        const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

        res.json({
            message: 'Agents retrieved successfully',
            data: {
                agents,
                pagination: paginationMeta(page, limit, total)
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


router.put('/users/:id/toggle-status', async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (req.user && Number(req.user.id) === userId) {
            return res.status(400).json({ message: 'You cannot change your own account status' });
        }

        const user = await getOne('SELECT id, is_active FROM users WHERE id = $1', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newStatus = !user.is_active;
        await executeQuery('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, userId]);

        res.json({
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            message: 'Error toggling user status',
            error: error.message
        });
    }
});

router.patch('/users/:id', [
    body('first_name').optional().trim().notEmpty(),
    body('last_name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional({ nullable: true }).trim(),
    body('location').optional({ nullable: true }).trim(),
    body('bio').optional({ nullable: true }).trim(),
    body('is_active').optional().isBoolean(),
    body('user_type').optional().isIn(['job_seeker', 'employer', 'admin'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const existing = await getOne('SELECT id, user_type, is_active FROM users WHERE id = $1', [userId]);
        if (!existing) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isSelf = req.user && Number(req.user.id) === userId;
        const updates = {};
        const allowed = ['first_name', 'last_name', 'email', 'phone', 'location', 'bio', 'is_active', 'user_type'];
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        if (isSelf && updates.user_type && updates.user_type !== 'admin') {
            return res.status(400).json({ message: 'You cannot remove your own admin access' });
        }
        if (isSelf && updates.is_active === false) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        if (updates.email) {
            const clash = await getOne(
                'SELECT id FROM users WHERE email = $1 AND id <> $2',
                [updates.email, userId]
            );
            if (clash) {
                return res.status(409).json({ message: 'Email is already in use' });
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        updates.updated_at = new Date();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        await executeQuery(
            `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}`,
            [...values, userId]
        );

        const user = stripUserSecrets(await getOne('SELECT * FROM users WHERE id = $1', [userId]));
        res.json({ message: 'User updated successfully', data: { user } });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
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

        // Ensure arrays are properly stringified for database storage
        const processArrayField = (field) => {
            if (Array.isArray(field)) {
                return JSON.stringify(field);
            }
            if (typeof field === 'string') {
                try {
                    // If it's already a JSON string, keep it as is
                    JSON.parse(field);
                    return field;
                } catch (e) {
                    // If it's a plain string, wrap it in an array
                    return JSON.stringify([field]);
                }
            }
            return JSON.stringify([]);
        };

        const processedSpecializations = processArrayField(specializations);
        const processedSkills = processArrayField(skills);
        const processedLanguages = processArrayField(languages);
        const processedCertifications = processArrayField(certifications);

        let userResult = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
        let userId = userResult.length ? userResult[0].id : null;

        if (!userId) {
            const nameParts = (agent_name || '').split(' ');
            const firstName = nameParts[0] || agent_name;
            const lastName = nameParts.slice(1).join(' ') || '';
            const hashed = await bcrypt.hash(`agent-${Date.now()}-${Math.random().toString(36).slice(2)}`, 10);
            try {
                const created = await executeQuery(
                    `INSERT INTO users (email, first_name, last_name, user_type, password, is_active, email_verified)
                     VALUES ($1, $2, $3, 'job_seeker', $4, true, true) RETURNING id`,
                    [email, firstName, lastName, hashed]
                );
                userId = created[0].id;
            } catch (err) {
                console.warn('Agent user row not created (will store agent without user_id):', err.message);
                userId = null;
            }
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
            experience_years, currency, processedLanguages, processedSkills, processedCertifications,
            location, timezone, linkedin_url, portfolio_url, processedSpecializations,
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

        const agent = result[0];
        agent.specializations = asList(agent.specializations).join(', ');
        agent.languages = asList(agent.languages).join(', ');
        agent.skills = asList(agent.skills).join(', ');
        agent.certifications = asList(agent.certifications).join(', ');
        res.json(agent);

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

        // Ensure arrays are properly stringified for database storage (reuse logic)
        const processArrayField = (field) => {
            if (Array.isArray(field)) {
                return JSON.stringify(field);
            }
            if (typeof field === 'string') {
                try {
                    // If it's already a JSON string, keep it as is
                    JSON.parse(field);
                    return field;
                } catch (e) {
                    // If it's a plain string, wrap it in an array
                    return JSON.stringify([field]);
                }
            }
            return JSON.stringify([]);
        };

        const processedSpecializations = processArrayField(specializations);
        const processedSkills = processArrayField(skills);
        const processedLanguages = processArrayField(languages);
        const processedCertifications = processArrayField(certifications);

        
        const agentCheck = await executeQuery('SELECT user_id FROM agents WHERE id = $1', [agentId]);
        if (agentCheck.length === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        const userId = agentCheck[0].user_id;

        if (userId) {
            await executeQuery('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);
        }

        
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
            currency, processedLanguages, processedSkills, processedCertifications, location, timezone,
            linkedin_url, portfolio_url, processedSpecializations, is_featured, is_active,
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

// Toggle agent featured status
router.post('/agents/:id/toggle-featured', async (req, res) => {
    try {
        const agentId = req.params.id;

        // Check if agent exists
        const agentResult = await executeQuery('SELECT id, is_featured FROM agents WHERE id = $1', [agentId]);
        if (agentResult.length === 0) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        const currentStatus = agentResult[0].is_featured;
        const newStatus = !currentStatus;

        // Update featured status
        await executeQuery('UPDATE agents SET is_featured = $1 WHERE id = $2', [newStatus, agentId]);

        res.json({ 
            message: `Agent ${newStatus ? 'featured' : 'unfeatured'} successfully`,
            is_featured: newStatus
        });

    } catch (error) {
        console.error('Error toggling agent featured status:', error);
        res.status(500).json({ 
            message: 'Error toggling agent featured status',
            error: error.message 
        });
    }
});

router.get('/admins', async (req, res) => {
    try {
        const admins = await executeQuery(
            `SELECT id, email, first_name, last_name, is_active, created_at
             FROM users
             WHERE user_type = 'admin'
             ORDER BY created_at ASC`
        );
        res.json({ message: 'Admins retrieved successfully', data: { admins } });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
});

router.post('/admins', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const email = String(req.body.email).trim().toLowerCase();
        const existing = await getOne('SELECT id, user_type FROM users WHERE email = $1', [email]);
        if (existing) {
            if (existing.user_type === 'admin') {
                return res.status(409).json({ message: 'An admin with this email already exists' });
            }
            await executeQuery(
                `UPDATE users SET user_type = 'admin', is_active = TRUE, email_verified = TRUE, updated_at = NOW()
                 WHERE id = $1`,
                [existing.id]
            );
            const user = stripUserSecrets(await getOne('SELECT * FROM users WHERE id = $1', [existing.id]));
            return res.json({ message: 'Existing user promoted to admin', data: { user } });
        }

        const hashed = await bcrypt.hash(req.body.password, 12);
        const created = await executeQuery(
            `INSERT INTO users (email, password, first_name, last_name, user_type, is_active, email_verified)
             VALUES ($1, $2, $3, $4, 'admin', TRUE, TRUE)
             RETURNING id`,
            [email, hashed, req.body.first_name.trim(), req.body.last_name.trim()]
        );
        const user = stripUserSecrets(await getOne('SELECT * FROM users WHERE id = $1', [created[0].id]));
        res.status(201).json({ message: 'Admin created successfully', data: { user } });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const days = parseRangeDays(req.query.range);
        const location = (req.query.location || '').trim();

        const registrations = await executeQuery(
            `SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COUNT(u.id)::int AS count
             FROM generate_series(
                    CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                  ) AS d(day)
             LEFT JOIN users u ON u.created_at::date = d.day::date
             GROUP BY d.day
             ORDER BY d.day ASC`,
            [days]
        );

        const currentRegs = await getOne(
            `SELECT COUNT(*)::int AS count FROM users
             WHERE created_at >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'`,
            [days]
        );
        const previousRegs = await getOne(
            `SELECT COUNT(*)::int AS count FROM users
             WHERE created_at >= CURRENT_DATE - ($1::int * 2 - 1) * INTERVAL '1 day'
               AND created_at < CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'`,
            [days]
        );

        let viewsWhere = '';
        const viewsParams = [];
        if (location) {
            viewsParams.push(`%${location}%`);
            viewsWhere = ` WHERE location ILIKE $1`;
        }

        const viewsByLocation = await executeQuery(
            `SELECT COALESCE(NULLIF(TRIM(location), ''), 'Unknown') AS location,
                    COALESCE(SUM(views_count), 0)::int AS views,
                    COUNT(*)::int AS jobs
             FROM jobs
             ${viewsWhere}
             GROUP BY 1
             ORDER BY views DESC, location ASC
             LIMIT 25`,
            viewsParams
        );

        const currentViews = await getOne(
            `SELECT COALESCE(SUM(views_count), 0)::int AS count FROM jobs ${viewsWhere}`,
            viewsParams
        );
        const totalViews = currentViews?.count || 0;
        const viewsRows = (viewsByLocation || []).map((row) => ({
            ...row,
            share_percent: totalViews ? Math.round((Number(row.views) / totalViews) * 1000) / 10 : 0
        }));

        const locationOptions = await executeQuery(
            `SELECT DISTINCT COALESCE(NULLIF(TRIM(location), ''), 'Unknown') AS location
             FROM jobs
             ORDER BY 1
             LIMIT 100`
        );

        const usersByCountry = await executeQuery(
            `SELECT COALESCE(NULLIF(TRIM(last_country), ''), 'Unknown') AS location,
                    COUNT(*)::int AS count
             FROM users
             WHERE created_at >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'
             GROUP BY 1
             ORDER BY count DESC
             LIMIT 20`,
            [days]
        );

        const currentCountryCount = currentRegs?.count || 0;
        const previousCountryCount = previousRegs?.count || 0;

        const series = (registrations || []).map((r) => {
            const raw = r.day;
            let day = '';
            if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
                day = raw.toISOString().slice(0, 10);
            } else {
                const match = String(raw || '').match(/^(\d{4}-\d{2}-\d{2})/);
                day = match ? match[1] : String(raw || '').slice(0, 10);
            }
            return { day, count: Number(r.count) || 0 };
        });

        res.json({
            message: 'Analytics retrieved successfully',
            data: {
                range_days: days,
                location: location || null,
                registrations: {
                    total: currentRegs?.count || 0,
                    previous: previousCountryCount,
                    growth_percent: percentChange(currentRegs?.count || 0, previousCountryCount),
                    series
                },
                views: {
                    total: currentViews?.count || 0,
                    by_location: viewsRows,
                    locations: (locationOptions || []).map((r) => r.location)
                },
                users_by_location: {
                    total: currentCountryCount,
                    previous: previousCountryCount,
                    growth_percent: percentChange(currentCountryCount, previousCountryCount),
                    by_location: usersByCountry || []
                }
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
});

// Get site configuration for admin panel
router.get('/site-config', (req, res) => {
    res.json({
        siteUrl: siteConfig.siteUrl,
        adminUrl: siteConfig.adminUrl(),
        jobsUrl: siteConfig.jobsUrl(),
        dashboardUrl: siteConfig.dashboardUrl(),
        environment: siteConfig.environment,
        isProduction: siteConfig.isProduction(),
        urls: {
            admin: siteConfig.adminUrl(),
            jobs: siteConfig.jobsUrl(),
            dashboard: siteConfig.dashboardUrl(),
            site: siteConfig.siteUrl
        }
    });
});

module.exports = router;
