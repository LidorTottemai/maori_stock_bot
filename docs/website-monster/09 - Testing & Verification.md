# ✅ Phase 9 — Testing & Verification

> **מטרה:** בדיקות end-to-end לכל שלב — לפני ואחרי כל דפלוי.

---

## בדיקת Pipeline מלא

### טריגר ידני

```bash
# על הרספברי — הרץ rebuild על ליד ספציפי
docker compose exec app python -c "
import asyncio, httpx
from app.core.config import get_settings
from app.services.rebuilder import run_rebuild_job

settings = get_settings()

async def main():
    async with httpx.AsyncClient() as client:
        # החלף ב-job_id אמיתי
        await run_rebuild_job('test-job-id', client, settings)

asyncio.run(main())
"
```

### בדיקת ספריית הרכיבים

```bash
# בדוק שmaori-ui קיים
curl -s https://api.github.com/repos/LidorTottemai/maori-ui | jq .name

# בדוק שיש את הרכיבים
curl -s https://api.github.com/repos/LidorTottemai/maori-ui/contents/src/motion | jq '.[].name'
# צפוי: TextReveal.tsx, ScrollReveal.tsx, MagneticButton.tsx, ...

# בדוק שnum = 12+
curl -s https://api.github.com/repos/LidorTottemai/maori-ui/contents/src/motion | jq length
```

### בדיקת אתר שנבנה

```bash
SITE_DIR="/var/www/sites/fixfeetcoil-website"

# maori-ui מותקן?
cat $SITE_DIR/package.json | grep maori-ui

# ספרייה מיובאת?
grep -r "from \"@tottemai/maori-ui\"" $SITE_DIR/components/

# TextReveal קיים?
grep -r "TextReveal" $SITE_DIR/components/

# MagneticButton קיים?
grep -r "MagneticButton" $SITE_DIR/components/

# כמה דפים?
ls $SITE_DIR/app/\[he\]/
# צפוי: page.tsx, about/, services/, booking/, contact/

# CSS variables?
grep "color-primary" $SITE_DIR/app/globals.css

# build עובר?
cd $SITE_DIR && npm run build
echo "Build exit code: $?"
```

### בדיקת איכות לולאה

```bash
# לוגים של הlölöp
docker compose logs app | grep -E "quality|score|attempt"
# צפוי:
# Quality loop attempt 1/3
# Quality score: 5/10 (attempt 1)
# Quality loop attempt 2/3
# Quality score: 8/10 (attempt 2)
# Quality gate passed!
```

---

## Checklist ויזואלי

פתח בדפדפן: `http://fixfeetcoil.hhippo.co.il`

```
דף הבית:
□ TextReveal על הכותרת הראשית מאנים (מילה-מילה)
□ רקע hero: gradient/תמונה עם overlay — לא לבן פשוט
□ MagneticButton: הCTA "מוגנט" כשmouse קרוב
□ ScrollReveal: sections מופיעים בscroll
□ CustomCursor: עיגול עוקב אחרי mouse (desktop)
□ ScrollProgress: פס צבעוני בראש הדף
□ Lenis: scroll חלק עם momentum

ניווט:
□ Navbar: blur backdrop בscroll
□ לחץ על "אודות" → דף נפרד (לא anchor באותו דף)
□ PageTransition: fade קצר בין דפים
□ מובייל: menu hamburger עובד

עברית/אנגלית:
□ /he/ → RTL עברית
□ /en/ → LTR אנגלית
□ language switcher בnavbar

הזמנות:
□ /he/booking/ → BookingWidget
□ 5 שלבים עובדים
□ WhatsApp link נפתח

SEO:
□ View Source: JSON-LD LocalBusiness
□ /robots.txt → קיים
□ /sitemap.xml → קיים
```

---

## Performance Benchmarks

```bash
# Lighthouse score (דרך Chrome DevTools)
# יעדים:
# Performance: ≥85
# Accessibility: ≥90
# Best Practices: ≥90
# SEO: ≥95

# Bundle size
cd /var/www/sites/fixfeetcoil-website
cat .next/analyze/client.html  # אם next-bundle-analyzer מותקן
```

---

## Regression Tests — לאחר שינויים

```bash
# אחרי כל שינוי ב-site_generator.py:
# 1. rebuild אתר בtest
# 2. structural check:
python3 -c "
from app.services.quality_loop import _structural_check
import json
files = {}  # טען קבצים מאתר שנבנה
ok, feedback = _structural_check(files)
print('OK' if ok else f'FAIL: {feedback}')
"

# 3. code review score:
python3 -c "
import asyncio, httpx
from app.services.quality_loop import _code_review_score
from app.core.config import get_settings

async def main():
    files = {}  # טען קבצים
    async with httpx.AsyncClient() as client:
        score, fixes = await _code_review_score(files, client, get_settings())
        print(f'Score: {score}/10')
        for f in fixes: print(f'  - {f}')

asyncio.run(main())
"
```

---

## מה הצלחה נראית כמוה?

אחרי כל 6 השלבים:

| בדיקה | יעד |
|-------|-----|
| ציון quality_loop ממוצע | ≥8/10 |
| אתר עם TextReveal בהero | 100% |
| אתר עם ≥4 דפים | 100% |
| אתר עם maori-ui | 100% |
| בנייה מצליחה (npm build) | ≥95% |
| זמן בנייה כולל | ≤90 דקות |
| ה"WOW factor" ויזואלי | אתה יודע כשאתה רואה |
