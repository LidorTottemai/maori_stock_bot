"""
Uses Claude API (claude-opus-4-7) to generate a beautiful HTML/CSS redesign mockup
based on scraped business context.
"""

import anthropic


SYSTEM_PROMPT = """You are a world-class UI/UX designer and front-end developer.
Your job is to create stunning, modern website redesign mockups as a single self-contained HTML file.

Design philosophy:
- Clean, contemporary aesthetic — think Stripe, Linear, Notion
- Strong visual hierarchy with clear CTA
- Generous whitespace, smooth gradients, subtle shadows
- Mobile-first responsive layout
- No external dependencies — all CSS inline or in a <style> block
- Use Google Fonts via a single <link> tag (acceptable exception)
- Animations: subtle CSS transitions only (no JS required for beauty)

Output: Return ONLY the complete HTML file. No explanation, no markdown fences, no commentary.
The file must start with <!DOCTYPE html> and be fully self-contained."""


def _build_prompt(context: dict) -> str:
    colors_str = ", ".join(context["colors"]) if context["colors"] else "derive from business type"
    fonts_str = ", ".join(context["fonts"]) if context["fonts"] else "choose appropriate modern fonts"
    copy_str = "\n".join(f"  - {s}" for s in context["copy_samples"][:4]) if context["copy_samples"] else "  - (none found)"

    return f"""Create a stunning modern website redesign mockup for this business:

**Business Name:** {context["business_name"]}
**Business Type:** {context["business_type"]}
**Website:** {context["url"]}
**Meta Description:** {context["meta_description"] or "(not provided)"}

**Existing brand colors (incorporate or improve upon):**
{colors_str}

**Existing fonts:**
{fonts_str}

**Existing copy/headlines found on site:**
{copy_str}

---

Design requirements:
1. Hero section with a powerful headline, subheadline, and primary CTA button
2. Features/Services section (3–4 cards) — infer from business type
3. Social proof section (testimonial or stats block)
4. Simple footer with contact info placeholder
5. Color palette: modernize the existing colors or create a fresh palette that fits the brand
6. Typography: choose 1–2 Google Fonts that elevate the brand
7. The design should look so good that the business owner immediately thinks "I need this"

The redesign should feel like a significant upgrade over a typical small business website.
Make it beautiful, make it convert, make it memorable.

Return ONLY the complete HTML file. Start with <!DOCTYPE html>."""


def generate_mockup(context: dict, output_path: str) -> str:
    """
    Generate HTML/CSS mockup via Claude API and write to output_path.

    Returns the path to the saved HTML file.
    """
    client = anthropic.Anthropic()

    prompt = _build_prompt(context)

    print(f"  → Generating mockup for {context['business_name']} ({context['business_type']})...")

    html_chunks = []

    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=8192,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            html_chunks.append(text)
            print(".", end="", flush=True)

    print()  # newline after dots

    html = "".join(html_chunks).strip()

    # Strip accidental markdown fences if model added them
    if html.startswith("```"):
        html = re.sub(r"^```[^\n]*\n", "", html)
        html = re.sub(r"\n```$", "", html)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    return output_path


# need re for the strip step above
import re  # noqa: E402 (imported after use in function body — fine for module-level)
