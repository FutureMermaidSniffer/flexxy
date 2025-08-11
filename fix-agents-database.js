require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixAgentsDatabase() {
  try {
    console.log('=== FIXING AGENTS DATABASE ===');
    
    // First, let's create agent records for our 5 recruiting consultants
    const consultants = [
      {
        email: 'sophie.mensah@flexjobs.com',
        agent_name: 'Sophie Mensah',
        display_name: 'Sophie M.',
        specializations: ["Marketing", "Brand Strategy", "Digital Marketing"],
        bio: "Marketing specialist with 8+ years experience in brand strategy and digital marketing campaigns. Expert in social media marketing and content creation.",
        location: "London, UK",
        timezone: "GMT",
        experience_years: 8,
        rating: 4.85,
        total_reviews: 47,
        languages: ["English", "French"],
        skills: ["Social Media Marketing", "Content Strategy", "Brand Development", "Analytics"],
        avatar_url: "/images/agents/Sophie.png"
      },
      {
        email: 'olivia.bennett@flexjobs.com',
        agent_name: 'Olivia Bennett',
        display_name: 'Olivia B.',
        specializations: ["Technology", "Software Development", "Project Management"],
        bio: "Senior technology consultant specializing in software development and agile project management. Passionate about helping tech professionals find their ideal remote positions.",
        location: "Toronto, Canada",
        timezone: "EST",
        experience_years: 10,
        rating: 4.92,
        total_reviews: 63,
        languages: ["English"],
        skills: ["JavaScript", "Python", "Agile Methodology", "Team Leadership"],
        avatar_url: "/images/agents/Olivia.png"
      },
      {
        email: 'daniel.freeman@flexjobs.com',
        agent_name: 'Daniel Freeman',
        display_name: 'Daniel Freeman',
        specializations: ["Finance", "Accounting", "Financial Analysis"],
        bio: "Job matching expert with extensive experience in corporate finance and accounting. Specializes in connecting professionals with top-tier remote opportunities.",
        location: "Europe",
        timezone: "EST",
        experience_years: 12,
        rating: 4.78,
        total_reviews: 54,
        languages: ["English", "Spanish"],
        skills: ["Financial Analysis", "Risk Management", "Corporate Finance", "Excel Modeling"],
        avatar_url: "/images/agents/Daniel.jpg"
      },
      {
        email: 'naomi.clarke@flexjobs.com',
        agent_name: 'Naomi Clarke',
        display_name: 'Naomi Clarke',
        specializations: ["Human Resources", "Talent Acquisition", "Employee Relations"],
        bio: "HR specialist focused on talent acquisition and employee relations. Expert in remote work policies and helping companies build strong distributed teams.",
        location: "Europe",
        timezone: "CST",
        experience_years: 9,
        rating: 4.89,
        total_reviews: 71,
        languages: ["English"],
        skills: ["Talent Acquisition", "Performance Management", "Remote Team Building", "HR Analytics"],
        avatar_url: "/images/agents/Naomi.png"
      },
      {
        email: 'isha.malik@flexjobs.com',
        agent_name: 'Isha Malik',
        display_name: 'Isha Malik',
        specializations: ["Healthcare", "Medical Administration", "Healthcare IT"],
        bio: "Remote work industry expert with deep knowledge of administration and IT systems. Specializes in placing professionals in remote and hybrid roles.",
        location: "London, UK",
        timezone: "PST",
        experience_years: 7,
        rating: 4.94,
        total_reviews: 38,
        languages: ["English", "Hindi"],
        skills: ["Healthcare Administration", "Medical Coding", "HIPAA Compliance", "Healthcare IT"],
        avatar_url: "/images/agents/Isha.jpg"
      }
    ];

    console.log('Step 1: Getting user IDs for consultants...');
    
    for (const consultant of consultants) {
      // Get the user ID
      const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [consultant.email]
      );

      if (userResult.rows.length === 0) {
        console.log(`❌ User not found for ${consultant.email}`);
        continue;
      }

      const userId = userResult.rows[0].id;
      console.log(`✅ Found user ID ${userId} for ${consultant.email}`);

      // Check if agent record already exists
      const existingAgent = await pool.query(
        'SELECT id FROM agents WHERE user_id = $1',
        [userId]
      );

      if (existingAgent.rows.length > 0) {
        console.log(`⚠️ Agent record already exists for ${consultant.agent_name}`);
        continue;
      }

      // Create agent record
      const insertQuery = `
        INSERT INTO agents (
          user_id, agent_name, display_name, specializations, bio, 
          location, timezone, experience_years, rating, total_reviews,
          languages, skills, avatar_url, is_featured, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
        ) RETURNING id
      `;

      const result = await pool.query(insertQuery, [
        userId,
        consultant.agent_name,
        consultant.display_name,
        JSON.stringify(consultant.specializations),
        consultant.bio,
        consultant.location,
        consultant.timezone,
        consultant.experience_years,
        consultant.rating,
        consultant.total_reviews,
        JSON.stringify(consultant.languages),
        JSON.stringify(consultant.skills),
        consultant.avatar_url,
        true, // is_featured
        true, // is_active
      ]);

      console.log(`✅ Created agent record (ID: ${result.rows[0].id}) for ${consultant.agent_name}`);
    }

    console.log('\nStep 2: Updating existing agents with null user_id...');
    
    // Let's also fix the existing agents that have null user_id
    const nullUserAgents = await pool.query('SELECT * FROM agents WHERE user_id IS NULL');
    
    for (const agent of nullUserAgents.rows) {
      console.log(`⚠️ Agent "${agent.agent_name}" has null user_id - this should be connected to a user or removed`);
      
      // For now, let's just mark them as inactive since they don't have associated user accounts
      await pool.query(
        'UPDATE agents SET is_active = false WHERE id = $1',
        [agent.id]
      );
      console.log(`🔧 Marked agent "${agent.agent_name}" as inactive (no user account)`);
    }

    console.log('\nStep 3: Verifying final state...');
    const finalAgents = await pool.query(`
      SELECT a.id, a.agent_name, a.user_id, u.email, a.is_active 
      FROM agents a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.id
    `);

    console.log('\nFinal agents table state:');
    finalAgents.rows.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.agent_name} (ID: ${agent.id}) - User: ${agent.email || 'None'} - Active: ${agent.is_active}`);
    });

    console.log('\n✅ Agents database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing agents database:', error);
  } finally {
    await pool.end();
  }
}

fixAgentsDatabase();
