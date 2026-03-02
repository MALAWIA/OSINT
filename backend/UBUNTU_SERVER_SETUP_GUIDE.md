# 🚀 Ubuntu Server Setup Guide for NSE Authentication System

## 📋 Prerequisites

- Ubuntu 20.04+ or 22.04+ server
- Root or sudo access
- Domain name pointed to server IP
- SSH access to server

## 🔧 Step 1: Initial Server Setup

### 1.1 Connect to Server
```bash
ssh root@your-server-ip
```

### 1.2 Download and Run Setup Script
```bash
# Download the setup script
wget https://your-domain.com/setup_ubuntu_server.sh

# Make it executable
chmod +x setup_ubuntu_server.sh

# Run the setup script
sudo ./setup_ubuntu_server.sh
```

**Or run manually:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y software-properties-common apt-transport-https ca-certificates curl wget git vim htop ufw fail2ban
```

## 🔧 Step 2: Install Python and Dependencies

### 2.1 Install Python 3.11+
```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### 2.2 Set Python 3.11 as Default
```bash
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
sudo update-alternatives --set python3 /usr/bin/python3.11
```

## 🗄️ Step 3: Install and Configure PostgreSQL

### 3.1 Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 3.2 Create Database and User
```bash
sudo -u postgres psql << EOF
CREATE DATABASE nse_auth;
CREATE USER nse_auth_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nse_auth TO nse_auth_user;
ALTER USER nse_auth_user CREATEDB;
\q
EOF
```

### 3.3 Configure PostgreSQL
```bash
# Edit PostgreSQL configuration
sudo vim /etc/postgresql/*/main/postgresql.conf

# Add these settings:
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

### 3.4 Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

## 🗄️ Step 4: Install Redis for Caching

```bash
sudo apt install -y redis-server

# Configure Redis
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## 🌐 Step 5: Install and Configure Nginx

### 5.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 5.2 Create Nginx Configuration
```bash
sudo vim /etc/nginx/sites-available/nse_auth
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Static Files
    location /static/ {
        alias /var/www/nse_auth/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Media Files
    location /media/ {
        alias /var/www/nse_auth/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health Check
    location /health/ {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5.3 Enable the Site
```bash
sudo ln -sf /etc/nginx/sites-available/nse_auth /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Step 6: Configure Firewall

```bash
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 🛡️ Step 7: Configure Fail2Ban

```bash
sudo apt install -y fail2ban

# Create jail configuration
sudo vim /etc/fail2ban/jail.local
```

**Add this configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600
```

```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

## 👤 Step 8: Create Application User

```bash
sudo useradd -m -s /bin/bash nseauth
sudo mkdir -p /var/www/nse_auth
sudo chown nseauth:nseauth /var/www/nse_auth
sudo mkdir -p /var/log/nse_auth
sudo chown nseauth:nseauth /var/log/nse_auth
```

## 🚀 Step 9: Install Gunicorn

```bash
# Create virtual environment first
sudo -u nseauth python3 -m venv /var/www/nse_auth/venv
sudo -u nseauth /var/www/nse_auth/venv/bin/pip install gunicorn
```

## ⚙️ Step 10: Create Gunicorn Service

```bash
sudo vim /etc/systemd/system/nse_auth.service
```

**Add this configuration:**
```ini
[Unit]
Description=nse_auth daemon
After=network.target

