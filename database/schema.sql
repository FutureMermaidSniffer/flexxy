-- FlexJobs Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS flexjobs_db;
USE flexjobs_db;

-- Users table (both job seekers and employers)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('job_seeker', 'employer', 'admin') DEFAULT 'job_seeker',
    phone VARCHAR(20),
    bio TEXT,
    skills TEXT,
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'entry',
    location VARCHAR(255),
    profile_image VARCHAR(255),
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(255),
    industry VARCHAR(100),
    company_size ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+') DEFAULT '1-10',
    location VARCHAR(255),
    founded_year YEAR,
    user_id INT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    company_id INT NOT NULL,
    category_id INT,
    location VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship') DEFAULT 'full-time',
    remote_type ENUM('remote', 'hybrid', 'on-site') DEFAULT 'remote',
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'entry',
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    benefits TEXT,
    application_url VARCHAR(500),
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (location),
    INDEX idx_job_type (job_type),
    INDEX idx_remote_type (remote_type),
    INDEX idx_created_at (created_at)
);

-- Job Applications table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cover_letter TEXT,
    resume_path VARCHAR(255),
    status ENUM('pending', 'reviewed', 'interviewed', 'hired', 'rejected') DEFAULT 'pending',
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
);

-- Saved Jobs table
CREATE TABLE saved_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_job (user_id, job_id)
);

-- Job Skills table (many-to-many relationship)
CREATE TABLE job_skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
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
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_featured ON jobs(is_featured);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);
