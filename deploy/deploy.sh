#!/usr/bin/env bash
set -euo pipefail

# ─── Production Deployment Script for terminal-bio ───
# Run as deployer user (NOT root, NOT www-data)
#
# Prerequisites:
#   - Server has Node.js 22+ installed
#   - nginx is installed + certbot for SSL
#   - Deployer has SSH key access to the server
#   - Git repo is cloned to /var/www/terminal-bio

APP_DIR="/var/www/terminal-bio"
DEPLOYER_USER="deployer"
WEB_USER="www-data"

echo "=== terminal-bio deployment ==="

# 1. Pull latest code
cd "$APP_DIR"
git pull origin main

# 2. Install frontend dependencies & build
echo "[1/5] Building frontend..."
cd "$APP_DIR"
npm ci --production=false
npm run build

# 3. Install server dependencies
echo "[2/5] Installing server dependencies..."
cd "$APP_DIR/server"
npm ci --production=false

# 4. Set strict ownership
echo "[3/5] Setting file ownership..."
chown -R "$DEPLOYER_USER:$DEPLOYER_USER" "$APP_DIR"
# Only storage and logs are writable by web server
chown -R "$WEB_USER:$WEB_USER" "$APP_DIR/server/storage" 2>/dev/null || mkdir -p "$APP_DIR/server/storage" && chown -R "$WEB_USER:$WEB_USER" "$APP_DIR/server/storage"

# 5. Set strict permissions
echo "[4/5] Setting file permissions..."
find "$APP_DIR" -type d -exec chmod 755 {} \;
find "$APP_DIR" -type f -exec chmod 644 {} \;

# Web root is world-readable (Nginx needs access)
chmod 755 "$APP_DIR/dist"
find "$APP_DIR/dist" -type f -exec chmod 644 {} \;

# Make deploy.sh executable
chmod 750 "$APP_DIR/deploy/deploy.sh"

# Storage directory writable by web server
chmod 775 "$APP_DIR/server/storage" 2>/dev/null || true

# 6. Restart backend (via PM2 or systemd)
echo "[5/5] Restarting backend..."
if command -v pm2 &> /dev/null; then
    pm2 restart terminal-bio-api 2>/dev/null || \
    pm2 start "$APP_DIR/server/src/index.js" --name "terminal-bio-api" --interpreter node
    pm2 save
elif systemctl is-active --quiet terminal-bio-api; then
    systemctl restart terminal-bio-api
else
    echo "WARNING: No process manager found. Start server manually:"
    echo "  node $APP_DIR/server/src/index.js"
fi

# 7. Verify Nginx config & reload
echo "[6/5] Reloading Nginx..."
nginx -t && systemctl reload nginx || echo "Nginx config test failed — check /etc/nginx/"

echo "=== Deployment complete ==="