[Service]
User=nseauth
Group=www-data
WorkingDirectory=/var/www/nse_auth
Environment="PATH=/var/www/nse_auth/venv/bin"
ExecStart=/var/www/nse_auth/venv/bin/gunicorn nse_auth.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --worker-class sync \
    --timeout 30 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload-app \
    --access-logfile /var/log/nse_auth/access.log \
    --error-logfile /var/log/nse_auth/error.log \
    --log-level info

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable nse_auth
```

## 🔐 Step 11: Install SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 📁 Step 12: Deploy Your Application

### 12.1 Clone Repository
```bash
sudo -u nseauth git clone https://github.com/your-username/nse-auth.git /var/www/nse_auth
```

### 12.2 Create Environment File
```bash
sudo -u nseauth cp /var/www/nse_auth/.env.example /var/www/nse_auth/.env
sudo vim /var/www/nse_auth/.env
```

**Update with your values:**
```bash
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_NAME=nse_auth
DB_USER=nse_auth_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://127.0.0.1:6379/1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 12.3 Install Dependencies
```bash
sudo -u nseauth /var/www/nse_auth/venv/bin/pip install -r /var/www/nse_auth/requirements.txt
```

### 12.4 Run Migrations
```bash
sudo -u nseauth /var/www/nse_auth/venv/bin/python /var/www/nse_auth/manage.py migrate
```

### 12.5 Create Superuser
```bash
sudo -u nseauth /var/www/nse_auth/venv/bin/python /var/www/nse_auth/manage.py createsuperuser
```

### 12.6 Collect Static Files
```bash
sudo -u nseauth /var/www/nse_auth/venv/bin/python /var/www/nse_auth/manage.py collectstatic --noinput
```

### 12.7 Start Application
```bash
sudo systemctl start nse_auth
```

## 📊 Step 13: Setup Monitoring and Backups

### 13.1 Create Backup Script
```bash
sudo vim /var/www/nse_auth/backup.sh
```

**Add this script:**
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/nse_auth"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U nse_auth_user nse_auth > $BACKUP_DIR/nse_auth_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/nse_auth_db_$DATE.sql

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: nse_auth_db_$DATE.sql.gz"
```

```bash
sudo chmod +x /var/www/nse_auth/backup.sh
sudo chown nseauth:nseauth /var/www/nse_auth/backup.sh

# Setup automatic backups (daily at 2 AM)
echo "0 2 * * * /var/www/nse_auth/backup.sh" | sudo crontab -
```

### 13.2 Create Deployment Script
```bash
sudo vim /var/www/nse_auth/deploy.sh
```

**Add this script:**
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Activate virtual environment
source /var/www/nse_auth/venv/bin/activate

# Pull latest code
git pull origin main

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart Gunicorn
sudo systemctl restart nse_auth

# Restart Nginx
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
```

```bash
sudo chmod +x /var/www/nse_auth/deploy.sh
sudo chown nseauth:nseauth /var/www/nse_auth/deploy.sh
```

## 🔍 Step 14: Verify Setup

### 14.1 Check Service Status
```bash
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
sudo systemctl status fail2ban
sudo systemctl status nse_auth
```

### 14.2 Test Application
```bash
# Test health endpoint
curl http://localhost/health/

# Test API endpoints
curl -X POST http://localhost/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","first_name":"Test","last_name":"User"}'
```

### 14.3 Check Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo tail -f /var/log/nse_auth/access.log
sudo tail -f /var/log/nse_auth/error.log
```

## 🎉 Server Setup Complete!

Your Ubuntu server is now ready for the NSE Authentication System!

### 📋 What's Been Installed:
- ✅ Python 3.11+ with pip
- ✅ PostgreSQL database
- ✅ Redis for caching
- ✅ Nginx web server
- ✅ Gunicorn application server
- ✅ SSL certificate with Let's Encrypt
- ✅ Firewall (UFW)
- ✅ Fail2Ban for security
- ✅ Automated backups
- ✅ Deployment scripts

### 🔧 Next Steps:
1. **Deploy your application** using the deployment script
2. **Configure monitoring** and alerting
3. **Set up CI/CD** pipeline
4. **Test all functionality** thoroughly
5. **Monitor performance** and security

### 🔐 Security Reminders:
- Change all default passwords
- Keep system updated
- Monitor security logs
- Use strong SSL certificates
- Implement rate limiting
- Regular security audits

Your server is now production-ready for the NSE Authentication System! 🚀
