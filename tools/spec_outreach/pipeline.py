#!/usr/bin/env python3
"""
Spec Work Cold Outreach Pipeline
=================================
Given a business URL, this script:
  1. Scrapes basic info from the existing website
  2. Generates a beautiful HTML/CSS redesign mockup using Claude API
  3. Takes a full-page screenshot of the mockup
  4. Writes a personalized cold outreach email template
  5. Saves everything to leads/<domain>/ for manual sending

Usage:
    python pipeline.py https://example-business.com
    python pipeline.py https://example-business.com --width 1280
    python pipeline.py --batch urls.txt          # process multiple URLs from file

Requirements:
    pip install -r requirements.txt
    playwright install chromium
    export ANTHROPIC_API_KEY=sk-...
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from scraper import scrape
from generator import generate_mockup
from screenshot import take_screenshot
from email_template import generate_email


LEADS_DIR = Path(__file__).parent / "leads"


def _lead_dir(domain: str) -> Path:
    """Return (and create) the output folder for a lead."""
    safe_domain = domain.replace(":", "_").replace("/", "_")
    lead_path = LEADS_DIR / safe_domain
    lead_path.mkdir(parents=True, exist_ok=True)
    return lead_path


def process_url(url: str, width: int = 1440) -> dict:
    """
    Run the full pipeline for a single URL.

    Returns a result dict with paths and email content.
    """
    print(f"\n{'='*60}")
    print(f"Processing: {url}")
    print("=" * 60)

    # ── 1. Scrape ──────────────────────────────────────────────
    print("\n[1/4] Scraping website...")
    context = scrape(url)
    print(f"  ✓ Business: {context['business_name']} ({context['business_type']})")
    print(f"  ✓ Colors found: {len(context['colors'])}")
    print(f"  ✓ Copy samples: {len(context['copy_samples'])}")

    lead_dir = _lead_dir(context["domain"])

    # ── 2. Generate mockup ────────────────────────────────────
    print("\n[2/4] Generating HTML/CSS redesign mockup...")
    html_path = str(lead_dir / "mockup.html")
    generate_mockup(context, html_path)
    print(f"  ✓ Saved: {html_path}")

    # ── 3. Screenshot ─────────────────────────────────────────
    print("\n[3/4] Taking screenshot...")
    screenshot_path = str(lead_dir / "mockup_preview.png")
    try:
        take_screenshot(html_path, screenshot_path, width=width)
        print(f"  ✓ Saved: {screenshot_path}")
    except RuntimeError as e:
        print(f"  ⚠ Screenshot skipped: {e}")
        screenshot_path = None

    # ── 4. Email template ─────────────────────────────────────
    print("\n[4/4] Writing outreach email...")
    email = generate_email(context, screenshot_path)
    email_path = str(lead_dir / "outreach_email.txt")
    with open(email_path, "w", encoding="utf-8") as f:
        f.write(f"TO: [find contact email on their site or LinkedIn]\n")
        f.write(f"SUBJECT: {email['subject']}\n")
        f.write(f"\n{email['body']}\n")
        f.write(f"\n---\n[Attach: mockup_preview.png]\n")
    print(f"  ✓ Saved: {email_path}")

    # ── Save metadata ─────────────────────────────────────────
    meta = {
        "processed_at": datetime.now().isoformat(),
        "url": url,
        "domain": context["domain"],
        "business_name": context["business_name"],
        "business_type": context["business_type"],
        "html_mockup": html_path,
        "screenshot": screenshot_path,
        "email_subject": email["subject"],
        "email_path": email_path,
        "status": "ready_to_send",
    }
    with open(lead_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    # ── Summary ───────────────────────────────────────────────
    print(f"\n{'─'*60}")
    print(f"✅ Done! Lead saved to: {lead_dir}")
    print(f"\n📧 Email subject: {email['subject']}")
    print(f"\n📄 Email preview:")
    print("─" * 40)
    print(email["body"][:400] + ("..." if len(email["body"]) > 400 else ""))
    print("─" * 40)

    return meta


def process_batch(urls_file: str, width: int = 1440) -> None:
    """Process multiple URLs from a text file (one URL per line)."""
    path = Path(urls_file)
    if not path.exists():
        print(f"Error: file not found: {urls_file}")
        sys.exit(1)

    urls = [line.strip() for line in path.read_text().splitlines() if line.strip() and not line.startswith("#")]
    print(f"Found {len(urls)} URLs to process.")

    results = []
    for url in urls:
        try:
            result = process_url(url, width=width)
            result["error"] = None
            results.append(result)
        except Exception as e:
            print(f"\n❌ Failed for {url}: {e}")
            results.append({"url": url, "error": str(e), "status": "failed"})

    # Write summary CSV
    csv_path = LEADS_DIR / f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    fieldnames = ["url", "domain", "business_name", "business_type", "email_subject", "status", "error"]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(results)

    print(f"\n\n{'='*60}")
    print(f"Batch complete: {len([r for r in results if not r.get('error')])} succeeded, "
          f"{len([r for r in results if r.get('error')])} failed")
    print(f"Summary saved to: {csv_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Spec Work Cold Outreach — generate redesign mockups for business leads"
    )
    parser.add_argument("url", nargs="?", help="Business website URL to process")
    parser.add_argument("--batch", metavar="FILE", help="Process multiple URLs from a text file")
    parser.add_argument("--width", type=int, default=1440, help="Screenshot viewport width (default: 1440)")
    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        print("  export ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    if args.batch:
        process_batch(args.batch, width=args.width)
    elif args.url:
        process_url(args.url, width=args.width)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
