#!/bin/bash
# Usage: deploy-site.sh <repo_name> <github_owner>
# Example: deploy-site.sh fixfeet-website lidortottemai
set -e

REPO_NAME="$1"
GITHUB_OWNER="$2"

# Deterministic port from repo name (3001-3900)
PORT_FILE="$HOME/.site_ports"
touch "$PORT_FILE"
PORT=$(grep "^$REPO_NAME=" "$PORT_FILE" | cut -d= -f2)
if [ -z "$PORT" ]; then
    LAST_PORT=$(sort -t= -k2 -n "$PORT_FILE" 2>/dev/null | tail -1 | cut -d= -f2)
    PORT=$(( ${LAST_PORT:-3000} + 1 ))
    echo "$REPO_NAME=$PORT" >> "$PORT_FILE"
fi
DOMAIN="hhippo.co.il"
SITES_DIR="/var/www/sites"
SITE_DIR="$SITES_DIR/$REPO_NAME"

# Subdomain: strip "-website" suffix
SUBDOMAIN="${REPO_NAME%-website}"
FQDN="${SUBDOMAIN}.${DOMAIN}"

echo "==> Deploying $REPO_NAME → https://$FQDN (port $PORT)"

# 1. Clone or pull
mkdir -p "$SITES_DIR"
if [ -d "$SITE_DIR/.git" ]; then
    echo "==> Pulling latest..."
    git -C "$SITE_DIR" pull --rebase origin main
else
    echo "==> Cloning..."
    git clone "https://github.com/$GITHUB_OWNER/$REPO_NAME.git" "$SITE_DIR"
fi

# 2. Install deps and build
cd "$SITE_DIR"
npm install --prefer-offline 2>&1 | tail -5
npm run build 2>&1 | tail -20

# 3. PM2: start or restart
if pm2 describe "$REPO_NAME" > /dev/null 2>&1; then
    echo "==> Restarting PM2 process..."
    pm2 restart "$REPO_NAME"
else
    echo "==> Starting PM2 process on port $PORT..."
    PORT=$PORT pm2 start npm --name "$REPO_NAME" -- start -- --port "$PORT"
fi
pm2 save

# 4. Nginx config
NGINX_CONF="/etc/nginx/sites-available/$FQDN"
sudo tee "$NGINX_CONF" > /dev/null << NGINX
server {
    listen 80;
    server_name $FQDN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $FQDN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 60s;
    }
}
NGINX

sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$FQDN"
sudo nginx -t && sudo systemctl reload nginx

echo "==> Done! Site live at https://$FQDN"
