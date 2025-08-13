const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class RecruitingConsultantsMigration {
    constructor() {
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'flexjobs_db'
        };
        
        console.log('🔗 Recruiting Consultants Migration');
        console.log('📌 Database Configuration:');
        console.log(`   Host: ${this.connectionConfig.host}`);
        console.log(`   Port: ${this.connectionConfig.port}`);
        console.log(`   Database: ${this.connectionConfig.database}`);
    }

    async createConnection() {
        try {
            this.client = new Client(this.connectionConfig);
            await this.client.connect();
            console.log('✅ Connected to PostgreSQL server');
            return this.client;
        } catch (error) {
            console.error('❌ Failed to connect to PostgreSQL server:', error.message);
            console.log('🔧 Troubleshooting tips:');
            console.log('   1. Ensure PostgreSQL is running');
            console.log('   2. Check database credentials in .env file');
            console.log('   3. Verify database exists');
            console.log('   4. Check if port is correct (5432 vs 5433)');
            throw error;
        }
    }

    async ensureMigrationLogTable() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS migration_log (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) UNIQUE NOT NULL,
                    executed_at TIMESTAMP DEFAULT NOW(),
                    success BOOLEAN DEFAULT false
                );
            `;
            await this.client.query(createTableQuery);
            console.log('✅ Migration log table ready');
        } catch (error) {
            console.error('❌ Failed to create migration log table:', error.message);
            throw error;
        }
    }

    async checkIfMigrationRan() {
        try {
            const checkQuery = `
                SELECT COUNT(*) as count 
                FROM migration_log 
                WHERE filename = '001_add_recruiting_consultants.sql' 
                AND success = true
            `;
            const result = await this.client.query(checkQuery);
            return result.rows[0].count > 0;
        } catch (error) {
            console.log('⚠️ Migration log table may not exist yet, proceeding...');
            return false;
        }
    }

    async runMigration() {
        try {
            await this.createConnection();
            await this.ensureMigrationLogTable();

            // Check if migration already ran
            const migrationExists = await this.checkIfMigrationRan();
            if (migrationExists) {
                console.log('✅ Recruiting consultants migration already completed');
                return;
            }

            console.log('🚀 Starting recruiting consultants migration...');

            // Read and execute the SQL migration file
            const sqlFilePath = path.join(__dirname, 'sequential', '001_add_recruiting_consultants.sql');
            
            if (!fs.existsSync(sqlFilePath)) {
                throw new Error(`Migration file not found: ${sqlFilePath}`);
            }

            const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
            
            // Execute the migration
            await this.client.query('BEGIN');
            await this.client.query(sqlContent);
            await this.client.query('COMMIT');

            console.log('✅ Recruiting consultants migration completed successfully');
            
            // Verify the data was inserted
            const verifyQuery = `
                SELECT a.name, a.display_name, a.specializations, u.email
                FROM agents a
                JOIN users u ON a.user_id = u.id
                WHERE u.email LIKE '%@flexjobseu.com'
                ORDER BY a.created_at DESC
                LIMIT 5
            `;
            
            const verifyResult = await this.client.query(verifyQuery);
            console.log(`✅ Inserted ${verifyResult.rows.length} recruiting consultants:`);
            
            verifyResult.rows.forEach((consultant, index) => {
                console.log(`   ${index + 1}. ${consultant.name} (${consultant.display_name}) - ${consultant.email}`);
                console.log(`      Specializations: ${consultant.specializations}`);
            });

        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            
            // Rollback on error
            try {
                await this.client.query('ROLLBACK');
                console.log('🔄 Transaction rolled back');
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError.message);
            }
            
            throw error;
        } finally {
            if (this.client) {
                await this.client.end();
                console.log('🔌 Database connection closed');
            }
        }
    }
}

// Run the migration
if (require.main === module) {
    const migration = new RecruitingConsultantsMigration();
    migration.runMigration()
        .then(() => {
            console.log('🎉 Migration process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration process failed:', error.message);
            process.exit(1);
        });
}

module.exports = RecruitingConsultantsMigration;
