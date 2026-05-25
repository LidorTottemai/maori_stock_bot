import asyncio
import json
import logging
import shutil
import tempfile
from pathlib import Path

from app.core.config import Settings
from app.services.competitor_researcher import CompetitorInsights
from app.services.playwright_inspector import SiteMap

logger = logging.getLogger(__name__)

_CLAUDE_SETTINGS = {
    "permissions": {
        "allow": ["Read", "Write", "Edit", "Bash(npm *)", "Bash(npx *)"],
        "defaultMode": "dontAsk",
    }
}

_MANDATORY_STANDARDS = """
## MANDATORY STANDARDS — implement every single one:

### 1. FULL RESPONSIVENESS
- Mobile-first (375px minimum), breakpoints sm/md/lg/xl
- No horizontal overflow anywhere
- Touch-friendly targets (min 44×44px)

### 2. ONLINE PURCHASING
Determine bookingType from the business:
- Services (gym, yoga, pool, clinic, salon): bookingType = "appointment"
  → Date + time picker, service selection, WhatsApp deeplink (wa.me/{PHONE})
- Retail (shop, store, bakery): bookingType = "shop"
  → Cart context, product grid, Stripe checkout (env: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

### 3. DESIGN EXCELLENCE
- shadcn/ui components (Button, Card, Badge, Input, Label — use cn() utility)
- Framer Motion: hero entrance (fadeInUp), scroll-triggered section reveals (viewport: once)
- WCAG AA contrast, consistent spacing (4/8/16/24/32/48px scale)
- 4-color brand palette derived from existing site colors

### 4. i18n WITH next-intl
- messages/he.json — ALL Hebrew content extracted from the existing site
- messages/en.json — English translation of every key in he.json
- app/[locale]/layout.tsx with locale routing (he default, en secondary)
- middleware.ts — createMiddleware from next-intl/middleware
- Language switcher in Navbar (he ⇌ en)
- hreflang alternate links in layout <head>
- next.config.ts must wrap with withNextIntl plugin

### 5. SEO BEST PRACTICES
- generateMetadata() in every page (title, description, openGraph, twitter)
- app/[locale]/sitemap.ts — returns all locale+path combinations
- app/robots.ts
- JSON-LD LocalBusiness schema in layout <head> via <script type="application/ld+json">
- All images via next/image with explicit width, height, alt
- Canonical URLs and hreflang alternate links
"""

_FILE_ORDER = """
## WRITE FILES IN THIS ORDER (use the Write tool for each):
1. business.config.json
2. messages/he.json
3. messages/en.json
4. package.json
5. next.config.ts
6. tsconfig.json
7. tailwind.config.ts
8. postcss.config.mjs
9. middleware.ts
10. .gitignore
11. app/globals.css
12. app/[locale]/layout.tsx
13. app/[locale]/page.tsx
14. app/robots.ts
15. app/[locale]/sitemap.ts
16. components/ui/cn.ts
17. components/Navbar.tsx
18. components/Footer.tsx
19. components/home/HeroSection.tsx
20. components/home/FeaturesSection.tsx
21. components/home/StatsSection.tsx
22. components/home/CtaSection.tsx
23. lib/config.ts
For appointment type:
  24. components/booking/BookingForm.tsx
  25. app/[locale]/booking/page.tsx
For shop type:
  24. components/shop/CartContext.tsx
  25. components/shop/ProductCard.tsx
  26. app/[locale]/shop/page.tsx
  27. app/api/checkout/route.ts
  28. lib/stripe.ts
29. app/[locale]/contact/page.tsx
30. README.md

### 6. PASSWORD GATE (mandatory)
Implement site-wide password protection via middleware.ts.
- Read env var SITE_PASSWORD at runtime
- If SITE_PASSWORD is set: redirect all pages to /unlock unless cookie "site-auth" matches
- /unlock page: clean centered form (password input + submit), RTL Hebrew, sets cookie on correct entry
- If SITE_PASSWORD is empty: no redirect (development/open mode)
- Exempt from redirect: /unlock, /_next/*, /favicon.ico, /api/*
- Cookie "site-auth": httpOnly=false, maxAge=30days, sameSite=lax

Write COMPLETE file contents — no placeholders, ellipses, or TODO comments.
"""


