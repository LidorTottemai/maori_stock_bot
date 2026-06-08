#!/bin/bash
# Usage: deploy-site.sh <repo_name> <github_owner>
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
SUBDOMAIN="${REPO_NAME%-website}"
FQDN="${SUBDOMAIN}.${DOMAIN}"
SSL_CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

echo "==> Deploying $REPO_NAME → $FQDN (port $PORT)"

# 1. Clone or pull
mkdir -p "$SITES_DIR"
if [ -d "$SITE_DIR/.git" ]; then
    echo "==> Pulling latest..."
    git -C "$SITE_DIR" pull --rebase origin main
else
    echo "==> Cloning..."
    git clone "https://github.com/$GITHUB_OWNER/$REPO_NAME.git" "$SITE_DIR"
fi

# 2. Fix next.config.ts → next.config.mjs (older Next.js versions don't support .ts)
cd "$SITE_DIR"
if [ -f "next.config.ts" ]; then
    echo "==> Converting next.config.ts → next.config.mjs..."
    node -e "
const fs = require('fs');
let c = fs.readFileSync('next.config.ts', 'utf8');
c = c.replace(/import type \{[^}]+\} from ['\"](next|.*)['\"];\n?/g, '');
c = c.replace(/: NextConfig/g, '');
fs.writeFileSync('next.config.mjs', c);
fs.unlinkSync('next.config.ts');
console.log('Done');
"
fi

# 3. Install deps and build
npm install --prefer-offline 2>&1 | tail -5
npm run build 2>&1 | tail -30

# 4. PM2: start or restart
if pm2 describe "$REPO_NAME" > /dev/null 2>&1; then
    echo "==> Restarting PM2..."
    pm2 restart "$REPO_NAME"
else
    echo "==> Starting PM2 on port $PORT..."
    PORT=$PORT pm2 start npm --name "$REPO_NAME" -- start -- --port "$PORT"
fi
pm2 save

# 5. Nginx config — HTTP now, HTTPS when cert exists
NGINX_CONF="/etc/nginx/sites-available/$FQDN"
if [ -f "$SSL_CERT" ]; then
sudo tee "$NGINX_CONF" > /dev/null << NGINX
server {
    listen 80;
    server_name $FQDN;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl;
    server_name $FQDN;
    ssl_certificate $SSL_CERT;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 60s;
    }
}
NGINX
else
sudo tee "$NGINX_CONF" > /dev/null << NGINX
server {
    listen 80;
    server_name $FQDN;
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }
}
NGINX
fi

sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$FQDN"
sudo nginx -t && sudo systemctl reload nginx

PROTO="http"
[ -f "$SSL_CERT" ] && PROTO="https"
echo "==> Done! Site live at $PROTO://$FQDN"
