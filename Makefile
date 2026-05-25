.PHONY: up down logs deploy shell build claude-auth scan rebuild report

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

# סריקת עסקים + שליחה לטלגרם
scan:
	curl -s -X POST http://localhost:8000/api/v1/scanner/scan \
	  -H "Content-Type: application/json" \
	  -d '{}' | python3 -m json.tool

# בניית אתר אחד מהתור
rebuild:
	curl -s -X POST http://localhost:8000/api/v1/rebuild/run-now | python3 -m json.tool

# שליחת דוח לטלגרם עכשיו
report:
	curl -s -X POST http://localhost:8000/api/v1/rebuild/send-report | python3 -m json.tool
