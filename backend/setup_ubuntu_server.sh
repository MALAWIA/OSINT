#!/bin/bash
# 🚀 Ubuntu Server Setup Script for NSE Authentication System
# This script sets up a production-ready Ubuntu server

set -e  # Exit on any error

echo "🚀 Starting Ubuntu Server Setup for NSE Authentication System..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    unattended-upgrades

# Install Python 3.11+ and pip
print_status "Installing Python 3.11+ and pip..."
add-apt-repository ppa:deadsnakes/ppa -y
apt update
apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Set Python 3.11 as default
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
update-alternatives --set python3 /usr/bin/python3.11

# Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Redis for caching
print_status "Installing Redis..."
apt install -y redis-server

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install Node.js for frontend
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Create application user
print_status "Creating application user..."
if ! id "nseauth" &>/dev/null; then
    useradd -m -s /bin/bash nseauth
    print_status "User 'nseauth' created"
else
    print_warning "User 'nseauth' already exists"
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/nse_auth
chown nseauth:nseauth /var/www/nse_auth

# Create logs directory
print_status "Creating logs directory..."
mkdir -p /var/log/nse_auth
chown nseauth:nseauth /var/log/nse_auth

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE nse_auth;" || print_warning "Database may already exist"
sudo -u postgres psql -c "CREATE USER nse_auth_user WITH PASSWORD 'secure_password_change_me';" || print_warning "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nse_auth TO nse_auth_user;"
sudo -u postgres psql -c "ALTER USER nse_auth_user CREATEDB;"

# Configure PostgreSQL
print_status "Configuring PostgreSQL..."
cat > /etc/postgresql/*/main/postgresql.conf << EOF
# Custom settings for NSE Auth
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# Configure PostgreSQL pg_hba.conf
print_status "Configuring PostgreSQL authentication..."
cat > /etc/postgresql/*/main/pg_hba.conf << EOF
# PostgreSQL Client Authentication Configuration File
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
EOF

# Restart PostgreSQL
systemctl restart postgresql
systemctl enable postgresql

# Configure Redis
print_status "Configuring Redis..."
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl restart redis-server
systemctl enable redis-server

# Configure UFW firewall
print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure Fail2Ban
print_status "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
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
EOF

systemctl restart fail2ban
systemctl enable fail2ban

# Install SSL certificate with Let's Encrypt
print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Create Nginx configuration template
print_status "Creating Nginx configuration template..."
cat > /etc/nginx/sites-available/nse_auth << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://\$server_name\$request_uri;
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
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/nse_auth /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t && systemctl restart nginx
systemctl enable nginx

# Create Gunicorn service file
print_status "Creating Gunicorn service..."
cat > /etc/systemd/system/nse_auth.service << EOF
[Unit]
Description=nse_auth daemon
After=network.target

[Service]
User=nseauth
Group=www-data
WorkingDirectory=/var/www/nse_auth
Environment="PATH=/var/www/nse_auth/venv/bin"
ExecStart=/var/www/nse_auth/venv/bin/gunicorn nse_auth.wsgi:application \\
    --bind 127.0.0.1:8000 \\
    --workers 4 \\
    --worker-class sync \\
    --timeout 30 \\
    --max-requests 1000 \\
    --max-requests-jitter 100 \\
    --preload-app \\
    --access-logfile /var/log/nse_auth/access.log \\
    --error-logfile /var/log/nse_auth/error.log \\
    --log-level info

[Install]
WantedBy=multi-user.target
EOF

# Create deployment script
print_status "Creating deployment script..."
cat > /var/www/nse_auth/deploy.sh << 'EOF'
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
EOF

chmod +x /var/www/nse_auth/deploy.sh
chown nseauth:nseauth /var/www/nse_auth/deploy.sh

# Create backup script
print_status "Creating backup script..."
cat > /var/www/nse_auth/backup.sh << 'EOF'
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
EOF

chmod +x /var/www/nse_auth/backup.sh
chown nseauth:nseauth /var/www/nse_auth/backup.sh

# Setup automatic backups
print_status "Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/nse_auth/backup.sh") | crontab -

# Setup automatic security updates
print_status "Setting up automatic security updates..."
dpkg-reconfigure -plow unattended-upgrades -f noninteractive

# Create environment file template
print_status "Creating environment file template..."
cat > /var/www/nse_auth/.env.example << EOF
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration
DB_NAME=nse_auth
DB_USER=nse_auth_user
DB_PASSWORD=secure_password_change_me
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379/1

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
EOF

chown nseauth:nseauth /var/www/nse_auth/.env.example
chmod 600 /var/www/nse_auth/.env.example

# Print setup completion message
echo ""
echo "🎉 Ubuntu Server Setup Completed!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Clone your repository to /var/www/nse_auth"
echo "2. Copy .env.example to .env and update with your values"
echo "3. Run 'python manage.py createsuperuser'"
echo "4. Obtain SSL certificate: certbot --nginx -d yourdomain.com"
echo "5. Deploy your application: ./deploy.sh"
echo ""
echo "🔐 Security Reminders:"
echo "- Change the PostgreSQL password"
echo "- Update the SECRET_KEY in .env"
echo "- Configure your domain name in Nginx"
echo "- Set up monitoring and alerting"
echo ""
echo "📁 Important Files:"
echo "- Nginx config: /etc/nginx/sites-available/nse_auth"
echo "- Gunicorn service: /etc/systemd/system/nse_auth.service"
echo "- Deployment script: /var/www/nse_auth/deploy.sh"
echo "- Backup script: /var/www/nse_auth/backup.sh"
echo "- Environment template: /var/www/nse_auth/.env.example"
echo ""
echo "🔧 Services Status:"
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
systemctl status fail2ban

echo ""
echo "✅ Server is ready for NSE Authentication System deployment!"
EOF
