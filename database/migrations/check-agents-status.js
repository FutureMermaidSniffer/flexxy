const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs_db',
  port: process.env.DB_PORT || 5433,
  password: process.env.DB_PASSWORD || 'your_password'
});

async function checkAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Agents in Database...\n');
    
    // Count total agents
    const countResult = await client.query('SELECT COUNT(*) as count FROM agents');
    console.log(`📊 Total agents in database: ${countResult.rows[0].count}`);
    
    // Get all agents
    const agentsResult = await client.query(`
      SELECT 
        a.id, a.agent_name, a.display_name, a.bio, a.specializations,
        a.rating, a.total_reviews, a.experience_years, a.location, 
        a.is_active, a.is_featured, a.created_at,
        u.email
      FROM agents a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    
    console.log('\n📋 Current Agents:');
    agentsResult.rows.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.agent_name}`);
      console.log(`   Display Name: ${agent.display_name}`);
      console.log(`   Email: ${agent.email || 'No email'}`);
      console.log(`   Location: ${agent.location}`);
      console.log(`   Active: ${agent.is_active}`);
      console.log(`   Featured: ${agent.is_featured}`);
      console.log(`   Specializations: ${agent.specializations}`);
      console.log('   ---');
    });
    
    // Test search functionality
    console.log('\n🔍 Testing Search Functionality...');
    
    // Test 1: Search by name
    const nameSearchResult = await client.query(`
      SELECT agent_name, display_name FROM agents 
      WHERE (
        agent_name LIKE $1 OR 
        display_name LIKE $1 OR 
        bio LIKE $1 OR 
        specializations LIKE $1
      )
      AND is_active = TRUE
    `, ['%Sophie%']);
    
    console.log(`Search for "Sophie": ${nameSearchResult.rows.length} results`);
    nameSearchResult.rows.forEach(agent => {
      console.log(`  - ${agent.agent_name} (${agent.display_name})`);
    });
    
    // Test 2: Search by specialization
    const specSearchResult = await client.query(`
      SELECT agent_name, specializations FROM agents 
      WHERE specializations LIKE $1 AND is_active = TRUE
    `, ['%Tech%']);
    
    console.log(`Search for "Tech": ${specSearchResult.rows.length} results`);
    specSearchResult.rows.forEach(agent => {
      console.log(`  - ${agent.agent_name}`);
    });
    
    // Test 3: Check featured agents
    const featuredResult = await client.query(`
      SELECT agent_name, is_featured FROM agents 
      WHERE is_featured = TRUE AND is_active = TRUE
    `);
    
    console.log(`Featured agents: ${featuredResult.rows.length} results`);
    featuredResult.rows.forEach(agent => {
      console.log(`  - ${agent.agent_name}`);
    });
    
    // Check if there are any issues with JSON fields
    console.log('\n🔍 Checking JSON Fields...');
    const jsonCheckResult = await client.query(`
      SELECT agent_name, specializations, skills, languages 
      FROM agents 
      WHERE specializations IS NOT NULL
      LIMIT 3
    `);
    
    jsonCheckResult.rows.forEach(agent => {
      console.log(`Agent: ${agent.agent_name}`);
      try {
        const specs = JSON.parse(agent.specializations || '[]');
        console.log(`  Specializations: ${specs.length} items`);
      } catch (e) {
        console.log(`  Specializations: ERROR parsing JSON - ${agent.specializations}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking agents:', error);
  } finally {
    client.release();
  }
}

checkAgents()
  .then(() => {
    console.log('\n✅ Agent check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
