# FlexJobs Deployment Checklist

## Pre-Deployment Checklist

### 🏗️ **Server Preparation**
- [ ] Contabo VPS is running and accessible via SSH
- [ ] Domain is purchased and DNS is configured
- [ ] Server has at least 1GB RAM and 20GB storage
- [ ] You have root/sudo access to the server

### 🔑 **Access Requirements**
- [ ] SSH key pair generated for deployment
- [ ] GitHub repository is accessible
- [ ] Database passwords chosen (secure ones!)
- [ ] Admin credentials chosen

## Quick Deployment Options

### 🚀 **Option 1: Automated Script (Recommended)**

1. **Upload and run deployment script:**
   ```bash
   # On your Contabo server
   wget https://raw.githubusercontent.com/FutureMermaidSniffer/flexxy/main/scripts/deploy-to-contabo.sh
   chmod +x deploy-to-contabo.sh
   sudo ./deploy-to-contabo.sh
   ```

2. **Follow the post-deployment steps the script provides**

### 🛠️ **Option 2: Manual Deployment**

Follow the complete guide in `CONTABO_DEPLOYMENT_GUIDE.md`

### ⚡ **Option 3: GitHub Actions (Automated CI/CD)**

1. **Setup GitHub Secrets** (in your repo settings):
   ```
   SERVER_HOST=your-domain.com
   SERVER_USER=root
   SERVER_SSH_KEY=your-private-ssh-key
   DATABASE_URL=postgresql://flexjobs_user:password@localhost:5432/flexjobs
   JWT_SECRET=your-secure-jwt-secret
   ASSETS_BASE_URL=https://assets.your-domain.com
   ```

2. **Push to main branch** - deployment happens automatically!

## Post-Deployment Checklist

### 🔧 **Server Configuration**
- [ ] Update `.env` file with your actual domain
- [ ] Update nginx configuration with your domain
- [ ] Setup SSL certificate with Let's Encrypt
- [ ] Test database connection
- [ ] Verify application starts with PM2

### 🌐 **Domain & SSL**
- [ ] Domain points to server IP
- [ ] SSL certificate is installed and valid
- [ ] HTTPS redirect is working
- [ ] Assets subdomain is configured

### 🔐 **Security**
- [ ] Change default database passwords
- [ ] Update JWT and session secrets
- [ ] Configure firewall rules
- [ ] Setup admin user credentials
- [ ] Review and update CORS settings

### 📊 **Testing**
- [ ] Main website loads: `https://yourdomain.com`
- [ ] Admin panel accessible: `https://yourdomain.com/admin-dashboard.html`
- [ ] Assets load from: `https://assets.yourdomain.com`
- [ ] Database operations work (create test job/user)
- [ ] File uploads work
- [ ] Authentication works

### 🚀 **Go Live**
- [ ] Application is running via PM2
- [ ] Nginx is serving the application
- [ ] SSL certificate is valid
- [ ] Monitoring is in place
- [ ] Backup strategy is configured

## Essential Commands

### 🔍 **Check Status**
```bash
# Application status
pm2 status
pm2 logs flexjobs

# Web server status
systemctl status nginx
nginx -t

# Database status
systemctl status postgresql
```

### 🔄 **Restart Services**
```bash
# Restart application
pm2 restart flexjobs

# Restart web server
systemctl restart nginx

# Restart database
systemctl restart postgresql
```

### 📝 **View Logs**
```bash
# Application logs
pm2 logs flexjobs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Application logs
tail -f /var/www/flexjobs/logs/combined.log
```

## Troubleshooting

### ❌ **Common Issues**

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check if Node.js app is running: `pm2 status` |
| Database connection error | Verify PostgreSQL is running: `systemctl status postgresql` |
| Assets not loading | Check nginx configuration and file permissions |
| SSL certificate issues | Re-run certbot: `certbot --nginx -d yourdomain.com` |
| Permission denied | Check file ownership: `chown -R www-data:www-data /var/www/` |

### 🆘 **Emergency Commands**
```bash
# Stop everything
pm2 stop flexjobs
systemctl stop nginx

# Start everything
systemctl start nginx
pm2 start flexjobs

# Check what's using port 3000
lsof -i :3000

# Check disk space
df -h

# Check memory usage
free -h
```

## Maintenance

### 🔄 **Regular Tasks**
- [ ] **Weekly**: Check server resources and logs
- [ ] **Monthly**: Update system packages: `apt update && apt upgrade`
- [ ] **Quarterly**: Review and rotate secrets/passwords
- [ ] **Backup**: Regular database backups

### 📈 **Performance Monitoring**
- [ ] Setup server monitoring (htop, iotop)
- [ ] Monitor application performance
- [ ] Review nginx access logs for traffic patterns
- [ ] Monitor database performance

### 🔒 **Security Updates**
- [ ] Keep Node.js updated
- [ ] Update npm packages regularly
- [ ] Monitor security advisories
- [ ] Review firewall rules

---

## 🎯 **Success Criteria**

Your deployment is successful when:
✅ Website loads at your domain with HTTPS  
✅ Admin panel is accessible  
✅ Assets load from CDN subdomain  
✅ Database operations work  
✅ Application auto-restarts on server reboot  
✅ SSL certificate is valid and auto-renewing  

## 📞 **Support**

If you encounter issues:
1. Check the logs first (`pm2 logs flexjobs`)
2. Verify all services are running
3. Check the troubleshooting section above
4. Review the complete deployment guide

**Your FlexJobs application will be live and professional! 🎉**
