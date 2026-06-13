# site_generator.py — שדרוג Phase 04

> **קובץ:** `app/services/site_generator.py`
> **סטטוס:** 🟡 קיים (241 שורות, גרסה 1.0) — צריך שדרוג לגרסה 2.0
> **תלויות:** `site_archaeologist`, `inspiration_crawler`, `anthropic` (Claude Haiku לscoring)

---

## השינויים המרכזיים בגרסה 2.0

| פרמטר | גרסה 1.0 (קיים) | גרסה 2.0 |
|-------|----------------|---------|
| `max_turns` | 80 | **150** |
| `timeout` | 30 min (1800s) | **60 min (3600s)** |
| CLAUDE.md | template סטטי | **דינמי** מ-SiteData + InspirationReport |
| ארכיאולוגיה | ❌ | ✅ `excavate_site()` |
| architecture decision | ❌ | ✅ `build_architecture_decision()` |
| quality loop | ❌ | ✅ hook point ל-Phase 05 |

---

## פונקציות שנשארות זהות

- `_collect_files(temp_dir)` — אוסף קבצים מהתיקייה הזמנית
- `run_claude_subprocess(claude_md, ...)` — מריץ `claude -p` כ-subprocess
- שמירת `.claude/settings.json` עם pre-approved tools

---

## פונקציות חדשות / ששונו

### `build_architecture_decision(site_data: SiteData) -> ArchitectureDecision`

```python
@dataclass
class ArchitectureDecision:
    pages: list[str]        # שמות הדפים שצריך לבנות
    modules: list[str]      # modules אופציונליים (booking, menu, shop)
    priority_features: list[str]   # מה לשים בhero ובfold ראשון

def build_architecture_decision(site: SiteData) -> ArchitectureDecision:
    pages = ["/"]  # home תמיד

    # דפים סטנדרטיים
    if site.team or site.description:
        pages.append("/about")
    if site.services:
        pages.append("/services")
    if site.gallery_images or "gallery" in site.missing_pages:
        pages.append("/gallery")

    # דפים שחסרים ואפשר להוסיף
    if "testimonials" in site.missing_pages:
        pages.append("/testimonials")

    pages.append("/contact")      # תמיד
    pages.append("/[locale]/accessibility-statement")   # חובה חוקי

    modules = []
    if site.has_booking:
        modules.append("booking-widget")
    if site.has_menu:
        modules.append("menu-page")
    if site.has_shop:
        modules.append("shop-integration")

    priority_features = []
    if site.services:
        priority_features.append(f"Hero: {site.services[0]}")
    if site.phone:
        priority_features.append(f"CTA: 'התקשר עכשיו → {site.phone}'")
    if site.whatsapp:
        priority_features.append(f"WhatsApp float button")

    return ArchitectureDecision(pages=pages, modules=modules, priority_features=priority_features)
```

---

### `build_dynamic_claude_md(site, inspiration, arch) -> str`

הפונקציה המרכזית — מחברת את כל הנתונים לCLAUDE.md אחד שClaude Code מקבל.

```python
def build_dynamic_claude_md(
    site: SiteData,
    inspiration: InspirationReport,
    arch: ArchitectureDecision,
    competitors: str = "",
) -> str:
    pages_list = "\n".join(f"- {p}" for p in arch.pages)
    services_list = "\n".join(f"  - {s}" for s in site.services) or "  (חלץ מהאתר הקיים)"
    team_list = "\n".join(f"  - {m.name} — {m.role}" for m in site.team) or "  (לא זוהה)"
    hours_text = _format_hours(site.opening_hours)
    social_text = _format_social(site.social_links)

    # הטמפלייט המלא — ראה CLAUDE_MD_TEMPLATE.md
    with open("app/templates/claude_md_template.txt") as f:
        template = f.read()

    return template.format(
        business_name=site.business_name,
        business_type=site.business_type,
        city=site.city,
        description=site.description,
        phone=site.phone,
        whatsapp=site.whatsapp,
        email=site.email,
        address=site.address,
        primary_color=site.primary_color,
        services_list=services_list,
        team_list=team_list,
        hours=hours_text,
        social=social_text,
        pages_list=pages_list,
        inspiration_summary=inspiration.summary,
        top_fonts=", ".join(inspiration.top_fonts[:3]),
        animation_stack=", ".join(inspiration.animation_stack),
        competitor_insights=competitors,
    )
```

