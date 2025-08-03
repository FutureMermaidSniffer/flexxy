const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseMigration {
    constructor() {
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            charset: 'utf8mb4'
        };
        
        this.databaseName = process.env.DB_NAME || 'flexjobs_db';
    }

    async createConnection() {
        try {
            this.connection = await mysql.createConnection(this.connectionConfig);
            console.log('✅ Connected to MySQL server');
            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to MySQL server:', error.message);
            throw error;
        }
    }

    async createDatabase() {
        try {
            await this.connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.databaseName}`);
            console.log(`✅ Database '${this.databaseName}' created or already exists`);
            
            await this.connection.execute(`USE ${this.databaseName}`);
            console.log(`✅ Using database '${this.databaseName}'`);
        } catch (error) {
            console.error('❌ Failed to create database:', error.message);
            throw error;
        }
    }

    async createUsersTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Users table created');
    }

    async createCompaniesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS companies (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Companies table created');
    }

    async createCategoriesTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                icon VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Categories table created');
    }

    async createJobsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS jobs (
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
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Jobs table created');
    }

    async createApplicationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS applications (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Applications table created');
    }

    async createSavedJobsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS saved_jobs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                job_id INT NOT NULL,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                UNIQUE KEY unique_saved_job (user_id, job_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
        console.log('✅ Saved Jobs table created');
    }

    async createJobSkillsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS job_skills (
                id INT PRIMARY KEY AUTO_INCREMENT,
                job_id INT NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                is_required BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await this.connection.execute(query);
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
            await this.connection.execute(indexQuery);
        }
        console.log('✅ Database indexes created');
    }

    async insertSampleCategories() {
        // Check if categories already exist
        const [existingCategories] = await this.connection.execute('SELECT COUNT(*) as count FROM categories');
        
        if (existingCategories[0].count > 0) {
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

        const query = 'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)';
        
        for (const category of categories) {
            await this.connection.execute(query, category);
        }
        
        console.log('✅ Sample categories inserted');
    }

    async createAdminUser() {
        // Check if admin user already exists
        const [existingAdmin] = await this.connection.execute(
            'SELECT id FROM users WHERE user_type = ? LIMIT 1',
            ['admin']
        );
        
        if (existingAdmin.length > 0) {
            console.log('✅ Admin user already exists, skipping creation');
            return;
        }

        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 12);
        
        const query = `
            INSERT INTO users (
                email, password, first_name, last_name, user_type, 
                is_active, email_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await this.connection.execute(query, [
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

    async checkDatabaseExists() {
        try {
            const [databases] = await this.connection.execute('SHOW DATABASES LIKE ?', [this.databaseName]);
            return databases.length > 0;
        } catch (error) {
            return false;
        }
    }

    async checkTableExists(tableName) {
        try {
            const [tables] = await this.connection.execute(
                'SHOW TABLES FROM ?? LIKE ?', 
                [this.databaseName, tableName]
            );
            return tables.length > 0;
        } catch (error) {
            return false;
        }
    }

    async getDatabaseInfo() {
        try {
            // Get database info
            const [dbInfo] = await this.connection.execute(`
                SELECT 
                    SCHEMA_NAME as database_name,
                    DEFAULT_CHARACTER_SET_NAME as charset,
                    DEFAULT_COLLATION_NAME as collation
                FROM information_schema.SCHEMATA 
                WHERE SCHEMA_NAME = ?
            `, [this.databaseName]);

            // Get table info
            const [tables] = await this.connection.execute(`
                SELECT 
                    TABLE_NAME as table_name,
                    TABLE_ROWS as row_count,
                    DATA_LENGTH as data_size,
                    INDEX_LENGTH as index_size
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_NAME
            `, [this.databaseName]);

            return {
                database: dbInfo[0],
                tables: tables
            };
        } catch (error) {
            console.error('Error getting database info:', error);
            return null;
        }
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
            // Connect to MySQL
            await this.createConnection();
            
            // Create database
            await this.createDatabase();
            
            // Create tables in order (respecting foreign key constraints)
            console.log('\n📝 Creating tables...');
            await this.createUsersTable();
            await this.createCompaniesTable();
            await this.createCategoriesTable();
            await this.createJobsTable();
            await this.createApplicationsTable();
            await this.createSavedJobsTable();
            await this.createJobSkillsTable();
            
            // Create indexes
            console.log('\n🔍 Creating indexes...');
            await this.createIndexes();
            
            // Insert sample data
            console.log('\n📊 Inserting sample data...');
            await this.insertSampleCategories();
            await this.createAdminUser();
            
            // Show database info
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

// Export for use in other scripts
module.exports = DatabaseMigration;

// Run migration if called directly
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
