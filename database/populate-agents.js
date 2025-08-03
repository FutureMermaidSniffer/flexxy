const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');


const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flexjobs',
    multipleStatements: true
};

async function populateAgentData() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        console.log('📖 Reading sample agents data...');
        const sqlFile = path.join(__dirname, 'sample_agents_data.sql');
        const sqlData = await fs.readFile(sqlFile, 'utf8');
        
        console.log('🚀 Executing SQL statements...');
        
        
        const statements = sqlData
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✅ Executed statement successfully');
                } catch (error) {
                    console.log('⚠️  Statement skipped (might already exist):', error.message);
                }
            }
        }
        
        console.log('🎉 Sample agent data populated successfully!');
        
        
        const [agents] = await connection.execute(`
            SELECT a.agent_name, a.display_name, a.location, a.rating, a.total_reviews, u.email
            FROM agents a
            JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 10
        `);
        
        console.log('\n📊 Sample of inserted agents:');
        console.table(agents);
        
        
        const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM agents');
        console.log(`\n📈 Total agents in database: ${countResult[0].total}`);
        
    } catch (error) {
        console.error('❌ Error populating agent data:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}


if (require.main === module) {
    populateAgentData();
}

module.exports = { populateAgentData };
