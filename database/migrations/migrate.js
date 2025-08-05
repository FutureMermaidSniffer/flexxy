const { Client } = require('pg');
require('dotenv').config();

class DatabaseMigration {
    constructor() {
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'flexjobs_db'
        };
        
        this.databaseName = process.env.DB_NAME || 'flexjobs_db';
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
            // PostgreSQL doesn't need explicit database creation in this context
            // since we're already connecting to the target database
            console.log(`✅ Using database '${this.databaseName}'`);
        } catch (error) {
            console.error('❌ Failed to use database:', error.message);
            throw error;
        }
    }

    async createUsersTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
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
                benefits TEXT,
                application_deadline DATE,
                is_active BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                views_count INTEGER DEFAULT 0,
                applications_count INTEGER DEFAULT 0,
                created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON jobs(remote_type)',
            'CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)',
            'CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)',
            'CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id)'
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

    async runMigration() {
        console.log('🚀 Starting FlexJobs database migration...\n');
        
        try {
            
            await this.createConnection();
            
            
            await this.createDatabase();
            
            
            console.log('\n📝 Creating tables...');
            await this.createUsersTable();
            await this.createCompaniesTable();
            await this.createCategoriesTable();
            await this.createJobsTable();
            await this.createApplicationsTable();
            await this.createSavedJobsTable();
            await this.createJobSkillsTable();
            
            
            console.log('\n🔍 Creating indexes...');
            await this.createIndexes();
            
            
            console.log('\n📊 Inserting sample data...');
            await this.insertSampleCategories();
            await this.createAdminUser();
            
            
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