def _build_site_summary(site_map: SiteMap) -> str:
    parts = [
        f"Business Name: {site_map.business_name}",
        f"Phone: {site_map.phone}",
        f"Address: {site_map.address}",
        "",
    ]
    for page in site_map.pages[:6]:
        parts.append(f"### Page: {page.url}")
        parts.append(f"Title: {page.title}")
        if page.headings:
            parts.append("Headings: " + " | ".join(page.headings[:8]))
        parts.append(f"Content:\n{page.body_text[:800]}")
        parts.append("")
    return "\n".join(parts)


def _build_claude_md(
    site_map: SiteMap,
    insights: CompetitorInsights,
    category: str,
    fix_prompt: str | None = None,
) -> str:
    phone_clean = site_map.phone.replace("-", "").replace(" ", "")
    standards = _MANDATORY_STANDARDS.replace("{PHONE}", phone_clean or "972XXXXXXXXX")
    fix_section = ""
    if fix_prompt:
        fix_section = f"""
## ⚡ FIX INSTRUCTIONS (highest priority — implement these changes first):
{fix_prompt}

Apply these specific changes ON TOP of rebuilding the site from the existing content above.
"""
    return f"""# Build a Next.js 14 website for "{site_map.business_name}" ({category})

You are a senior Next.js developer. Build a world-class, production-ready website.
Write every file to this directory using the Write tool.
{fix_section}
## EXISTING SITE CONTENT — copy text faithfully, modernize only the design:

{_build_site_summary(site_map)}

## TOP INDUSTRY DESIGN PATTERNS (from competitor research):

{insights.summary_for_claude}

{standards}

{_FILE_ORDER}

Start now. Write each file completely before moving to the next.
"""


async def generate_site(
    site_map: SiteMap,
    insights: CompetitorInsights,
    category: str,
    settings: Settings,
    fix_prompt: str | None = None,
) -> dict[str, str]:
    project_dir = Path(tempfile.mkdtemp(prefix="rebuild-"))
    logger.info("Generating site in %s", project_dir)

    try:
        # Write CLAUDE.md with all instructions
        (project_dir / "CLAUDE.md").write_text(
            _build_claude_md(site_map, insights, category, fix_prompt=fix_prompt),
            encoding="utf-8",
        )

        # Pre-approve tools so no permission prompts interrupt the subprocess
        dot_claude = project_dir / ".claude"
        dot_claude.mkdir()
        (dot_claude / "settings.json").write_text(
            json.dumps(_CLAUDE_SETTINGS, indent=2),
            encoding="utf-8",
        )

        proc = await asyncio.create_subprocess_exec(
            "claude",
            "-p",
            "--permission-mode", "dontAsk",
            "--max-turns", "80",
            "Read CLAUDE.md thoroughly, then build the complete Next.js project as specified. "
            "Write every file listed in CLAUDE.md to this directory.",
            cwd=str(project_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=1800)
        except asyncio.TimeoutError:
            proc.kill()
            raise RuntimeError("Site generation timed out after 30 minutes")

        out_text = stdout.decode(errors="replace")
        if proc.returncode != 0 and "Reached max turns" not in out_text:
            err = stderr.decode(errors="replace")[:400]
            raise RuntimeError(f"Claude Code exited {proc.returncode}: stderr={err!r} stdout={out_text[:400]!r}")

        if "Reached max turns" in out_text:
            logger.warning("Claude Code hit max turns — collecting partial output")
        else:
            logger.info("Claude Code finished. stdout preview: %s", out_text[:300])

        # Collect all generated files
        files: dict[str, str] = {}
        skip_prefixes = {".claude", "node_modules", ".git"}
        skip_names = {"CLAUDE.md"}

        for fp in project_dir.rglob("*"):
            if not fp.is_file():
                continue
            rel = fp.relative_to(project_dir)
            parts = rel.parts
            if parts[0] in skip_prefixes or rel.name in skip_names:
                continue
            if any(p in skip_prefixes for p in parts):
                continue
            try:
                files[str(rel)] = fp.read_text(encoding="utf-8")
            except Exception:
                pass  # skip binary files

        logger.info("Collected %d generated files", len(files))
        return files

    finally:
        shutil.rmtree(project_dir, ignore_errors=True)
