import logging
import re

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)

_DOMAIN = "hhippo.co.il"


def _repo_to_subdomain(repo_name: str) -> str:
    return re.sub(r"-website$", "", repo_name)


async def deploy_site(repo_name: str, settings: Settings, http_client: httpx.AsyncClient) -> str:
    """Trigger GitHub Actions deploy-site workflow. Returns the public URL."""
    resp = await http_client.post(
        f"https://api.github.com/repos/{settings.github_username}/maori_stock_bot/dispatches",
        headers={
            "Authorization": f"Bearer {settings.github_token}",
            "Accept": "application/vnd.github+json",
        },
        json={
            "event_type": "deploy-site",
            "client_payload": {
                "repo_name": repo_name,
                "github_owner": settings.github_username,
            },
        },
        timeout=15,
    )
    if resp.status_code != 204:
        raise RuntimeError(f"GitHub dispatch failed ({resp.status_code}): {resp.text[:200]}")

    subdomain = _repo_to_subdomain(repo_name)
    url = f"https://{subdomain}.{_DOMAIN}"
    logger.info("Deploy dispatch sent → %s", url)
    return url
