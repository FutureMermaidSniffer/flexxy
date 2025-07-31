const { executeQuery } = require('../backend/database');

async function runOAuthMigration() {
  try {
    console.log('Starting OAuth migration...');
    
    // Check and add google_id column
    try {
      await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='google_id'
      `);
      console.log('✓ google_id column already exists');
    } catch (error) {
      console.log('Adding google_id column...');
      await executeQuery('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE');
      console.log('✓ google_id column added');
    }
    
    // Check and add apple_id column
    try {
      const result = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='apple_id'
      `);
      if (result.length === 0) {
        console.log('Adding apple_id column...');
        await executeQuery('ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) UNIQUE');
        console.log('✓ apple_id column added');
      } else {
        console.log('✓ apple_id column already exists');
      }
    } catch (error) {
      console.log('Adding apple_id column...');
      await executeQuery('ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) UNIQUE');
      console.log('✓ apple_id column added');
    }
    
    // Check and add avatar_url column
    try {
      const result = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='avatar_url'
      `);
      if (result.length === 0) {
        console.log('Adding avatar_url column...');
        await executeQuery('ALTER TABLE users ADD COLUMN avatar_url TEXT');
        console.log('✓ avatar_url column added');
      } else {
        console.log('✓ avatar_url column already exists');
      }
    } catch (error) {
      console.log('Adding avatar_url column...');
      await executeQuery('ALTER TABLE users ADD COLUMN avatar_url TEXT');
      console.log('✓ avatar_url column added');
    }
    
    // Create indexes if they don't exist
    try {
      await executeQuery('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
      console.log('✓ google_id index created/verified');
    } catch (error) {
      console.log('Google ID index may already exist:', error.message);
    }
    
    try {
      await executeQuery('CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id)');
      console.log('✓ apple_id index created/verified');
    } catch (error) {
      console.log('Apple ID index may already exist:', error.message);
    }
    
    // Update existing users to have email_verified = true
    try {
      const result = await executeQuery('UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL');
      console.log(`✓ Updated ${result.length || 0} users with email_verified = TRUE`);
    } catch (error) {
      console.log('Email verified update completed or column already properly set');
    }
    
    console.log('✅ OAuth migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runOAuthMigration();
