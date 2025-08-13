require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkAgentsTable() {
  try {
    console.log('=== AGENTS TABLE CONTENT ===');
    const agentsResult = await pool.query('SELECT * FROM agents ORDER BY created_at');
    console.log(`Found ${agentsResult.rows.length} agents in agents table:`);
    
    if (agentsResult.rows.length > 0) {
      agentsResult.rows.forEach((agent, index) => {
        console.log(`\n${index + 1}. Agent ID: ${agent.id}`);
        console.log(`   Name: ${agent.agent_name}`);
        console.log(`   Display Name: ${agent.display_name}`);
        console.log(`   User ID: ${agent.user_id}`);
        console.log(`   Location: ${agent.location}`);
        console.log(`   Rating: ${agent.rating}`);
        console.log(`   Specializations: ${agent.specializations}`);
        console.log(`   Active: ${agent.is_active}`);
      });
    } else {
      console.log('No agents found in agents table.');
    }

    console.log('\n=== USERS WITH ADMIN TYPE ===');
    const adminUsers = await pool.query("SELECT id, email, first_name, last_name, user_type FROM users WHERE user_type = 'admin' ORDER BY created_at");
    console.log(`Found ${adminUsers.rows.length} admin users:`);
    
    adminUsers.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Type: ${user.user_type}`);
    });

    console.log('\n=== SCHEMA CHECK ===');
    const agentsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      ORDER BY ordinal_position
    `);
    
    console.log('Agents table columns:');
    agentsSchema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkAgentsTable();
