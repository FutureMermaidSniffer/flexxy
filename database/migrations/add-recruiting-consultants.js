const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Recruiting consultants data based on the images
const recruitingConsultants = [
  {
    name: 'Sophie Mensah',
    display_name: 'Sophie M.',
    bio: 'Senior Recruiting Consultant specializing in tech and remote positions. Over 8 years of experience helping professionals find their perfect remote careers. Expert in AI, data science, and software engineering roles.',
    avatar_url: 'images/agents/Sophie.png',
    experience_years: 8,
    hourly_rate: 120.00,
    location: 'San Francisco, CA',
    timezone: 'PST',
    specializations: JSON.stringify([
      'Technology Recruiting',
      'Remote Work Placement',
      'AI & Data Science',
      'Software Engineering',
      'Startup Recruiting'
    ]),
    skills: JSON.stringify([
      'Technical Screening',
      'Salary Negotiation',
      'Career Coaching',
      'Interview Preparation',
      'Remote Work Strategy'
    ]),
    languages: JSON.stringify(['English', 'French']),
    certifications: JSON.stringify([
      'Certified Professional Recruiter (CPR)',
      'Remote Work Association Certified',
      'LinkedIn Talent Solutions'
    ]),
    linkedin_url: 'https://linkedin.com/in/sophie-mensah-recruiting',
    is_verified: true,
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Career Strategy Session',
      'Resume Review',
      'Interview Preparation',
      'Salary Negotiation',
      'Remote Work Transition'
    ]),
    availability: JSON.stringify({
      'monday': ['09:00', '17:00'],
      'tuesday': ['09:00', '17:00'],
      'wednesday': ['09:00', '17:00'],
      'thursday': ['09:00', '17:00'],
      'friday': ['09:00', '17:00']
    })
  },
  {
    name: 'Olivia Bennett',
    display_name: 'Olivia B.',
    bio: 'Executive Recruiting Consultant with expertise in C-level and senior management placements. Specialized in helping executives transition to remote leadership roles across various industries.',
    avatar_url: 'images/agents/Olivia.png',
    experience_years: 12,
    hourly_rate: 180.00,
    location: 'New York, NY',
    timezone: 'EST',
    specializations: JSON.stringify([
      'Executive Search',
      'C-Level Recruiting',
      'Remote Leadership',
      'Healthcare Recruiting',
      'Finance & Banking'
    ]),
    skills: JSON.stringify([
      'Executive Assessment',
      'Leadership Coaching',
      'Board Relations',
      'Succession Planning',
      'Remote Team Building'
    ]),
    languages: JSON.stringify(['English', 'Spanish']),
    certifications: JSON.stringify([
      'Certified Executive Recruiter (CER)',
      'Society for Human Resource Management (SHRM)',
      'International Coach Federation (ICF)'
    ]),
    linkedin_url: 'https://linkedin.com/in/olivia-bennett-executive',
    is_verified: true,
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Executive Strategy Session',
      'Leadership Assessment',
      'Board Interview Prep',
      'Compensation Negotiation',
      'Career Transition Planning'
    ]),
    availability: JSON.stringify({
      'monday': ['10:00', '18:00'],
      'tuesday': ['10:00', '18:00'],
      'wednesday': ['10:00', '18:00'],
      'thursday': ['10:00', '18:00'],
      'friday': ['10:00', '16:00']
    })
  },
  {
    name: 'Daniel Freeman',
    display_name: 'Daniel F.',
    bio: 'Creative Industries Recruiting Consultant focused on design, marketing, and creative roles. Passionate about helping creative professionals build sustainable remote careers while maintaining work-life balance.',
    avatar_url: 'images/agents/Daniel.jpg',
    experience_years: 6,
    hourly_rate: 95.00,
    location: 'Austin, TX',
    timezone: 'CST',
    specializations: JSON.stringify([
      'Creative Recruiting',
      'Design & UX/UI',
      'Digital Marketing',
      'Content Creation',
      'Remote Creative Teams'
    ]),
    skills: JSON.stringify([
      'Portfolio Review',
      'Creative Direction',
      'Freelance Transition',
      'Brand Strategy',
      'Remote Collaboration'
    ]),
    languages: JSON.stringify(['English']),
    certifications: JSON.stringify([
      'Google Analytics Certified',
      'HubSpot Content Marketing',
      'Adobe Certified Expert'
    ]),
    linkedin_url: 'https://linkedin.com/in/daniel-freeman-creative',
    is_verified: true,
    is_featured: false,
    is_active: true,
    consultation_types: JSON.stringify([
      'Portfolio Review',
      'Creative Career Strategy',
      'Freelance Setup',
      'Client Acquisition',
      'Creative Skills Assessment'
    ]),
    availability: JSON.stringify({
      'tuesday': ['11:00', '19:00'],
      'wednesday': ['11:00', '19:00'],
      'thursday': ['11:00', '19:00'],
      'friday': ['11:00', '19:00'],
      'saturday': ['10:00', '14:00']
    })
  },
  {
    name: 'Naomi Clarke',
    display_name: 'Naomi C.',
    bio: 'Healthcare & Life Sciences Recruiting Consultant with deep expertise in medical, pharmaceutical, and biotech industries. Specializes in remote healthcare roles and telemedicine opportunities.',
    avatar_url: 'images/agents/Naomi.png',
    experience_years: 10,
    hourly_rate: 140.00,
    location: 'Boston, MA',
    timezone: 'EST',
    specializations: JSON.stringify([
      'Healthcare Recruiting',
      'Life Sciences',
      'Telemedicine',
      'Medical Device',
      'Pharmaceutical'
    ]),
    skills: JSON.stringify([
      'Medical Credentialing',
      'Healthcare Compliance',
      'Telemedicine Setup',
      'Medical Writing',
      'Healthcare Technology'
    ]),
    languages: JSON.stringify(['English', 'German']),
    certifications: JSON.stringify([
      'Healthcare Recruiting Certified',
      'HIPAA Compliance Training',
      'Medical Staff Services Certified'
    ]),
    linkedin_url: 'https://linkedin.com/in/naomi-clarke-healthcare',
    is_verified: true,
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Healthcare Career Planning',
      'Medical Licensing Guidance',
      'Telemedicine Transition',
      'Healthcare Resume Review',
      'Medical Interview Prep'
    ]),
    availability: JSON.stringify({
      'monday': ['08:00', '16:00'],
      'tuesday': ['08:00', '16:00'],
      'wednesday': ['08:00', '16:00'],
      'thursday': ['08:00', '16:00'],
      'friday': ['08:00', '14:00']
    })
  },
  {
    name: 'Isha Malik',
    display_name: 'Isha M.',
    bio: 'Entry-Level & Career Change Specialist helping professionals transition into remote work. Expert in skill assessment, career pivoting, and helping newcomers navigate the remote job market successfully.',
    avatar_url: 'images/agents/Isha.jpg',
    experience_years: 5,
    hourly_rate: 85.00,
    location: 'Seattle, WA',
    timezone: 'PST',
    specializations: JSON.stringify([
      'Career Change Coaching',
      'Entry-Level Placement',
      'Skills Assessment',
      'Remote Work Training',
      'Professional Development'
    ]),
    skills: JSON.stringify([
      'Career Assessment',
      'Skill Development',
      'Resume Building',
      'Interview Training',
      'Remote Work Mentoring'
    ]),
    languages: JSON.stringify(['English', 'Hindi', 'Urdu']),
    certifications: JSON.stringify([
      'Certified Career Coach',
      'Remote Work Professional',
      'Skills Assessment Specialist'
    ]),
    linkedin_url: 'https://linkedin.com/in/isha-malik-careers',
    is_verified: true,
    is_featured: false,
    is_active: true,
    consultation_types: JSON.stringify([
      'Career Assessment',
      'Skills Gap Analysis',
      'Career Change Strategy',
      'Entry-Level Job Search',
      'Remote Work Preparation'
    ]),
    availability: JSON.stringify({
      'monday': ['09:00', '17:00'],
      'tuesday': ['09:00', '17:00'],
      'wednesday': ['12:00', '20:00'],
      'thursday': ['09:00', '17:00'],
      'friday': ['09:00', '17:00']
    })
  }
];

