const { pool } = require('./backend/database');
const fs = require('fs');
const path = require('path');

async function populateAgentData() {
    let client;
    
    try {
        console.log('🔌 Connecting to database...');
        client = await pool.connect();
        
        console.log('📖 Reading sample agent data...');
        const sqlFile = path.join(__dirname, 'database', 'sample_agents_data.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        
        const cleanedSql = sqlContent
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
            .join('\n');
        
        
        const statements = cleanedSql
            .split(/;\s*\n/)
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(`📝 Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            try {
                await client.query(statement);
                console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
            } catch (error) {
                
                if (error.code === '23505' || error.message.includes('duplicate key')) {
                    console.log(`⚠️  Statement ${i + 1}/${statements.length} - Duplicate entry (skipping)`);
                } else {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    console.log('Statement:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        console.log('\n🎉 Sample agent data population completed!');
        
        
        console.log('\n📊 Verifying data...');
        const agentsResult = await client.query('SELECT COUNT(*) as count FROM agents');
        const usersResult = await client.query('SELECT COUNT(*) as count FROM users WHERE user_type = $1', ['agent']);
        const reviewsResult = await client.query('SELECT COUNT(*) as count FROM agent_reviews');
        
        console.log(`👥 Total agents in database: ${agentsResult.rows[0].count}`);
        console.log(`🧑‍💼 Total agent users: ${usersResult.rows[0].count}`);
        console.log(`⭐ Total agent reviews: ${reviewsResult.rows[0].count}`);
        
    } catch (error) {
        console.error('❌ Error populating agent data:', error);
    } finally {
        if (client) {
            client.release();
            console.log('🔌 Database connection released');
        }
    }
}


if (require.main === module) {
    populateAgentData()
        .then(() => {
            console.log('\n✨ Script completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error);
            process.exit(1);
        });
}

module.exports = { populateAgentData };
