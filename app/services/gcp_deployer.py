import asyncio
import logging
import re

from app.core.config import Settings

logger = logging.getLogger(__name__)

_DOMAIN = "hhippo.co.il"
_DEPLOY_SCRIPT = "/home/ubuntu/maori_stock_bot/scripts/deploy-site.sh"
_SITES_DIR = "/var/www/sites"


def _repo_to_subdomain(repo_name: str) -> str:
    return re.sub(r"-website$", "", repo_name)


def _repo_to_port(repo_name: str) -> int:
    """Deterministic port 3001-3900 from repo name."""
    return 3001 + (abs(hash(repo_name)) % 900)


async def deploy_site(repo_name: str, settings: Settings) -> str:
    """Build and serve a generated site. Returns its public URL."""
    port = _repo_to_port(repo_name)
    subdomain = _repo_to_subdomain(repo_name)

    proc = await asyncio.create_subprocess_exec(
        "bash",
        _DEPLOY_SCRIPT,
        repo_name,
        settings.github_username,
        str(port),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    try:
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=600)
    except asyncio.TimeoutError:
        proc.kill()
        raise RuntimeError("Site deployment timed out after 10 minutes")

    output = stdout.decode(errors="replace")
    logger.info("deploy-site output:\n%s", output[-1000:])

    if proc.returncode != 0:
        raise RuntimeError(f"deploy-site.sh exited {proc.returncode}:\n{output[-500:]}")

    return f"https://{subdomain}.{_DOMAIN}"
