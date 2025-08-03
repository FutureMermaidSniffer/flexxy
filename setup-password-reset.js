/**
 * Simple Password Reset Setup
 * Creates the password reset tokens table manually
 */

const { getOne, insertOne } = require('./backend/database');

async function setupPasswordResetTable() {
    try {
        console.log('🔄 Setting up password reset functionality...');

        // Try to create the table using the database helper
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        // Execute the table creation
        await getOne(createTableSQL, []);

        // Create indexes
        const indexQueries = [
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)',
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)'
        ];

        for (const query of indexQueries) {
            try {
                await getOne(query, []);
            } catch (err) {
                // Indexes might already exist, that's ok
                console.log('Index creation note:', err.message);
            }
        }

        console.log('✅ Password reset table setup complete!');
        console.log('📋 Features added:');
        console.log('  • Password reset tokens table');
        console.log('  • Database indexes for performance');
        console.log('  • Frontend pages: /forgot-password and /reset-password');
        console.log('  • API endpoints: /api/auth/forgot-password and /api/auth/reset-password');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('💡 You may need to run this SQL manually in your database:');
        console.log(`
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);  
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
        `);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupPasswordResetTable()
        .then(() => {
            console.log('🎉 Setup complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupPasswordResetTable };
