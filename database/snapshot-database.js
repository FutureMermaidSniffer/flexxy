#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DatabaseSnapshot {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'flexjobs_db'
    };
    this.snapshotDir = path.join(__dirname, 'snapshots');
    this.timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  }

  async init() {
    // Ensure snapshots directory exists
    if (!fs.existsSync(this.snapshotDir)) {
      fs.mkdirSync(this.snapshotDir, { recursive: true });
    }
  }

  async connect() {
    this.client = new Client(this.dbConfig);
    await this.client.connect();
    console.log('✅ Connected to local database');
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
    }
  }

  async takeSnapshot() {
    try {
      await this.init();
      await this.connect();

      console.log('📸 Taking database snapshot...\n');

      // 1. Get all tables
      const tables = await this.getTables();
      console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);

      // 2. Export schema
      const schema = await this.exportSchema(tables);
      
      // 3. Export data
      const data = await this.exportData(tables);

      // 4. Generate reports
      await this.generateReports(tables, schema, data);

      // 5. Compare with existing files
      await this.compareWithExisting();

      console.log('\n🎉 Database snapshot completed successfully!');
      console.log(`📁 Files saved in: ${this.snapshotDir}`);

    } catch (error) {
      console.error('❌ Snapshot failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async getTables() {
    const result = await this.client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    return result.rows.map(row => row.table_name);
  }

  async exportSchema(tables) {
    console.log('🔧 Exporting schema...');
    
    let schemaSQL = '';
    schemaSQL += `-- FlexJobs Database Schema Snapshot\n`;
    schemaSQL += `-- Generated: ${new Date().toISOString()}\n`;
    schemaSQL += `-- Source: ${this.dbConfig.database} on ${this.dbConfig.host}\n\n`;

    const schema = {};

    for (const tableName of tables) {
      console.log(`  • Exporting table structure: ${tableName}`);
      
      // Get table structure
      const columns = await this.getTableColumns(tableName);
      const constraints = await this.getTableConstraints(tableName);
      const indexes = await this.getTableIndexes(tableName);

      schema[tableName] = { columns, constraints, indexes };

      // Generate CREATE TABLE statement
      schemaSQL += await this.generateCreateTableSQL(tableName, columns, constraints);
      schemaSQL += '\n';
    }

    // Add indexes
    schemaSQL += '-- Indexes\n';
    for (const tableName of tables) {
      const indexes = schema[tableName].indexes;
      for (const index of indexes) {
        if (!index.is_primary && !index.is_unique_constraint) {
          schemaSQL += `${index.definition};\n`;
        }
      }
    }

    // Save schema file
    const schemaFile = path.join(this.snapshotDir, `schema_snapshot_${this.timestamp}.sql`);
    fs.writeFileSync(schemaFile, schemaSQL);
    console.log(`✅ Schema exported to: ${schemaFile}`);

    return schema;
  }

  async getTableColumns(tableName) {
    const result = await this.client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return result.rows;
  }

  async getTableConstraints(tableName) {
    const result = await this.client.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      LEFT JOIN information_schema.referential_constraints rc 
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.table_schema = 'public' 
      AND tc.table_name = $1
      ORDER BY tc.constraint_type, tc.constraint_name
    `, [tableName]);
    
    return result.rows;
  }

  async getTableIndexes(tableName) {
    const result = await this.client.query(`
      SELECT 
        i.relname as index_name,
        pg_get_indexdef(i.oid) as definition,
        ix.indisprimary as is_primary,
        ix.indisunique as is_unique,
        EXISTS(
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_type = 'UNIQUE' 
          AND tc.constraint_name = i.relname
        ) as is_unique_constraint
      FROM pg_index ix
      JOIN pg_class i ON ix.indexrelid = i.oid
      JOIN pg_class t ON ix.indrelid = t.oid
      WHERE t.relname = $1
      AND t.relkind = 'r'
      ORDER BY i.relname
    `, [tableName]);
    
    return result.rows;
  }

  async generateCreateTableSQL(tableName, columns, constraints) {
    let sql = `-- Table: ${tableName}\n`;
    sql += `CREATE TABLE ${tableName} (\n`;
    
    // Add columns
    const columnDefs = columns.map(col => {
      let def = `  ${col.column_name} `;
      
      // Data type
      if (col.data_type === 'character varying') {
        def += `VARCHAR(${col.character_maximum_length})`;
      } else if (col.data_type === 'numeric') {
        def += `DECIMAL(${col.numeric_precision},${col.numeric_scale})`;
      } else if (col.data_type === 'integer') {
        def += 'INTEGER';
      } else if (col.data_type === 'bigint') {
        def += 'BIGINT';
      } else if (col.data_type === 'timestamp without time zone') {
        def += 'TIMESTAMP';
      } else if (col.data_type === 'boolean') {
        def += 'BOOLEAN';
      } else if (col.data_type === 'text') {
        def += 'TEXT';
      } else if (col.data_type === 'date') {
        def += 'DATE';
      } else {
        def += col.data_type.toUpperCase();
      }
      
      // Nullable
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL';
      }
      
      // Default
      if (col.column_default) {
        if (col.column_default.includes('nextval')) {
          // This is a SERIAL column
          def = def.replace(/INTEGER|BIGINT/, 'SERIAL');
          def = def.replace(' NOT NULL', ''); // SERIAL implies NOT NULL
        } else {
          def += ` DEFAULT ${col.column_default}`;
        }
      }
      
      return def;
    });
    
    sql += columnDefs.join(',\n');
    
    // Add constraints
    const primaryKeys = constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
    const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
    const uniqueKeys = constraints.filter(c => c.constraint_type === 'UNIQUE');
    
    if (primaryKeys.length > 0) {
      const pkColumns = primaryKeys.map(pk => pk.column_name).join(', ');
      sql += `,\n  PRIMARY KEY (${pkColumns})`;
    }
    
    for (const uk of uniqueKeys) {
      sql += `,\n  UNIQUE (${uk.column_name})`;
    }
    
    for (const fk of foreignKeys) {
      const onDelete = fk.delete_rule !== 'NO ACTION' ? ` ON DELETE ${fk.delete_rule}` : '';
      const onUpdate = fk.update_rule !== 'NO ACTION' ? ` ON UPDATE ${fk.update_rule}` : '';
      sql += `,\n  FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})${onDelete}${onUpdate}`;
    }
    
    sql += '\n);\n';
    
    return sql;
  }

  async exportData(tables) {
    console.log('📊 Exporting data...');
    
    const data = {};
    let dataSQL = '';
    dataSQL += `-- FlexJobs Database Data Snapshot\n`;
    dataSQL += `-- Generated: ${new Date().toISOString()}\n\n`;

    for (const tableName of tables) {
      console.log(`  • Exporting data from: ${tableName}`);
      
      const result = await this.client.query(`SELECT * FROM ${tableName} ORDER BY id`);
      data[tableName] = result.rows;
      
      if (result.rows.length > 0) {
        dataSQL += `-- Data for table: ${tableName}\n`;
        
        const columns = Object.keys(result.rows[0]);
        const columnsList = columns.join(', ');
        
        for (const row of result.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          }).join(', ');
          
          dataSQL += `INSERT INTO ${tableName} (${columnsList}) VALUES (${values});\n`;
        }
        dataSQL += '\n';
      }
    }

    // Save data file
    const dataFile = path.join(this.snapshotDir, `data_snapshot_${this.timestamp}.sql`);
    fs.writeFileSync(dataFile, dataSQL);
    console.log(`✅ Data exported to: ${dataFile}`);

    return data;
  }

  async generateReports(tables, schema, data) {
    console.log('📋 Generating analysis reports...');

    // Summary report
    let report = `# FlexJobs Database Analysis Report\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Database: ${this.dbConfig.database}\n\n`;

    report += `## Database Summary\n`;
    report += `- **Tables**: ${tables.length}\n`;
    report += `- **Total Records**: ${Object.values(data).reduce((sum, rows) => sum + rows.length, 0)}\n\n`;

    report += `## Tables Overview\n`;
    for (const tableName of tables) {
      const tableSchema = schema[tableName];
      const tableData = data[tableName];
      
      report += `### ${tableName}\n`;
      report += `- **Columns**: ${tableSchema.columns.length}\n`;
      report += `- **Records**: ${tableData.length}\n`;
      report += `- **Constraints**: ${tableSchema.constraints.length}\n`;
      report += `- **Indexes**: ${tableSchema.indexes.length}\n`;
      
      // Column details
      report += `- **Column Details**:\n`;
      for (const col of tableSchema.columns) {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
        report += `  - ${col.column_name}: ${col.data_type} ${nullable}\n`;
      }
      report += '\n';
    }

    // Save report
    const reportFile = path.join(this.snapshotDir, `analysis_report_${this.timestamp}.md`);
    fs.writeFileSync(reportFile, report);
    console.log(`✅ Analysis report saved to: ${reportFile}`);
  }

  async compareWithExisting() {
    console.log('🔍 Comparing with existing migration files...');

    const comparisons = [];

    // Compare with migrate.js expected output
    const migrateJsPath = path.join(__dirname, 'migrate.js');
    if (fs.existsSync(migrateJsPath)) {
      comparisons.push('migrate.js');
    }

    // Compare with schema_postgres.sql
    const schemaPath = path.join(__dirname, 'schema_postgres.sql');
    if (fs.existsSync(schemaPath)) {
      comparisons.push('schema_postgres.sql');
    }

    let comparisonReport = `# Migration Comparison Report\n`;
    comparisonReport += `Generated: ${new Date().toISOString()}\n\n`;

    if (comparisons.length === 0) {
      comparisonReport += `⚠️ No existing migration files found to compare against.\n`;
    } else {
      comparisonReport += `## Files Compared\n`;
      comparisons.forEach(file => {
        comparisonReport += `- ${file}\n`;
      });
      comparisonReport += '\n';
      
      comparisonReport += `## Recommendations\n`;
      comparisonReport += `1. Review the generated schema snapshot against your migration files\n`;
      comparisonReport += `2. Look for missing tables, columns, or constraints\n`;
      comparisonReport += `3. Ensure all indexes are properly defined\n`;
      comparisonReport += `4. Verify foreign key relationships\n`;
      comparisonReport += `5. Check that data types match expected values\n\n`;
    }

    // Save comparison report
    const comparisonFile = path.join(this.snapshotDir, `migration_comparison_${this.timestamp}.md`);
    fs.writeFileSync(comparisonFile, comparisonReport);
    console.log(`✅ Comparison report saved to: ${comparisonFile}`);
  }
}

async function main() {
  const snapshot = new DatabaseSnapshot();
  
  try {
    await snapshot.takeSnapshot();
    
    console.log('\n📁 Generated Files:');
    console.log('   • schema_snapshot_[timestamp].sql - Complete schema');
    console.log('   • data_snapshot_[timestamp].sql - All data');  
    console.log('   • analysis_report_[timestamp].md - Detailed analysis');
    console.log('   • migration_comparison_[timestamp].md - Migration comparison');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review the analysis report for database overview');
    console.log('   2. Compare schema snapshot with your migrate.js output');
    console.log('   3. Identify any missing fields or constraints');
    console.log('   4. Update migration scripts as needed');
    console.log('   5. Test deployment with updated migrations');
    
  } catch (error) {
    console.error('❌ Snapshot failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('   • PostgreSQL is running');
    console.error('   • Database exists and is accessible');
    console.error('   • .env configuration is correct');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseSnapshot;
