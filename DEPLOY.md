# מדריך פריסה — Raspberry Pi

מדריך זה מסביר כיצד להפעיל את המערכת על Raspberry Pi מאפס.

---

## דרישות מוקדמות

### מערכת הפעלה
- Raspberry Pi OS **64-bit** (Bookworm) — חובה לארכיטקטורת arm64

### תוכנות נדרשות על ה-Pi
```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Git
sudo apt-get install -y git make

# Node.js 20 (לאימות Claude Code — חד-פעמי על ה-host)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
```

---

## שלב 1 — שכפול הפרויקט

```bash
git clone https://github.com/YOUR_USERNAME/maori_stock_bot.git
cd maori_stock_bot
```

---

## שלב 2 — יצירת כל הטוקנים

### 🗺️ Google Maps API Key — `GOOGLE_MAPS_API_KEY`
1. פתח [console.cloud.google.com](https://console.cloud.google.com)
2. צור פרויקט חדש (או בחר קיים)
3. תפריט שמאל → **APIs & Services** → **Library**
4. חפש **Places API** → הפעל
5. תפריט שמאל → **Credentials** → **Create Credentials** → **API Key**
6. לחץ **Edit Key** → תחת **API restrictions** הגבל ל-**Places API**

---

### 🤖 Telegram Bot Token — `TELEGRAM_BOT_TOKEN`
1. פתח Telegram, חפש **@BotFather**
2. שלח: `/newbot`
3. תן שם לבוט (לדוגמה: `My Lead Bot`)
4. תן username (חייב להסתיים ב-`bot`, לדוגמה: `my_lead_bot`)
5. תקבל טוקן בפורמט: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 💬 Telegram Chat ID — `TELEGRAM_CHAT_ID`
1. שלח הודעה כלשהי לבוט שיצרת
2. פתח בדפדפן:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
3. מצא: `result[0].message.chat.id` — זה ה-Chat ID שלך

### 🔐 Telegram Webhook Secret — `TELEGRAM_WEBHOOK_SECRET`
```bash
# הרץ על ה-Pi ליצירת סיסמה אקראית:
openssl rand -hex 16
```

---

### 🐙 GitHub Token — `GITHUB_TOKEN`
1. פתח [github.com](https://github.com) → **Settings** (מימין למעלה)
2. תפריט שמאל → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. שם: `maori-stock-bot`
5. תחת **Select scopes** — סמן **repo** בלבד
6. **Generate token** — שמור מיד, לא תראה שוב

`GITHUB_USERNAME` — שם המשתמש שלך ב-GitHub (מה שמופיע ב-URL)

---

### ▲ Vercel Token — `VERCEL_TOKEN`
1. פתח [vercel.com](https://vercel.com) → **Account Settings**
2. תפריט שמאל → **Tokens**
3. **Create** → שם: `maori-bot` → **Full Account** → **Create**

---

### 📧 Resend API Key — `RESEND_API_KEY`
1. פתח [resend.com](https://resend.com) → **API Keys**
2. **Create API Key** → שם: `maori-bot` → **Full access** → **Add**

### ✉️ Outreach From Email — `OUTREACH_FROM_EMAIL`
על מנת לשלוח מיילים, חייבים לאמת דומיין:
1. resend.com → **Domains** → **Add Domain**
2. הכנס את שם הדומיין שלך (לדוגמה: `myagency.co.il`)
3. הוסף את רשומות ה-DNS שResend מראה (TXT + MX)
4. לאחר אימות: השתמש ב-`hello@myagency.co.il` (או כל כתובת בדומיין)

> אם אין לך דומיין עדיין, אפשר לדלג זמנית — האפליקציה עובדת גם בלי outreach.

---

## שלב 3 — הגדרת `.env`

```bash
cp .env.example .env
nano .env   # או: vim .env
```

מלא את כל הערכים שיצרת בשלב 2:

```env
GOOGLE_MAPS_API_KEY=AIza...
TELEGRAM_BOT_TOKEN=1234567890:ABC...
TELEGRAM_CHAT_ID=123456789
TELEGRAM_WEBHOOK_SECRET=abc123def456...

GITHUB_TOKEN=ghp_...
GITHUB_USERNAME=your-username
VERCEL_TOKEN=...

RESEND_API_KEY=re_...
OUTREACH_FROM_EMAIL=hello@yourdomain.com
```

---

## שלב 4 — אימות Claude Code (חד-פעמי)

זה הכלי שבונה את האתרים. חייב להיעשות **על ה-Pi ישירות** (לא בתוך Docker):

```bash
# התקנה
sudo npm install -g @anthropic-ai/claude-code

# כניסה — פותח browser, מאשר דרך claude.ai
claude auth login

# בדיקה שעובד:
claude --version
```

> לאחר הכניסה, קובצי ה-auth נשמרים ב-`~/.claude/` ו-Docker מ-mount אותם אוטומטית.

---

## שלב 5 — בנייה והפעלה

```bash
# בנייה ראשונית (לוקח ~10 דקות — מוריד Playwright Chromium)
make deploy

# צפייה בלוגים:
make logs
```

בדוק שהכל עלה:
```bash
curl http://localhost:8000/api/v1/health
# תגובה צפויה: {"status":"ok","db":"connected"}
```

---

## שלב 6 — הגדרת Telegram Webhook

ה-Pi צריך להיות נגיש מהאינטרנט. האפשרות המומלצת לרשת ביתית:

### אפשרות A — Cloudflare Tunnel (מומלץ, חינם)
```bash
# התקנה
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] \
  https://pkg.cloudflare.com/cloudflared bookworm main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install -y cloudflared

# כניסה וקישור דומיין (צריך חשבון Cloudflare עם דומיין)
cloudflared tunnel login
cloudflared tunnel create maori-bot
cloudflared tunnel route dns maori-bot bot.yourdomain.com

# הפעלה כשירות מערכת
sudo cloudflared service install
sudo systemctl start cloudflared
```

```bash
# רישום ה-webhook ב-Telegram (פעם אחת):
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://bot.yourdomain.com/api/v1/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
# תגובה: {"ok":true,"result":true,...}
```

### אפשרות B — Port Forwarding (נתב ביתי)
1. ב-router: הגדר port forwarding מ-80 → Pi:8000
2. השג IP סטטי או השתמש ב-DuckDNS
3. הרץ את פקודת ה-setWebhook עם ה-URL הציבורי שלך

---

## שלב 7 — בדיקה מלאה

```bash
# בריאות
curl http://localhost:8000/api/v1/health

# Claude Code CLI בתוך הקונטיינר
docker compose exec app claude --version

# הפעלת סריקה ידנית (בדיקת Google Maps API)
curl -X POST http://localhost:8000/api/v1/scanner/scan \
  -H "Content-Type: application/json" \
  -d '{"dry_run": true}'

# צפייה בלידים
curl http://localhost:8000/api/v1/leads
```

בטלגרם — שלח הודעה לבוט ובדוק שיש תגובה.

---

## פקודות שימושיות

```bash
make up          # הפעל (background)
make down        # עצור
make logs        # לוגים חיים
make deploy      # build + up
make shell       # bash בתוך הקונטיינר

# עדכון לגרסה חדשה:
git pull
make deploy

# גיבוי ה-DB:
docker compose cp app:/data/scanner.db ./scanner.db.backup

# צפייה ב-DB ישירות:
docker compose exec app sqlite3 /data/scanner.db ".tables"
docker compose exec app sqlite3 /data/scanner.db "SELECT name, score FROM lead ORDER BY score DESC LIMIT 10"
```

---

## לוח זמנים של תהליכים אוטומטיים

| שעה | תהליך | תיאור |
|-----|--------|-------|
| 08:00 | Daily Report | שולח לטלגרם דוח עם כל האתרים הבנויים |
| 09:00 | Daily Scan | סריקת Google Maps לעסקים חדשים |
| 10:00 | Daily Rebuild | בונה אתרים לעסקים בתור |
| 12:00 | Daily Outreach | שולח מיילים לעסקים מאושרים |

כל השעות ניתנות לשינוי דרך `.env` (`DAILY_SCAN_HOUR`, `REBUILD_SCAN_HOUR`, `REPORT_HOUR`).

---

## פתרון בעיות

### הקונטיינר לא עולה
```bash
make logs   # בדוק את ההודעות
```

### Claude Code לא עובד
```bash
# בדוק auth על ה-host:
claude --version
claude auth status

# בדוק שה-mount עובד:
docker compose exec app ls /root/.claude/
```

### Playwright נכשל
```bash
docker compose exec app playwright install --with-deps chromium
```

### Telegram webhook לא מקבל הודעות
```bash
# בדוק סטטוס webhook:
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```
