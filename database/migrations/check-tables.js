const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'flexjobs_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

async function checkTables() {
  try {
    console.log('\n=== USERS TABLE STRUCTURE ===');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    console.table(usersResult.rows);

    console.log('\n=== AGENTS TABLE STRUCTURE ===');
    const agentsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      ORDER BY ordinal_position;
    `);
    console.table(agentsResult.rows);

    console.log('\n=== SAMPLE USERS DATA ===');
    const sampleUsers = await pool.query('SELECT * FROM users LIMIT 2');
    console.table(sampleUsers.rows);

    console.log('\n=== SAMPLE AGENTS DATA ===');
    const sampleAgents = await pool.query('SELECT * FROM agents LIMIT 2');
    console.table(sampleAgents.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
