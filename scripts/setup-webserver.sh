#!/bin/bash

# Web Server Setup Script for NSE Intelligence Platform
# Configures Nginx with security optimizations and performance tuning

set -e

DOMAIN=${1:-"your-domain.com"}
API_DOMAIN=${2:-"api.your-domain.com"}

echo "🌐 Setting up production web server for $DOMAIN"

# Create additional Nginx configurations
mkdir -p nginx/conf.d
mkdir -p nginx/snippets

# Create security headers snippet
cat > nginx/snippets/security-headers.conf << 'EOF'
# Security Headers
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' wss: https:; frame-ancestors 'none';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
EOF

# Create rate limiting snippet
cat > nginx/snippets/rate-limiting.conf << 'EOF'
# Rate Limiting Configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ws:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

# Connection Limiting
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn conn_limit_per_ip 20;
EOF

# Create SSL optimization snippet
cat > nginx/snippets/ssl-optimization.conf << 'EOF'
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# SSL HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
EOF

# Create gzip compression snippet
cat > nginx/snippets/gzip-compression.conf << 'EOF'
# Gzip Compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    application/atom+xml
    application/javascript
    application/json
    application/rss+xml
    application/vnd.ms-fontobject
    application/x-font-ttf
    application/x-web-app-manifest+json
    application/xhtml+xml
    application/xml
    font/opentype
    image/svg+xml
    image/x-icon
    text/css
    text/plain
    text/x-component;
EOF

# Create caching snippet
cat > nginx/snippets/cache-control.conf << 'EOF'
# Cache Control Settings
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|eot|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    access_log off;
}

location ~* \.(pdf|doc|docx|xls|xlsx|ppt|pptx)$ {
    expires 30d;
    add_header Cache-Control "public";
    access_log off;
}

# API caching
location ~* \.(json)$ {
    expires 5m;
    add_header Cache-Control "public, must-revalidate";
}
EOF

# Create main Nginx configuration with optimizations
cat > nginx/nginx-optimized.conf << EOF
# Nginx Configuration for NSE Intelligence Platform
# Optimized for production with security hardening

# Worker processes (auto-detect CPU cores)
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging format
    log_format main_ext '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                       '\$status \$body_bytes_sent "\$http_referer" '
                       '"\$http_user_agent" "\$http_x_forwarded_for" '
                       'rt=\$request_time uct="\$upstream_connect_time" '
                       'uht="\$upstream_header_time" urt="\$upstream_response_time"';

    access_log /var/log/nginx/access.log main_ext;
    error_log /var/log/nginx/error.log warn;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 100;
    reset_timedout_connection on;
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    client_max_body_size 20M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Include snippets
    include /etc/nginx/snippets/security-headers.conf;
    include /etc/nginx/snippets/rate-limiting.conf;
    include /etc/nginx/snippets/gzip-compression.conf;
    include /etc/nginx/snippets/cache-control.conf;

    # Hide Nginx version
    server_tokens off;

    # Upstream servers
    upstream backend {
        server backend:3001 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream frontend {
        server frontend:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $DOMAIN $API_DOMAIN;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # Frontend (HTTPS)
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        include /etc/nginx/snippets/ssl-optimization.conf;

        # Security headers
        include /etc/nginx/snippets/security-headers.conf;

        # Frontend
        location / {
            limit_conn conn_limit_per_ip 20;
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
            
            # Include cache control
            include /etc/nginx/snippets/cache-control.conf;
        }
    }

    # Backend API (HTTPS)
    server {
        listen 443 ssl http2;
        server_name $API_DOMAIN;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        include /etc/nginx/snippets/ssl-optimization.conf;

        # Security headers
        include /etc/nginx/snippets/security-headers.conf;

        # CORS headers
        add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since" always;
        add_header Access-Control-Allow-Credentials true always;

        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://$DOMAIN";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since";
            add_header Access-Control-Allow-Credentials true;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        # Backend API with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_conn conn_limit_per_ip 10;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # WebSocket
        location /socket.io/ {
            limit_req zone=ws burst=10 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 86400;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
EOF

# Create Nginx performance tuning configuration
cat > nginx/conf.d/performance.conf << 'EOF'
# Performance Tuning Configuration

# Worker processes
worker_processes auto;
worker_rlimit_nofile 65535;

# Events
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# HTTP optimizations
http {
    # TCP optimizations
    tcp_nopush on;
    tcp_nodelay on;
    
    # Keep alive settings
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 20m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # Timeout settings
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # Reset timedout connections
    reset_timedout_connection on;
    
    # File descriptors
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
EOF

echo "✅ Production web server configuration completed!"
echo "📁 Configuration files created in nginx/"
echo "🔧 Apply with: docker-compose -f docker-compose.prod.yml restart nginx"
