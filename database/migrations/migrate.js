const { Client } = require('pg');
require('dotenv').config();

class DatabaseMigration {
    constructor() {
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'flexjobs_db',
            schema: 'public'
        };
        
        this.databaseName = process.env.DB_NAME || 'flexjobs_db';
        console.log('📌 Database Configuration:');
        console.log(`   Host: ${this.connectionConfig.host}`);
        console.log(`   Port: ${this.connectionConfig.port}`);
        console.log(`   User: ${this.connectionConfig.user}`);
        console.log(`   Database: ${this.connectionConfig.database}`);
    }

    async createConnection() {
        try {
            this.connection = new Client(this.connectionConfig);
            await this.connection.connect();
            console.log('✅ Connected to PostgreSQL server');
            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to PostgreSQL server:', error.message);
            throw error;
        }
    }

    async createDatabase() {
        try {
            // Check if connected to the correct database
            const result = await this.connection.query('SELECT current_database() as db');
            const currentDb = result.rows[0].db;
            
            if (currentDb === this.databaseName) {
                console.log(`✅ Connected to '${this.databaseName}' database`);
            } else {
                console.log(`⚠️ Warning: Connected to '${currentDb}' but expected '${this.databaseName}'`);
            }
            
            // Check database version for compatibility
            const versionResult = await this.connection.query('SELECT version()');
            console.log(`📊 Database server: ${versionResult.rows[0].version.split(',')[0]}`);
            
        } catch (error) {
            console.error('❌ Failed to verify database:', error.message);
            throw error;
        }
    }

    async createUsersTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
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
                google_id VARCHAR(255) UNIQUE,
                apple_id VARCHAR(255) UNIQUE,
                is_temp_account BOOLEAN DEFAULT FALSE,
                created_via_wizard BOOLEAN DEFAULT FALSE,
                selected_agent_id INTEGER,
                job_preference JSONB,
                work_type_preference JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Users table created');
    }

    async createCompaniesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                website VARCHAR(255),
                logo VARCHAR(255),
                industry VARCHAR(100),
                company_size VARCHAR(20) DEFAULT '1-10' CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
                location VARCHAR(255),
                founded_year INTEGER,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Companies table created');
    }

    async createCategoriesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                icon VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Categories table created');
    }

    async createJobsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT,
                responsibilities TEXT,
                company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                location VARCHAR(255),
                job_type VARCHAR(20) DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
                remote_type VARCHAR(20) DEFAULT 'remote' CHECK (remote_type IN ('remote', 'hybrid', 'on-site')),
                experience_level VARCHAR(20) DEFAULT 'entry' CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
                salary_min DECIMAL(10,2),
                salary_max DECIMAL(10,2),
                salary_currency VARCHAR(3) DEFAULT 'USD',
                salary_type VARCHAR(50) DEFAULT 'fixed' CHECK (salary_type IN ('fixed', 'range', 'hourly', 'negotiable', 'competitive')),
                benefits TEXT,
                application_deadline DATE,
                is_active BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                views_count INTEGER DEFAULT 0,
                applications_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                job_status VARCHAR(20) DEFAULT 'active' CHECK (job_status IN ('active', 'expired', 'draft', 'pending', 'filled')),
                application_url VARCHAR(255),
                contact_email VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Jobs table created');
    }

    async createApplicationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                cover_letter TEXT,
                resume_path VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interviewed', 'hired', 'rejected')),
                notes TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(job_id, user_id)
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Applications table created');
    }

    async createSavedJobsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, job_id)
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Saved Jobs table created');
    }

    async createJobSkillsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS job_skills (
                id SERIAL PRIMARY KEY,
                job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                skill_name VARCHAR(100) NOT NULL,
                is_required BOOLEAN DEFAULT FALSE
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Job Skills table created');
    }

    async createPasswordResetTokensTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Password Reset Tokens table created');
    }
    
    async createAgentsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS agents (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                avatar VARCHAR(255),
                specializations TEXT,
                experience_years INTEGER DEFAULT 0,
                hourly_rate DECIMAL(10,2),
                portfolio_url VARCHAR(255),
                website_url VARCHAR(255),
                linkedin_url VARCHAR(255),
                rating DECIMAL(3,2) DEFAULT 0.0,
                reviews_count INTEGER DEFAULT 0,
                is_verified BOOLEAN DEFAULT FALSE,
                is_featured BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Agents table created');
    }

    async createAgentReviewsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS agent_reviews (
                id SERIAL PRIMARY KEY,
                agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(agent_id, user_id)
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Agent Reviews table created');
    }

    async createAgentBookingsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS agent_bookings (
                id SERIAL PRIMARY KEY,
                agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                booking_date TIMESTAMP NOT NULL,
                duration INTEGER DEFAULT 60,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Agent Bookings table created');
    }
    
    async createProfileSubmissionsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS profile_submissions (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                location VARCHAR(255) NOT NULL,
                work_eligibility VARCHAR(255) NOT NULL,
                experience_level VARCHAR(50) NOT NULL,
                role_type VARCHAR(255),
                industry VARCHAR(100),
                employment_types JSONB,
                job_preference JSONB,
                bio TEXT,
                data_processing_consent BOOLEAN DEFAULT false,
                job_alerts_consent BOOLEAN DEFAULT false,
                marketing_consent BOOLEAN DEFAULT false,
                selected_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
                resume_path VARCHAR(500),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ Profile Submissions table created');
    }
    
    async createUserSubscriptionsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_type VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
                starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                payment_method VARCHAR(50),
                payment_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.connection.query(query);
        console.log('✅ User Subscriptions table created');
    }

    async createIndexes() {
        // Create foreign key constraints first
        console.log('🔗 Creating foreign key constraints...');
        
        try {
            // Add foreign key constraint for selected_agent_id in users table
            await this.connection.query(`
                ALTER TABLE users 
                ADD CONSTRAINT fk_users_selected_agent 
                FOREIGN KEY (selected_agent_id) REFERENCES agents(id) 
                ON DELETE SET NULL
            `);
            console.log('✅ Users selected_agent_id foreign key constraint added');
        } catch (error) {
            if (error.code === '42710') {
                console.log('ℹ️  Users selected_agent_id foreign key constraint already exists');
            } else {
                console.log('⚠️  Could not add users selected_agent_id foreign key:', error.message);
            }
        }
        
        // Wait for all tables to be created before creating indexes
        console.log('🔍 Creating indexes...');
        const indexes = [
            // User related indexes
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)',
            'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_users_temp_account ON users(is_temp_account) WHERE is_temp_account IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_users_wizard_created ON users(created_via_wizard) WHERE created_via_wizard IS NOT NULL',
            
            // Jobs related indexes
            'CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON jobs(remote_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(job_status) WHERE job_status IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_application_url ON jobs(application_url) WHERE application_url IS NOT NULL',
            'CREATE INDEX IF NOT EXISTS idx_jobs_contact_email ON jobs(contact_email) WHERE contact_email IS NOT NULL',
            
            // Applications related indexes
            'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)',
            'CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)',
            
            // Other tables indexes
            'CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id)',
            
            // Password reset tokens
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)',
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)',
            
            // Agent related indexes
            'CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active)',
            'CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(is_featured)',
            'CREATE INDEX IF NOT EXISTS idx_agents_rating ON agents(rating)',
            'CREATE INDEX IF NOT EXISTS idx_agents_specializations ON agents(specializations)',
            
            // Agent reviews and bookings
            'CREATE INDEX IF NOT EXISTS idx_agent_reviews_rating ON agent_reviews(rating)',
            'CREATE INDEX IF NOT EXISTS idx_agent_bookings_status ON agent_bookings(status)',
            
            // Profile submissions indexes
            'CREATE INDEX IF NOT EXISTS idx_profile_submissions_email ON profile_submissions(email)',
            'CREATE INDEX IF NOT EXISTS idx_profile_submissions_status ON profile_submissions(status)',
            'CREATE INDEX IF NOT EXISTS idx_profile_submissions_agent ON profile_submissions(selected_agent_id)',
            'CREATE INDEX IF NOT EXISTS idx_profile_submissions_created ON profile_submissions(created_at)',
            
            // Users new fields indexes
            'CREATE INDEX IF NOT EXISTS idx_users_selected_agent ON users(selected_agent_id)',
            
            // Subscriptions
            'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)',
            'CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at)'
        ];

        for (const indexQuery of indexes) {
            await this.connection.query(indexQuery);
        }
        console.log('✅ Database indexes created');
    }

    async insertSampleCategories() {
        // Check if categories already exist
        const existingCategories = await this.connection.query('SELECT COUNT(*) as count FROM categories');
        
        if (parseInt(existingCategories.rows[0].count) > 0) {
            console.log('✅ Categories already exist, skipping sample data insertion');
            return;
        }

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

        const query = 'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3)';
        
        for (const category of categories) {
            await this.connection.query(query, category);
        }
        
        console.log('✅ Sample categories inserted');
    }

    async createAdminUser() {
        // Check if admin user already exists
        const existingAdmin = await this.connection.query(
            'SELECT id FROM users WHERE user_type = $1 LIMIT 1',
            ['admin']
        );
        
        if (existingAdmin.rows.length > 0) {
            console.log('✅ Admin user already exists, skipping creation');
            return;
        }

        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 12);
        
        const query = `
            INSERT INTO users (
                email, password, first_name, last_name, user_type, 
                is_active, email_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        await this.connection.query(query, [
            'admin@flexjobs.com',
            adminPassword,
            'Admin',
            'User',
            'admin',
            true,
            true
        ]);
        
        console.log('✅ Admin user created (email: admin@flexjobs.com, password: admin123)');
        console.log('⚠️  Please change the admin password after first login!');
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ Database connection closed');
        }
    }

    async getDatabaseInfo() {
        try {
            // Get database information
            const databaseInfo = await this.connection.query(`
                SELECT 
                    current_database() as database_name,
                    pg_encoding_to_char(encoding) as charset,
                    datcollate as collation
                FROM pg_database
                WHERE datname = current_database()
            `);
            
            // Get tables information
            const tablesInfo = await this.connection.query(`
                SELECT 
                    table_name,
                    (SELECT count(*) FROM ${this.connectionConfig.schema || 'public'}."' || table_name || '") as row_count
                FROM 
                    information_schema.tables
                WHERE 
                    table_schema = $1
                    AND table_type = 'BASE TABLE'
                ORDER BY 
                    table_name
            `, [this.connectionConfig.schema || 'public']);
            
            return {
                database: databaseInfo.rows[0],
                tables: tablesInfo.rows
            };
        } catch (error) {
            console.error('Error getting database info:', error.message);
            return null;
        }
    }

    async runMigration() {
        console.log('🚀 Starting FlexJobs database migration...\n');
        
        try {
            await this.createConnection();
            await this.createDatabase();
            
            console.log('\n📝 Creating tables...');
            
            // First create the users table which many other tables depend on
            await this.createUsersTable();
            
            // Create password reset tokens table that depends on users
            await this.createPasswordResetTokensTable();
            
            // Create company and category tables
            await this.createCompaniesTable();
            await this.createCategoriesTable();
            
            // Create jobs table which depends on companies and categories
            await this.createJobsTable();
            
            // Create tables that depend on jobs
            await this.createApplicationsTable();
            await this.createSavedJobsTable();
            await this.createJobSkillsTable();
            
            // Create agent related tables
            await this.createAgentsTable();
            await this.createAgentReviewsTable();
            await this.createAgentBookingsTable();
            
            // Create profile submissions table
            await this.createProfileSubmissionsTable();
            
            // Create subscription tables
            await this.createUserSubscriptionsTable();
            
            // Wait for tables to be created before creating indexes
            console.log('\n🔍 Creating indexes...');
            await this.createIndexes();
            
            console.log('\n📊 Inserting sample data...');
            await this.insertSampleCategories();
            await this.createAdminUser();
            
            try {
                console.log('\n📈 Database Information:');
                const dbInfo = await this.getDatabaseInfo();
                if (dbInfo) {
                    console.log(`Database: ${dbInfo.database.database_name}`);
                    console.log(`Charset: ${dbInfo.database.charset}`);
                    console.log(`Collation: ${dbInfo.database.collation}`);
                    console.log(`Tables created: ${dbInfo.tables.length}`);
                    
                    console.log('\n📋 Tables:');
                    dbInfo.tables.forEach(table => {
                        console.log(`  - ${table.table_name} (${table.row_count || 0} rows)`);
                    });
                }
            } catch (infoError) {
                console.log('Note: Could not retrieve detailed database information');
            }
            
            console.log('\n✅ Migration completed successfully!');
            console.log('🎉 FlexJobs database is ready to use!');
            
        } catch (error) {
            console.error('\n❌ Migration failed:', error.message);
            throw error;
        } finally {
            await this.closeConnection();
        }
    }
}


module.exports = DatabaseMigration;


if (require.main === module) {
    const migration = new DatabaseMigration();
    migration.runMigration()
        .then(() => {
            console.log('\n🏁 Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration script failed:', error);
            process.exit(1);
        });
}
