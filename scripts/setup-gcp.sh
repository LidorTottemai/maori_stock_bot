#!/bin/bash
# Run once on a fresh GCP Debian/Ubuntu VM
set -e

# 1. System packages
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin nginx certbot python3-certbot-nginx

# 2. Allow current user to run docker without sudo
sudo usermod -aG docker "$USER"
newgrp docker

# 3. Clone the repo (replace with your repo URL)
git clone https://github.com/lidortottemai/maori_stock_bot.git ~/maori_stock_bot

# 4. Copy nginx config (edit YOUR_DOMAIN first)
sudo cp ~/maori_stock_bot/nginx/api.conf /etc/nginx/sites-available/api
sudo ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/api
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== Next steps ==="
echo "1. Edit /etc/nginx/sites-available/api — replace YOUR_DOMAIN with your real domain"
echo "2. sudo certbot --nginx -d api.YOUR_DOMAIN.com"
echo "3. cp ~/maori_stock_bot/.env.example ~/maori_stock_bot/.env  (and fill in secrets)"
echo "4. cd ~/maori_stock_bot && docker compose up -d"
echo "5. Add GCP_HOST, GCP_USER, GCP_SSH_KEY to GitHub repo Secrets"
