# Application Source Differentiation — Unified Implementation

## Overview
Unified implementation for differentiating CV/profile submissions between **FlexJobs** and **CanadaJobs** using a single shared database table: `profile_submissions`.

## Architecture

### Table: `profile_submissions`
```sql
CREATE TABLE profile_submissions (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(50)     NOT NULL,           -- Now required
    province        VARCHAR(100)    NOT NULL,           -- Renamed to "Country" in UI
    job_category    VARCHAR(100)    NOT NULL,
    application_source VARCHAR(30)  NOT NULL DEFAULT 'other',  -- New: canadajobs|flexjobs|other
    cv_filename     VARCHAR(255),
    submitted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
- `idx_profile_submissions_email` — for fast lookups by email
- `idx_profile_submissions_province` — for geographic analysis
- `idx_profile_submissions_source` — for filtering by application source
- `idx_profile_submissions_submitted` — for sorting/time-range queries

---

## Source Detection Flow

### Backend: `backend/routes/cv-submissions.js`

#### Detection Strategy
1. **Explicit source** from form `application_source` field (hostname)
2. **Header-based fallback**:
   - `Origin` header
   - `Referer` header  
   - `X-Forwarded-Host` header
   - `Host` header
3. **Normalization** (case-insensitive):
   - `flexjobs` → `flexjobs`
   - `canadajobconnect|canadajobs|canada-jobs` → `canadajobs`
   - Everything else → `other`

#### Request Handling
```javascript
POST /api/cv-submissions
{
  "name": "...",
  "email": "...",
  "phone": "...",           // Now required
  "province": "...",        // Country value
  "category": "...",
  "application_source": "canadajobconnect.com"  // Auto-sent by frontend
}
```

#### Email Notification
Admin receives email with `Source` row showing which platform submission came from.

---

## Frontend Integration

### All CV Modal Forms Send Source
- **[frontend/index.html](frontend/index.html)** — Index page CV modal
- **[frontend/browse-jobs.html](frontend/browse-jobs.html)** — Browse jobs page CV modal
- **[frontend/job-details.html](frontend/job-details.html)** — Job details page CV modal

**Mechanism:**
```javascript
formData.append('application_source', window.location.hostname || 'unknown');
```

**Examples:**
- `canadajobconnect.com` → detected as `canadajobs`
- `flexjobs.com` → detected as `flexjobs`
- Custom hostname → falls back to header detection

---

## Migration & Backfilling

### Script: `scripts/differentiate-application-sources.js`

**Run with:**
```bash
npm run cv:source:migrate
```

**What it does:**
1. Checks if `profile_submissions` table exists
2. Creates it if missing (includes all columns + indexes)
3. Adds `application_source` column if missing
4. **Backfills existing rows as `flexjobs`** (assumes historical data is FlexJobs)
5. Prints source breakdown for verification

**Edit backfill rule** if your historical data came from CanadaJobs:
```javascript
// Change from 'flexjobs' to 'canadajobs'
UPDATE profile_submissions
SET application_source = 'canadajobs'
WHERE application_source IS NULL OR application_source = '' OR application_source = 'other';
```

---

## Admin Usage

### View All Submissions
```bash
curl -H "Authorization: Bearer <admin-token>" https://yoursite.com/api/cv-submissions
```

**Response includes:**
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 416 555 1234",
  "province": "Ontario",
  "job_category": "Technology & IT",
  "application_source": "canadajobs",
  "cv_filename": "1234567890-resume.pdf",
  "submitted_at": "2026-05-28T15:30:00Z"
}
```

### Filter by Source
```sql
-- All FlexJobs submissions
SELECT * FROM profile_submissions WHERE application_source = 'flexjobs';

-- All CanadaJobs submissions
SELECT * FROM profile_submissions WHERE application_source = 'canadajobs';

-- Source breakdown
SELECT application_source, COUNT(*) as total
FROM profile_submissions
GROUP BY application_source
ORDER BY total DESC;
```

---

## Unification Summary

| Component | Before | After |
|-----------|--------|-------|
| Table name | `cv_submissions` | `profile_submissions` |
| Column: source | Not in schema | Added as `application_source` |
| Phone field | Optional | **Required** |
| Province label | "Province / Territory" | **"Country"** |
| Detection logic | Basic (only form) | Robust (form + headers) |
| Backfill default | canadajobs | **flexjobs** (configurable) |
| Migration tool | Standalone | Unified + table auto-creation |

---

## Files Modified

1. **[backend/routes/cv-submissions.js](backend/routes/cv-submissions.js)**
   - Added `normalizeApplicationSource()` & `detectApplicationSource()`
   - Updated INSERT/SELECT to use `profile_submissions` table
   - Added source field to admin email notification

2. **[create-cv-submissions-table.sql](create-cv-submissions-table.sql)**
   - Renamed table to `profile_submissions`
   - Made phone NOT NULL
   - Added `application_source` column with index

3. **[scripts/differentiate-application-sources.js](scripts/differentiate-application-sources.js)**
   - Unified single script (replaces old approach)
   - Auto-creates table if missing
   - Backfills as `flexjobs` by default
   - Includes source normalization logic

4. **[frontend/index.html](frontend/index.html), [browse-jobs.html](frontend/browse-jobs.html), [job-details.html](frontend/job-details.html)**
   - All CV forms send `application_source` as hostname

5. **[package.json](package.json)**
   - Added npm script: `npm run cv:source:migrate`

---

## Deployment Steps

1. **Backup your database** (if existing data)
   ```bash
   pg_dump -U postgres canadajobconnect_db > backup.sql
   ```

2. **Run migration**
   ```bash
   npm run cv:source:migrate
   ```

3. **Verify** application sources are tagged correctly
   ```sql
   SELECT application_source, COUNT(*) FROM profile_submissions GROUP BY application_source;
   ```

4. **Deploy frontend** changes (hostname auto-detection will kick in)

---

## Notes

- **Backward compatible**: Existing submissions without source get tagged as `flexjobs` (configurable)
- **Automatic detection**: No manual tagging needed for new submissions—hostname is auto-detected
- **Extensible**: Easy to add more site names to normalization logic
- **Auditable**: Every submission has source + timestamp for full attribution trail
