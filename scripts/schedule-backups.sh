#!/bin/bash

# Backup Scheduling Script for NSE Intelligence Platform
# Sets up automated backup schedules using cron

set -e

echo "⏰ Setting up automated backup schedules..."

# Add cron jobs for backups
(crontab -l 2>/dev/null; echo "# NSE Intelligence Platform - Automated Backups") | crontab -
(crontab -l 2>/dev/null; echo "# Daily full backup at 2:00 AM") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/nse-intelligence/scripts/backup.sh >> /var/log/nse-intelligence/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "# Weekly backup verification at 3:00 AM on Sundays") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/nse-intelligence/scripts/verify-backups.sh >> /var/log/nse-intelligence/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "# SSL certificate renewal check at 12:00 PM daily") | crontab -
(crontab -l 2>/dev/null; echo "0 12 * * * /opt/nse-intelligence/scripts/ssl-renewal.sh >> /var/log/nse-intelligence/ssl.log 2>&1") | crontab -

echo "✅ Backup schedules configured:"
echo "📅 Daily backup: 2:00 AM"
echo "🔍 Weekly verification: Sunday 3:00 AM"
echo "🔐 SSL renewal check: Daily 12:00 PM"

# Create backup verification script
cat > scripts/verify-backups.sh << 'EOF'
#!/bin/bash

# Backup Verification Script
# Verifies backup integrity and sends alerts if needed

set -e

BACKUP_DIR="/opt/backups/nse-intelligence"
TODAY=$(date +%Y%m%d)
ALERT_EMAIL=${ALERT_EMAIL:-"admin@your-domain.com"}

echo "🔍 Verifying backup integrity - $(date)"

# Check if today's backup exists
if [ ! -f "$BACKUP_DIR/manifest_$TODAY"*".json" ]; then
    echo "❌ Today's backup not found!"
    # Send alert (implement your notification method)
    # echo "Today's backup failed for NSE Intelligence Platform" | mail -s "Backup Failure Alert" $ALERT_EMAIL
    exit 1
fi

# Verify latest backup integrity
LATEST_BACKUP=$(ls -1 "$BACKUP_DIR"/manifest_*.json | tail -1 | sed 's/.*manifest_\(.*\)\.json/\1/')

echo "📋 Verifying backup: $LATEST_BACKUP"

# Check database backup
DB_FILE="$BACKUP_DIR/database/nse_intelligence_$LATEST_BACKUP.sql.gz"
if [ -f "$DB_FILE" ]; then
    if gzip -t "$DB_FILE" 2>/dev/null; then
        echo "✅ Database backup integrity verified"
    else
        echo "❌ Database backup corrupted!"
        # echo "Database backup corrupted for $LATEST_BACKUP" | mail -s "Backup Corruption Alert" $ALERT_EMAIL
    fi
else
    echo "❌ Database backup missing!"
fi

# Check backup size
BACKUP_SIZE=$(du -sb "$BACKUP_DIR" | cut -f1)
MIN_SIZE=100000000  # 100MB minimum

if [ "$BACKUP_SIZE" -lt "$MIN_SIZE" ]; then
    echo "⚠️ Backup size suspiciously small: $BACKUP_SIZE bytes"
else
    echo "✅ Backup size OK: $(numfmt --to=iec $BACKUP_SIZE)"
fi

# Check disk space
AVAILABLE_SPACE=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
MIN_SPACE=1073741824  # 1GB minimum

if [ "$AVAILABLE_SPACE" -lt "$MIN_SPACE" ]; then
    echo "⚠️ Low disk space for backups: $(numfmt --to=iec $AVAILABLE_SPACE) available"
else
    echo "✅ Disk space OK: $(numfmt --to=iec $AVAILABLE_SPACE) available"
fi

echo "🎉 Backup verification completed"
EOF

chmod +x scripts/verify-backups.sh

echo "✅ Backup scheduling completed!"
echo "📋 Current cron jobs:"
crontab -l | grep -E "(backup|verify-backups|ssl-renewal)" | tail -10
