# PM2 Setup Guide for FlexJobs Production Server

## Commands to Run on Your Server (flexjob.uk)

### 1. Install PM2 globally (if not already installed)
```bash
npm install -g pm2
```

### 2. Stop any existing FlexJobs processes
```bash
# Stop all PM2 processes
pm2 stop all

# Delete old FlexJobs processes (if any)
pm2 delete flexjobs 2>/dev/null || true
pm2 delete flexjobs-uk 2>/dev/null || true
```

### 3. Copy your production environment file
```bash
# Make sure you're in the FlexJobs directory
cd ~/flexxy

# Copy production environment
cp .env.production .env

# Verify the environment variables
cat .env | grep -E "PORT|API_HOST|API_PORT|DOMAIN"
```

### 4. Start the application with PM2
```bash
# Start with production environment
pm2 start ecosystem.config.js --env production

# OR start with explicit environment file
pm2 start ecosystem.config.js --env production --node-args="--env-file=.env"
```

### 5. Save PM2 configuration for persistence
```bash
# Save current PM2 processes
pm2 save

# Setup PM2 startup script (persists after server reboot)
pm2 startup

# Follow the instructions provided by the startup command
# It will give you a command like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username
```

### 6. Verify the setup
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs flexjobs-uk

# Check if app is responding
curl http://localhost:3005/api/health

# Test from outside
curl https://flexjob.uk/api/health
```

### 7. Common PM2 management commands
```bash
# Restart the application
pm2 restart flexjobs-uk

# Stop the application
pm2 stop flexjobs-uk

# View real-time logs
pm2 logs flexjobs-uk --follow

# Monitor resources
pm2 monit

# Reload application without downtime
pm2 reload flexjobs-uk

# Delete application from PM2
pm2 delete flexjobs-uk
```

## Troubleshooting

### If port 3005 is still occupied:
```bash
# Find what's using the port
sudo netstat -tlnp | grep :3005
lsof -i :3005

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Then restart PM2
pm2 restart flexjobs-uk
```

### If PM2 doesn't start on server reboot:
```bash
# Re-run startup command
pm2 startup

# Save configuration again
pm2 save

# Test by rebooting server
sudo reboot
```

### Environment Variables Not Loading:
```bash
# Make sure .env file exists and has correct values
ls -la .env
cat .env

# Start PM2 with explicit env file
pm2 start ecosystem.config.js --env production --update-env

# Or set environment variables directly
export PORT=3005
export API_HOST=localhost
export API_PORT=3005
pm2 restart flexjobs-uk --update-env
```

## Expected Output

After successful setup, you should see:
```
┌─────────────────┬────┬─────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ App name        │ id │ version │ mode    │ pid     │ status   │ restart│ uptime│ cpu      │ mem      │ user     │ watching │ instance │
├─────────────────┼────┼─────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ flexjobs-uk     │ 0  │ 1.0.0   │ fork    │ 12345   │ online   │ 0      │ 5m   │ 0%       │ 65.2mb   │ user     │ disabled │ N/A      │
└─────────────────┴────┴─────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

## Benefits of This Setup

✅ **Persistence**: Application continues running after terminal closes
✅ **Auto-restart**: Automatically restarts if application crashes  
✅ **Boot persistence**: Starts automatically after server reboot
✅ **Environment variables**: Properly loads from .env file
✅ **Process monitoring**: Easy monitoring with `pm2 monit`
✅ **Log management**: Centralized logging with `pm2 logs`
✅ **Zero-downtime**: Reload without stopping service

Your FlexJobs application will now run persistently on your server at flexjob.uk!
