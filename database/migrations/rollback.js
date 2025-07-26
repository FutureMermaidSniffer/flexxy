const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseRollback {
    constructor() {
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            charset: 'utf8mb4'
        };
        
        this.databaseName = process.env.DB_NAME || 'flexjobs_db';
    }

    async createConnection() {
        try {
            this.connection = await mysql.createConnection(this.connectionConfig);
            console.log('✅ Connected to MySQL server');
            return this.connection;
        } catch (error) {
            console.error('❌ Failed to connect to MySQL server:', error.message);
            throw error;
        }
    }

    async checkDatabaseExists() {
        try {
            const [databases] = await this.connection.execute('SHOW DATABASES LIKE ?', [this.databaseName]);
            return databases.length > 0;
        } catch (error) {
            return false;
        }
    }

    async getTableList() {
        try {
            const [tables] = await this.connection.execute(`
                SELECT TABLE_NAME 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_NAME
            `, [this.databaseName]);
            
            return tables.map(row => row.TABLE_NAME);
        } catch (error) {
            return [];
        }
    }

    async dropTablesOnly() {
        console.log('🗑️  Dropping all tables...');
        
        try {
            // Use the database
            await this.connection.execute(`USE ${this.databaseName}`);
            
            // Get all tables
            const tables = await this.getTableList();
            
            if (tables.length === 0) {
                console.log('ℹ️  No tables found to drop');
                return;
            }

            // Disable foreign key checks temporarily
            await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            // Drop each table
            for (const table of tables) {
                await this.connection.execute(`DROP TABLE IF EXISTS ${table}`);
                console.log(`✅ Dropped table: ${table}`);
            }
            
            // Re-enable foreign key checks
            await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
            
            console.log(`✅ All ${tables.length} tables dropped successfully`);
            
        } catch (error) {
            console.error('❌ Failed to drop tables:', error.message);
            throw error;
        }
    }

    async dropDatabase() {
        console.log(`🗑️  Dropping database '${this.databaseName}'...`);
        
        try {
            await this.connection.execute(`DROP DATABASE IF EXISTS ${this.databaseName}`);
            console.log(`✅ Database '${this.databaseName}' dropped successfully`);
        } catch (error) {
            console.error('❌ Failed to drop database:', error.message);
            throw error;
        }
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ Database connection closed');
        }
    }

    async confirmAction(action) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(`⚠️  Are you sure you want to ${action}? This action cannot be undone! (yes/no): `, (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
            });
        });
    }

    async runRollback(options = {}) {
        const { dropDatabase = false, force = false } = options;
        
        console.log('🔄 Starting FlexJobs database rollback...\n');
        
        try {
            // Connect to MySQL
            await this.createConnection();
            
            // Check if database exists
            const dbExists = await this.checkDatabaseExists();
            if (!dbExists) {
                console.log(`ℹ️  Database '${this.databaseName}' does not exist`);
                return;
            }

            // Get confirmation unless forced
            if (!force) {
                const action = dropDatabase ? 'drop the entire database' : 'drop all tables';
                const confirmed = await this.confirmAction(action);
                
                if (!confirmed) {
                    console.log('❌ Rollback cancelled by user');
                    return;
                }
            }

            if (dropDatabase) {
                await this.dropDatabase();
            } else {
                await this.dropTablesOnly();
            }
            
            console.log('\n✅ Rollback completed successfully!');
            
        } catch (error) {
            console.error('\n❌ Rollback failed:', error.message);
            throw error;
        } finally {
            await this.closeConnection();
        }
    }
}

// Export for use in other scripts
module.exports = DatabaseRollback;

// Run rollback if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const dropDatabase = args.includes('--drop-database');
    const force = args.includes('--force');
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
FlexJobs Database Rollback Script

Usage: node rollback.js [options]

Options:
  --drop-database    Drop the entire database (default: drop tables only)
  --force            Skip confirmation prompt
  --help, -h         Show this help message

Examples:
  node rollback.js                    # Drop all tables (with confirmation)
  node rollback.js --force            # Drop all tables (no confirmation)
  node rollback.js --drop-database    # Drop entire database (with confirmation)
  node rollback.js --drop-database --force  # Drop entire database (no confirmation)
        `);
        process.exit(0);
    }
    
    const rollback = new DatabaseRollback();
    rollback.runRollback({ dropDatabase, force })
        .then(() => {
            console.log('\n🏁 Rollback script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Rollback script failed:', error);
            process.exit(1);
        });
}
