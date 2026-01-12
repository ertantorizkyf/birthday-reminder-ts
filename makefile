# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Available commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

dev: ## Run development server 
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

build: ## Build TypeScript
	@echo "$(BLUE)Building project...$(NC)"
	npm run build

start: ## Start server
	@echo "$(BLUE)Starting production server...$(NC)"
	npm start

clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning...$(NC)"
	rm -rf dist node_modules

db-migrate: ## Run migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	npm run db:migrate

db-rollback: ## Rollback last migration
	@echo "$(YELLOW)Rolling back migration...$(NC)"
	npm run db:migrate:undo

docker-build: ## Build Docker image
	docker-compose build

docker-up: ## Start service
	docker-compose up -d
	@echo "$(GREEN)Service started! App running at http://localhost:3000$(RESET)"

docker-down: ## Stop service
	docker-compose down

docker-restart: ## Restart service
	docker-compose restart

docker-clean: ## Stop service and remove volume
	docker-compose down -v
	docker system prune -f

docker-rebuild: ## Rebuild and restart service
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

docker-dev: ## Start service in development mode
	docker-compose up
	