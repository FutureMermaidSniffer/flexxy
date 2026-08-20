#!/usr/bin/env node
/**
 * Upsert the public FlexJobs agent roster from the live site values,
 * keep extra agents (inactive) so admin still lists everyone.
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const LIVE_AGENTS = [
  {
    email: 'sophie.mensah@flexjobs.com',
    agent_name: 'Sophie Mensah',
    display_name: 'Sophie M.',
    specializations: ['Marketing', 'Brand Strategy', 'Digital Marketing'],
    bio: 'Marketing specialist with 8+ years experience in brand strategy and digital marketing campaigns. Expert in social media marketing and content creation.',
    location: 'Toronto, ON, Canada',
    timezone: 'GMT',
    experience_years: 8,
    rating: 4.85,
    total_reviews: 47,
    languages: ['English', 'French'],
    skills: ['Social Media Marketing', 'Content Strategy', 'Brand Development', 'Analytics'],
    avatar_url: '/images/agents/Sophie.png',
    is_featured: true,
    is_active: true
  },
  {
    email: 'daniel.freeman@flexjobs.com',
    agent_name: 'Daniel Freeman',
    display_name: 'Daniel Freeman',
    specializations: ['Finance', 'Accounting', 'Financial Analysis'],
    bio: 'Job matching expert with extensive experience in corporate finance and accounting. Specializes in connecting professionals with top-tier remote opportunities.',
    location: 'New York, NY, USA',
    timezone: 'EST',
    experience_years: 12,
    rating: 4.78,
    total_reviews: 54,
    languages: ['English', 'Spanish'],
    skills: ['Financial Analysis', 'Risk Management', 'Corporate Finance', 'Excel Modeling'],
    avatar_url: '/images/agents/Daniel.jpg',
    is_featured: true,
    is_active: true
  },
  {
    email: 'naomi.clarke@flexjobs.com',
    agent_name: 'Naomi Clarke',
    display_name: 'Naomi Clarke',
    specializations: ['Human Resources', 'Talent Acquisition', 'Employee Relations'],
    bio: 'HR specialist focused on talent acquisition and employee relations. Expert in remote work policies and helping companies build strong distributed teams.',
    location: 'Vancouver, BC, Canada',
    timezone: 'CST',
    experience_years: 9,
    rating: 4.89,
    total_reviews: 71,
    languages: ['English'],
    skills: ['Talent Acquisition', 'Performance Management', 'Remote Team Building', 'HR Analytics'],
    avatar_url: '/images/agents/Naomi.png',
    is_featured: true,
    is_active: true
  },
  {
    email: 'isha.malik@flexjobs.com',
    agent_name: 'Isha Malik',
    display_name: 'Isha Malik',
    specializations: ['Healthcare', 'Medical Administration', 'Healthcare IT'],
    bio: 'Remote work industry expert with deep knowledge of administration and IT systems. Specializes in placing professionals in remote and hybrid roles.',
    location: 'Chicago, IL, USA',
    timezone: 'PST',
    experience_years: 7,
    rating: 4.94,
    total_reviews: 38,
    languages: ['English', 'Hindi'],
    skills: ['Healthcare Administration', 'Medical Coding', 'HIPAA Compliance', 'Healthcare IT'],
    avatar_url: '/images/agents/Isha.jpg',
    is_featured: true,
    is_active: true
  },
  {
    email: 'olivia.bennett@flexjobs.com',
    agent_name: 'Olivia Bennett',
    display_name: 'Olivia B.',
    specializations: ['Technology', 'Software Development', 'Project Management'],
    bio: 'Senior technology consultant specializing in software development and agile project management. Passionate about helping tech professionals find their ideal remote positions.',
    location: 'Toronto, Canada',
    timezone: 'EST',
    experience_years: 10,
    rating: 4.92,
    total_reviews: 63,
    languages: ['English'],
    skills: ['JavaScript', 'Python', 'Agile Methodology', 'Team Leadership'],
    avatar_url: '/images/agents/Olivia.png',
    is_featured: false,
    is_active: false
  }
];

async function ensureUserTypeConstraint(pool) {
  const constraints = await pool.query(`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%user_type%'
  `);
  for (const row of constraints.rows) {
    await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS ${row.conname}`);
  }
  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_user_type_check
    CHECK (user_type IN ('job_seeker', 'employer', 'admin', 'agent'))
  `);
}

async function upsertAgent(pool, agent) {
  const nameParts = agent.agent_name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || firstName;

  let user = (await pool.query('SELECT id FROM users WHERE email = $1', [agent.email])).rows[0];
  if (!user) {
    const hashed = await bcrypt.hash(`agent-${agent.email}-${Date.now()}`, 10);
    const created = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type, is_active, email_verified)
       VALUES ($1, $2, $3, $4, 'agent', TRUE, TRUE)
       RETURNING id`,
      [agent.email, hashed, firstName, lastName]
    );
    user = created.rows[0];
    console.log(`Created user ${agent.email} (${user.id})`);
  } else {
    await pool.query(
      `UPDATE users SET first_name = $2, last_name = $3, is_active = TRUE WHERE id = $1`,
      [user.id, firstName, lastName]
    );
  }

  const existing = (await pool.query(
    `SELECT id FROM agents
     WHERE user_id = $1 OR lower(agent_name) = lower($2) OR lower(email) = lower($3)`,
    [user.id, agent.agent_name, agent.email]
  )).rows[0];

  const fields = [
    user.id,
    agent.agent_name,
    agent.display_name,
    JSON.stringify(agent.specializations),
    agent.bio,
    agent.avatar_url,
    agent.experience_years,
    agent.rating,
    agent.total_reviews,
    JSON.stringify(agent.languages),
    JSON.stringify(agent.skills),
    agent.location,
    agent.timezone,
    agent.is_featured,
    agent.is_active
  ];

  if (existing) {
    await pool.query(
      `UPDATE agents SET
         user_id = $1,
         agent_name = $2,
         display_name = $3,
         specializations = $4,
         bio = $5,
         avatar_url = $6,
         experience_years = $7,
         rating = $8,
         total_reviews = $9,
         languages = $10,
         skills = $11,
         location = $12,
         timezone = $13,
         is_featured = $14,
         is_active = $15,
         updated_at = NOW()
       WHERE id = $16`,
      [...fields, existing.id]
    );
    console.log(`Updated agent ${agent.agent_name} (id ${existing.id}) active=${agent.is_active}`);
    return existing.id;
  }

  const inserted = await pool.query(
    `INSERT INTO agents (
       user_id, agent_name, display_name, specializations, bio, avatar_url,
       experience_years, rating, total_reviews, languages, skills, location,
       timezone, is_featured, is_active, currency, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'USD', NOW(), NOW()
     ) RETURNING id`,
    fields
  );
  console.log(`Inserted agent ${agent.agent_name} (id ${inserted.rows[0].id})`);
  return inserted.rows[0].id;
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'flexjobs_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await ensureUserTypeConstraint(pool);
    console.log('users.user_type allows agent');

    try {
      await pool.query('ALTER TABLE agents ADD COLUMN IF NOT EXISTS email VARCHAR(255)');
    } catch (err) {
      console.warn('Could not add agents.email:', err.message);
    }

    const keepIds = [];
    for (const agent of LIVE_AGENTS) {
      const id = await upsertAgent(pool, agent);
      keepIds.push(id);
      try {
        await pool.query('UPDATE agents SET email = $2 WHERE id = $1', [id, agent.email]);
      } catch {
        // column may still be missing
      }
    }

    const deactivated = await pool.query(
      `UPDATE agents SET is_active = FALSE, is_featured = FALSE, updated_at = NOW()
       WHERE id <> ALL($1::int[])
       RETURNING id, agent_name`,
      [keepIds]
    );
    if (deactivated.rows.length) {
      console.log('Deactivated extra agents:');
      deactivated.rows.forEach((r) => console.log(`  ${r.id} ${r.agent_name}`));
    } else {
      console.log('No extra agents to deactivate');
    }

    const all = await pool.query(
      `SELECT id, agent_name, display_name, location, is_active, is_featured, rating
       FROM agents ORDER BY is_active DESC, agent_name`
    );
    console.table(all.rows);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
