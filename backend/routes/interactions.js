const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne } = require('../database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();


router.post('/newsletter/subscribe', [
  body('email').isEmail().normalizeEmail(),
  body('subscription_type').optional().isIn(['general', 'career_advice', 'job_alerts', 'tutorials']),
  body('source_page').optional().isLength({ max: 100 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: errors.array() 
      });
    }

    const { email, subscription_type = 'general', source_page = 'career-advice' } = req.body;
    const userId = req.user ? req.user.id : null;

    
    const existingSubscription = await getOne(
      'SELECT id, is_active FROM newsletter_subscriptions WHERE email = ? AND subscription_type = ?',
      [email, subscription_type]
    );

    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return res.status(400).json({ 
          message: 'You are already subscribed to this newsletter' 
        });
      } else {
        
        await updateOne(
          'newsletter_subscriptions',
          { 
            is_active: true, 
            user_id: userId,
            subscribed_at: new Date(),
            unsubscribed_at: null 
          },
          'id = ?',
          [existingSubscription.id]
        );
        
        return res.json({ 
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
          subscription_id: existingSubscription.id
        });
      }
    }

    
    const subscriptionId = await insertOne('newsletter_subscriptions', {
      email,
      user_id: userId,
      subscription_type,
      source_page,
      is_active: true
    });

    
    await trackInteraction(req, {
      interaction_type: 'form_submit',
      page_name: source_page,
      element_name: 'newsletter_subscribe',
      metadata: JSON.stringify({ 
        subscription_type,
        email_domain: email.split('@')[1]
      })
    });

    res.status(201).json({ 
      message: 'Successfully subscribed to our newsletter!',
      subscription_id: subscriptionId
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Server error while processing subscription' });
  }
});


router.post('/newsletter/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
  body('subscription_type').optional().isIn(['general', 'career_advice', 'job_alerts', 'tutorials'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: errors.array() 
      });
    }

    const { email, subscription_type = 'general' } = req.body;

    const subscription = await getOne(
      'SELECT id FROM newsletter_subscriptions WHERE email = ? AND subscription_type = ? AND is_active = TRUE',
      [email, subscription_type]
    );

    if (!subscription) {
      return res.status(404).json({ 
        message: 'No active subscription found for this email' 
      });
    }

    await updateOne(
      'newsletter_subscriptions',
      { 
        is_active: false,
        unsubscribed_at: new Date()
      },
      'id = ?',
      [subscription.id]
    );

    res.json({ message: 'Successfully unsubscribed from newsletter' });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Server error while processing unsubscription' });
  }
});


router.post('/tutorial/track', [
  body('tutorial_name').isLength({ min: 1, max: 255 }),
  body('action_type').isIn(['view', 'play', 'pause', 'complete', 'share']),
  body('watch_duration').optional().isInt({ min: 0 }),
  body('total_duration').optional().isInt({ min: 0 }),
  body('completion_percentage').optional().isFloat({ min: 0, max: 100 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: errors.array() 
      });
    }

    const { 
      tutorial_name, 
      action_type, 
      watch_duration = 0, 
      total_duration = 0, 
      completion_percentage = 0 
    } = req.body;

    const userId = req.user ? req.user.id : null;
    const sessionId = req.sessionID || req.headers['x-session-id'] || generateSessionId();

    await insertOne('tutorial_engagement', {
      user_id: userId,
      session_id: sessionId,
      tutorial_name,
      action_type,
      watch_duration,
      total_duration,
      completion_percentage
    });

    res.json({ message: 'Tutorial interaction tracked successfully' });

  } catch (error) {
    console.error('Tutorial tracking error:', error);
    res.status(500).json({ message: 'Server error while tracking tutorial interaction' });
  }
});


router.post('/interaction/track', [
  body('interaction_type').isIn(['page_view', 'tutorial_view', 'button_click', 'form_submit', 'download']),
  body('page_name').optional().isLength({ max: 100 }),
  body('element_name').optional().isLength({ max: 100 }),
  body('metadata').optional().isJSON()
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: errors.array() 
      });
    }

    await trackInteraction(req, req.body);
    res.json({ message: 'Interaction tracked successfully' });

  } catch (error) {
    console.error('Interaction tracking error:', error);
    res.status(500).json({ message: 'Server error while tracking interaction' });
  }
});


router.get('/newsletter/my-subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await getMany(
      'SELECT subscription_type, is_active, subscribed_at FROM newsletter_subscriptions WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ subscriptions });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions' });
  }
});


async function trackInteraction(req, data) {
  const userId = req.user ? req.user.id : null;
  const sessionId = req.sessionID || req.headers['x-session-id'] || generateSessionId();
  
  const interactionData = {
    user_id: userId,
    session_id: sessionId,
    interaction_type: data.interaction_type,
    page_name: data.page_name || null,
    element_name: data.element_name || null,
    metadata: data.metadata || null,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.headers['user-agent'] || null
  };

  try {
    await insertOne('user_interactions', interactionData);
  } catch (error) {
    console.error('Error tracking interaction:', error);
    
  }
}


function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = router;
