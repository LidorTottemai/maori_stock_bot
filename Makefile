.PHONY: up down logs deploy shell build claude-auth scan rebuild report dev dev-down setup-local bootstrap

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
# שימוש: make scan  OR  make scan CITY="תל אביב" CATEGORY="חדר כושר"
CITY     ?=
CATEGORY ?=
scan:
	@if [ -n "$(CITY)" ] && [ -n "$(CATEGORY)" ]; then \
		BODY='{"city":"$(CITY)","category":"$(CATEGORY)"}'; \
	else \
		BODY='{}'; \
	fi; \
	curl -s -X POST http://localhost:8000/api/v1/scanner/scan \
	  -H "Content-Type: application/json" \
	  -d "$$BODY" | python3 -m json.tool

# בניית אתר אחד מהתור
rebuild:
	curl -s -X POST http://localhost:8000/api/v1/rebuild/run-now | python3 -m json.tool

# שליחת דוח לטלגרם עכשיו
report:
	curl -s -X POST http://localhost:8000/api/v1/rebuild/send-report | python3 -m json.tool

# ─── Local dev (Docker, no Python required on host) ──────────────────────────
dev:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

# יצירת .env.local לדאשבורד ולחנות
setup-local:
	@printf "NEXT_PUBLIC_API_URL=http://localhost:8000\n" > apps/client-site/.env.local
	@printf "NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=dev-nextauth-secret\nNEXT_PUBLIC_API_URL=http://localhost:8000\nAPI_BASE_URL=http://localhost:8000\n" > dashboard/.env.local
	@echo "✅ .env.local files created"

# יצירת מנהל ראשון (הרץ פעם אחת לאחר make dev)
bootstrap:
	@echo "Creating first owner account..."
	@curl -s -X POST http://localhost:8000/api/v1/staff/bootstrap \
	  -H "Content-Type: application/json" \
	  -d '{"email":"admin@demo.com","password":"Admin1234!","name":"Admin"}' \
	  | python3 -m json.tool
