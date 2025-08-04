-- FlexJobs Database Schema Snapshot
-- Generated: 2025-08-04T08:35:29.581Z
-- Source: flexjobs_db on localhost

-- Table: agent_bookings
CREATE TABLE agent_bookings (
  id SERIAL,
  agent_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  consultation_type VARCHAR(50) DEFAULT 'general'::character varying,
  status VARCHAR(20) DEFAULT 'pending'::character varying,
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: agent_reviews
CREATE TABLE agent_reviews (
  id SERIAL,
  agent_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  rating INTEGER,
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (reviewer_id),
  UNIQUE (reviewer_id),
  UNIQUE (agent_id),
  UNIQUE (agent_id),
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: agents
CREATE TABLE agents (
  id SERIAL,
  user_id INTEGER,
  agent_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  specializations TEXT,
  bio TEXT,
  avatar_url VARCHAR(255),
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD'::character varying,
  languages TEXT,
  skills TEXT,
  certifications TEXT,
  location VARCHAR(255),
  timezone VARCHAR(50),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: applications
CREATE TABLE applications (
  id SERIAL,
  job_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cover_letter TEXT,
  resume_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending'::character varying,
  notes TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (user_id),
  UNIQUE (user_id),
  UNIQUE (job_id),
  UNIQUE (job_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: categories
CREATE TABLE categories (
  id SERIAL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN,
  PRIMARY KEY (id),
  UNIQUE (name)
);

-- Table: companies
CREATE TABLE companies (
  id SERIAL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  logo VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(20) DEFAULT '1-10'::character varying,
  location VARCHAR(255),
  founded_year INTEGER,
  user_id INTEGER,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logo_url VARCHAR(100),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: job_skills
CREATE TABLE job_skills (
  id SERIAL,
  job_id INTEGER NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  PRIMARY KEY (id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Table: jobs
CREATE TABLE jobs (
  id SERIAL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  company_id INTEGER NOT NULL,
  category_id INTEGER,
  location VARCHAR(255),
  job_type VARCHAR(20) DEFAULT 'full-time'::character varying,
  remote_type VARCHAR(20) DEFAULT 'remote'::character varying,
  experience_level VARCHAR(20) DEFAULT 'entry'::character varying,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  salary_currency VARCHAR(3) DEFAULT 'USD'::character varying,
  benefits TEXT,
  application_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  application_url VARCHAR(500),
  contact_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active'::character varying,
  salary_type VARCHAR(20) DEFAULT 'yearly'::character varying,
  tags TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: password_reset_tokens
CREATE TABLE password_reset_tokens (
  id SERIAL,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: saved_jobs
CREATE TABLE saved_jobs (
  id SERIAL,
  user_id INTEGER NOT NULL,
  job_id INTEGER NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (job_id),
  UNIQUE (job_id),
  UNIQUE (user_id),
  UNIQUE (user_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: subscription_plans
CREATE TABLE subscription_plans (
  id SERIAL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period VARCHAR(20) DEFAULT 'monthly'::character varying,
  features TEXT,
  max_job_applications INTEGER DEFAULT '-1'::integer,
  max_agent_consultations INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Table: user_subscriptions
CREATE TABLE user_subscriptions (
  id SERIAL,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active'::character varying,
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: users
CREATE TABLE users (
  id SERIAL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) DEFAULT 'job_seeker'::character varying,
  phone VARCHAR(20),
  bio TEXT,
  skills TEXT,
  experience_level VARCHAR(20) DEFAULT 'entry'::character varying,
  location VARCHAR(255),
  profile_image VARCHAR(255),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  google_id VARCHAR(255),
  apple_id VARCHAR(255),
  avatar_url TEXT,
  is_temp_account BOOLEAN DEFAULT false,
  created_via_wizard BOOLEAN DEFAULT false,
  work_type_preference JSONB,
  salary_preference JSONB,
  location_preference JSONB,
  job_preference JSONB,
  experience_level_preference VARCHAR(100),
  education_level_preference VARCHAR(100),
  benefit_preferences JSONB,
  wizard_completed_at TIMESTAMP,
  preferences_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (apple_id),
  UNIQUE (email),
  UNIQUE (google_id)
);

-- Indexes
CREATE INDEX idx_agent_bookings_scheduled ON public.agent_bookings USING btree (scheduled_at);
CREATE INDEX idx_agent_bookings_status ON public.agent_bookings USING btree (status);
CREATE INDEX idx_agent_reviews_rating ON public.agent_reviews USING btree (rating);
CREATE INDEX idx_agents_active ON public.agents USING btree (is_active);
CREATE INDEX idx_agents_featured ON public.agents USING btree (is_featured);
CREATE INDEX idx_agents_rating ON public.agents USING btree (rating);
CREATE INDEX idx_agents_specializations ON public.agents USING gin (to_tsvector('english'::regconfig, specializations));
CREATE INDEX idx_applications_job ON public.applications USING btree (job_id);
CREATE INDEX idx_applications_status ON public.applications USING btree (status);
CREATE INDEX idx_applications_user ON public.applications USING btree (user_id);
CREATE INDEX idx_jobs_active ON public.jobs USING btree (is_active);
CREATE INDEX idx_jobs_application_url ON public.jobs USING btree (application_url) WHERE (application_url IS NOT NULL);
CREATE INDEX idx_jobs_contact_email ON public.jobs USING btree (contact_email) WHERE (contact_email IS NOT NULL);
CREATE INDEX idx_jobs_created_at ON public.jobs USING btree (created_at);
CREATE INDEX idx_jobs_featured ON public.jobs USING btree (is_featured);
CREATE INDEX idx_jobs_job_type ON public.jobs USING btree (job_type);
CREATE INDEX idx_jobs_location ON public.jobs USING btree (location);
CREATE INDEX idx_jobs_remote_type ON public.jobs USING btree (remote_type);
CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);
CREATE INDEX idx_jobs_type ON public.jobs USING btree (job_type);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);
CREATE INDEX idx_user_subscriptions_expires ON public.user_subscriptions USING btree (expires_at);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);
CREATE INDEX idx_users_apple_id ON public.users USING btree (apple_id);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);
CREATE INDEX idx_users_temp_account ON public.users USING btree (is_temp_account);
CREATE INDEX idx_users_type ON public.users USING btree (user_type);
CREATE INDEX idx_users_wizard_created ON public.users USING btree (created_via_wizard);
