"""
Daily business scanner — entry point.
Finds businesses via Google Places, analyzes their websites for manual booking signals,
and sends a Telegram report with the best leads.

Usage:
    python main.py                  # normal run
    python main.py --dry-run        # analyze but don't send Telegram message
    python main.py --city תל אביב --category מספרה   # specific search
"""

import argparse
import sys
import os
from datetime import date

# Allow running from this directory directly
sys.path.insert(0, os.path.dirname(__file__))

import config
import db
import maps_client
import booking_analyzer
import telegram_sender


def pick_todays_rotation() -> tuple[str, str]:
    """Pick city + category for today based on date hash (deterministic rotation)."""
    day_index = date.today().toordinal()
    city = config.CITIES[day_index % len(config.CITIES)]
    category = config.ALL_CATEGORIES[day_index % len(config.ALL_CATEGORIES)]
    return city, category


def run(city: str, category: str, dry_run: bool = False):
    db.init_db()

    print(f"[scanner] Searching: {category} in {city}")
    businesses = maps_client.search_businesses(category, city, max_results=20)
    print(f"[scanner] Found {len(businesses)} businesses from Maps")

    leads = []
    total_scanned = 0

    for biz in businesses:
        place_id = biz.get("place_id", "")
        name = biz.get("name", "")
        website = biz.get("website", "")

        if db.already_scanned(place_id):
            print(f"[scanner] Skipping (already scanned): {name}")
            continue

        if not website:
            db.mark_scanned(place_id, name, "", 0)
            print(f"[scanner] No website: {name}")
            continue

        print(f"[scanner] Analyzing: {name} — {website}")
        total_scanned += 1

        analysis = booking_analyzer.analyze(website)

        if not analysis["reachable"]:
            print(f"[scanner]   → unreachable")
            db.mark_scanned(place_id, name, website, 0)
            continue

        score = analysis["score"]
        db.mark_scanned(place_id, name, website, score)
        print(f"[scanner]   → score: {score} | has_system: {analysis['has_booking_system']}")

        if analysis["has_booking_system"]:
            continue

        if score < config.MIN_BOOKING_SCORE:
            continue

        leads.append({
            **biz,
            "score": score,
            "findings": analysis["findings"],
            "wordpress_version": analysis["wordpress_version"],
        })

    # Sort by score descending, take top DAILY_LIMIT
    leads.sort(key=lambda x: x["score"], reverse=True)
    leads = leads[: config.DAILY_LIMIT]

    if not leads:
        print(f"[scanner] No qualifying leads found today (min score: {config.MIN_BOOKING_SCORE})")
        return

    print(f"\n[scanner] {len(leads)} leads qualify for report:")
    for lead in leads:
        print(f"  • {lead['name']} — score {lead['score']}")

    report = telegram_sender.format_report(leads, city, category, total_scanned)

    if dry_run:
        print("\n--- DRY RUN: Telegram message preview ---")
        print(report)
        print("-----------------------------------------")
    else:
        ok = telegram_sender.send_message(report)
        print(f"\n[scanner] Telegram message sent: {ok}")


def main():
    parser = argparse.ArgumentParser(description="Daily business lead scanner")
    parser.add_argument("--dry-run", action="store_true", help="Analyze without sending Telegram message")
    parser.add_argument("--city", default=None, help="Override city")
    parser.add_argument("--category", default=None, help="Override category")
    args = parser.parse_args()

    if args.city and args.category:
        city, category = args.city, args.category
    elif args.city or args.category:
        parser.error("Provide both --city and --category or neither")
    else:
        city, category = pick_todays_rotation()

    run(city, category, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
