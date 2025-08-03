const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runAgentsMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting agents table migration...');
    
    
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agents'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Agents table already exists');
      
      
      const tableInfo = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'agents' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Current agents table structure:');
      tableInfo.rows.forEach(row => {
        console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
      });
      
      return;
    }
    
    
    const fs = require('fs');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_agents_table.sql'), 
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Successfully created agents table with the following features:');
    console.log('   - Basic agent information (name, display_name, email, bio)');
    console.log('   - Professional details (experience_years, hourly_rate, location)');
    console.log('   - Rating system (rating, total_reviews)');
    console.log('   - Skills and specializations (JSON arrays)');
    console.log('   - Status management (status, is_verified, is_featured, is_available)');
    console.log('   - Social links (linkedin_url, portfolio_url, website_url)');
    console.log('   - Proper indexes for performance');
    console.log('   - Auto-updating timestamps');
    
    
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Agents table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });
    
    
    const indexes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'agents'
      ORDER BY indexname
    `);
    
    console.log('\n🔍 Created indexes:');
    indexes.rows.forEach(row => {
      console.log(`   ${row.indexname}`);
    });
    
  } catch (error) {
    console.error('❌ Error running agents migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}


if (require.main === module) {
  runAgentsMigration().catch(console.error);
}

module.exports = { runAgentsMigration };
