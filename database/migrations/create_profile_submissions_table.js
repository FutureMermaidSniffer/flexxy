/**
 * Migration: Create profile_submissions table
 * Date: 2024-01-12
 * Description: Create separate table for profile form submissions without authentication requirements
 */

const { Client } = require('pg');

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'flexjobs_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Check if table already exists
        const tableExists = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'profile_submissions'
        `);

        if (tableExists.rows.length > 0) {
            console.log('Table profile_submissions already exists');
            return;
        }

        console.log('Creating profile_submissions table...');

        // Create profile_submissions table
        await client.query(`
            CREATE TABLE profile_submissions (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                location VARCHAR(255) NOT NULL,
                work_eligibility VARCHAR(100) NOT NULL,
                experience_level VARCHAR(50) NOT NULL,
                role_type VARCHAR(255),
                industry VARCHAR(100),
                employment_types JSONB,
                job_preference JSONB,
                bio TEXT,
                resume_path VARCHAR(500),
                selected_agent_id INTEGER,
                data_processing_consent BOOLEAN DEFAULT false,
                job_alerts_consent BOOLEAN DEFAULT false,
                marketing_consent BOOLEAN DEFAULT false,
                status VARCHAR(50) DEFAULT 'pending',
                reviewed_by INTEGER,
                reviewed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Created profile_submissions table');

        // Check if agents table exists and add foreign key
        const agentsTableExists = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'agents'
        `);

        if (agentsTableExists.rows.length > 0) {
            await client.query(`
                ALTER TABLE profile_submissions 
                ADD CONSTRAINT fk_profile_submissions_agent 
                FOREIGN KEY (selected_agent_id) REFERENCES agents(id) 
                ON DELETE SET NULL
            `);
            console.log('✓ Added foreign key constraint to agents table');
        } else {
            console.log('⚠ Agents table not found, skipping foreign key constraint');
        }

        // Add indexes for performance
        await client.query(`CREATE INDEX idx_profile_submissions_email ON profile_submissions(email)`);
        await client.query(`CREATE INDEX idx_profile_submissions_status ON profile_submissions(status)`);
        await client.query(`CREATE INDEX idx_profile_submissions_created_at ON profile_submissions(created_at)`);
        await client.query(`CREATE INDEX idx_profile_submissions_agent_id ON profile_submissions(selected_agent_id)`);
        console.log('✓ Added indexes');

        // Add comments
        await client.query(`COMMENT ON TABLE profile_submissions IS 'Stores profile form submissions from new users before they create accounts'`);
        await client.query(`COMMENT ON COLUMN profile_submissions.status IS 'Submission status: pending, reviewed, approved, rejected'`);
        await client.query(`COMMENT ON COLUMN profile_submissions.selected_agent_id IS 'ID of the recruiting consultant/agent selected by the user'`);
        console.log('✓ Added table comments');

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
