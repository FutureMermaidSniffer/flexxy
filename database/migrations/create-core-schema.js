/**
 * Core Database Schema Migration for FlexJob.UK
 * Creates all essential tables for the application
 */

const { Client } = require('pg');
require('dotenv').config();

async function createCoreSchema() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'flexjobs_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        console.log('🏗️  Creating core database schema...');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                phone VARCHAR(20),
                location VARCHAR(255),
                bio TEXT,
                experience_level VARCHAR(50),
                job_preference JSONB,
                work_type_preference JSONB,
                user_type VARCHAR(20) DEFAULT 'job_seeker',
                is_verified BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Create companies table
        await client.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                website VARCHAR(255),
                logo_url VARCHAR(500),
                industry VARCHAR(100),
                company_size VARCHAR(50),
                location VARCHAR(255),
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Companies table created');

        // Create categories table
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Categories table created');

        // Create jobs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                salary_currency VARCHAR(3) DEFAULT 'GBP',
                employment_type VARCHAR(50) NOT NULL,
                experience_level VARCHAR(50),
                location VARCHAR(255),
                is_remote BOOLEAN DEFAULT false,
                is_featured BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                expires_at TIMESTAMP,
                category_id INTEGER REFERENCES categories(id),
                company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Jobs table created');

        // Create applications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                cover_letter TEXT,
                resume_path VARCHAR(500),
                status VARCHAR(50) DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(job_id, user_id)
            )
        `);
        console.log('✅ Applications table created');

        // Create saved_jobs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id)
            )
        `);
        console.log('✅ Saved jobs table created');

        // Create admin_users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                is_active BOOLEAN DEFAULT true,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admin users table created');

        // Create newsletter_subscriptions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                subscription_type VARCHAR(50) DEFAULT 'general',
                source_page VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP
            )
        `);
        console.log('✅ Newsletter subscriptions table created');

        // Create indexes for performance
        console.log('🔍 Creating indexes...');

        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)');

        console.log('✅ Indexes created');

        // Insert default categories
        console.log('📋 Inserting default categories...');

        const defaultCategories = [
            ['Technology', 'technology', 'Software development, IT, and tech roles'],
            ['Marketing', 'marketing', 'Digital marketing, content, and advertising'],
            ['Sales', 'sales', 'Sales representatives and business development'],
            ['Customer Service', 'customer-service', 'Customer support and service roles'],
            ['Design', 'design', 'Graphic design, UI/UX, and creative roles'],
            ['Writing', 'writing', 'Content writing, copywriting, and editorial'],
            ['Finance', 'finance', 'Accounting, financial analysis, and banking'],
            ['HR', 'hr', 'Human resources and recruiting'],
            ['Operations', 'operations', 'Business operations and management'],
            ['Education', 'education', 'Teaching, training, and educational roles']
        ];

        for (const [name, slug, description] of defaultCategories) {
            await client.query(`
                INSERT INTO categories (name, slug, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO NOTHING
            `, [name, slug, description]);
        }

        console.log('✅ Default categories inserted');

        // Create default admin user (password: admin123)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await client.query(`
            INSERT INTO admin_users (username, email, password, role)
            VALUES ('admin', 'admin@flexjob.uk', $1, 'super_admin')
            ON CONFLICT (username) DO NOTHING
        `, [hashedPassword]);

        console.log('✅ Default admin user created (username: admin, password: admin123)');

        // Show final table count
        const tableCount = await client.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log(`\n🎉 Core schema creation completed!`);
        console.log(`📊 Total tables created: ${tableCount.rows[0].count}`);
        
        console.log('\n📋 Tables created:');
        console.log('  ✅ users - User accounts and profiles');
        console.log('  ✅ companies - Company profiles');
        console.log('  ✅ categories - Job categories');
        console.log('  ✅ jobs - Job listings');
        console.log('  ✅ applications - Job applications');
        console.log('  ✅ saved_jobs - User saved jobs');
        console.log('  ✅ admin_users - Admin user accounts');
        console.log('  ✅ newsletter_subscriptions - Email subscriptions');

        console.log('\n🔐 Default Admin Account:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  Email: admin@flexjob.uk');
        console.log('  ⚠️  Please change this password after first login!');

    } catch (error) {
        console.error('❌ Schema creation failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    console.log('🚀 FlexJob.UK Core Schema Setup\n');
    createCoreSchema();
}

module.exports = { createCoreSchema };
