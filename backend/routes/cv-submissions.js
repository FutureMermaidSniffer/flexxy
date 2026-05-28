const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getOne, getMany, insertOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// ─── Source Detection ────────────────────────────────────────────────────────

/**
 * Normalise a raw hostname / origin string into one of:
 *   'flexjobs' | 'canadajobs' | 'other'
 */
function normalizeApplicationSource(raw) {
  if (!raw) return 'other';
  const s = raw.toLowerCase();
  if (s.includes('canadajobconnect') || s.includes('canadajobs') || s.includes('canada-jobs')) {
    return 'canadajobs';
  }
  if (s.includes('flexjobs') || s.includes('flexjobseu') || s.includes('flexxy')) {
    return 'flexjobs';
  }
  return 'other';
}

/**
 * Determine application source from (in priority order):
 *   1. Explicit form field  `application_source`
 *   2. Origin header
 *   3. Referer header
 *   4. X-Forwarded-Host header
 *   5. Host header
 */
function detectApplicationSource(req) {
  const candidates = [
    req.body?.application_source,
    req.get('Origin'),
    req.get('Referer'),
    req.get('X-Forwarded-Host'),
    req.get('Host'),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeApplicationSource(candidate);
    if (normalized !== 'other') return normalized;
  }

  // Try once more on the last candidate (Host) even if it resolves to 'other'
  return normalizeApplicationSource(req.get('Host')) || 'other';
}

// ─── File Upload ─────────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

// ─── POST /api/cv-submissions ─────────────────────────────────────────────────

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    const { name, email, phone, province, category } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !province || !category) {
      return res.status(400).json({
        message: 'All fields (name, email, phone, country, job category) are required.',
        type: 'error',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.', type: 'error' });
    }

    const application_source = detectApplicationSource(req);
    const cv_filename = req.file ? req.file.filename : null;

    const submissionData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      province: province.trim(),
      job_category: category.trim(),
      application_source,
      cv_filename,
      submitted_at: new Date(),
    };

    const submissionId = await insertOne('profile_submissions', submissionData);

    console.log(`📥 CV submission #${submissionId} from ${email} (source: ${application_source})`);

    res.status(201).json({
      message: 'Your CV has been submitted successfully! We will be in touch shortly.',
      type: 'success',
      submission_id: submissionId,
      source: application_source,
    });
  } catch (error) {
    console.error('CV submission error:', error);
    res.status(500).json({ message: 'Submission failed. Please try again.', type: 'error' });
  }
});

// ─── GET /api/cv-submissions (admin only) ─────────────────────────────────────

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const source = req.query.source || null; // 'flexjobs' | 'canadajobs' | 'other'

    let whereClause = source ? 'WHERE application_source = ?' : '';
    const params = source ? [source, limit, offset] : [limit, offset];

    const rows = await getMany(
      `SELECT * FROM profile_submissions ${whereClause} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
      params
    );

    const countRow = await getOne(
      `SELECT COUNT(*)::int AS total FROM profile_submissions ${whereClause}`,
      source ? [source] : []
    );

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: countRow?.total || 0,
        pages: Math.ceil((countRow?.total || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Fetch CV submissions error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
module.exports.normalizeApplicationSource = normalizeApplicationSource;
module.exports.detectApplicationSource = detectApplicationSource;
