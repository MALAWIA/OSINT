#!/bin/bash

# SSL Certificate Renewal Script
# This script should be run via cron for automatic renewal

set -e

DOMAIN=${1:-"your-domain.com"}
API_DOMAIN=${2:-"api.your-domain.com"}

echo "🔄 Checking SSL certificate renewal for $DOMAIN..."

# Renew certificates
sudo certbot renew --quiet

# Check if certificates were renewed
if [ /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem -nt /etc/ssl/certs/your-domain.crt ]; then
    echo "🔑 Certificates renewed! Updating nginx..."
    
    # Copy new certificates
    sudo cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem nginx/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem nginx/ssl/key.pem
    sudo chown $USER:$USER nginx/ssl/*.pem
    
    # Restart nginx to apply new certificates
    docker-compose -f docker-compose.prod.yml restart nginx
    
    echo "✅ SSL certificates renewed and nginx restarted!"
else
    echo "ℹ️  No certificate renewal needed."
fi

# Test certificate expiry
EXPIRY=$(openssl x509 -in nginx/ssl/cert.pem -noout -enddate | cut -d= -f2)
echo "📅 Certificate expires: $EXPIRY"

# Check if certificate expires within 30 days
if openssl x509 -checkend 2592000 -noout -in nginx/ssl/cert.pem; then
    echo "✅ Certificate is valid for more than 30 days."
else
    echo "⚠️  Certificate expires within 30 days!"
    # Send notification (implement your notification method)
    # echo "SSL certificate for $DOMAIN expires soon!" | mail -s "SSL Certificate Warning" admin@your-domain.com
fi
