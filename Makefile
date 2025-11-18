.PHONY: help install dev build test clean docker-up docker-down db-setup db-seed db-reset

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install

dev: ## Start development servers (backend + frontend)
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run all tests
	npm run test

clean: ## Clean node_modules and build artifacts
	rm -rf node_modules backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/.next

docker-up: ## Start PostgreSQL container
	docker-compose up -d

docker-down: ## Stop PostgreSQL container
	docker-compose down

db-setup: ## Generate Prisma client and run migrations
	cd backend && npm run db:generate && npm run db:migrate

db-seed: ## Seed the database with sample data
	npm run db:seed

db-reset: ## Reset database and reseed
	cd backend && npx prisma migrate reset --force

setup: install docker-up db-setup db-seed ## Complete setup (install, docker, db, seed)
	@echo "✅ Setup complete! Run 'make dev' to start development servers."
