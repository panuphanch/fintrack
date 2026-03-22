#!/bin/bash
# Financial Tracker Database Backup Script
# Usage: ./backup.sh
# Cron:  30 2 * * * /var/www/financial-tracker/deploy/scripts/backup.sh

set -e

# Configuration
DB_NAME="financial_tracker"
DB_USER="fintrack_user"
BACKUP_DIR="/var/backups/financial-tracker"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_$DATE.sql.gz"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Log start
echo "[$(date)] Starting backup..."

# Create database backup
sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup created: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

# Remove old backups
DELETED=$(find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "[$(date)] Deleted $DELETED old backup(s)"

# List current backups
echo "[$(date)] Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  No backups found"

echo "[$(date)] Backup completed successfully"
