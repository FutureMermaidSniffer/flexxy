const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'flexjobs_db',
  ssl: false,
};

const pool = new Pool(dbConfig);

async function checkUsersTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table structure:');
    console.log('='.repeat(80));
    console.log('Column Name'.padEnd(30) + ' | Data Type'.padEnd(15) + ' | Nullable | Default');
    console.log('-'.repeat(80));
    
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'YES' : 'NO';
      const defaultValue = row.column_default || 'NULL';
      console.log(
        row.column_name.padEnd(30) + ' | ' + 
        row.data_type.padEnd(15) + ' | ' + 
        nullable.padEnd(8) + ' | ' + 
        defaultValue
      );
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsersTable();
