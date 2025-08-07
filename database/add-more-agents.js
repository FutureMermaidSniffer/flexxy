#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function addMoreAgents() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'flexjobs_db',
  });

  try {
    console.log('🔍 Checking current agents...\n');

    // Check current agents
    const currentAgents = await pool.query('SELECT COUNT(*) as count FROM agents');
    console.log(`Current agents count: ${currentAgents.rows[0].count}`);

    // Check if we need to add user records first
    const users = await pool.query('SELECT id, email FROM users ORDER BY id DESC LIMIT 10');
    console.log('Available user IDs:', users.rows.map(u => `${u.id} (${u.email})`));

    // Add 3 more agents (2 female, 1 male to get the right distribution)
    const newAgents = [
      {
        user_id: users.rows[0]?.id || 1, // Use existing user or default
        agent_name: 'Emily Rodriguez',
        display_name: 'Emily R.',
        specializations: '["Human Resources","Career Coaching","Executive Search"]',
        bio: 'Experienced HR professional with 8+ years helping professionals advance their careers. Specializes in executive placements and career transitions.',
        experience_years: 8,
        rating: 4.7,
        gender: 'Female'
      },
      {
        user_id: users.rows[1]?.id || 2,
        agent_name: 'Jessica Chen',
        display_name: 'Jessica C.',
        specializations: '["Technology","Software Engineering","AI/ML"]',
        bio: 'Former software engineer turned recruiter. Deep understanding of tech roles from startups to Fortune 500 companies.',
        experience_years: 6,
        rating: 4.8,
        gender: 'Female'
      },
      {
        user_id: users.rows[2]?.id || 3,
        agent_name: 'Amanda Thompson',
        display_name: 'Amanda T.',
        specializations: '["Healthcare","Nursing","Medical Administration"]',
        bio: 'Healthcare recruitment specialist with extensive network in medical field. Helps both clinical and administrative professionals.',
        experience_years: 10,
        rating: 4.9,
        gender: 'Female'
      }
    ];

    console.log('\n📝 Adding 3 new agents...\n');

    for (const agent of newAgents) {
      try {
        const result = await pool.query(`
          INSERT INTO agents (
            user_id, agent_name, display_name, specializations, bio, 
            experience_years, rating, languages, skills, location, 
            timezone, is_active, is_featured
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id, agent_name;
        `, [
          agent.user_id,
          agent.agent_name,
          agent.display_name,
          agent.specializations,
          agent.bio,
          agent.experience_years,
          agent.rating,
          '["English"]', // languages
          agent.specializations, // skills (same as specializations)
          'Remote', // location
          'UTC-5', // timezone
          true, // is_active
          false // is_featured
        ]);

        console.log(`✅ Added: ${result.rows[0].agent_name} (ID: ${result.rows[0].id}) - ${agent.gender}`);
      } catch (error) {
        console.error(`❌ Failed to add ${agent.agent_name}:`, error.message);
      }
    }

    // Display final count and gender distribution
    console.log('\n📊 Final Agent Summary:');
    const finalAgents = await pool.query(`
      SELECT id, agent_name, display_name, specializations, experience_years, rating 
      FROM agents ORDER BY id
    `);

    console.log(`\nTotal Agents: ${finalAgents.rows.length}`);
    console.log('\nAgent Details:');
    finalAgents.rows.forEach((agent, index) => {
      // Determine likely gender based on name (simple heuristic)
      const femaleNames = ['Sarah', 'Emily', 'Jessica', 'Amanda'];
      const maleNames = ['John', 'Michael', 'Mike'];
      
      let gender = 'Unknown';
      if (femaleNames.some(name => agent.agent_name.includes(name))) gender = 'Female';
      if (maleNames.some(name => agent.agent_name.includes(name))) gender = 'Male';
      
      console.log(`${index + 1}. ${agent.agent_name} (${agent.display_name}) - ${gender}`);
      console.log(`   Specializations: ${agent.specializations}`);
      console.log(`   Experience: ${agent.experience_years} years, Rating: ${agent.rating}/5`);
      console.log('');
    });

    // Count by gender (approximate)
    const femaleCount = finalAgents.rows.filter(a => 
      ['Sarah', 'Emily', 'Jessica', 'Amanda'].some(name => a.agent_name.includes(name))
    ).length;
    
    const maleCount = finalAgents.rows.filter(a => 
      ['John', 'Michael', 'Mike'].some(name => a.agent_name.includes(name))
    ).length;

    console.log(`👩 Female Agents: ${femaleCount}`);
    console.log(`👨 Male Agents: ${maleCount}`);
    console.log(`❓ Other: ${finalAgents.rows.length - femaleCount - maleCount}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addMoreAgents();
}

module.exports = addMoreAgents;
