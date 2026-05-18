import logging
import re

import httpx
from playwright.async_api import async_playwright
from pydantic import BaseModel

from app.core.config import Settings

logger = logging.getLogger(__name__)

DDGO_URL = "https://html.duckduckgo.com/html/"
MAX_COMPETITORS = 4


class CompetitorInsights(BaseModel):
    design_patterns: list[str]
    color_trends: list[str]
    must_have_sections: list[str]
    booking_ux: str
    summary_for_claude: str


def _parse_ddgo_results(html: str) -> list[str]:
    urls = re.findall(r'uddg=([^&"]+)', html)
    decoded = []
    for u in urls:
        u = u.replace("%3A", ":").replace("%2F", "/").replace("%3F", "?").replace("%3D", "=")
        if u.startswith("http"):
            decoded.append(u)
    return decoded[:MAX_COMPETITORS]


async def _inspect_competitor(browser, url: str) -> dict:
    try:
        page = await browser.new_page()
        await page.goto(url, timeout=12000, wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        title = await page.title()
        colors = await page.evaluate("""() => {
            const els = [document.querySelector('header'), document.querySelector('footer'), document.body];
            const cols = new Set();
            for (const el of els) {
                if (!el) continue;
                const s = window.getComputedStyle(el);
                cols.add(s.backgroundColor);
            }
            return [...cols].filter(c => c && c !== 'rgba(0, 0, 0, 0)').slice(0, 5);
        }""")
        has_whatsapp = await page.evaluate(
            "() => !!document.querySelector('[href*=\"wa.me\"],[href*=\"whatsapp\"]')"
        )
        has_booking = await page.evaluate("""() => {
            const text = document.body.innerText.toLowerCase();
            return text.includes('book') || text.includes('הזמן') || text.includes('קביעת');
        }""")
        await page.close()
        return {
            "url": url, "title": title, "colors": colors,
            "has_whatsapp": has_whatsapp, "has_booking": has_booking,
        }
    except Exception as exc:
        logger.warning("Failed to inspect %s: %s", url, exc)
        return {"url": url, "error": str(exc)}


async def research_competitors(
    category: str,
    http_client: httpx.AsyncClient,
    settings: Settings,
) -> CompetitorInsights:
    queries = [
        f"best {category} website design Israel",
        f"best {category} website examples modern 2024",
    ]
    competitor_urls: list[str] = []

    for q in queries:
        try:
            resp = await http_client.post(
                DDGO_URL,
                data={"q": q},
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"},
                timeout=10,
            )
            competitor_urls.extend(_parse_ddgo_results(resp.text))
        except Exception as exc:
            logger.warning("DDG search failed for %r: %s", q, exc)

    competitor_urls = list(dict.fromkeys(competitor_urls))[:MAX_COMPETITORS]
    logger.info("Researching %d competitors for '%s'", len(competitor_urls), category)

    findings: list[dict] = []
    if competitor_urls:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            for url in competitor_urls:
                findings.append(await _inspect_competitor(browser, url))
            await browser.close()

    patterns = ["Mobile-first responsive layout", "Clear hero with CTA button", "Services grid with icons"]
    colors = ["Brand accent colors", "High-contrast text on white"]
    sections = ["Hero", "Services/Features", "Booking/Contact CTA", "Footer with contact info"]

    if any(f.get("has_whatsapp") for f in findings):
        patterns.append("Floating WhatsApp button")
    if any(f.get("has_booking") for f in findings):
        patterns.append("Online booking/appointment system")

    summary = (
        f"Top {len(findings)} competitors for '{category}':\n"
        f"- Patterns: {', '.join(patterns)}\n"
        f"- Booking: form-based with date picker + confirmation\n"
        f"- Must-haves: sticky header, WhatsApp CTA, mobile-first\n"
        f"- Sections: {', '.join(sections)}\n"
        f"Sites: {[f.get('url', '') for f in findings[:3]]}"
    )

    return CompetitorInsights(
        design_patterns=patterns,
        color_trends=colors,
        must_have_sections=sections,
        booking_ux="Date/time picker form → WhatsApp confirmation deeplink",
        summary_for_claude=summary,
    )
