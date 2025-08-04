# Remote SSH Deployment Guide for FlexJobs

## 🖥️ Remote Server SSH Setup

### **1. Server Preparation**
```bash
# On your remote server (Ubuntu/Debian example):
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib git

# Create application user (recommended)
sudo adduser flexjobs
sudo usermod -aG sudo flexjobs
su - flexjobs
```

### **2. SSH Key Setup**
```bash
# On your Windows machine (PowerShell):
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for default location: C:\Users\YourName\.ssh\id_ed25519

# Copy public key to server:
scp C:\Users\YourName\.ssh\id_ed25519.pub flexjobs@your-server-ip:~/.ssh/authorized_keys

# Or use ssh-copy-id if available:
ssh-copy-id flexjobs@your-server-ip
```

### **3. VS Code Remote-SSH Configuration**
```bash
# In VS Code, press Ctrl+Shift+P, then "Remote-SSH: Open Configuration File"
# Add your server configuration:

Host flexjobs-production
    HostName your-server-ip-address
    User flexjobs
    Port 22
    IdentityFile C:\Users\YourName\.ssh\id_ed25519
    ServerAliveInterval 60
```

## 🚀 **Deployment Workflow with Remote-SSH**

### **Step 1: Connect to Server**
1. Press `Ctrl+Shift+P`
2. Type "Remote-SSH: Connect to Host"
3. Select "flexjobs-production"
4. VS Code will open a new window connected to your server

### **Step 2: Clone Repository**
```bash
# In VS Code terminal (now connected to remote server):
cd ~
git clone https://github.com/yourusername/flexjobs.git
cd flexjobs
```

### **Step 3: Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with production values
nano .env
```

### **Step 4: Database Setup**
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL:
CREATE USER flexjobs_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE flexjobs_db OWNER flexjobs_user;
GRANT ALL PRIVILEGES ON DATABASE flexjobs_db TO flexjobs_user;

# Change PostgreSQL port for security (optional)
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change: port = 15432

sudo systemctl restart postgresql
```

### **Step 5: Application Deployment**
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start application (development)
npm run dev

# Or start in production mode
npm start
```

## 🔒 **Security Enhancements**

### **SSH Security**
```bash
# On server - edit SSH config
sudo nano /etc/ssh/sshd_config

# Add these security settings:
Port 2222                    # Change from default 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
```

### **Database Security**
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/postgresql.conf

# Security settings:
port = 15432                 # Non-standard port
listen_addresses = 'localhost'  # Only local connections
ssl = on                     # Enable SSL

# Edit pg_hba.conf for access control
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### **Firewall Setup**
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (your custom port)
sudo ufw allow 2222/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow your app port
sudo ufw allow 3000/tcp

# Block default PostgreSQL port from external access
sudo ufw deny 5432/tcp
```

## 🔄 **Development Workflow**

### **Daily Development:**
1. Open VS Code
2. Connect to remote server via Remote-SSH
3. Make changes directly on server
4. Test changes: `npm run dev`
5. Commit changes: `git add . && git commit -m "description"`
6. Push to repository: `git push origin main`

### **Production Updates:**
1. Pull latest changes: `git pull origin main`
2. Install new dependencies: `npm install`
3. Run migrations if needed: `npm run migrate`
4. Restart application: `pm2 restart flexjobs` (if using PM2)

## 🎛️ **Process Management (Recommended)**

### **Install PM2 for Production**
```bash
# Install PM2 globally
npm install -g pm2

# Start your application
pm2 start server.js --name "flexjobs"

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the displayed command

# Monitor your application
pm2 status
pm2 logs flexjobs
pm2 monit
```

## 📊 **Monitoring and Logs**
```bash
# View application logs
pm2 logs flexjobs

# Monitor system resources
htop

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

This setup gives you:
- ✅ Secure SSH access
- ✅ Non-standard database port
- ✅ Direct file editing on server
- ✅ Professional deployment workflow
- ✅ Easy monitoring and management
