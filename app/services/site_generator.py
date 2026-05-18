import logging

import anthropic

from app.core.config import Settings
from app.services.competitor_researcher import CompetitorInsights
from app.services.playwright_inspector import SiteMap

logger = logging.getLogger(__name__)

_WRITE_FILE_TOOL = {
    "name": "write_file",
    "description": "Write a file to the Next.js project being built.",
    "input_schema": {
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "File path relative to project root, e.g. components/Navbar.tsx",
            },
            "content": {
                "type": "string",
                "description": "Complete file content — no placeholders or TODOs",
            },
        },
        "required": ["path", "content"],
    },
}

_FINISH_TOOL = {
    "name": "finish",
    "description": "Signal that all project files have been written and the project is complete.",
    "input_schema": {"type": "object", "properties": {}, "required": []},
}


def _build_site_summary(site_map: SiteMap) -> str:
    parts = [
        f"Business Name: {site_map.business_name}",
        f"Phone: {site_map.phone}",
        f"Address: {site_map.address}",
        "",
    ]
    for page in site_map.pages[:6]:
        parts.append(f"Page: {page.url}")
        parts.append(f"Title: {page.title}")
        if page.headings:
            parts.append("Headings: " + " | ".join(page.headings[:8]))
        parts.append(f"Content: {page.body_text[:600]}")
        parts.append("")
    return "\n".join(parts)


def _build_prompt(site_map: SiteMap, insights: CompetitorInsights, category: str) -> str:
    phone_clean = site_map.phone.replace("-", "").replace(" ", "")
    return f"""You are a senior Next.js developer. Build a world-class, production-ready website for "{site_map.business_name}" ({category}).

## EXISTING SITE CONTENT — copy text faithfully, modernize only the design:
{_build_site_summary(site_map)}

## DESIGN INSPIRATION FROM TOP INDUSTRY SITES:
{insights.summary_for_claude}

## MANDATORY STANDARDS — implement every single one:

### 1. FULL RESPONSIVENESS
- Mobile-first (375px minimum), breakpoints sm/md/lg/xl
- No horizontal overflow anywhere
- Touch-friendly targets (min 44×44px)

### 2. ONLINE PURCHASING
Determine bookingType from the business type:
- Services (gym, yoga, pool, clinic, salon): bookingType = "appointment"
  → Date + time picker form, service selection, WhatsApp deeplink: wa.me/{phone_clean or '972XXXXXXXXX'}
- Retail (shop, store, bakery): bookingType = "shop"
  → Cart context provider, product grid, Stripe checkout (env: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

### 3. DESIGN EXCELLENCE
- shadcn/ui components (cn utility, Button, Card, Badge, Input, Label)
- Framer Motion: hero entrance (fadeInUp), scroll-triggered section reveals (viewport: once)
- WCAG AA contrast, consistent spacing (4/8/16/24/32/48px)
- Derive a 4-color palette from existing brand colors + competitors

### 4. i18n WITH next-intl
- messages/he.json — ALL Hebrew content extracted from site
- messages/en.json — English translation of every key
- app/[locale]/layout.tsx — locale routing (he default, en)
- middleware.ts — next-intl createMiddleware
- Language switcher in Navbar (flag or he/en toggle)
- hreflang alternate links in layout <head>
- next.config.ts must use withNextIntl plugin

### 5. SEO BEST PRACTICES
- generateMetadata() in every page (title, description, openGraph, twitter)
- app/[locale]/sitemap.ts returning all locale URLs
- app/robots.ts
- JSON-LD LocalBusiness schema injected in layout <head> via <script type="application/ld+json">
- All images via next/image with width, height, alt
- Canonical URLs, <link rel="alternate" hreflang>

## WRITE FILES IN THIS ORDER:
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
(then booking or shop files depending on type)
24a. components/booking/BookingForm.tsx + app/[locale]/booking/page.tsx
   OR
24b. components/shop/CartContext.tsx + components/shop/ProductCard.tsx + app/[locale]/shop/page.tsx + app/api/checkout/route.ts + lib/stripe.ts
25. app/[locale]/contact/page.tsx
26. README.md

Write COMPLETE file contents — no placeholders, ellipses, or TODO comments.
Call write_file for each file, then call finish."""


async def generate_site(
    site_map: SiteMap,
    insights: CompetitorInsights,
    category: str,
    settings: Settings,
) -> dict[str, str]:
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    prompt = _build_prompt(site_map, insights, category)
    messages: list[dict] = [{"role": "user", "content": prompt}]
    files: dict[str, str] = {}
    max_rounds = 20

    for round_num in range(max_rounds):
        logger.info("Generation round %d, files so far: %d", round_num + 1, len(files))
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8096,
            tools=[_WRITE_FILE_TOOL, _FINISH_TOOL],
            messages=messages,
        )

        tool_results = []
        finished = False

        for block in response.content:
            if block.type == "tool_use":
                if block.name == "write_file":
                    path: str = block.input["path"]
                    content: str = block.input["content"]
                    files[path] = content
                    logger.info("  wrote %s (%d chars)", path, len(content))
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "ok",
                    })
                elif block.name == "finish":
                    finished = True
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "Project complete",
                    })

        if finished:
            logger.info("Site generation complete: %d files", len(files))
            return files

        if response.stop_reason == "end_turn" and not tool_results:
            logger.warning("Agent stopped without finish after %d files", len(files))
            return files

        messages.append({"role": "assistant", "content": response.content})
        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    logger.warning("Reached max rounds, returning %d files", len(files))
    return files
