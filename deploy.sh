#!/bin/bash

# Deployment script for Twitch to YouTube Publisher

echo "Starting deployment..."

# Configuration
APP_DIR="/var/www/twitch-yt"
BACKUP_DIR="/var/backups/twitch-yt"
NGINX_CONFIG="/etc/nginx/sites-available/twitch-yt"
DOMAIN="your-domain.com"  # Change this to your domain

# Create backup
echo "Creating backup..."
if [ -d "$APP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r "$APP_DIR" "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
fi

# Stop the application
echo "Stopping application..."
pm2 stop twitch-yt || true

# Update the code
echo "Updating code..."
cd "$APP_DIR"
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build the application
echo "Building application..."
npm run build

# Start the application
echo "Starting application..."
pm2 start ecosystem.config.js --name twitch-yt

# Update Nginx configuration
echo "Updating Nginx configuration..."
cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}

# HTTPS redirect (uncomment when SSL is configured)
# server {
#     listen 443 ssl http2;
#     server_name $DOMAIN www.$DOMAIN;
#     
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
#     
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_cache_bypass \$http_upgrade;
#     }
# }
EOF

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    systemctl reload nginx
else
    echo "Nginx configuration test failed. Please check the configuration."
    exit 1
fi

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Restart PM2
echo "Restarting PM2..."
pm2 restart twitch-yt

echo "Deployment completed successfully!"
echo ""
echo "Check the application at: https://$DOMAIN"
echo ""
echo "To monitor the application, run:"
echo "  pm2 logs twitch-yt"
echo "  pm2 status"