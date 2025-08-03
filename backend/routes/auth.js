const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getOne, insertOne, updateOne, deleteOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const emailService = require('../services/email');

const router = express.Router();


function convertQuery(query, params) {
  let index = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${index++}`);
  return { query: convertedQuery, params };
}


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


const generateToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};


router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, user_type, preferences, is_temp_account, created_via_wizard } = req.body;

    
    const finalFirstName = first_name || 'User';
    const finalLastName = last_name || Date.now().toString().slice(-4); 

    
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    
    let wizardData = {};
    if (preferences && created_via_wizard) {
      wizardData = {
        work_type_preference: preferences.workType ? JSON.stringify(preferences.workType) : null,
        salary_preference: preferences.salaryPreference ? JSON.stringify(preferences.salaryPreference) : null,
        location_preference: preferences.locationPreference ? JSON.stringify(preferences.locationPreference) : null,
        job_preference: preferences.jobPreference ? JSON.stringify(preferences.jobPreference) : null,
        experience_level_preference: preferences.experienceLevel?.level || null,
        education_level_preference: preferences.educationLevel?.level || null,
        benefit_preferences: preferences.benefitPreference ? JSON.stringify(preferences.benefitPreference) : null,
        wizard_completed_at: new Date()
      };
    }

    
    const userData = {
      email,
      password: hashedPassword,
      first_name: finalFirstName,
      last_name: finalLastName,
      user_type,
      is_temp_account: is_temp_account || false,
      created_via_wizard: created_via_wizard || false,
      ...wizardData
    };

    const userId = await insertOne('users', userData);

    
    const token = generateToken(userId, email, user_type);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        first_name: finalFirstName,
        last_name: finalLastName,
        user_type,
        is_temp_account: is_temp_account || false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    
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

    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
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

    
    const user = await getOne('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    
    await updateOne('users', { password: hashedNewPassword }, 'id = ?', [req.user.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


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


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        
        let user = await getOne('SELECT * FROM users WHERE google_id = ?', [profile.id]);
        
        if (user) {
          return done(null, user);
        }

        
        user = await getOne('SELECT * FROM users WHERE email = ?', [profile.emails[0].value]);
        
        if (user) {
          
          await updateOne('users', { 
            google_id: profile.id,
            avatar_url: profile.photos[0]?.value 
          }, 'id = ?', [user.id]);
          
          user.google_id = profile.id;
          user.avatar_url = profile.photos[0]?.value;
          return done(null, user);
        }

        
        const newUserData = {
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          google_id: profile.id,
          avatar_url: profile.photos[0]?.value,
          user_type: 'job_seeker', 
          email_verified: true, 
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


router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user.id, req.user.email, req.user.user_type);
      
      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3003'}/?token=${token}&auth=success`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3003'}/login.html?error=auth_failed`;
      res.redirect(errorUrl);
    }
  }
);


router.post('/apple/callback', async (req, res) => {
  try {
    const { id_token, user_info } = req.body;
    
    
    
    if (!id_token) {
      return res.status(400).json({ message: 'Invalid Apple ID token' });
    }

    
    const appleUserId = user_info?.sub || 'apple_' + Date.now();
    const email = user_info?.email;
    const firstName = user_info?.given_name || 'Apple';
    const lastName = user_info?.family_name || 'User';

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    
    let user = await getOne('SELECT * FROM users WHERE apple_id = ?', [appleUserId]);
    
    if (user) {
      const token = generateToken(user.id, user.email, user.user_type);
      return res.json({ token, user: { id: user.id, email: user.email, user_type: user.user_type } });
    }

    
    user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user) {
      
      await updateOne('users', { apple_id: appleUserId }, 'id = ?', [user.id]);
      user.apple_id = appleUserId;
      
      const token = generateToken(user.id, user.email, user.user_type);
      return res.json({ token, user: { id: user.id, email: user.email, user_type: user.user_type } });
    }

    
    const newUserData = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      apple_id: appleUserId,
      user_type: 'job_seeker', 
      email_verified: true, 
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

// Password reset validation
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Forgot Password Route
router.post('/forgot-password', forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await getOne('SELECT id, email, first_name FROM users WHERE email = ?', [email]);

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up any existing reset tokens for this user
    await deleteOne('password_reset_tokens', 'user_id = ?', [user.id]);

    // Save reset token to database
    await insertOne('password_reset_tokens', {
      user_id: user.id,
      token: hashedToken,
      expires_at: expiresAt,
      used: false
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken);
      
      res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.',
        debug: process.env.NODE_ENV === 'development' ? { token: resetToken } : undefined
      });
      
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clean up the token if email fails
      await deleteOne('password_reset_tokens', 'user_id = ?', [user.id]);
      
      res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while processing your request.' 
    });
  }
});

// Reset Password Route
router.post('/reset-password', resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { token, password } = req.body;

    // Hash the received token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const resetRecord = await getOne(`
      SELECT prt.*, u.id as user_id, u.email, u.first_name 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE
    `, [hashedToken]);

    if (!resetRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user's password
    await updateOne('users', 
      { 
        password: hashedPassword,
        updated_at: new Date()
      }, 
      'id = ?', 
      [resetRecord.user_id]
    );

    // Mark the reset token as used
    await updateOne('password_reset_tokens', 
      { used: true }, 
      'id = ?', 
      [resetRecord.id]
    );

    // Clean up all reset tokens for this user
    await deleteOne('password_reset_tokens', 'user_id = ? AND id != ?', [resetRecord.user_id, resetRecord.id]);

    console.log(`Password reset successful for user: ${resetRecord.email}`);

    res.json({ 
      message: 'Your password has been successfully reset. You can now log in with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while resetting your password.' 
    });
  }
});

// Verify Reset Token Route (optional - for frontend validation)
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await getOne(`
      SELECT prt.expires_at, u.email 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE
    `, [hashedToken]);

    if (!resetRecord) {
      return res.status(400).json({ 
        valid: false,
        message: 'Invalid or expired reset token.' 
      });
    }

    res.json({ 
      valid: true,
      email: resetRecord.email,
      expiresAt: resetRecord.expires_at
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ 
      valid: false,
      message: 'An error occurred while verifying the token.' 
    });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  
  
  res.json({ message: 'Logout successful' });
});

module.exports = router;
