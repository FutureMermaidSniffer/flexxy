const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'flexjobs_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

async function showDatabaseSchema() {
  try {
    console.log('\n=== ALL TABLES IN DATABASE ===');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.table(tablesResult.rows);

    console.log('\n=== FOREIGN KEY RELATIONSHIPS ===');
    const fkResult = await pool.query(`
      SELECT 
        tc.table_name as table_name,
        kcu.column_name as column_name,
        ccu.table_name as foreign_table_name,
        ccu.column_name as foreign_column_name,
        tc.constraint_name as constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name;
    `);
    console.table(fkResult.rows);

    // Get structure for each table
    const tables = tablesResult.rows.map(row => row.table_name);
    
    for (const tableName of tables) {
      console.log(`\n=== ${tableName.toUpperCase()} TABLE STRUCTURE ===`);
      const columnResult = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);
      console.table(columnResult.rows);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showDatabaseSchema();
