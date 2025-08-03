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


router.get('/plans', async (req, res) => {
  try {
    const query = `
      SELECT id, name, description, price, currency, billing_period, features,
             max_job_applications, max_agent_consultations, is_active
      FROM subscription_plans 
      WHERE is_active = TRUE 
      ORDER BY price ASC
    `;

    const plans = await getMany(query, []);

    
    const processedPlans = plans.map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    }));

    res.json({ plans: processedPlans });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ message: 'Server error while fetching subscription plans' });
  }
});


router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        us.id, us.status, us.starts_at, us.expires_at, us.created_at,
        sp.name, sp.description, sp.price, sp.currency, sp.billing_period,
        sp.features, sp.max_job_applications, sp.max_agent_consultations
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? 
        AND us.status IN ('active', 'trial')
        AND us.expires_at > NOW()
      ORDER BY us.created_at DESC
      LIMIT 1
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(query, [userId]);
    const subscription = await getOne(convertedQuery, convertedParams);

    if (!subscription) {
      
      const freePlan = await getOne(`
        SELECT id, name, description, price, currency, billing_period,
               features, max_job_applications, max_agent_consultations
        FROM subscription_plans 
        WHERE name = 'Free' AND is_active = TRUE
      `, []);

      return res.json({ 
        subscription: null,
        plan: freePlan ? {
          ...freePlan,
          features: freePlan.features ? JSON.parse(freePlan.features) : []
        } : null
      });
    }

    
    const processedSubscription = {
      ...subscription,
      features: subscription.features ? JSON.parse(subscription.features) : []
    };

    res.json({ subscription: processedSubscription });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error while fetching subscription' });
  }
});


router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        us.id, us.status, us.starts_at, us.expires_at, us.created_at,
        sp.name, sp.price, sp.currency, sp.billing_period
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(query, [userId, parseInt(limit), offset]);
    const subscriptions = await getMany(convertedQuery, convertedParams);

    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM user_subscriptions 
      WHERE user_id = ?
    `;
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, [userId]);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      subscriptions,
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
    console.error('Get subscription history error:', error);
    res.status(500).json({ message: 'Server error while fetching subscription history' });
  }
});


router.post('/subscribe', authenticateToken, [
  body('plan_id').isInt({ min: 1 }),
  body('payment_method').optional().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { plan_id, payment_method = 'manual' } = req.body;

    
    const plan = await getOne('SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    
    const existingSubscription = await getOne(`
      SELECT id FROM user_subscriptions 
      WHERE user_id = ? AND status IN ('active', 'trial') AND expires_at > NOW()
    `, [userId]);

    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    
    const startsAt = new Date();
    const expiresAt = new Date();
    
    if (plan.billing_period === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    
    const subscriptionData = {
      user_id: userId,
      plan_id: plan_id,
      status: plan.price > 0 ? 'active' : 'trial', 
      starts_at: startsAt.toISOString().slice(0, 19).replace('T', ' '),
      expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
      payment_method: payment_method
    };

    const subscriptionId = await insertOne('user_subscriptions', subscriptionData);

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription_id: subscriptionId,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error while creating subscription' });
  }
});


router.put('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    
    const subscription = await getOne(`
      SELECT id FROM user_subscriptions 
      WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    
    await updateOne('user_subscriptions', 
      { status: 'cancelled' }, 
      'id = ?', 
      [subscription.id]
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error while cancelling subscription' });
  }
});


