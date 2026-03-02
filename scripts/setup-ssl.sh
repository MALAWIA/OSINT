#!/bin/bash

# SSL Certificate Setup Script for NSE Intelligence Platform
# Supports Let's Encrypt and self-signed certificates

set -e

DOMAIN=${1:-"your-domain.com"}
API_DOMAIN=${2:-"api.your-domain.com"}
SSL_TYPE=${3:-"letsencrypt"} # Options: letsencrypt, selfsigned

echo "🔐 Setting up SSL certificates for domain: $DOMAIN"
echo "🌐 API domain: $API_DOMAIN"
echo "📋 SSL type: $SSL_TYPE"

# Create SSL directory
mkdir -p nginx/ssl
mkdir -p nginx/logs

if [ "$SSL_TYPE" = "letsencrypt" ]; then
    echo "🚀 Setting up Let's Encrypt certificates..."
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Get certificates
    echo "🔑 Obtaining SSL certificates..."
    sudo certbot certonly --nginx -d "$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    
    # Copy certificates to nginx directory
    sudo cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem nginx/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem nginx/ssl/key.pem
    sudo chown $USER:$USER nginx/ssl/*.pem
    
    # Set up auto-renewal
    echo "⏰ Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx") | crontab -
    
elif [ "$SSL_TYPE" = "selfsigned" ]; then
    echo "🔧 Creating self-signed certificates..."
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=KE/ST=Nairobi/L=Nairobi/O=NSE Intelligence/CN=$DOMAIN"
    
    echo "⚠️  Self-signed certificates created. Browser will show security warnings."
else
    echo "❌ Invalid SSL type. Use 'letsencrypt' or 'selfsigned'"
    exit 1
fi

# Set proper permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

echo "✅ SSL certificates setup complete!"
echo "📁 Certificates located in: nginx/ssl/"
echo "🔄 Let's Encrypt certificates will auto-renew if configured."
