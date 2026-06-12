# Phase 9: Testing & Verification

> **מטרה:** לוודא שהמכונה עובדת end-to-end ומייצרת אתרי WOW  
> **בדיקות:** בסוף כל phase ובבדיקת אינטגרציה מלאה

---

## בדיקת Phase 1+2 — maori-ui

```bash
# 1. ריפו קיים ב-GitHub
gh repo view LidorTottemai/maori-ui --json name,url

# 2. כל הקבצים קיימים
gh api repos/LidorTottemai/maori-ui/contents/src/motion \
  --jq '.[].name'
# ציפייה: TextReveal.tsx, CharReveal.tsx, ScrollReveal.tsx, ...

# 3. בדיקת import בפרויקט test
mkdir /tmp/test-maori-ui && cd /tmp/test-maori-ui
echo '{"name":"test","dependencies":{"@tottemai/maori-ui":"github:LidorTottemai/maori-ui"}}' > package.json
npm install
node -e "const m = require('@tottemai/maori-ui/src/index'); console.log(Object.keys(m))"
# ציפייה: ["TextReveal", "ScrollReveal", "MagneticButton", ...]
```

---

## בדיקת Phase 4 — Site Generator

```bash
# rebuild ידני על fixfeet
docker compose exec app python -c "
import asyncio, httpx
from app.services.site_generator import generate_site
from app.services.playwright_inspector import crawl_site
from app.services.competitor_researcher import research_competitors
from app.core.config import get_settings

async def test():
    s = get_settings()
    async with httpx.AsyncClient() as http:
        site_map = await crawl_site('https://fixfeetcoil.co.il')
        insights = await research_competitors('פיזיותרפיה', http, s)
        files = await generate_site(site_map, insights, 'פיזיותרפיה', s)
        print('Files generated:', len(files))
        print('Has package.json:', 'package.json' in files)
        print('Has maori-ui:', '@tottemai/maori-ui' in files.get('package.json',''))
        print('Has TextReveal:', any('TextReveal' in v for v in files.values()))
        print('Pages count:', sum(1 for k in files if k.endswith('page.tsx')))

asyncio.run(test())
"
```

**ציפייה:**
```
Files generated: 28-35
Has package.json: True
Has maori-ui: True
Has TextReveal: True
Pages count: 5+
```

---

## בדיקת Phase 5 — Quality Loop

```bash
docker compose logs app --follow | grep -E "quality|attempt|score"
```

**ציפייה:**
```
Quality loop — attempt 1/3
Quality score: 7/10 | issues: [...]
Quality loop — attempt 2/3
✅ Quality gate passed (score=9/10)
```

---

## בדיקת Phase 6 — Inspiration Crawler

```bash
docker compose exec app python -c "
import asyncio, httpx
from app.services.inspiration_crawler import get_inspiration
from app.core.config import get_settings

async def test():
    s = get_settings()
    async with httpx.AsyncClient() as http:
        report = await get_inspiration('ספא', http, s)
        print('Sites analyzed:', report.sites_analyzed)
        print('Top fonts:', report.top_fonts[:4])
        print('Detected libs:', report.detected_libraries)

asyncio.run(test())
"
```

---

## בדיקה ויזואלית — חובה!

### Checklist ויזואלי לכל אתר שנבנה:

```
פתח http://{site}.hhippo.co.il בדפדפן

HERO:
□ כותרת מתגלה מילה-מילה (TextReveal)
□ רקע מונפש (gradient / shapes / parallax image)
□ כפתור CTA זזה מגנטית בhover
□ חץ scroll מקפץ

SCROLL:
□ סקציות מתגלות בscroll (ScrollReveal)
□ scroll חלק ועם momentum (Lenis)
□ פס התקדמות בראש הדף

INTERACTIONS:
□ סמן מותאם (desktop)
□ card תלת-ממדי בhover (Reveal3D)
□ גופן display מיוחד (לא רק Inter)

MULTI-PAGE:
□ לפחות 4 עמודים בנפרד
□ מעבר בין דפים מונפש (PageTransition)
□ Navbar נשאר sticky ועם blur

RTL:
□ Hebrew right-to-left
□ תפריט ניווט בצד ימין
□ dir="rtl" בhtml/layout
```

---

## בדיקת מערכת ההזמנות

```bash
# 1. בדוק endpoints
curl http://localhost:8000/api/v1/booking/slots?place_id=TEST&date=2026-07-01
# ציפייה: JSON עם slots

# 2. צור appointment
curl -X POST http://localhost:8000/api/v1/booking/ \
  -H "Content-Type: application/json" \
  -d '{"place_id":"TEST","client_name":"ישראל","client_phone":"0501234567","service_name":"עיסוי","date":"2026-07-01","time_slot":"14:00"}'
# ציפייה: { id, status:"pending", whatsapp_url }

# 3. בדוק WhatsApp URL
# פתח ב-browser — אמור לפתוח WhatsApp עם הודעה
```

---

## בדיקת מסעדה

```bash
# 1. צור menu
curl http://localhost:8000/api/v1/menu/TEST_RESTAURANT
# ציפייה: { categories: [...] }

# 2. צור order
curl -X POST http://localhost:8000/api/v1/orders/ \
  -d '{"place_id":"TEST","items":[{"id":"1","qty":2}],"client_name":"דנה","client_phone":"0521234567","delivery_type":"table","table_number":"5"}'
```

---

## Pipeline מלא — smoke test

```bash
# הרץ rebuild על ליד אמיתי
docker compose exec app python -m app.scripts.test_rebuild <place_id>

# בדוק Telegram — אמורה להגיע הודעה עם:
# ✅ שם העסק — האתר מוכן! ציון עיצוב: 8/10 🎨
# 🌐 http://...hhippo.co.il

# בדוק שהאתר עלה
curl -I http://fixfeetcoil.hhippo.co.il
# ציפייה: 200 OK
```

---

## ציון הצלחה כולל

| קריטריון | ציון מינימלי |
|---------|-------------|
| Quality loop ציון | ≥ 8/10 |
| מספר קבצים שנוצרו | ≥ 25 |
| TextReveal בhero | ✅ |
| גופן מותאם (לא רק Inter) | ✅ |
| CSS variables לכל הצבעים | ✅ |
| 4+ דפים | ✅ |
| Lenis בlayout | ✅ |
| npm run build עובר | ✅ |

**אם כל הקריטריונים עוברים — המפלצת מוכנה.** 🦛
