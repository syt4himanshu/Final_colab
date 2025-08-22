# Student Mentor Allocation System - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+, MySQL 8+, PM2, Nginx
- Docker (optional)

### 1. Environment Setup
```bash
# Clone repository
git clone <repo-url>
cd student-mentor-system

# Backend setup
cd backend

# Edit .env with your config
npm install
npm run seed  # Optional: seed sample data
```

### 2. Database Setup
```sql
CREATE DATABASE student_mentor;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON student_mentor.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Development
```bash
# Backend
npm run dev

# Frontend (new terminal)
cd ../frontend
npm install
npm start
```

## Production Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save and setup startup
pm2 save
pm2 startup
```

### Nginx Configuration
```bash
# Copy config
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Setup
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Management

### Backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u appuser -p student_mentor > backup_$DATE.sql
gzip backup_$DATE.sql
```

### Restore
```bash
gunzip -c backup_20231201_120000.sql.gz | mysql -u appuser -p student_mentor
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### System Monitoring
```bash
# Install tools
sudo apt install htop iotop

# Monitor
htop
df -h
free -h
```

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   sudo systemctl status mysql
   mysql -u appuser -p -h localhost
   ```

2. **Application Not Starting**
   ```bash
   pm2 status
   pm2 logs student-mentor-backend
   pm2 restart student-mentor-backend
   ```

3. **Nginx Issues**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL Issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

## Security Checklist

- [ ] Change default MySQL password
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Regular updates
- [ ] Database user privileges
- [ ] Rate limiting
- [ ] CORS configuration

## Maintenance

### Daily
- Database backups
- Monitor logs

### Weekly
- Application backups
- Security updates

### Monthly
- SSL certificate check
- Performance review

## Support

For issues:
1. Check logs
2. Review troubleshooting section
3. Verify configurations
4. Contact administrator
