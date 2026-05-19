.PHONY: up down logs deploy shell build claude-auth

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f app

deploy: build up
	@echo "✅ Deployed. Run 'make logs' to watch."

shell:
	docker compose exec app bash

# One-time: authenticate Claude Code on the HOST (not inside Docker)
claude-auth:
	claude auth login
