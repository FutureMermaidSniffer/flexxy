const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, updateOne, insertOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules for profile update
const profileUpdateValidation = [
    body('first_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('First name must be between 1 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, apostrophes, and hyphens'),
    
    body('last_name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Last name must be between 1 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, apostrophes, and hyphens'),
    
    body('phone')
        .optional({ nullable: true, checkFalsy: true })
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('location')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Location is required and must be less than 255 characters'),
    
    body('work_eligibility')
        .isIn(['authorized_to_work', 'visa_required', 'student_visa', 'over_18'])
        .withMessage('Please select a valid work eligibility status'),
    
    body('experience_level')
        .isIn(['entry', 'mid', 'senior', 'executive'])
        .withMessage('Please select a valid experience level'),
    
    body('job_preference')
        .custom((value) => {
            try {
                const parsed = JSON.parse(value);
                if (!parsed.role_type) {
                    throw new Error('Role type is required in job preferences');
                }
                if (!parsed.employment_types || !Array.isArray(parsed.employment_types) || parsed.employment_types.length === 0) {
                    throw new Error('At least one employment type must be selected');
                }
                return true;
            } catch (error) {
                throw new Error('Invalid job preference format');
            }
        }),
    
    body('data_processing_consent')
        .equals('true')
        .withMessage('You must consent to data processing'),
    
    body('job_alerts_consent')
        .optional()
        .isBoolean()
        .withMessage('Job alerts consent must be a boolean value'),
    
    body('marketing_consent')
        .optional()
        .isBoolean()
        .withMessage('Marketing consent must be a boolean value')
];

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await getOne(
            'SELECT id, email, first_name, last_name, phone, location, bio, experience_level, job_preference, work_type_preference, created_at, updated_at FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                type: 'error'
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Failed to fetch profile',
            type: 'error'
        });
    }
});

// Update user profile
router.put('/update-profile', authenticateToken, profileUpdateValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array(),
                type: 'error'
            });
        }

        const userId = req.user.userId;
        const {
            first_name,
            last_name,
            phone,
            location,
            work_eligibility,
            experience_level,
            job_preference,
            bio,
            data_processing_consent,
            job_alerts_consent,
            marketing_consent,
            resume_path,
            selected_agent_id
        } = req.body;

        // Verify user exists
        const existingUser = await getOne(
            'SELECT id, email FROM users WHERE id = ?',
            [userId]
        );

        if (!existingUser) {
            return res.status(404).json({
                message: 'User not found',
                type: 'error'
            });
        }

        // Parse job preferences
        let parsedJobPreference;
        try {
            parsedJobPreference = JSON.parse(job_preference);
        } catch (error) {
            return res.status(400).json({
                message: 'Invalid job preference format',
                type: 'error'
            });
        }

        // Prepare update data
        const updateData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            phone: phone || null,
            location: location.trim(),
            bio: bio || `Work Eligibility: ${work_eligibility}`,
            experience_level,
            job_preference,
            work_type_preference: JSON.stringify({
                employment_types: parsedJobPreference.employment_types
            }),
            selected_agent_id: selected_agent_id || null,
            updated_at: new Date()
        };

        // Add resume path if provided
        if (resume_path) {
            updateData.resume_path = resume_path;
        }

        // Update user profile
        await updateOne('users', updateData, 'id = ?', [userId]);

        // Handle newsletter subscription based on consent
        if (job_alerts_consent) {
            try {
                // Check if subscription already exists
                const existingSubscription = await getOne(
                    'SELECT id FROM newsletter_subscriptions WHERE email = ? AND user_id = ?',
                    [existingUser.email, userId]
                );

                if (!existingSubscription) {
                    await insertOne('newsletter_subscriptions', {
                        email: existingUser.email,
                        user_id: userId,
                        subscription_type: 'job_alerts',
                        source_page: 'profile_form',
                        is_active: true,
                        subscribed_at: new Date()
                    });
                } else {
                    // Reactivate if it was deactivated
                    await updateOne(
                        'newsletter_subscriptions',
                        { is_active: true, subscribed_at: new Date() },
                        'id = ?',
                        [existingSubscription.id]
                    );
                }
            } catch (subscriptionError) {
                console.error('Newsletter subscription error:', subscriptionError);
                // Don't fail the profile update if newsletter subscription fails
            }
        }

        // Log profile update
        console.log(`Profile updated for user ${userId} (${existingUser.email})`);

        // Get updated user data
        const updatedUser = await getOne(
            'SELECT id, email, first_name, last_name, phone, location, bio, experience_level, job_preference, work_type_preference, updated_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            type: 'success',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        
        res.status(500).json({
            message: 'Profile update failed. Please try again.',
            type: 'error'
        });
    }
});

