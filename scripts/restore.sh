#!/bin/bash

# Restore Script for NSE Intelligence Platform
# Restores system from backup files

set -e

# Configuration
BACKUP_DIR="/opt/backups/nse-intelligence"
RESTORE_DATE=$1
S3_BUCKET=${BACKUP_S3_BUCKET:-"your-backup-bucket"}

if [ -z "$RESTORE_DATE" ]; then
    echo "❌ Usage: $0 <backup_date> (format: YYYYMMDD_HHMMSS)"
    echo "📋 Available backups:"
    ls -1 "$BACKUP_DIR"/manifest_*.json 2>/dev/null | sed 's/.*manifest_\(.*\)\.json/\1/' | sort -r
    exit 1
fi

echo "🔄 Starting restore process from backup: $RESTORE_DATE"
echo "======================================================"

# Check if backup exists
if [ ! -f "$BACKUP_DIR/manifest_$RESTORE_DATE.json" ]; then
    echo "❌ Backup manifest not found: $BACKUP_DIR/manifest_$RESTORE_DATE.json"
    
    # Try to download from S3
    if [ -n "$S3_BUCKET" ]; then
        echo "☁️ Attempting to download from S3..."
        aws s3 cp "s3://$S3_BUCKET/nse-intelligence/manifest_$RESTORE_DATE.json" "$BACKUP_DIR/manifest_$RESTORE_DATE.json"
        
        if [ ! -f "$BACKUP_DIR/manifest_$RESTORE_DATE.json" ]; then
            echo "❌ Backup not found in S3 either"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Download all backup files from S3 if needed
if [ -n "$S3_BUCKET" ]; then
    echo "☁️ Downloading backup files from S3..."
    for file in database configs ssl logs; do
        aws s3 cp "s3://$S3_BUCKET/nse-intelligence/${file}_${RESTORE_DATE}.tar.gz" "$BACKUP_DIR/${file}/${file}_${RESTORE_DATE}.tar.gz" 2>/dev/null || true
    done
    aws s3 cp "s3://$S3_BUCKET/nse-intelligence/nse_intelligence_${RESTORE_DATE}.sql.gz" "$BACKUP_DIR/database/nse_intelligence_${RESTORE_DATE}.sql.gz" 2>/dev/null || true
    aws s3 cp "s3://$S3_BUCKET/nse-intelligence/redis_${RESTORE_DATE}.rdb.gz" "$BACKUP_DIR/database/redis_${RESTORE_DATE}.rdb.gz" 2>/dev/null || true
fi

# Verify backup integrity
echo "🔍 Verifying backup integrity..."
manifest_file="$BACKUP_DIR/manifest_$RESTORE_DATE.json"

# Check database backup
if [ -f "$BACKUP_DIR/database/nse_intelligence_$RESTORE_DATE.sql.gz" ]; then
    expected_checksum=$(jq -r '.components.database.checksum' "$manifest_file")
    actual_checksum=$(sha256sum "$BACKUP_DIR/database/nse_intelligence_$RESTORE_DATE.sql.gz" | cut -d' ' -f1)
    
    if [ "$expected_checksum" != "$actual_checksum" ]; then
        echo "❌ Database backup checksum mismatch!"
        exit 1
    fi
    echo "✅ Database backup verified"
else
    echo "❌ Database backup file not found"
    exit 1
fi

# Stop services
echo "⏹️ Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Restore database
echo "📊 Restoring PostgreSQL database..."
gunzip -c "$BACKUP_DIR/database/nse_intelligence_$RESTORE_DATE.sql.gz" > /tmp/restore.sql
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U nse_user -d nse_intelligence_prod; do
    echo "Waiting for postgres..."
    sleep 2
done

# Restore database data
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U nse_user -d nse_intelligence_prod < /tmp/restore.sql
rm -f /tmp/restore.sql
echo "✅ Database restored"

# Restore Redis
if [ -f "$BACKUP_DIR/database/redis_$RESTORE_DATE.rdb.gz" ]; then
    echo "🗄️ Restoring Redis data..."
    gunzip -c "$BACKUP_DIR/database/redis_$RESTORE_DATE.rdb.gz" > /tmp/redis_restore.rdb
    docker-compose -f docker-compose.prod.yml up -d redis
    sleep 5
    
    # Copy Redis data
    docker cp /tmp/redis_restore.rdb nse-redis:/data/dump.rdb
    docker-compose -f docker-compose.prod.yml restart redis
    rm -f /tmp/redis_restore.rdb
    echo "✅ Redis restored"
else
    echo "⚠️ Redis backup not found, skipping"
fi

# Restore Elasticsearch
if [ -f "$BACKUP_DIR/database/elasticsearch_$RESTORE_DATE.tar.gz" ]; then
    echo "🔍 Restoring Elasticsearch data..."
    docker-compose -f docker-compose.prod.yml up -d elasticsearch
    sleep 15
    
    # Extract and restore Elasticsearch data
    tar -xzf "$BACKUP_DIR/database/elasticsearch_$RESTORE_DATE.tar.gz" -C /tmp/
    docker cp /tmp/elasticsearch_$RESTORE_DATE/ nse-elasticsearch:/usr/share/elasticsearch/
    docker-compose -f docker-compose.prod.yml restart elasticsearch
    rm -rf /tmp/elasticsearch_$RESTORE_DATE
    echo "✅ Elasticsearch restored"
else
    echo "⚠️ Elasticsearch backup not found, skipping"
fi

# Restore configurations
if [ -f "$BACKUP_DIR/configs/configs_$RESTORE_DATE.tar.gz" ]; then
    echo "⚙️ Restoring configuration files..."
    tar -xzf "$BACKUP_DIR/configs/configs_$RESTORE_DATE.tar.gz" -C ./ --overwrite
    echo "✅ Configurations restored"
else
    echo "⚠️ Configuration backup not found, skipping"
fi

# Restore SSL certificates
if [ -f "$BACKUP_DIR/ssl/ssl_$RESTORE_DATE.tar.gz" ]; then
    echo "🔐 Restoring SSL certificates..."
    tar -xzf "$BACKUP_DIR/ssl/ssl_$RESTORE_DATE.tar.gz" -C ./ --overwrite
    echo "✅ SSL certificates restored"
else
    echo "⚠️ SSL backup not found, skipping"
fi

# Start all services
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Verify restore
echo "🔍 Verifying restore..."
if ./scripts/health-check.sh; then
    echo "✅ System restored successfully!"
else
    echo "⚠️ Some services may not be functioning correctly"
fi

echo ""
echo "🎉 Restore process completed!"
echo "📅 Restored from: $RESTORE_DATE"
echo "📋 Manifest: $BACKUP_DIR/manifest_$RESTORE_DATE.json"

# Create restore log
echo "$(date): Restored from backup $RESTORE_DATE" >> "$BACKUP_DIR/restore.log"
