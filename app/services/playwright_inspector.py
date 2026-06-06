import logging
import re
from urllib.parse import urlparse

from playwright.async_api import async_playwright
from pydantic import BaseModel

logger = logging.getLogger(__name__)

MAX_PAGES = 20
MAX_DEPTH = 3


class PageContent(BaseModel):
    url: str
    title: str
    headings: list[str]
    body_text: str
    nav_links: list[str]
    colors: list[str]
    phone: str
    address: str


class SiteMap(BaseModel):
    base_url: str
    pages: list[PageContent]
    business_name: str
    phone: str
    address: str
    total_pages: int


def _extract_phone(text: str) -> str:
    match = re.search(r"0\d[\d\-\s]{7,12}", text)
    return match.group().strip() if match else ""


async def _extract_page_content(page, url: str) -> PageContent:
    try:
        await page.goto(url, timeout=15000, wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)
    except Exception:
        return PageContent(
            url=url, title="", headings=[], body_text="",
            nav_links=[], colors=[], phone="", address="",
        )

    title = await page.title()

    headings = await page.evaluate("""() =>
        Array.from(document.querySelectorAll('h1,h2,h3,h4'))
            .map(h => h.innerText.trim())
            .filter(t => t.length > 0)
            .slice(0, 20)
    """)

    body_text = await page.evaluate("""() => {
        const el = document.body;
        return el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 3000) : '';
    }""")

    nav_links = await page.evaluate("""() =>
        Array.from(document.querySelectorAll('nav a, header a'))
            .map(a => a.href)
            .filter(h => h.startsWith('http'))
            .slice(0, 20)
    """)

    colors = await page.evaluate("""() => {
        const els = [
            document.body,
            ...Array.from(document.querySelectorAll('header,nav,footer,.hero,section')),
        ].slice(0, 5);
        const cols = new Set();
        for (const el of els) {
            const s = window.getComputedStyle(el);
            cols.add(s.backgroundColor);
            cols.add(s.color);
        }
        return [...cols].filter(c => c && c !== 'rgba(0, 0, 0, 0)').slice(0, 8);
    }""")

    phone = _extract_phone(body_text)
    addr_match = re.search(r"(?:רחוב|שד'|כתובת|ממוקמים ב)[^\n.]{5,60}", body_text)
    address = addr_match.group().strip() if addr_match else ""

    return PageContent(
        url=url,
        title=title,
        headings=headings,
        body_text=body_text,
        nav_links=nav_links[:10],
        colors=colors,
        phone=phone,
        address=address,
    )


async def crawl_site(base_url: str) -> SiteMap:
    visited: set[str] = set()
    to_visit: list[tuple[str, int]] = [(base_url, 0)]
    pages: list[PageContent] = []
    base_domain = urlparse(base_url).netloc

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; SiteScanner/1.0)",
            locale="he-IL",
        )
        page = await context.new_page()

        while to_visit and len(visited) < MAX_PAGES:
            url, depth = to_visit.pop(0)
            if url in visited:
                continue
            visited.add(url)

            logger.info("Crawling %s (depth=%d)", url, depth)
            content = await _extract_page_content(page, url)
            pages.append(content)

            if depth < MAX_DEPTH:
                for link in content.nav_links:
                    parsed = urlparse(link)
                    if parsed.netloc == base_domain and link not in visited:
                        to_visit.append((link, depth + 1))

        await browser.close()

    phone = next((p.phone for p in pages if p.phone), "")
    address = next((p.address for p in pages if p.address), "")
    business_name = pages[0].title.split("|")[0].strip() if pages else ""

    return SiteMap(
        base_url=base_url,
        pages=pages,
        business_name=business_name,
        phone=phone,
        address=address,
        total_pages=len(pages),
    )