> **הערה:** הטמפלייט המלא (claude_md_template.txt) מתועד ב-[[CLAUDE_MD_TEMPLATE]].

---

### `generate_site(job, site_data, inspiration, competitors) -> GeneratedSite`

```python
async def generate_site(
    job: RebuildJob,
    site_data: SiteData,
    inspiration: InspirationReport,
    competitors: str,
) -> GeneratedSite:
    arch      = build_architecture_decision(site_data)
    claude_md = build_dynamic_claude_md(site_data, inspiration, arch, competitors)

    temp_dir  = Path(tempfile.mkdtemp(prefix=f"site_{job.slug}_"))
    try:
        # כתוב CLAUDE.md
        (temp_dir / "CLAUDE.md").write_text(claude_md, encoding="utf-8")

        # pre-approve tools (מהגרסה הקיימת — ללא שינוי)
        _write_claude_settings(temp_dir)

        # הרץ claude -p
        result = await _run_claude_subprocess(
            cwd=temp_dir,
            max_turns=150,          # ← שינוי מ-80
            timeout=3600,           # ← שינוי מ-1800
        )

        # אסוף קבצים
        files = _collect_files(temp_dir)

        return GeneratedSite(
            files=files,
            quality_score=0.0,      # יועדכן ע"י quality_loop
            attempts=1,
            claude_md_used=claude_md,
        )
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
```

---

### `_write_claude_settings(temp_dir: Path) -> None`

**ללא שינוי מגרסה 1.0** — כותב `.claude/settings.json` עם כל הכלים pre-approved:

```python
def _write_claude_settings(temp_dir: Path) -> None:
    settings_dir = temp_dir / ".claude"
    settings_dir.mkdir(exist_ok=True)
    settings = {
        "permissions": {
            "allow": [
                "Bash(npm:*)",
                "Bash(npx:*)",
                "Bash(node:*)",
                "Write(*)",
                "Edit(*)",
                "Read(*)",
                "Glob(*)",
            ]
        }
    }
    (settings_dir / "settings.json").write_text(
        json.dumps(settings, indent=2), encoding="utf-8"
    )
```

---

### `_run_claude_subprocess(cwd, max_turns, timeout) -> str`

```python
async def _run_claude_subprocess(cwd: Path, max_turns: int, timeout: int) -> str:
    cmd = [
        "claude",
        "--max-turns", str(max_turns),
        "--output-format", "stream-json",
        "--verbose",
        "-p",
        "Build the website according to CLAUDE.md. Start immediately with globals.css, then layout.tsx, then the home page. Do not ask questions.",
    ]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=str(cwd),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(), timeout=timeout
        )
    except asyncio.TimeoutError:
        proc.kill()
        stdout, _ = await proc.communicate()
    return (stdout or b"").decode(errors="replace")
```

---

## Helper Functions

```python
def _format_hours(hours: dict[str, str]) -> str:
    if not hours:
        return "לא זוהה מהאתר הקיים"
    return "\n".join(f"  {k}: {v}" for k, v in hours.items())

def _format_social(social: dict[str, str]) -> str:
    if not social:
        return "  (לא זוהו רשתות חברתיות)"
    return "\n".join(f"  {k}: {v}" for k, v in social.items())

def _collect_files(temp_dir: Path) -> dict[str, str]:
    files = {}
    for path in temp_dir.rglob("*"):
        if path.is_file() and not any(
            p in str(path) for p in [".claude", "node_modules", ".git", ".next"]
        ):
            rel = str(path.relative_to(temp_dir))
            try:
                files[rel] = path.read_text(encoding="utf-8", errors="replace")
            except Exception:
                pass
    return files
```

---

## בדיקות

```python
def test_build_architecture_decision():
    site = SiteData(
        url="https://example.co.il",
        business_name="ספא יפה",
        business_type="ספא",
        description="",
        phone="",
        email="",
        address="",
        city="תל אביב",
        services=["עיסוי", "פנים"],
        team=[TeamMember("מיכל", "מטפלת")],
        has_booking=True,
        missing_pages=["gallery", "testimonials"],
    )
    arch = build_architecture_decision(site)
    assert "/" in arch.pages
    assert "/about" in arch.pages
    assert "/services" in arch.pages
    assert "/gallery" in arch.pages
    assert "/contact" in arch.pages
    assert "booking-widget" in arch.modules
```

← [[00 - Services Overview]] | [[CLAUDE_MD_TEMPLATE]]
