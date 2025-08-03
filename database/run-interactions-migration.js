const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('🚀 Starting user interactions migration...');

    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'flexjobs_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    
    const migrationPath = path.join(__dirname, 'migrations', 'add_user_interactions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📂 Read migration file');

    
    await connection.execute(migrationSQL);

    console.log('✅ Migration executed successfully');

    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('newsletter_subscriptions', 'user_interactions', 'tutorial_engagement')
    `, [process.env.DB_NAME || 'flexjobs_db']);

    console.log('📊 Tables created:', tables.map(t => t.TABLE_NAME));

    await connection.end();
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}


if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
