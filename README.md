# Birthday Reminder TS

A robust, timezone-aware birthday reminder system built with Node.js, TypeScript, Express, and PostgreSQL. Automatically sends birthday greetings to users at 9 AM in their local timezone.

## 🎯 Features

- **Timezone-Aware Scheduling**: Sends birthday messages at exactly 9 AM in each user's local timezone
- **Automatic Recovery**: Recovers and sends missed messages if the service was down
- **Retry Mechanism**: Automatically retries failed messages with exponential backoff
- **Race Condition Prevention**: Database-level unique constraints prevent duplicate messages
- **Data Change Detection**: Validates user data hasn't changed since scheduling
- **RESTful API**: Full CRUD operations for user management
- **Docker Support**: Containerized deployment with Docker and Docker Compose

## 🏗️ Architecture

```
Routes → Controllers → Services → Repositories → Models
```

**Key Components:**

- **Scheduler Service**: Manages birthday message scheduling and processing
- **Email Service**: Integrates with https://email-service.digitalenvision.com.au API
- **Cron Jobs**: Automated tasks for scheduling, processing, and recovery
- **Message Tracking**: Persistent storage with status tracking (pending/sent/failed/invalidated)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Make (optional, for shortcuts)
- Docker & Docker Compose (optional, for containerization)

## 🚀 Quick Start

### Option 1: Using Docker

```bash
# Build and start the application
make up
```

Server will be running at `http://localhost:3000`

**Note**: Make sure your external PostgreSQL database is running and accessible at the host specified in your `.env` file.

### Option 2: Using npm

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Option 3: Via makefile (without Docker)

```bash
# Install dependencies
make install

# Run migrations
make db-migrate

# Start development server
make dev
```

Server will be running at `http://localhost:3000` by default (can be adjusted via .env later on)

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000

# Your database URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres

# Email service related env
EMAIL_SERVICE_URL=https://email-service.digitalenvision.com.au/send-email
EMAIL_SERVICE_TIMEOUT=10000
```

## 📊 Database Schema

### Users Table (`bday_users`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| email | VARCHAR(255) | Unique email address |
| birthday_date | DATE | Birthday (YYYY-MM-DD) |
| location | VARCHAR(255) | Human-readable location |
| timezone | VARCHAR(50) | IANA timezone (e.g., "Asia/Jakarta") |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Birthday Messages Table (`bday_birthday_messages`)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| scheduled_date | DATE | Date message is scheduled for |
| status | ENUM | pending/sent/failed/invalidated |
| sent_at | TIMESTAMP | When message was sent |
| error_message | TEXT | Error details if failed |
| retry_count | INTEGER | Number of retry attempts |
| user_snapshot | JSONB | User data at scheduling time |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## 🔌 API Endpoints (Postman Collection Provided in /docs)

### Users

```bash
# Create user
POST /api/v1/users
# Get user by ID
GET /api/v1/users/:id
# Update user
PUT /api/v1/users/:id
# Delete user
DELETE /api/v1/users/:id
```

### Scheduler (Trigger via Curl)

```bash
# Manually trigger scheduling
POST /api/v1/scheduler/schedule
# Process pending messages
POST /api/v1/scheduler/process
# Recover unsent messages
POST /api/v1/scheduler/recover?days=7
# Retry failed messages
POST /api/v1/scheduler/retry
```

### Health Check

```bash
GET /health
```

## ⏰ Automated Jobs

The system runs these cron jobs automatically:

| Job | Schedule | Description |
|-----|----------|-------------|
| Scheduler | Every 6 hours | Creates birthday messages for users |
| Processor | Every minute | Sends pending messages |
| Retry | Every 30 minutes | Retries failed messages (max 3 attempts) |
| Recovery | Daily at midnight UTC | Recovers missed messages from past 7 days (in case of system failure) |

## 🛠️ Makefile Commands

### General
```bash
make help            # Show list of available make commands
```

### Development

```bash
make install         # Install dependencies
make dev             # Run development server
make build           # Build TypeScript
make start           # Start production server
make clean           # Clean build artifacts
```

### Database

```bash
make db-migrate      # Run migrations
make db-rollback     # Rollback last migration
```

### Docker Operations

```bash
make docker-build    # Build Docker image
make docker-up       # Start service
make docker-down     # Stop service
make docker-restart  # Restart service
make docker-clean    # Stop service and remove volume
make docker-rebuild  # Rebuild and restart service
make docker-dev      # Start service in development mode
```

## 🔒 How It Handles Different Scenarios

### 1. Race Conditions / Duplicate Messages
- **Database unique constraint**: `(user_id, scheduled_date)`
- **Atomic operations**: `findOrCreate` prevents race conditions
- **Idempotent**: Re-running won't create duplicates

### 2. Service Downtime Recovery
- Messages persist in database with `pending` status
- Daily recovery job finds and sends missed messages
- Validates user data hasn't changed before sending

### 3. User Data Changes
- **Snapshot mechanism**: Stores user data at scheduling time
- **Validation**: Checks if data changed before sending
- **Invalidation**: Marks outdated messages as `invalidated` (not retried)

### 4. Send Failures
- **Status tracking**: `pending` → `sent` / `failed` / `invalidated`
- **Retry mechanism**: Up to 3 retries with detailed error logging

### 5. Timezone Handling
- All calculations use user's IANA timezone
- Server timezone doesn't affect message timing
- Sends at 9 AM **local time** regardless of server location

### 6. Scalability
- **Indexed queries**: Optimized for thousands of users
- **Decoupled design**: Scheduling and sending are separate
- **Graceful shutdown**: Stops cron jobs cleanly on termination

## 🧪 Testing

```bash
# Manual testing
make dev

# Create users data
curl -X POST http://localhost:3000/api/v1/users

# Trigger scheduler manually
curl -X POST http://localhost:3000/api/v1/scheduler/schedule # Save scheduled message in bday_birthday_messages table
curl -X POST http://localhost:3000/api/v1/scheduler/process # Send messages by fetching all pending messages
```

## 📁 Project Structure

```
birthday-reminder-api/
├── src/
│   ├── config/           # Database and app configuration
│   ├── controllers/      # HTTP request handlers
│   ├── middleware/       # Express middleware
│   ├── migrations/       # Database migrations
│   ├── models/          # Sequelize models
│   ├── repositories/    # Database operations
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   └── index.ts         # Application entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
├── .sequelizerc         # Sequelize CLI configuration
├── Makefile            # Command shortcuts
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## 🎓 Key Learnings & Design Decisions

### Why Separate Scheduling and Processing?
- **Flexibility**: Schedule early, send at appropriate time (9 AM local time)
- **Resilience**: Messages persist even if processor is down

### Why Store User Snapshots?
- **Data integrity**: Detect if user changed birthday/timezone
- **Safety**: Don't send with outdated information

## 📄 Additional Note

This project is a proof of concept (POC) for demonstration purposes.
