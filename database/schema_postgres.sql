-- FlexJobs Database Schema for PostgreSQL
-- Run this script to create the database and tables

-- Users table (both job seekers and employers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'job_seeker' CHECK (user_type IN ('job_seeker', 'employer', 'admin')),
    phone VARCHAR(20),
    bio TEXT,
    skills TEXT,
    experience_level VARCHAR(20) DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    location VARCHAR(255),
    profile_image VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(20) DEFAULT '1-10' CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    location VARCHAR(255),
    founded_year INTEGER,
    user_id INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    company_id INTEGER NOT NULL,
    category_id INTEGER,
    location VARCHAR(255),
    job_type VARCHAR(20) DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    remote_type VARCHAR(20) DEFAULT 'remote' CHECK (remote_type IN ('remote', 'hybrid', 'on-site')),
    experience_level VARCHAR(20) DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    benefits TEXT,
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Job Applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    cover_letter TEXT,
    resume_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interviewed', 'hired', 'rejected')),
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (job_id, user_id)
);

-- Saved Jobs table
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE (user_id, job_id)
);

-- Job Skills table (many-to-many relationship)
CREATE TABLE job_skills (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO categories (name, description, icon) VALUES
('Technology', 'Software development, IT, and tech-related jobs', 'fa-laptop-code'),
('Marketing', 'Digital marketing, content, and advertising roles', 'fa-bullhorn'),
('Design', 'UI/UX, graphic design, and creative positions', 'fa-paint-brush'),
('Sales', 'Sales representatives, account managers, and business development', 'fa-chart-line'),
('Customer Service', 'Support, customer success, and service roles', 'fa-headset'),
('Finance', 'Accounting, financial analysis, and bookkeeping', 'fa-calculator'),
('Writing', 'Content writing, copywriting, and editorial roles', 'fa-pen'),
('Education', 'Teaching, training, and educational content creation', 'fa-graduation-cap'),
('Healthcare', 'Medical, nursing, and healthcare administration', 'fa-stethoscope'),
('Project Management', 'Project managers, coordinators, and operations', 'fa-tasks');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_featured ON jobs(is_featured);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
