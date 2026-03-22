#!/bin/bash
# Financial Tracker Deployment Script
# Run as deploy user on the server
# Usage: ./deploy.sh [--skip-db]

set -e

APP_DIR="/var/www/financial-tracker"
SKIP_DB=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

cd "$APP_DIR"

echo "========================================"
echo "Deploying Financial Tracker"
echo "========================================"

echo ""
echo "[1/7] Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo ""
echo "[2/7] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci

echo ""
echo "[3/7] Generating Prisma client and building backend..."
npx prisma generate
npm run build

if [ "$SKIP_DB" = false ]; then
    echo ""
    echo "[4/7] Running database migrations..."
    npm run db:migrate:deploy
else
    echo ""
    echo "[4/7] Skipping database migrations (--skip-db)"
fi

echo ""
echo "[5/7] Pruning backend devDependencies..."
npm prune --production

echo ""
echo "[6/7] Installing and building frontend..."
cd "$APP_DIR/frontend"
npm ci
npm run build
npm prune --production

echo ""
echo "[7/7] Restarting services..."
cd "$APP_DIR"
pm2 reload deploy/ecosystem.config.cjs --env production

# Wait for service to be ready
sleep 3

# Health check
echo ""
echo "Running health check..."
HEALTH=$(curl -s http://127.0.0.1:3001/api/health/ready)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "Health check passed! (API + Database)"
else
    echo "WARNING: Health check failed!"
    echo "Response: $HEALTH"
    echo ""
    echo "Checking basic health..."
    curl -s http://127.0.0.1:3001/api/health
    echo ""
    pm2 logs fintrack-api --lines 20
    exit 1
fi

echo ""
echo "========================================"
echo "Deployment completed successfully!"
echo "========================================"
pm2 status
