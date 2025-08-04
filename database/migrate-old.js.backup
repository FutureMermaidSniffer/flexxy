#!/usr/bin/env node



const { Client } = require('pg');
require('dotenv').config();


const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'postgres' 
};

const targetDatabase = process.env.DB_NAME || 'flexjobs_db';

console.log('🚀 Starting FlexJobs PostgreSQL Migration...\n');

async function runMigration() {
  let client;
  
  try {
    
    console.log('📡 Connecting to PostgreSQL server...');
    client = new Client(dbConfig);
    await client.connect();
    console.log('✅ Connected to PostgreSQL server\n');

    
    console.log(`🗄️  Creating database '${targetDatabase}'...`);
    try {
      await client.query(`CREATE DATABASE ${targetDatabase}`);
      console.log(`✅ Database '${targetDatabase}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') { 
        console.log(`ℹ️  Database '${targetDatabase}' already exists`);
      } else {
        throw error;
      }
    }

    
    await client.end();

    
    console.log(`\n🔗 Connecting to database '${targetDatabase}'...`);
    client = new Client({ ...dbConfig, database: targetDatabase });
    await client.connect();
    console.log(`✅ Connected to '${targetDatabase}'\n`);

    
    console.log('📋 Creating tables...');
    
    
    console.log('  • Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        user_type VARCHAR(20) CHECK (user_type IN ('job_seeker', 'employer', 'admin')) DEFAULT 'job_seeker',
        phone VARCHAR(20),
        bio TEXT,
        skills TEXT,
        experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')) DEFAULT 'entry',
        location VARCHAR(255),
        profile_image VARCHAR(255),
        linkedin_url VARCHAR(255),
        portfolio_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    
    console.log('  • Creating companies table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website VARCHAR(255),
        logo VARCHAR(255),
        industry VARCHAR(100),
        company_size VARCHAR(20) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')) DEFAULT '1-10',
        location VARCHAR(255),
        founded_year INTEGER,
        user_id INTEGER,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    
    console.log('  • Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    
    console.log('  • Creating jobs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        responsibilities TEXT,
        company_id INTEGER NOT NULL,
        category_id INTEGER,
        location VARCHAR(255),
        job_type VARCHAR(20) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')) DEFAULT 'full-time',
        remote_type VARCHAR(20) CHECK (remote_type IN ('remote', 'hybrid', 'on-site')) DEFAULT 'remote',
        experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')) DEFAULT 'entry',
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
      )
    `);

    
    console.log('  • Creating applications table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        cover_letter TEXT,
        resume_path VARCHAR(255),
        status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'interviewed', 'hired', 'rejected')) DEFAULT 'pending',
        notes TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (job_id, user_id)
      )
    `);

    
    console.log('  • Creating saved_jobs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE (user_id, job_id)
      )
    `);

    
    console.log('  • Creating job_skills table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_skills (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully\n');

    
    console.log('🔍 Creating indexes for better performance...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON jobs(remote_type)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)',
      'CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Indexes created successfully\n');

    
    console.log('📦 Inserting sample categories...');
    const categories = [
      ['Technology', 'Software development, IT, and tech-related jobs', 'fa-laptop-code'],
      ['Marketing', 'Digital marketing, content, and advertising roles', 'fa-bullhorn'],
      ['Design', 'UI/UX, graphic design, and creative positions', 'fa-paint-brush'],
      ['Sales', 'Sales representatives, account managers, and business development', 'fa-chart-line'],
      ['Customer Service', 'Support, customer success, and service roles', 'fa-headset'],
      ['Finance', 'Accounting, financial analysis, and bookkeeping', 'fa-calculator'],
      ['Writing', 'Content writing, copywriting, and editorial roles', 'fa-pen'],
      ['Education', 'Teaching, training, and educational content creation', 'fa-graduation-cap'],
      ['Healthcare', 'Medical, nursing, and healthcare administration', 'fa-stethoscope'],
      ['Project Management', 'Project managers, coordinators, and operations', 'fa-tasks']
    ];

    for (const [name, description, icon] of categories) {
      await client.query(
        'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [name, description, icon]
      );
    }
    console.log('✅ Sample categories inserted successfully\n');

    
    console.log('⚡ Creating timestamp update triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    
    const tablesWithUpdatedAt = ['users', 'companies', 'jobs', 'applications'];
    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      `);
    }
    console.log('✅ Triggers created successfully\n');

    console.log('🎉 Migration completed successfully!');
    console.log(`\n📊 Database Summary:`);
    console.log(`   • Database: ${targetDatabase}`);
    console.log(`   • Tables: 6 core tables created`);
    console.log(`   • Indexes: 11 performance indexes created`);
    console.log(`   • Categories: 10 job categories inserted`);
    console.log(`   • Triggers: Auto-update timestamps enabled`);
    console.log(`\n🚀 You can now start the FlexJobs application!`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('   • PostgreSQL is running');
    console.error('   • Database credentials are correct in .env file');
    console.error('   • User has permission to create databases');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}


runMigration();
