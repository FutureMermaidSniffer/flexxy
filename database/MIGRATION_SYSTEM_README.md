# FlexJobs Sequential Migration System

## 🚀 Overview

The FlexJobs platform now uses a **sequential migration system** that replaces the old snapshot-based approach. This provides:

- ✅ **Version Control**: Track exactly which schema changes were applied when
- ✅ **Rollback Support**: Safely undo specific migrations if needed
- ✅ **Team Collaboration**: Multiple developers can work on schema changes without conflicts
- ✅ **Production Safety**: Incremental changes instead of full schema replacement
- ✅ **Audit Trail**: Complete history of all database modifications

## 📁 File Structure

```
database/
├── migration-system.js          # Main migration runner
├── generate-migration.js        # Create new migrations
├── transition-migrations.js     # Transition from old system
├── migrations/
│   └── sequential/              # New sequential migrations
│       ├── 20240101_000000_initial_schema.sql
│       ├── 20240102_000000_add_agents_system.sql
│       ├── 20240103_000000_add_oauth_fields.sql
│       ├── 20240104_000000_add_password_reset.sql
│       └── rollbacks/           # Rollback scripts
│           ├── 20240101_000000_initial_schema.sql.rollback.sql
│           ├── 20240102_000000_add_agents_system.sql.rollback.sql
│           └── ...
└── migrate.js                  # Legacy (deprecated)
```

## 🛠️ Quick Start

### 1. Transition from Old System

If you have an existing database:

```bash
npm run migrate:transition
```

This will:
- Analyze your current database
- Create the migration tracking table
- Mark existing migrations as completed

### 2. Check Migration Status

```bash
npm run migrate:status
```

Shows which migrations are executed and which are pending.

### 3. Run Migrations

```bash
npm run migrate
```

Runs all pending migrations in order.

### 4. Create New Migration

```bash
npm run migrate:generate "Add user preferences table" table
```

Migration types:
- `table` - Create/drop table (default)
- `column` - Add/remove column  
- `index` - Add/remove index
- `data` - Insert/update/delete data

## 📋 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run migrate` | Run pending migrations |
| `npm run migrate:status` | Show migration status |
| `npm run migrate:rollback <name>` | Rollback specific migration |
| `npm run migrate:generate "desc" [type]` | Generate new migration |
| `npm run migrate:transition` | Transition from old system |
| `npm run migrate:legacy` | Use old migration system (deprecated) |

## 📝 Creating Migrations

### Generate Template

```bash
npm run migrate:generate "Add email notifications table" table
```

This creates two files:
- `migrations/sequential/YYYYMMDD_HHMMSS_add_email_notifications_table.sql`
- `migrations/sequential/rollbacks/YYYYMMDD_HHMMSS_add_email_notifications_table.sql.rollback.sql`

### Edit Migration File

```sql
-- Migration: Add email notifications table
-- Created: 2024-12-20T10:30:00.000Z

CREATE TABLE IF NOT EXISTS email_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_user 
ON email_notifications(user_id);

COMMENT ON TABLE email_notifications IS 'Email notification tracking';
```

### Edit Rollback File

```sql
-- Rollback: Add email notifications table
-- Created: 2024-12-20T10:30:00.000Z

DROP INDEX IF EXISTS idx_email_notifications_user;
DROP TABLE IF EXISTS email_notifications;
```

## 🔧 Advanced Usage

### Direct CLI Usage

You can also use the migration system directly:

```bash
# Run migrations
node database/migration-system.js migrate

# Check status  
node database/migration-system.js status

# Rollback specific migration
node database/migration-system.js rollback 20240104_000000_add_password_reset.sql

# Generate migration
node database/generate-migration.js "Add feature X" column
```

### Environment Configuration

The migration system uses your existing environment variables:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=flexjobs_db
```

## 🏗️ Migration Tracking

The system creates a `schema_migrations` table to track:

| Column | Purpose |
|--------|---------|
| `migration_name` | Migration file name |
| `executed_at` | When it was run |
| `execution_time_ms` | How long it took |
| `checksum` | File integrity check |

## 🔒 Production Best Practices

### 1. Always Test Migrations

```bash
# Test on development first
npm run migrate:status
npm run migrate

# Test rollback
npm run migrate:rollback 20240104_000000_add_password_reset.sql
npm run migrate
```

### 2. Backup Before Production

```bash
pg_dump -h localhost -p 5433 -U postgres flexjobs_db > backup_before_migration.sql
```

### 3. Run in Transaction

All migrations run inside transactions - if any step fails, everything rolls back automatically.

### 4. Check Dependencies

Make sure new migrations don't break existing functionality:

```bash
npm run migrate:status
npm test  # Run your test suite
```

## 🚨 Troubleshooting

### Migration Fails

If a migration fails:

1. Check the error message
2. Fix the SQL in the migration file
3. The failed migration won't be marked as completed
4. Run `npm run migrate` again

### Rollback Issues

If rollback fails:
1. Check the rollback SQL syntax
2. Manually fix database state if needed
3. Remove migration record: `DELETE FROM schema_migrations WHERE migration_name = 'problematic_migration.sql'`

### Migration Out of Order

If migrations get out of order:
1. Rename migration files to correct order
2. Update `schema_migrations` table if needed

## 🔄 Migration from Old System

The old `migrate.js` system had these issues:
- ❌ Snapshot-based (replaced entire schema)
- ❌ No rollback capability  
- ❌ No version tracking
- ❌ Dangerous for production

The new system fixes all these issues while maintaining compatibility.

## 📊 Database Schema Status

Current schema includes:

| Table | Purpose | Migration |
|-------|---------|-----------|
| `users` | User accounts | Initial |
| `companies` | Company profiles | Initial |
| `categories` | Job categories | Initial |
| `jobs` | Job listings | Initial |
| `applications` | Job applications | Initial |
| `saved_jobs` | Bookmarked jobs | Initial |
| `job_skills` | Job skill requirements | Initial |
| `agents` | Career agents | Agents system |
| `agent_reviews` | Agent ratings | Agents system |
| `agent_bookings` | Agent consultations | Agents system |
| `subscription_plans` | Pricing plans | Agents system |
| `user_subscriptions` | User subscriptions | Agents system |
| `password_reset_tokens` | Password recovery | Password reset |

OAuth fields (`google_id`, `apple_id`, `avatar_url`) added to `users` table.

## 🎯 Next Steps

1. **Run the transition**: `npm run migrate:transition`
2. **Check status**: `npm run migrate:status`  
3. **Create new migrations** as needed for future features
4. **Deprecate old migrate.js** once transition is complete

The new system ensures safe, trackable, and reversible database changes for production deployment! 🚀
