-- Migration: Add application_url field to jobs table (PostgreSQL)
-- This field will store external URLs where users can apply for jobs

-- Add application_url column to jobs table
ALTER TABLE jobs 
ADD COLUMN application_url VARCHAR(500);

-- Update existing jobs with sample external application URLs
-- You can modify these URLs to point to actual job application pages
UPDATE jobs SET 
    application_url = CASE 
        WHEN id = 1 THEN 'https://careers.techcorp.com/jobs/senior-developer'
        WHEN id = 2 THEN 'https://jobs.designstudio.com/apply/ui-ux-designer'
        WHEN id = 3 THEN 'https://apply.marketingfirm.com/digital-marketing-specialist'
        WHEN id = 4 THEN 'https://careers.datacompany.com/data-scientist-position'
        WHEN id = 5 THEN 'https://jobs.projectmanager.com/apply/project-manager'
        WHEN id = 6 THEN 'https://apply.contentagency.com/content-writer'
        WHEN id = 7 THEN 'https://careers.salesforce.com/apply/sales-manager'
        WHEN id = 8 THEN 'https://jobs.hrfirm.com/hr-specialist-remote'
        ELSE 'https://example-company.com/apply/' || id::text
    END
WHERE id IS NOT NULL;

-- For any new jobs without application_url, you can leave it NULL
-- and handle it in the frontend to show an internal application form

SELECT 'Migration completed: application_url field added to jobs table' as status;