async function addRecruitingConsultants() {
  const client = await pool.connect();
  
  try {
    console.log('🎯 Adding Recruiting Consultants to Database...\n');
    
    // Check if agents table exists and has the required columns
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents' 
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length === 0) {
      throw new Error('Agents table does not exist. Please run the main migration first.');
    }
    
    console.log('✅ Agents table found with columns:', tableCheck.rows.map(r => r.column_name).join(', '));
    
    // Check if we need to add user_id references (create dummy user accounts for agents)
    let userIdMap = {};
    
    for (const consultant of recruitingConsultants) {
      // Create user account for each consultant
      const email = `${consultant.name.toLowerCase().replace(' ', '.')}@flexjobs.com`;
      const password = '$2b$12$dummyHashForAgentAccounts'; // Placeholder hash
      
      try {
        const userResult = await client.query(`
          INSERT INTO users (email, password, first_name, last_name, user_type, is_active, email_verified)
          VALUES ($1, $2, $3, $4, 'admin', true, true)
          ON CONFLICT (email) DO UPDATE SET 
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name
          RETURNING id
        `, [
          email,
          password,
          consultant.name.split(' ')[0],
          consultant.name.split(' ').slice(1).join(' ')
        ]);
        
        userIdMap[consultant.name] = userResult.rows[0].id;
        console.log(`👤 Created/Updated user account for ${consultant.name}`);
        
      } catch (userError) {
        console.warn(`Warning creating user for ${consultant.name}:`, userError.message);
        // Use a default user ID if creation fails
        userIdMap[consultant.name] = 1;
      }
    }
    
    // Now insert/update agents
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const consultant of recruitingConsultants) {
      try {
        // Check if agent already exists by name
        const existingAgent = await client.query(
          'SELECT id FROM agents WHERE name = $1 OR display_name = $2',
          [consultant.name, consultant.display_name]
        );
        
        if (existingAgent.rows.length > 0) {
          // Update existing agent
          await client.query(`
            UPDATE agents SET
              user_id = $1,
              name = $2,
              display_name = $3,
              bio = $4,
              avatar = $5,
              experience_years = $6,
              hourly_rate = $7,
              specializations = $8,
              is_verified = $9,
              is_featured = $10,
              is_active = $11,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
          `, [
            userIdMap[consultant.name],
            consultant.name,
            consultant.display_name,
            consultant.bio,
            consultant.avatar_url,
            consultant.experience_years,
            consultant.hourly_rate,
            consultant.specializations,
            consultant.is_verified,
            consultant.is_featured,
            consultant.is_active,
            existingAgent.rows[0].id
          ]);
          
          updatedCount++;
          console.log(`🔄 Updated agent: ${consultant.name}`);
        } else {
          // Insert new agent
          await client.query(`
            INSERT INTO agents (
              user_id, name, display_name, bio, avatar, experience_years, 
              hourly_rate, specializations, is_verified, is_featured, is_active,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            userIdMap[consultant.name],
            consultant.name,
            consultant.display_name,
            consultant.bio,
            consultant.avatar_url,
            consultant.experience_years,
            consultant.hourly_rate,
            consultant.specializations,
            consultant.is_verified,
            consultant.is_featured,
            consultant.is_active
          ]);
          
          insertedCount++;
          console.log(`✅ Inserted agent: ${consultant.name}`);
        }
        
      } catch (agentError) {
        console.error(`❌ Error processing ${consultant.name}:`, agentError.message);
      }
    }
    
    // Verify the results
    const finalCount = await client.query('SELECT COUNT(*) as count FROM agents');
    const featuredCount = await client.query('SELECT COUNT(*) as count FROM agents WHERE is_featured = true');
    const verifiedCount = await client.query('SELECT COUNT(*) as count FROM agents WHERE is_verified = true');
    
    console.log('\n🎉 Recruiting Consultants Migration Completed!');
    console.log('📊 Summary:');
    console.log(`   • ${insertedCount} new consultants added`);
    console.log(`   • ${updatedCount} existing consultants updated`);
    console.log(`   • ${finalCount.rows[0].count} total agents in database`);
    console.log(`   • ${featuredCount.rows[0].count} featured consultants`);
    console.log(`   • ${verifiedCount.rows[0].count} verified consultants`);
    
    console.log('\n📋 Available Recruiting Consultants:');
    recruitingConsultants.forEach(consultant => {
      console.log(`   • ${consultant.name} (${consultant.display_name}) - ${consultant.specializations.replace(/[\[\]"]/g, '').split(',')[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  addRecruitingConsultants()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addRecruitingConsultants, recruitingConsultants };
