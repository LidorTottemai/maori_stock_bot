"""
Scrapes a business website to extract context for mockup generation.
Returns a dict with name, type, colors, fonts, description, and raw copy samples.
"""

import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _extract_colors(soup: BeautifulSoup) -> list[str]:
    """Pull hex/rgb colors from inline styles and <style> tags."""
    colors = set()
    hex_pattern = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
    rgb_pattern = re.compile(r"rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)")

    for tag in soup.find_all(style=True):
        colors.update(hex_pattern.findall(tag["style"]))
        colors.update(rgb_pattern.findall(tag["style"]))

    for style_tag in soup.find_all("style"):
        text = style_tag.get_text()
        colors.update(hex_pattern.findall(text))
        colors.update(rgb_pattern.findall(text))

    # Filter out pure black/white noise
    filtered = [
        c for c in colors
        if c.lower() not in {"#000", "#000000", "#fff", "#ffffff", "#333", "#666", "#999"}
    ]
    return filtered[:6]


def _extract_fonts(soup: BeautifulSoup) -> list[str]:
    """Extract Google Fonts family names from link tags."""
    fonts = []
    for link in soup.find_all("link", href=True):
        href = link["href"]
        if "fonts.googleapis.com" in href:
            match = re.findall(r"family=([^&:]+)", href)
            for m in match:
                fonts.append(m.replace("+", " ").split(":")[0])
    return list(dict.fromkeys(fonts))[:3]  # deduplicate, keep order


def _extract_copy_samples(soup: BeautifulSoup) -> list[str]:
    """Pull h1/h2 headings and the first meaningful paragraph."""
    samples = []
    for tag in soup.find_all(["h1", "h2"]):
        text = tag.get_text(strip=True)
        if text and len(text) > 3:
            samples.append(text)
        if len(samples) >= 4:
            break

    for p in soup.find_all("p"):
        text = p.get_text(strip=True)
        if len(text) > 60:
            samples.append(text[:300])
            break

    return samples


def _guess_business_type(soup: BeautifulSoup, domain: str) -> str:
    """Heuristic guess at business category from page content."""
    text = soup.get_text(" ", strip=True).lower()

    categories = {
        "restaurant / food": ["menu", "reservation", "cuisine", "dining", "eat", "food", "restaurant"],
        "real estate": ["property", "listing", "mortgage", "buy home", "rent", "realty", "estate"],
        "law firm": ["attorney", "lawyer", "legal", "litigation", "counsel", "law firm"],
        "medical / clinic": ["clinic", "patient", "doctor", "appointment", "healthcare", "therapy"],
        "beauty / salon": ["salon", "spa", "hair", "nails", "beauty", "waxing", "skincare"],
        "fitness / gym": ["gym", "fitness", "workout", "personal trainer", "crossfit", "yoga"],
        "e-commerce": ["add to cart", "shop now", "buy now", "checkout", "product", "store"],
        "SaaS / tech": ["dashboard", "api", "integration", "software", "platform", "saas", "free trial"],
        "agency / creative": ["agency", "branding", "creative", "design", "marketing", "campaign"],
        "consulting": ["consulting", "advisory", "strategy", "solutions", "expertise"],
        "construction": ["contractor", "construction", "renovation", "building", "plumbing", "hvac"],
    }

    scores = {}
    for category, keywords in categories.items():
        score = sum(1 for kw in keywords if kw in text)
        if score:
            scores[category] = score

    if scores:
        return max(scores, key=scores.get)
    return "local business"


def scrape(url: str) -> dict:
    """
    Scrape a business URL and return structured context.

    Returns:
        {
            "url": str,
            "domain": str,
            "business_name": str,
            "business_type": str,
            "colors": list[str],
            "fonts": list[str],
            "copy_samples": list[str],
            "page_title": str,
            "meta_description": str,
        }
    """
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to fetch {url}: {e}") from e

    soup = BeautifulSoup(response.text, "html.parser")
    domain = urlparse(url).netloc.replace("www.", "")

    # Business name: og:site_name → <title> → domain
    og_site = soup.find("meta", property="og:site_name")
    business_name = (
        og_site["content"].strip()
        if og_site and og_site.get("content")
        else (soup.title.get_text(strip=True).split("|")[0].split("-")[0].strip() if soup.title else domain)
    )

    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc_tag["content"].strip() if meta_desc_tag and meta_desc_tag.get("content") else ""

    og_desc_tag = soup.find("meta", property="og:description")
    if not meta_description and og_desc_tag and og_desc_tag.get("content"):
        meta_description = og_desc_tag["content"].strip()

    return {
        "url": url,
        "domain": domain,
        "business_name": business_name,
        "business_type": _guess_business_type(soup, domain),
        "colors": _extract_colors(soup),
        "fonts": _extract_fonts(soup),
        "copy_samples": _extract_copy_samples(soup),
        "page_title": soup.title.get_text(strip=True) if soup.title else "",
        "meta_description": meta_description,
    }
