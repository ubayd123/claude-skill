#!/usr/bin/env bash
# Nightly logical backup. Schedule with cron, e.g.  15 2 * * *  cd /app && npm run db:backup
# Keeps 30 days of compressed dumps in ./backups (copy them off-server, e.g. to S3/R2).
set -euo pipefail
mkdir -p backups
stamp=$(date -u +%Y%m%d-%H%M%S)
pg_dump --no-owner --format=custom "$DATABASE_URL" > "backups/rltc-$stamp.dump"
find backups -name 'rltc-*.dump' -mtime +30 -delete
echo "Backup written: backups/rltc-$stamp.dump"
