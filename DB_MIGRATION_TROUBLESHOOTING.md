# Database Migration Troubleshooting Guide

If you're experiencing issues with database migration, follow this guide to diagnose and fix common problems.

## Common Issues and Solutions

### 1. Tables Not Being Created

**Symptoms:**
- Error messages about relations not existing
- Missing tables in the database
- Application showing database connection errors

**Solutions:**

1. **Check Database Connection:**
   ```bash
   # Inside Docker container
   docker exec -it flexjobs-app node -e "const { Client } = require('pg'); const client = new Client({host:process.env.DB_HOST, port:process.env.DB_PORT, user:process.env.DB_USER, password:process.env.DB_PASSWORD, database:process.env.DB_NAME}); client.connect().then(() => { console.log('Connected!'); client.end(); }).catch(e => console.error(e));"
   ```

2. **Run Migration Manually:**
   ```bash
   # From your server
   ./run-migration.sh
   
   # Inside Docker container
   docker exec -it flexjobs-app node database/migrations/migrate.js
   ```

3. **Check Database Logs:**
   ```bash
   docker logs flexjobs-db
   ```

4. **Verify Environment Variables:**
   ```bash
   docker exec -it flexjobs-app printenv | grep DB_
   ```

### 2. Database Permission Issues

**Symptoms:**
- "permission denied" errors in logs
- Migration fails with authentication errors

**Solutions:**

1. **Fix Database User Permissions:**
   ```bash
   # Connect to PostgreSQL
   docker exec -it flexjobs-db psql -U postgres
   
   # Create user if not exists
   CREATE USER kai WITH PASSWORD '11223344';
   
   # Grant necessary permissions
   ALTER USER kai WITH CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE flexjobs_db TO kai;
   
   # Connect to the database
   \c flexjobs_db
   
   # Grant schema permissions
   GRANT ALL ON SCHEMA public TO kai;
   ```

2. **Reset Database and Start Fresh:**
   ```bash
   # Stop containers
   docker-compose down
   
   # Remove volumes
   docker volume rm flexjobs_db_data
   
   # Start again
   docker-compose --env-file .env.docker up -d
   
   # Run migration
   ./run-migration.sh
   ```

### 3. Migration Errors with Table Creation

**Symptoms:**
- Errors about syntax in CREATE TABLE statements
- Issues with constraints or references

**Solutions:**

1. **Check PostgreSQL Version:**
   ```bash
   docker exec -it flexjobs-db psql -U postgres -c "SELECT version();"
   ```
   
   Make sure the migration script is compatible with your PostgreSQL version.

2. **Run Migration in Debug Mode:**
   ```bash
   # Set environment variable for debugging
   docker exec -it flexjobs-app bash -c "LOG_LEVEL=debug node database/migrations/migrate.js"
   ```

3. **Examine Specific Table Creation:**
   ```bash
   # Try creating just one table manually
   docker exec -it flexjobs-db psql -U kai -d flexjobs_db -c "CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));"
   ```

## Step-by-Step Migration Process

1. **Ensure containers are running:**
   ```bash
   docker-compose --env-file .env.docker up -d
   ```

2. **Verify database connection:**
   ```bash
   docker exec -it flexjobs-app node -e "const { Client } = require('pg'); const client = new Client({host:'db', user:'kai', password:'11223344', database:'flexjobs_db'}); client.connect().then(() => { console.log('Connected!'); client.end(); }).catch(e => console.error(e));"
   ```

3. **Run migration script:**
   ```bash
   docker exec -it flexjobs-app node database/migrations/migrate.js
   ```

4. **Verify tables were created:**
   ```bash
   docker exec -it flexjobs-db psql -U kai -d flexjobs_db -c "\dt"
   ```

5. **Check for admin user:**
   ```bash
   docker exec -it flexjobs-db psql -U kai -d flexjobs_db -c "SELECT email FROM users WHERE user_type='admin';"
   ```

## Database Schema Changes

If you make changes to the database schema:

1. Update the migration file (`database/migrations/migrate.js`)
2. Run the migration again
3. If tables already exist, you may need to use ALTER TABLE statements

## Testing Database Connection

```javascript
// Test script for database connection
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'flexjobs_db'
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const result = await client.query('SELECT current_database() as db, version()');
    console.log(`Database: ${result.rows[0].db}`);
    console.log(`Version: ${result.rows[0].version}`);
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name
    `);
    
    console.log('\nTables:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
```

Save this as `test-db-connection.js` and run with:
```bash
docker exec -it flexjobs-app node test-db-connection.js
```
