const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
});

// File filter for resumes
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file at a time
    }
});

const agentImageDir = path.join(__dirname, '../../uploads/agents');
if (!fs.existsSync(agentImageDir)) {
    fs.mkdirSync(agentImageDir, { recursive: true });
}

const agentImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, agentImageDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomBytes(12).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
        cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
});

const agentImageUpload = multer({
    storage: agentImageStorage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid image type. Use JPG, PNG, WEBP, or GIF.'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

router.post('/agent-image', authenticateToken, requireAdmin, agentImageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No image uploaded',
                type: 'error'
            });
        }
        const filePath = `/uploads/agents/${req.file.filename}`;
        res.json({
            message: 'Agent image uploaded',
            filePath,
            originalName: req.file.originalname,
            size: req.file.size,
            type: 'success'
        });
    } catch (error) {
        console.error('Agent image upload error:', error);
        res.status(500).json({
            message: 'Image upload failed',
            type: 'error'
        });
    }
});

// Resume upload endpoint
router.post('/resume', upload.single('resume'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded',
                type: 'error'
            });
        }

        const filePath = `/uploads/resumes/${req.file.filename}`;
        
        console.log('File uploaded successfully:', {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            path: filePath
        });

        res.json({
            message: 'Resume uploaded successfully',
            filePath: filePath,
            originalName: req.file.originalname,
            size: req.file.size,
            type: 'success'
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            message: 'File upload failed',
            type: 'error'
        });
    }
});

// Profile image upload endpoint
router.post('/profile-image', authenticateToken, upload.single('profile_image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded',
                type: 'error'
            });
        }

        const filePath = `/uploads/resumes/${req.file.filename}`;
        
        res.json({
            message: 'Profile image uploaded successfully',
            filePath: filePath,
            originalName: req.file.originalname,
            size: req.file.size,
            type: 'success'
        });

    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({
            message: 'File upload failed',
            type: 'error'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.',
                type: 'error'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files. Only one file allowed.',
                type: 'error'
            });
        }
    }
    
    if (error.message && error.message.startsWith('Invalid')) {
        return res.status(400).json({
            message: error.message,
            type: 'error'
        });
    }
    
    res.status(500).json({
        message: 'Upload failed',
        type: 'error'
    });
});

module.exports = router;