router.put('/change-plan', authenticateToken, [
  body('plan_id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { plan_id } = req.body;

    
    const plan = await getOne('SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    
    const currentSubscription = await getOne(`
      SELECT id, plan_id FROM user_subscriptions 
      WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);

    if (!currentSubscription) {
      return res.status(404).json({ message: 'No active subscription found to change' });
    }

    if (currentSubscription.plan_id === plan_id) {
      return res.status(400).json({ message: 'You are already subscribed to this plan' });
    }

    
    await updateOne('user_subscriptions', 
      { status: 'cancelled' }, 
      'id = ?', 
      [currentSubscription.id]
    );

    
    const startsAt = new Date();
    const expiresAt = new Date();
    
    if (plan.billing_period === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billing_period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    const newSubscriptionData = {
      user_id: userId,
      plan_id: plan_id,
      status: plan.price > 0 ? 'active' : 'trial',
      starts_at: startsAt.toISOString().slice(0, 19).replace('T', ' '),
      expires_at: expiresAt.toISOString().slice(0, 19).replace('T', ' '),
      payment_method: 'existing'
    };

    const newSubscriptionId = await insertOne('user_subscriptions', newSubscriptionData);

    res.json({
      message: 'Subscription plan changed successfully',
      subscription_id: newSubscriptionId,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('Change subscription plan error:', error);
    res.status(500).json({ message: 'Server error while changing subscription plan' });
  }
});


router.get('/limits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    
    let subscription = await getOne(`
      SELECT 
        sp.max_job_applications, sp.max_agent_consultations, sp.name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? 
        AND us.status IN ('active', 'trial')
        AND us.expires_at > NOW()
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [userId]);

    if (!subscription) {
      
      subscription = await getOne(`
        SELECT max_job_applications, max_agent_consultations, name
        FROM subscription_plans 
        WHERE name = 'Free' AND is_active = TRUE
      `, []);
    }

    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    
    const applicationCount = await getOne(`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE user_id = ? AND applied_at >= ?
    `, [userId, currentMonth.toISOString().slice(0, 19).replace('T', ' ')]);

    
    const consultationCount = await getOne(`
      SELECT COUNT(*) as count 
      FROM agent_bookings 
      WHERE client_id = ? AND created_at >= ? AND status IN ('confirmed', 'completed')
    `, [userId, currentMonth.toISOString().slice(0, 19).replace('T', ' ')]);

    const limits = {
      plan_name: subscription.name,
      job_applications: {
        max: subscription.max_job_applications,
        used: applicationCount.count,
        remaining: subscription.max_job_applications === -1 ? -1 : 
                  Math.max(0, subscription.max_job_applications - applicationCount.count)
      },
      agent_consultations: {
        max: subscription.max_agent_consultations,
        used: consultationCount.count,
        remaining: subscription.max_agent_consultations === -1 ? -1 :
                  Math.max(0, subscription.max_agent_consultations - consultationCount.count)
      }
    };

    res.json({ limits });
  } catch (error) {
    console.error('Get subscription limits error:', error);
    res.status(500).json({ message: 'Server error while fetching subscription limits' });
  }
});


router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 20, status, plan_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('us.status = ?');
      queryParams.push(status);
    }

    if (plan_id) {
      whereConditions.push('us.plan_id = ?');
      queryParams.push(plan_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        us.id, us.status, us.starts_at, us.expires_at, us.created_at,
        sp.name as plan_name, sp.price, sp.currency, sp.billing_period,
        u.first_name, u.last_name, u.email
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
      ${whereClause}
      ORDER BY us.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const { query: convertedQuery, params: convertedParams } = convertQuery(query, queryParams);
    const subscriptions = await getMany(convertedQuery, convertedParams);

    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      JOIN users u ON us.user_id = u.id
      ${whereClause}
    `;
    const countParams = queryParams.slice(0, -2); 
    const { query: convertedCountQuery, params: convertedCountParams } = convertQuery(countQuery, countParams);
    const countResult = await getOne(convertedCountQuery, convertedCountParams);
    const total = countResult.total;

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      subscriptions,
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
    console.error('Get all subscriptions error:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions' });
  }
});


router.post('/admin/plans', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('billing_period').isIn(['monthly', 'yearly']),
  body('features').isArray(),
  body('max_job_applications').isInt({ min: -1 }),
  body('max_agent_consultations').isInt({ min: -1 })
], async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      currency = 'USD',
      billing_period,
      features,
      max_job_applications,
      max_agent_consultations
    } = req.body;

    const planData = {
      name,
      description: description || null,
      price,
      currency,
      billing_period,
      features: JSON.stringify(features),
      max_job_applications,
      max_agent_consultations
    };

    const planId = await insertOne('subscription_plans', planData);

    res.status(201).json({
      message: 'Subscription plan created successfully',
      plan_id: planId
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ message: 'Server error while creating subscription plan' });
  }
});

module.exports = router;
