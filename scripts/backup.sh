#!/bin/bash

# Backup Script for NSE Intelligence Platform
# Performs automated backups of database, configurations, and user data

set -e

# Configuration
BACKUP_DIR="/opt/backups/nse-intelligence"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
S3_BUCKET=${BACKUP_S3_BUCKET:-"your-backup-bucket"}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/configs"
mkdir -p "$BACKUP_DIR/logs"
mkdir -p "$BACKUP_DIR/ssl"

echo "🔄 Starting backup process - $DATE"
echo "=================================="

# Database backup
echo "📊 Backing up PostgreSQL database..."
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U nse_user nse_intelligence_prod > "$BACKUP_DIR/database/nse_intelligence_$DATE.sql"; then
    gzip "$BACKUP_DIR/database/nse_intelligence_$DATE.sql"
    echo "✅ Database backup completed: nse_intelligence_$DATE.sql.gz"
else
    echo "❌ Database backup failed"
    exit 1
fi

# Redis backup
echo "🗄️ Backing up Redis data..."
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli --rdb /data/dump_$DATE.rdb; then
    docker cp nse-redis:/data/dump_$DATE.rdb "$BACKUP_DIR/database/redis_$DATE.rdb"
    gzip "$BACKUP_DIR/database/redis_$DATE.rdb"
    echo "✅ Redis backup completed: redis_$DATE.rdb.gz"
else
    echo "❌ Redis backup failed"
fi

# Elasticsearch backup
echo "🔍 Backing up Elasticsearch data..."
if docker-compose -f docker-compose.prod.yml exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup_repo" -H 'Content-Type: application/json' -d '{"type": "fs", "settings": {"location": "/usr/share/elasticsearch/backup"}}'; then
    docker-compose -f docker-compose.prod.yml exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup_repo/snapshot_$DATE?wait_for_completion=true"
    docker cp nse-elasticsearch:/usr/share/elasticsearch/backup "$BACKUP_DIR/database/elasticsearch_$DATE"
    tar -czf "$BACKUP_DIR/database/elasticsearch_$DATE.tar.gz" -C "$BACKUP_DIR/database" "elasticsearch_$DATE"
    rm -rf "$BACKUP_DIR/database/elasticsearch_$DATE"
    echo "✅ Elasticsearch backup completed: elasticsearch_$DATE.tar.gz"
else
    echo "❌ Elasticsearch backup failed"
fi

# Configuration files backup
echo "⚙️ Backing up configuration files..."
tar -czf "$BACKUP_DIR/configs/configs_$DATE.tar.gz" \
    .env.production \
    docker-compose.prod.yml \
    nginx/nginx.conf \
    monitoring/ \
    scripts/

echo "✅ Configuration backup completed: configs_$DATE.tar.gz"

# SSL certificates backup
if [ -d "nginx/ssl" ]; then
    echo "🔐 Backing up SSL certificates..."
    tar -czf "$BACKUP_DIR/ssl/ssl_$DATE.tar.gz" nginx/ssl/
    echo "✅ SSL backup completed: ssl_$DATE.tar.gz"
fi

# Application logs backup
echo "📝 Backing up application logs..."
if [ -d "nginx/logs" ]; then
    tar -czf "$BACKUP_DIR/logs/logs_$DATE.tar.gz" nginx/logs/
    echo "✅ Logs backup completed: logs_$DATE.tar.gz"
fi

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/manifest_$DATE.json" << EOF
{
  "backup_date": "$DATE",
  "backup_type": "full",
  "components": {
    "database": {
      "file": "nse_intelligence_$DATE.sql.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/database/nse_intelligence_$DATE.sql.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/database/nse_intelligence_$DATE.sql.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    },
    "redis": {
      "file": "redis_$DATE.rdb.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/database/redis_$DATE.rdb.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/database/redis_$DATE.rdb.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    },
    "elasticsearch": {
      "file": "elasticsearch_$DATE.tar.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/database/elasticsearch_$DATE.tar.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/database/elasticsearch_$DATE.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    },
    "configs": {
      "file": "configs_$DATE.tar.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/configs/configs_$DATE.tar.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/configs/configs_$DATE.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    },
    "ssl": {
      "file": "ssl_$DATE.tar.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/ssl/ssl_$DATE.tar.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/ssl/ssl_$DATE.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    },
    "logs": {
      "file": "logs_$DATE.tar.gz",
      "size": "$(stat -c%s "$BACKUP_DIR/logs/logs_$DATE.tar.gz" 2>/dev/null || echo 0)",
      "checksum": "$(sha256sum "$BACKUP_DIR/logs/logs_$DATE.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo "")"
    }
  },
  "total_size": "$(du -sb "$BACKUP_DIR" | cut -f1)",
  "docker_compose_version": "$(docker-compose -f docker-compose.prod.yml version --short)",
  "platform": "$(uname -a)"
}
EOF

echo "✅ Backup manifest created: manifest_$DATE.json"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo "☁️ Uploading backup to S3..."
    
    # Configure AWS CLI if not already configured
    if [ ! -f "$HOME/.aws/config" ]; then
        aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
        aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
        aws configure set default.region "us-east-1"
    fi
    
    # Upload all backup files
    for file in "$BACKUP_DIR"/*/*"$DATE"*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            aws s3 cp "$file" "s3://$S3_BUCKET/nse-intelligence/$filename"
            echo "☁️ Uploaded: $filename"
        fi
    done
    
    echo "✅ S3 upload completed"
fi

# Cleanup old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup completed"

# Backup summary
echo ""
echo "📊 Backup Summary"
echo "=================="
echo "📅 Date: $DATE"
echo "📁 Location: $BACKUP_DIR"
echo "💾 Total size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "🗂️ Files created:"
find "$BACKUP_DIR" -name "*$DATE*" -type f -exec basename {} \; | sort

echo ""
echo "🎉 Backup process completed successfully!"
echo "📋 Manifest: $BACKUP_DIR/manifest_$DATE.json"