// Update specific profile fields (for partial updates)
router.patch('/update-field', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { field, value } = req.body;

        // Define allowed fields for partial updates
        const allowedFields = [
            'phone', 'location', 'bio', 'experience_level', 
            'job_preference', 'work_type_preference'
        ];

        if (!allowedFields.includes(field)) {
            return res.status(400).json({
                message: 'Invalid field for update',
                type: 'error'
            });
        }

        // Prepare update data
        const updateData = {
            [field]: value,
            updated_at: new Date()
        };

        // Update the specific field
        await updateOne('users', updateData, 'id = ?', [userId]);

        res.json({
            message: `${field} updated successfully`,
            type: 'success'
        });

    } catch (error) {
        console.error('Field update error:', error);
        res.status(500).json({
            message: 'Field update failed',
            type: 'error'
        });
    }
});

// Get user preferences for job matching
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await getOne(
            'SELECT job_preference, work_type_preference, salary_preference, location_preference, benefit_preferences FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                type: 'error'
            });
        }

        // Parse JSON preferences
        const preferences = {
            job_preference: user.job_preference ? JSON.parse(user.job_preference) : null,
            work_type_preference: user.work_type_preference ? JSON.parse(user.work_type_preference) : null,
            salary_preference: user.salary_preference ? JSON.parse(user.salary_preference) : null,
            location_preference: user.location_preference ? JSON.parse(user.location_preference) : null,
            benefit_preferences: user.benefit_preferences ? JSON.parse(user.benefit_preferences) : null
        };

        res.json({
            preferences,
            type: 'success'
        });

    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            message: 'Failed to fetch preferences',
            type: 'error'
        });
    }
});

// Standalone profile form submission (for new users)
router.post('/profile-form', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            location,
            work_eligibility,
            experience_level,
            job_preference,
            bio,
            data_processing_consent,
            job_alerts_consent,
            marketing_consent,
            resume_path,
            selected_agent_id
        } = req.body;

        // Basic validation for required fields
        if (!first_name || !last_name || !email || !location || !work_eligibility || !experience_level) {
            return res.status(400).json({
                message: 'Please fill in all required fields (first name, last name, email, location, work eligibility, experience level)',
                type: 'error'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please provide a valid email address',
                type: 'error'
            });
        }

        // Check if user with this email already exists in profile submissions
        const existingSubmission = await getOne(
            'SELECT id, email FROM profile_submissions WHERE email = ?',
            [email]
        );

        if (existingSubmission) {
            return res.status(400).json({
                message: 'A profile submission with this email already exists.',
                type: 'error'
            });
        }

        // Parse job preferences - frontend sends it as JSON string
        let parsedJobPreference = {};
        let employmentTypesArray = [];
        
        if (job_preference) {
            try {
                // Frontend sends job_preference as JSON string, so parse it
                parsedJobPreference = JSON.parse(job_preference);
                employmentTypesArray = parsedJobPreference.employment_types || [];
            } catch (error) {
                console.log('Job preference parsing error, using defaults:', error);
                parsedJobPreference = {
                    role_type: '',
                    industry: null,
                    employment_types: []
                };
                employmentTypesArray = [];
            }
        } else {
            // Default values if no job_preference provided
            parsedJobPreference = {
                role_type: '',
                industry: null,
                employment_types: []
            };
            employmentTypesArray = [];
        }

        // Create new profile submission record
        const submissionData = {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone || null,
            location: location.trim(),
            work_eligibility,
            experience_level,
            role_type: parsedJobPreference.role_type || null,
            industry: parsedJobPreference.industry || null,
            employment_types: employmentTypesArray, // Store as array directly since it's JSONB
            job_preference: job_preference, // Store the original JSON string from frontend
            bio: bio || `Work Eligibility: ${work_eligibility}`,
            data_processing_consent: !!data_processing_consent,
            job_alerts_consent: !!job_alerts_consent,
            marketing_consent: !!marketing_consent,
            selected_agent_id: selected_agent_id || null,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };

        // Insert new profile submission
        const submissionId = await insertOne('profile_submissions', submissionData);

        // Handle newsletter subscription based on consent (optional)
        if (job_alerts_consent) {
            try {
                // Check if newsletter_subscriptions table exists
                const tableExists = await getOne(
                    "SELECT table_name FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions'"
                );
                
                if (tableExists) {
                    await insertOne('newsletter_subscriptions', {
                        email: email.trim().toLowerCase(),
                        submission_id: submissionId,
                        subscription_type: 'job_alerts',
                        source_page: 'profile_form',
                        subscribed_at: new Date()
                    });
                }
            } catch (subscriptionError) {
                console.error('Newsletter subscription error (non-critical):', subscriptionError);
                // Don't fail the profile submission if newsletter subscription fails
            }
        }

        // Log profile submission
        console.log(`New profile form submitted by ${email} (Submission ID: ${submissionId})`);

        res.status(201).json({
            message: 'Profile submitted successfully! We will review your information and contact you soon.',
            type: 'success',
            submission_id: submissionId
        });

    } catch (error) {
        console.error('Profile form submission error:', error);
        
        res.status(500).json({
            message: 'Profile submission failed. Please try again.',
            type: 'error'
        });
    }
});

module.exports = router;
