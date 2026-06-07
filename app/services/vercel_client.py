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
        raise RuntimeError(
            f"Vercel deploy failed ({deploy_resp.status_code}): {deploy_resp.text[:300]}"
        )

    # Use URL from response if available; fall back to canonical project alias
    data = deploy_resp.json()
    raw_url = data.get("url") or f"{repo_name}.vercel.app"
    vercel_url = raw_url if raw_url.startswith("http") else f"https://{raw_url}"
    logger.info("Vercel deployment triggered → %s", vercel_url)
    return vercel_url


async def set_env_var(
    project_name: str,
    key: str,
    value: str,
    settings: Settings,
    client: httpx.AsyncClient,
) -> None:
    headers = {"Authorization": f"Bearer {settings.vercel_token}"}
    resp = await client.post(
        f"{_VERCEL_API}/v10/projects/{project_name}/env",
        headers=headers,
        json={"key": key, "value": value, "type": "plain", "target": ["production"]},
        timeout=20,
    )
    if resp.status_code not in (200, 201, 409):
        logger.warning("set_env_var returned %s: %s", resp.status_code, resp.text[:200])


async def trigger_redeploy(
    project_name: str,
    settings: Settings,
    client: httpx.AsyncClient,
) -> None:
    headers = {"Authorization": f"Bearer {settings.vercel_token}"}
    deps_resp = await client.get(
        f"{_VERCEL_API}/v6/deployments?projectId={project_name}&limit=1&state=READY",
        headers=headers,
        timeout=20,
    )
    deps = deps_resp.json().get("deployments", [])
    if not deps:
        logger.warning("No deployments found for project %s — cannot redeploy", project_name)
        return
    dep_uid = deps[0]["uid"]
    resp = await client.post(
        f"{_VERCEL_API}/v13/deployments",
        headers=headers,
        json={"deploymentId": dep_uid, "name": project_name},
        timeout=30,
    )
    if resp.status_code not in (200, 201):
        logger.warning("trigger_redeploy returned %s: %s", resp.status_code, resp.text[:200])
    else:
        logger.info("Redeploy triggered for %s", project_name)
