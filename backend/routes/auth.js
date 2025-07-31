const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getOne, insertOne, updateOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Helper function to convert MySQL-style placeholders to PostgreSQL
function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').trim().isLength({ min: 1 }),
  body('last_name').trim().isLength({ min: 1 }),
  body('user_type').isIn(['job_seeker', 'employer'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Helper function to generate JWT token
const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, user_type } = req.body;

    // Check if user already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await insertOne('users', {
      email,
      password: hashedPassword,
      first_name,
      last_name,
      user_type
    });

    // Generate token
    const token = generateToken(userId, email, user_type);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        first_name,
        last_name,
        user_type
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from database
    const user = await getOne(
      'SELECT id, email, password, first_name, last_name, user_type, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.user_type);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getOne(
      `SELECT id, email, first_name, last_name, user_type, phone, bio, skills, 
       experience_level, location, profile_image, linkedin_url, portfolio_url,
       created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('first_name').optional().trim().isLength({ min: 1 }),
  body('last_name').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim(),
  body('bio').optional().trim(),
  body('skills').optional().trim(),
  body('experience_level').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  body('location').optional().trim(),
  body('linkedin_url').optional().isURL(),
  body('portfolio_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = [
      'first_name', 'last_name', 'phone', 'bio', 'skills',
      'experience_level', 'location', 'linkedin_url', 'portfolio_url'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    await updateOne('users', updateData, 'id = ?', [req.user.id]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const user = await getOne('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await updateOne('users', { password: hashedNewPassword }, 'id = ?', [req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      email: req.user.email,
      user_type: req.user.user_type
    }
  });
});

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await getOne('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        
        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await getOne('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
        
        if (user) {
          // Link Google account to existing user
          await updateOne('users', { 
            google_id: profile.id,
            avatar_url: profile.photos[0]?.value 
          }, 'id = ?', [user.id]);
          
          user.google_id = profile.id;
          user.avatar_url = profile.photos[0]?.value;
          return done(null, user);
        }

        // Create new user
        const newUserData = {
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          google_id: profile.id,
          avatar_url: profile.photos[0]?.value,
          user_type: 'job_seeker', // Default type
          email_verified: true, // Google emails are pre-verified
          created_at: new Date(),
          updated_at: new Date()
        };

        const userId = await insertOne('users', newUserData);
        const newUser = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
        
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
} else {
  console.log('⚠️  Google OAuth disabled - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getOne('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user.id, req.user.email, req.user.user_type);
      
      // Redirect to browse jobs page with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/browse-jobs.html?token=${token}&success=1`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`;
      res.redirect(errorUrl);
    }
  }
);

// Apple OAuth routes (simplified implementation)
router.post('/apple/callback', async (req, res) => {
  try {
    const { id_token, user_info } = req.body;
    
    // In a production environment, you would verify the Apple ID token
    // For now, this is a simplified implementation
    if (!id_token) {
      return res.status(400).json({ message: 'Invalid Apple ID token' });
    }

    // Decode Apple ID token (in production, use proper verification)
    const appleUserId = user_info?.sub || 'apple_' + Date.now();
    const email = user_info?.email;
    const firstName = user_info?.given_name || 'Apple';
    const lastName = user_info?.family_name || 'User';

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists with this Apple ID
    let user = await getOne('SELECT * FROM users WHERE apple_id = ?', [appleUserId]);
    
    if (user) {
      const token = generateToken(user.id, user.email, user.user_type);
      return res.json({ token, user: { id: user.id, email: user.email, user_type: user.user_type } });
    }

    // Check if user exists with same email
    user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user) {
      // Link Apple account to existing user
      await updateOne('users', { apple_id: appleUserId }, 'id = ?', [user.id]);
      user.apple_id = appleUserId;
      
      const token = generateToken(user.id, user.email, user.user_type);
      return res.json({ token, user: { id: user.id, email: user.email, user_type: user.user_type } });
    }

    // Create new user
    const newUserData = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      apple_id: appleUserId,
      user_type: 'job_seeker', // Default type
      email_verified: true, // Apple emails are pre-verified
      created_at: new Date(),
      updated_at: new Date()
    };

    const userId = await insertOne('users', newUserData);
    const newUser = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
    
    const token = generateToken(newUser.id, newUser.email, newUser.user_type);
    res.json({ token, user: { id: newUser.id, email: newUser.email, user_type: newUser.user_type } });

  } catch (error) {
    console.error('Apple authentication error:', error);
    res.status(500).json({ message: 'Apple authentication failed' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  // Since we're using JWT tokens (stateless), we don't need to do anything server-side
  // In a production app, you might want to blacklist the token or store logout events
  res.json({ message: 'Logout successful' });
});

module.exports = router;
