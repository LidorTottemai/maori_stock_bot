FROM python:3.11-slim-bookworm

# System deps + Node.js 20 (for Claude Code CLI)
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Python deps
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Playwright Chromium + system deps (arm64 compatible)
RUN playwright install --with-deps chromium

# App source
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "1", "--log-level", "info"]
