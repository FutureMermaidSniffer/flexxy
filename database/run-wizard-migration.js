const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'flexjobs_db'
    });

    const migration = fs.readFileSync('./migrations/add_wizard_fields.sql', 'utf8');
    const statements = migration.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
      }
    }
    
    await connection.end();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runMigration();
