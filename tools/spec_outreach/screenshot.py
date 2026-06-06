"""
Captures a full-page screenshot of a local HTML file using Playwright.
Falls back to a simple wkhtmltoimage approach if Playwright is not installed.
"""

import subprocess
import sys
from pathlib import Path


def _screenshot_playwright(html_path: str, output_path: str, width: int = 1440) -> str:
    """Render HTML file and save a full-page PNG screenshot via Playwright."""
    from playwright.sync_api import sync_playwright

    file_url = Path(html_path).resolve().as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = browser.new_page(viewport={"width": width, "height": 900})
        page.goto(file_url, wait_until="networkidle")

        # Let fonts/animations settle
        page.wait_for_timeout(1500)

        page.screenshot(path=output_path, full_page=True)
        browser.close()

    return output_path


def _screenshot_wkhtmltoimage(html_path: str, output_path: str, width: int = 1440) -> str:
    """Fallback: use wkhtmltoimage CLI if installed."""
    cmd = [
        "wkhtmltoimage",
        "--width", str(width),
        "--quality", "90",
        html_path,
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"wkhtmltoimage failed: {result.stderr}")
    return output_path


def take_screenshot(html_path: str, output_path: str, width: int = 1440) -> str:
    """
    Take a screenshot of the HTML mockup file.

    Tries Playwright first, falls back to wkhtmltoimage.

    Args:
        html_path: Path to the local HTML file.
        output_path: Where to save the PNG.
        width: Viewport width in pixels.

    Returns:
        Path to the saved screenshot.
    """
    print(f"  → Capturing screenshot ({width}px wide)...")

    try:
        return _screenshot_playwright(html_path, output_path, width)
    except ImportError:
        pass
    except Exception as e:
        print(f"  ⚠ Playwright failed ({e}), trying wkhtmltoimage...")

    try:
        return _screenshot_wkhtmltoimage(html_path, output_path, width)
    except (FileNotFoundError, RuntimeError) as e:
        raise RuntimeError(
            "Screenshot capture failed. Install Playwright:\n"
            "  pip install playwright && playwright install chromium\n"
            f"Original error: {e}"
        ) from e
