const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'flexjobs_db',
  port: process.env.DB_PORT || 5433,
  password: process.env.DB_PASSWORD || 'your_password'
});

// Recruiting consultants data (matching your actual database schema)
const recruitingConsultants = [
  {
    name: 'Sophie Mensah',
    display_name: 'Sophie M. - Senior Recruiting Consultant',
    bio: 'Senior recruiting consultant with 8+ years of experience helping professionals find remote opportunities in tech, marketing, and business development. Specializes in career transitions and salary negotiations.',
    avatar_url: '/images/agents/Sophie.png',
    specializations: JSON.stringify(['Remote Work Placement', 'Career Transitions', 'Salary Negotiation', 'Tech Recruiting']),
    experience_years: 8,
    hourly_rate: 150.00,
    rating: 4.9,
    total_reviews: 127,
    currency: 'USD',
    languages: JSON.stringify(['English', 'French', 'German']),
    skills: JSON.stringify(['Technical Recruiting', 'Remote Work Consulting', 'Career Coaching', 'Interview Preparation']),
    certifications: JSON.stringify([
      'Certified Professional Recruiter (CPR)',
      'Remote Work Association Certified',
      'LinkedIn Talent Solutions'
    ]),
    location: 'New York, NY',
    timezone: 'America/New_York',
    availability_schedule: JSON.stringify({
      'monday': ['09:00-17:00'],
      'tuesday': ['09:00-17:00'],
      'wednesday': ['09:00-17:00'],
      'thursday': ['09:00-17:00'],
      'friday': ['09:00-15:00']
    }),
    linkedin_url: 'https://linkedin.com/in/sophie-mensah-recruiting',
    portfolio_url: 'https://sophiemensah.com/portfolio',
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Career Strategy Session',
      'Resume Review & Optimization',
      'Interview Preparation',
      'Salary Negotiation Coaching'
    ])
  },
  {
    name: 'Olivia Carter',
    display_name: 'Olivia C. - Tech Recruiting Specialist',
    bio: 'Technology recruiting specialist with deep expertise in placing software engineers, data scientists, and product managers at top-tier companies. Passionate about helping tech professionals advance their careers.',
    avatar_url: '/images/agents/Olivia.png',
    specializations: JSON.stringify(['Tech Recruiting', 'Software Engineering Roles', 'Data Science Placement', 'Product Management']),
    experience_years: 6,
    hourly_rate: 140.00,
    rating: 4.8,
    total_reviews: 89,
    currency: 'USD',
    languages: JSON.stringify(['English', 'Spanish']),
    skills: JSON.stringify(['Technical Assessment', 'Startup Recruiting', 'Executive Search', 'Compensation Analysis']),
    certifications: JSON.stringify([
      'Technical Recruiting Certification',
      'Google for Startups Mentor',
      'SHRM Certified Professional'
    ]),
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    availability_schedule: JSON.stringify({
      'monday': ['08:00-16:00'],
      'tuesday': ['08:00-16:00'],
      'wednesday': ['08:00-16:00'],
      'thursday': ['08:00-16:00'],
      'friday': ['08:00-14:00']
    }),
    linkedin_url: 'https://linkedin.com/in/olivia-carter-tech',
    portfolio_url: 'https://oliviacarter.tech',
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Technical Role Assessment',
      'Startup Career Guidance',
      'Compensation Benchmarking',
      'Technical Interview Prep'
    ])
  },
  {
    name: 'Daniel Rodriguez',
    display_name: 'Daniel R. - Executive Search Consultant',
    bio: 'Executive search consultant specializing in C-suite and senior leadership placements across industries. Expert in executive coaching and leadership development with a track record of successful placements.',
    avatar_url: '/images/agents/Daniel.jpg',
    specializations: JSON.stringify(['Executive Search', 'Leadership Coaching', 'C-Suite Placement', 'Board Advisory']),
    experience_years: 12,
    hourly_rate: 200.00,
    rating: 4.95,
    total_reviews: 156,
    currency: 'USD',
    languages: JSON.stringify(['English', 'Spanish', 'Portuguese']),
    skills: JSON.stringify(['Executive Coaching', 'Board Search', 'Leadership Assessment', 'Succession Planning']),
    certifications: JSON.stringify([
      'Certified Executive Coach (CEC)',
      'Association of Executive Search Consultants Member',
      'Leadership Circle Profile Certified'
    ]),
    location: 'Chicago, IL',
    timezone: 'America/Chicago',
    availability_schedule: JSON.stringify({
      'monday': ['10:00-18:00'],
      'tuesday': ['10:00-18:00'],
      'wednesday': ['10:00-18:00'],
      'thursday': ['10:00-18:00'],
      'friday': ['10:00-16:00']
    }),
    linkedin_url: 'https://linkedin.com/in/daniel-rodriguez-exec',
    portfolio_url: 'https://danielrodriguez.consulting',
    is_featured: true,
    is_active: true,
    consultation_types: JSON.stringify([
      'Executive Career Strategy',
      'Leadership Assessment',
      'Board Readiness Coaching',
      'Succession Planning'
    ])
  },
  {
    name: 'Naomi Kim',
    display_name: 'Naomi K. - Healthcare & Finance Recruiter',
    bio: 'Specialized recruiter focusing on healthcare and financial services with expertise in placing professionals from entry-level to executive positions. Known for thorough market knowledge and personalized approach.',
    avatar_url: '/images/agents/Naomi.png',
    specializations: JSON.stringify(['Healthcare Recruiting', 'Financial Services', 'Regulatory Compliance', 'Medical Device Sales']),
    experience_years: 7,
    hourly_rate: 135.00,
    rating: 4.85,
    total_reviews: 98,
    currency: 'USD',
    languages: JSON.stringify(['English', 'Korean', 'Mandarin']),
    skills: JSON.stringify(['Healthcare Recruiting', 'Financial Analysis', 'Regulatory Knowledge', 'Clinical Research']),
    certifications: JSON.stringify([
      'Healthcare Recruiting Certification',
      'Financial Industry Regulatory Authority (FINRA)',
      'Certified Medical Representative'
    ]),
    location: 'Boston, MA',
    timezone: 'America/New_York',
    availability_schedule: JSON.stringify({
      'monday': ['09:00-17:00'],
      'tuesday': ['09:00-17:00'],
      'wednesday': ['09:00-17:00'],
      'thursday': ['09:00-17:00'],
      'friday': ['09:00-15:00']
    }),
    linkedin_url: 'https://linkedin.com/in/naomi-kim-healthcare',
    portfolio_url: 'https://naomikim.healthcare',
    is_featured: false,
    is_active: true,
    consultation_types: JSON.stringify([
      'Healthcare Career Planning',
      'Financial Services Transition',
      'Regulatory Compliance Guidance',
      'Medical Sales Strategy'
    ])
  },
  {
    name: 'Isha Patel',
    display_name: 'Isha P. - Marketing & Creative Recruiter',
    bio: 'Creative and marketing recruitment specialist with a passion for connecting talented professionals with innovative companies. Expertise in digital marketing, creative agencies, and startup environments.',
    avatar_url: '/images/agents/Isha.jpg',
    specializations: JSON.stringify(['Marketing Recruiting', 'Creative Roles', 'Digital Marketing', 'Agency Placement']),
    experience_years: 5,
    hourly_rate: 125.00,
    rating: 4.75,
    total_reviews: 73,
    currency: 'USD',
    languages: JSON.stringify(['English', 'Hindi', 'Gujarati']),
    skills: JSON.stringify(['Creative Portfolio Review', 'Digital Marketing Strategy', 'Agency Recruiting', 'Freelancer Placement']),
    certifications: JSON.stringify([
      'Digital Marketing Institute Certified',
      'Creative Recruiting Specialist',
      'Google Ads Certified'
    ]),
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    availability_schedule: JSON.stringify({
      'monday': ['10:00-18:00'],
      'tuesday': ['10:00-18:00'],
      'wednesday': ['10:00-18:00'],
      'thursday': ['10:00-18:00'],
      'friday': ['10:00-16:00']
    }),
    linkedin_url: 'https://linkedin.com/in/isha-patel-marketing',
    portfolio_url: 'https://ishapatel.marketing',
    is_featured: false,
    is_active: true,
    consultation_types: JSON.stringify([
      'Marketing Career Strategy',
      'Portfolio Optimization',
      'Agency vs In-House Guidance',
      'Creative Role Preparation'
    ])
  }
];

