import logging

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)

_VERCEL_API = "https://api.vercel.com"


async def create_and_deploy(
    repo_name: str,
    github_owner: str,
    settings: Settings,
    client: httpx.AsyncClient,
) -> str:
    """Create a Vercel project linked to the GitHub repo and trigger a deployment.
    Returns the predicted deployment URL.
    """
    headers = {
        "Authorization": f"Bearer {settings.vercel_token}",
        "Content-Type": "application/json",
    }

    # 1. Create project linked to GitHub repo
    proj_resp = await client.post(
        f"{_VERCEL_API}/v9/projects",
        headers=headers,
        json={
            "name": repo_name,
            "gitRepository": {
                "type": "github",
                "repo": f"{github_owner}/{repo_name}",
            },
            "framework": "nextjs",
        },
        timeout=30,
    )
    if proj_resp.status_code not in (200, 201, 409):
        logger.warning("Vercel project creation returned %s: %s", proj_resp.status_code, proj_resp.text[:200])

    # 2. Trigger deployment from main branch
    deploy_resp = await client.post(
        f"{_VERCEL_API}/v13/deployments",
        headers=headers,
        json={
            "name": repo_name,
            "gitSource": {
                "type": "github",
                "repo": f"{github_owner}/{repo_name}",
                "ref": "main",
            },
        },
        timeout=30,
    )
    if deploy_resp.status_code not in (200, 201):
        logger.warning("Vercel deploy returned %s: %s", deploy_resp.status_code, deploy_resp.text[:200])

    vercel_url = f"https://{repo_name}.vercel.app"
    logger.info("Vercel project created → %s", vercel_url)
    return vercel_url
