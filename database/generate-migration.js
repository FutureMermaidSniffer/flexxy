#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MigrationGenerator {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations', 'sequential');
    this.rollbacksPath = path.join(this.migrationsPath, 'rollbacks');
    
    // Ensure directories exist
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }
    if (!fs.existsSync(this.rollbacksPath)) {
      fs.mkdirSync(this.rollbacksPath, { recursive: true });
    }
  }

  generateMigrationName(description) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '')
      .replace('T', '_')
      .substring(0, 15);
    
    const slug = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    return `${timestamp}_${slug}.sql`;
  }

  generateMigrationTemplate(description, type = 'table') {
    const templates = {
      table: `-- Migration: ${description}
-- Created: ${new Date().toISOString()}

-- Create new table
CREATE TABLE IF NOT EXISTS example_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_example_table_name ON example_table(name);

-- Add comments
COMMENT ON TABLE example_table IS '${description}';`,

      column: `-- Migration: ${description}
-- Created: ${new Date().toISOString()}

-- Add new column
ALTER TABLE existing_table 
ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- Update existing data if needed
-- UPDATE existing_table SET new_column = 'default_value' WHERE new_column IS NULL;

-- Add constraints if needed
-- ALTER TABLE existing_table ADD CONSTRAINT chk_new_column CHECK (new_column IS NOT NULL);`,

      index: `-- Migration: ${description}
-- Created: ${new Date().toISOString()}

-- Add new index
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);

-- Add composite index if needed
-- CREATE INDEX IF NOT EXISTS idx_table_multi ON table_name(column1, column2);`,

      data: `-- Migration: ${description}
-- Created: ${new Date().toISOString()}

-- Insert data
INSERT INTO table_name (column1, column2) VALUES
    ('value1', 'value2'),
    ('value3', 'value4')
ON CONFLICT (unique_column) DO NOTHING;

-- Update existing data
-- UPDATE table_name SET column = 'new_value' WHERE condition;`
    };

    return templates[type] || templates.table;
  }

  generateRollbackTemplate(description, type = 'table') {
    const templates = {
      table: `-- Rollback: ${description}
-- Created: ${new Date().toISOString()}

-- Drop indexes first
DROP INDEX IF EXISTS idx_example_table_name;

-- Drop table
DROP TABLE IF EXISTS example_table;`,

      column: `-- Rollback: ${description}
-- Created: ${new Date().toISOString()}

-- Remove column
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;`,

      index: `-- Rollback: ${description}
-- Created: ${new Date().toISOString()}

-- Drop indexes
DROP INDEX IF EXISTS idx_table_column;
DROP INDEX IF EXISTS idx_table_multi;`,

      data: `-- Rollback: ${description}
-- Created: ${new Date().toISOString()}

-- Remove inserted data
DELETE FROM table_name WHERE condition;

-- Revert updated data (if you have backup values)
-- UPDATE table_name SET column = 'old_value' WHERE condition;`
    };

    return templates[type] || templates.table;
  }

  async generate(description, type = 'table') {
    const migrationName = this.generateMigrationName(description);
    const migrationPath = path.join(this.migrationsPath, migrationName);
    const rollbackPath = path.join(this.rollbacksPath, `${migrationName}.rollback.sql`);

    // Generate migration file
    const migrationContent = this.generateMigrationTemplate(description, type);
    fs.writeFileSync(migrationPath, migrationContent);

    // Generate rollback file
    const rollbackContent = this.generateRollbackTemplate(description, type);
    fs.writeFileSync(rollbackPath, rollbackContent);

    console.log(`✅ Generated migration files:`);
    console.log(`   Migration: ${migrationPath}`);
    console.log(`   Rollback:  ${rollbackPath}`);
    console.log(`\n📝 Edit these files with your actual SQL commands before running migrations.`);

    return { migrationPath, rollbackPath };
  }
}

// CLI Interface
async function main() {
  const description = process.argv[2];
  const type = process.argv[3] || 'table';

  if (!description) {
    console.log('Usage:');
    console.log('  node generate-migration.js "Description" [type]');
    console.log('');
    console.log('Types:');
    console.log('  table  - Create/drop table migration (default)');
    console.log('  column - Add/remove column migration');
    console.log('  index  - Add/remove index migration');
    console.log('  data   - Insert/update/delete data migration');
    console.log('');
    console.log('Examples:');
    console.log('  node generate-migration.js "Add user profiles table" table');
    console.log('  node generate-migration.js "Add email column to users" column');
    console.log('  node generate-migration.js "Add index on user email" index');
    console.log('  node generate-migration.js "Seed admin users" data');
    process.exit(1);
  }

  const generator = new MigrationGenerator();
  await generator.generate(description, type);
}

if (require.main === module) {
  main();
}

module.exports = MigrationGenerator;