async function addRecruitingConsultants() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Recruiting Consultants Migration...');
    console.log('📋 Database Configuration:');
    console.log(`   • Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   • Port: ${process.env.DB_PORT || 5433}`);
    console.log(`   • Database: ${process.env.DB_NAME || 'flexjobs_db'}`);
    
    // Test database connection
    await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL server');
    
    // Check if migrations log table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('📝 Migration log table ready');
    
    // Check if this migration has already run
    const migrationCheck = await client.query(
      'SELECT id FROM migrations_log WHERE migration_name = $1',
      ['add_recruiting_consultants']
    );
    
    if (migrationCheck.rows.length > 0) {
      console.log('⚠️  Migration already executed. Skipping...');
      return;
    }
    
    // Create user accounts for consultants first
    console.log('👥 Creating user accounts for recruiting consultants...');
    const userIdMap = {};
    
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
    console.log('🎯 Adding recruiting consultants to agents table...');
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const consultant of recruitingConsultants) {
      try {
        // Check if agent already exists by name
        const existingAgent = await client.query(
          'SELECT id FROM agents WHERE agent_name = $1 OR display_name = $2',
          [consultant.name, consultant.display_name]
        );
        
        if (existingAgent.rows.length > 0) {
          // Update existing agent
          await client.query(`
            UPDATE agents SET 
              user_id = $1,
              agent_name = $2,
              display_name = $3,
              bio = $4,
              avatar_url = $5,
              experience_years = $6,
              hourly_rate = $7,
              specializations = $8,
              is_featured = $9,
              is_active = $10,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
          `, [
            userIdMap[consultant.name],
            consultant.name,
            consultant.display_name,
            consultant.bio,
            consultant.avatar_url,
            consultant.experience_years,
            consultant.hourly_rate,
            consultant.specializations,
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
              user_id, agent_name, display_name, bio, avatar_url, experience_years, 
              hourly_rate, specializations, is_featured, is_active,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            userIdMap[consultant.name],
            consultant.name,
            consultant.display_name,
            consultant.bio,
            consultant.avatar_url,
            consultant.experience_years,
            consultant.hourly_rate,
            consultant.specializations,
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
    
    // Log this migration as completed
    await client.query(
      'INSERT INTO migrations_log (migration_name) VALUES ($1)',
      ['add_recruiting_consultants']
    );
    
    // Verify the results
    const finalCount = await client.query('SELECT COUNT(*) as count FROM agents');
    const featuredCount = await client.query('SELECT COUNT(*) as count FROM agents WHERE is_featured = true');
    const activeCount = await client.query('SELECT COUNT(*) as count FROM agents WHERE is_active = true');
    
    console.log('\n🎉 Recruiting Consultants Migration Completed!');
    console.log('📊 Summary:');
    console.log(`   • ${insertedCount} new consultants added`);
    console.log(`   • ${updatedCount} existing consultants updated`);
    console.log(`   • ${finalCount.rows[0].count} total agents in database`);
    console.log(`   • ${featuredCount.rows[0].count} featured consultants`);
    console.log(`   • ${activeCount.rows[0].count} active consultants`);
    
    console.log('\n📋 Available Recruiting Consultants:');
    recruitingConsultants.forEach(consultant => {
      const specializations = JSON.parse(consultant.specializations);
      console.log(`   • ${consultant.name} (${consultant.display_name}) - ${specializations[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
if (require.main === module) {
  addRecruitingConsultants()
    .then(() => {
      console.log('\n✨ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addRecruitingConsultants, recruitingConsultants };
