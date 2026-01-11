# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

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
	