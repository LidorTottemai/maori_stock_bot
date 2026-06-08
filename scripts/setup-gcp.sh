#!/bin/bash
# Run once on a fresh GCP Ubuntu 22.04 VM
set -e

echo "=== 1. System packages ==="
sudo apt-get update
sudo apt-get install -y git nginx certbot python3-certbot-nginx curl

echo "=== 2. Docker ==="
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"

echo "=== 3. Node.js 20 + PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash

echo "=== 4. Clone repo ==="
git clone https://github.com/lidortottemai/maori_stock_bot.git ~/maori_stock_bot
chmod +x ~/maori_stock_bot/scripts/deploy-site.sh

echo "=== 5. nginx — API ==="
sudo cp ~/maori_stock_bot/nginx/api.conf /etc/nginx/sites-available/api.hhippo.co.il
sudo ln -sf /etc/nginx/sites-available/api.hhippo.co.il /etc/nginx/sites-enabled/api.hhippo.co.il
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 6. Wildcard SSL (requires Cloudflare DNS) ==="
echo ""
echo "Run after pointing DNS to this server:"
echo "  sudo certbot certonly --manual --preferred-challenges dns \\"
echo "    -d hhippo.co.il -d '*.hhippo.co.il'"
echo ""
echo "=== 7. Copy .env ==="
echo "  cp ~/maori_stock_bot/.env.example ~/maori_stock_bot/.env"
echo "  nano ~/maori_stock_bot/.env   # fill in secrets"
echo ""
echo "=== 8. Start backend ==="
echo "  cd ~/maori_stock_bot && docker compose up -d"
echo ""
echo "=== Setup complete ==="
