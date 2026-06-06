"""
Generates a personalized cold outreach email for spec work.
Uses Claude API for a high-converting, non-pushy message.
"""

import anthropic


def generate_email(context: dict, screenshot_path: str) -> dict:
    """
    Generate a personalized cold outreach email based on business context.

    Returns:
        {
            "subject": str,
            "body": str,
        }
    """
    client = anthropic.Anthropic()

    prompt = f"""Write a cold outreach email for a web design agency doing "spec work" sales.

Context:
- Business name: {context["business_name"]}
- Business type: {context["business_type"]}
- Their current website: {context["url"]}
- Their current tagline/description: {context["meta_description"] or "(not found)"}

The agency has built a beautiful, modern redesign mockup of their website (screenshot attached in the actual email).
The agency is reaching out to show the business what their website COULD look like — no strings attached initially.

Email requirements:
- Subject line: intriguing, specific to their business, makes them want to open it
- Opening: acknowledge something specific about their current business (use the info above)
- Middle: explain you noticed their website, built a mockup redesign, and want to share it
- Show the value: 1-2 sentences on what the new design achieves (conversions, trust, modern look)
- Soft CTA: "I've attached a preview — happy to share the full interactive version on a quick call"
- Closing: warm, not desperate, confident
- Tone: professional but human, not salesy, no buzzwords like "synergy" or "leverage"
- Length: 120-180 words max (short = respectful of their time)

Format your response as:
SUBJECT: [subject line here]

BODY:
[email body here]

Nothing else. No commentary."""

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[-1].text.strip()

    # Parse subject and body
    subject = ""
    body = ""

    lines = raw.split("\n")
    body_start = False
    body_lines = []

    for line in lines:
        if line.startswith("SUBJECT:"):
            subject = line.replace("SUBJECT:", "").strip()
        elif line.startswith("BODY:"):
            body_start = True
        elif body_start:
            body_lines.append(line)

    body = "\n".join(body_lines).strip()

    # Fallback if parsing fails
    if not subject or not body:
        subject = f"I redesigned {context['business_name']}'s website — want to see?"
        body = raw

    return {"subject": subject, "body": body}
