# FlexJob.UK Remote Access Configuration
# Configure these settings for your server

# Server Details
SERVER_HOST="flexjob.uk"
SERVER_USER="root"
SERVER_PORT="22"
PROJECT_PATH="/root/flexxy"

# SSH Key Configuration
SSH_KEY_PATH="~/.ssh/id_rsa"  # Path to your private SSH key

# Database Configuration (on server)
DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="flexjobs_db"
DB_PORT="5432"

# Application Configuration
APP_PORT="3005"
PM2_APP_NAME="flexjobs-uk"

# Migration Files to Run (in order)
MIGRATIONS=(
    "create-core-schema.js"
    "add-salary-type-column.js"
    "add-tags-column.js"
    "create_profile_submissions_table.js"
    "add-recruiting-consultants-fixed.js"
    "add_selected_agent_id.js"
)

# Backup Settings
CREATE_BACKUP_BEFORE_MIGRATION=true
BACKUP_RETENTION_DAYS=7

# Git Configuration
GIT_BRANCH="uk"
AUTO_PULL_LATEST=true

# Post-Migration Actions
RESTART_APPLICATION=true
RUN_HEALTH_CHECK=true
UPDATE_PM2_CONFIG=true

# Notification Settings (optional)
SEND_NOTIFICATION_ON_COMPLETION=false
NOTIFICATION_EMAIL=""

# Logging
LOG_MIGRATIONS=true
LOG_FILE="migration.log"

# Safety Settings
REQUIRE_CONFIRMATION=true
STOP_ON_FIRST_ERROR=false
DRY_RUN_MODE=false
