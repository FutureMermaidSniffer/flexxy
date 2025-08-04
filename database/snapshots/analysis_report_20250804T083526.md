# FlexJobs Database Analysis Report
Generated: 2025-08-04T08:35:34.234Z
Database: flexjobs_db

## Database Summary
- **Tables**: 13
- **Total Records**: 59

## Tables Overview
### agent_bookings
- **Columns**: 11
- **Records**: 0
- **Constraints**: 7
- **Indexes**: 3
- **Column Details**:
  - id: integer (not null)
  - agent_id: integer (not null)
  - client_id: integer (not null)
  - consultation_type: character varying (nullable)
  - status: character varying (nullable)
  - scheduled_at: timestamp without time zone (nullable)
  - duration_minutes: integer (nullable)
  - meeting_link: character varying (nullable)
  - notes: text (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)

### agent_reviews
- **Columns**: 8
- **Records**: 6
- **Constraints**: 11
- **Indexes**: 3
- **Column Details**:
  - id: integer (not null)
  - agent_id: integer (not null)
  - reviewer_id: integer (not null)
  - rating: integer (nullable)
  - review_text: text (nullable)
  - is_anonymous: boolean (nullable)
  - is_approved: boolean (nullable)
  - created_at: timestamp without time zone (nullable)

### agents
- **Columns**: 22
- **Records**: 9
- **Constraints**: 5
- **Indexes**: 5
- **Column Details**:
  - id: integer (not null)
  - user_id: integer (nullable)
  - agent_name: character varying (not null)
  - display_name: character varying (not null)
  - specializations: text (nullable)
  - bio: text (nullable)
  - avatar_url: character varying (nullable)
  - experience_years: integer (nullable)
  - rating: numeric (nullable)
  - total_reviews: integer (nullable)
  - currency: character varying (nullable)
  - languages: text (nullable)
  - skills: text (nullable)
  - certifications: text (nullable)
  - location: character varying (nullable)
  - timezone: character varying (nullable)
  - linkedin_url: character varying (nullable)
  - portfolio_url: character varying (nullable)
  - is_featured: boolean (nullable)
  - is_active: boolean (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)

### applications
- **Columns**: 9
- **Records**: 0
- **Constraints**: 11
- **Indexes**: 5
- **Column Details**:
  - id: integer (not null)
  - job_id: integer (not null)
  - user_id: integer (not null)
  - cover_letter: text (nullable)
  - resume_path: character varying (nullable)
  - status: character varying (nullable)
  - notes: text (nullable)
  - applied_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)

### categories
- **Columns**: 6
- **Records**: 12
- **Constraints**: 4
- **Indexes**: 2
- **Column Details**:
  - id: integer (not null)
  - name: character varying (not null)
  - description: text (nullable)
  - icon: character varying (nullable)
  - created_at: timestamp without time zone (nullable)
  - is_active: boolean (nullable)

### companies
- **Columns**: 14
- **Records**: 13
- **Constraints**: 5
- **Indexes**: 1
- **Column Details**:
  - id: integer (not null)
  - name: character varying (not null)
  - description: text (nullable)
  - website: character varying (nullable)
  - logo: character varying (nullable)
  - industry: character varying (nullable)
  - company_size: character varying (nullable)
  - location: character varying (nullable)
  - founded_year: integer (nullable)
  - user_id: integer (nullable)
  - is_verified: boolean (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)
  - logo_url: character varying (nullable)

### job_skills
- **Columns**: 4
- **Records**: 0
- **Constraints**: 5
- **Indexes**: 1
- **Column Details**:
  - id: integer (not null)
  - job_id: integer (not null)
  - skill_name: character varying (not null)
  - is_required: boolean (nullable)

