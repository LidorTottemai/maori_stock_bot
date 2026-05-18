import base64
import logging
import re
import time

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)

_GITHUB_API = "https://api.github.com"


def _slugify(name: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", name.lower())
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:50] or "business"


def _gh_headers(settings: Settings) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.github_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


async def _create_repo(name: str, business_name: str, settings: Settings, client: httpx.AsyncClient) -> str:
    """Create GitHub repo; returns actual repo name (may differ if conflict)."""
    headers = _gh_headers(settings)
    payload = {
        "name": name,
        "description": f"Website for {business_name}",
        "private": settings.github_repos_private,
        "auto_init": False,
    }
    resp = await client.post(f"{_GITHUB_API}/user/repos", headers=headers, json=payload, timeout=30)

    if resp.status_code == 422:
        # Conflict — append timestamp
        name = f"{name}-{int(time.time())}"
        payload["name"] = name
        resp = await client.post(f"{_GITHUB_API}/user/repos", headers=headers, json=payload, timeout=30)

    resp.raise_for_status()
    return name


async def _push_file(
    owner: str,
    repo: str,
    path: str,
    content: str,
    headers: dict,
    client: httpx.AsyncClient,
) -> None:
    encoded = base64.b64encode(content.encode("utf-8")).decode()
    resp = await client.put(
        f"{_GITHUB_API}/repos/{owner}/{repo}/contents/{path}",
        headers=headers,
        json={"message": f"Add {path}", "content": encoded},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        logger.warning("Failed to push %s: %s", path, resp.status_code)
    else:
        logger.debug("Pushed %s", path)


async def create_repo_and_push(
    business_name: str,
    files: dict[str, str],
    settings: Settings,
    http_client: httpx.AsyncClient,
) -> tuple[str, str]:
    """Push all files to a new GitHub repo. Returns (repo_url, repo_name)."""
    base_slug = _slugify(business_name)
    repo_name = f"{base_slug}-website"
    repo_name = await _create_repo(repo_name, business_name, settings, http_client)

    owner = settings.github_username
    headers = _gh_headers(settings)
    repo_url = f"https://github.com/{owner}/{repo_name}"
    logger.info("Created repo %s, pushing %d files", repo_url, len(files))

    for path, content in files.items():
        await _push_file(owner, repo_name, path, content, headers, http_client)

    return repo_url, repo_name