### jobs
- **Columns**: 28
- **Records**: 8
- **Constraints**: 14
- **Indexes**: 11
- **Column Details**:
  - id: integer (not null)
  - title: character varying (not null)
  - description: text (not null)
  - requirements: text (nullable)
  - responsibilities: text (nullable)
  - company_id: integer (not null)
  - category_id: integer (nullable)
  - location: character varying (nullable)
  - job_type: character varying (nullable)
  - remote_type: character varying (nullable)
  - experience_level: character varying (nullable)
  - salary_min: numeric (nullable)
  - salary_max: numeric (nullable)
  - salary_currency: character varying (nullable)
  - benefits: text (nullable)
  - application_deadline: date (nullable)
  - is_active: boolean (nullable)
  - is_featured: boolean (nullable)
  - views_count: integer (nullable)
  - applications_count: integer (nullable)
  - created_by: integer (not null)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)
  - application_url: character varying (nullable)
  - contact_email: character varying (nullable)
  - status: character varying (nullable)
  - salary_type: character varying (nullable)
  - tags: text (nullable)

### password_reset_tokens
- **Columns**: 6
- **Records**: 0
- **Constraints**: 7
- **Indexes**: 5
- **Column Details**:
  - id: integer (not null)
  - user_id: integer (not null)
  - token: character varying (not null)
  - expires_at: timestamp without time zone (not null)
  - used: boolean (nullable)
  - created_at: timestamp without time zone (nullable)

### saved_jobs
- **Columns**: 4
- **Records**: 0
- **Constraints**: 10
- **Indexes**: 2
- **Column Details**:
  - id: integer (not null)
  - user_id: integer (not null)
  - job_id: integer (not null)
  - saved_at: timestamp without time zone (nullable)

### subscription_plans
- **Columns**: 11
- **Records**: 0
- **Constraints**: 5
- **Indexes**: 1
- **Column Details**:
  - id: integer (not null)
  - name: character varying (not null)
  - description: text (nullable)
  - price: numeric (not null)
  - billing_period: character varying (nullable)
  - features: text (nullable)
  - max_job_applications: integer (nullable)
  - max_agent_consultations: integer (nullable)
  - is_active: boolean (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)

### user_subscriptions
- **Columns**: 10
- **Records**: 0
- **Constraints**: 7
- **Indexes**: 3
- **Column Details**:
  - id: integer (not null)
  - user_id: integer (not null)
  - plan_id: integer (not null)
  - status: character varying (nullable)
  - starts_at: timestamp without time zone (nullable)
  - expires_at: timestamp without time zone (nullable)
  - auto_renew: boolean (nullable)
  - payment_method: character varying (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)

### users
- **Columns**: 32
- **Records**: 11
- **Constraints**: 11
- **Indexes**: 10
- **Column Details**:
  - id: integer (not null)
  - email: character varying (not null)
  - password: character varying (not null)
  - first_name: character varying (not null)
  - last_name: character varying (not null)
  - user_type: character varying (nullable)
  - phone: character varying (nullable)
  - bio: text (nullable)
  - skills: text (nullable)
  - experience_level: character varying (nullable)
  - location: character varying (nullable)
  - profile_image: character varying (nullable)
  - linkedin_url: character varying (nullable)
  - portfolio_url: character varying (nullable)
  - is_active: boolean (nullable)
  - email_verified: boolean (nullable)
  - created_at: timestamp without time zone (nullable)
  - updated_at: timestamp without time zone (nullable)
  - google_id: character varying (nullable)
  - apple_id: character varying (nullable)
  - avatar_url: text (nullable)
  - is_temp_account: boolean (nullable)
  - created_via_wizard: boolean (nullable)
  - work_type_preference: jsonb (nullable)
  - salary_preference: jsonb (nullable)
  - location_preference: jsonb (nullable)
  - job_preference: jsonb (nullable)
  - experience_level_preference: character varying (nullable)
  - education_level_preference: character varying (nullable)
  - benefit_preferences: jsonb (nullable)
  - wizard_completed_at: timestamp without time zone (nullable)
  - preferences_updated_at: timestamp without time zone (nullable)

