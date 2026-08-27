# 📋 TaskFlow — Master Command Cheatsheet

A complete reference guide containing all essential commands for Full-Stack development (React frontend & Django backend), testing, Docker, database management, migrations, and debugging for TaskFlow.

---

## 📑 Table of Contents
1. [⚡ Quick Start & Full-Stack Development](#1--quick-start--full-stack-development)
2. [🐍 Backend & Python (`uv` / Django)](#2--backend--python-uv--django)
3. [⚛️ Frontend & TypeScript (React / Vite / Oxlint)](#3-️-frontend--typescript-react--vite--oxlint)
4. [🗄️ Database & Migrations (PostgreSQL)](#4-️-database--migrations-postgresql)
5. [🧪 Testing & Quality Assurance](#5--testing--quality-assurance)
6. [🐳 Docker & Docker Compose](#6--docker--docker-compose)
7. [🌐 Application & API URLs](#7--application--api-urls)
8. [🛠️ Useful Debugging & Troubleshooting](#8-️-useful-debugging--troubleshooting)

---

## 1. ⚡ Quick Start & Full-Stack Development

### Running the Whole Stack Locally (Two Terminals)

#### Terminal 1 — Backend (Port 8000)
```bash
# 1. Start PostgreSQL (via Docker)
docker compose up db -d

# 2. Navigate to backend and start Django server
cd backend
uv run python manage.py migrate
uv run python manage.py runserver
```

#### Terminal 2 — Frontend (Port 3000)
```bash
# Navigate to frontend and start Vite dev server
cd frontend
npm install
npm run dev
```

> 💡 **Vite Proxy Note**: The frontend dev server (`http://localhost:3000`) automatically proxies all requests starting with `/api` to the Django backend (`http://127.0.0.1:8000`).

---

## 2. 🐍 Backend & Python (`uv` / Django)

All backend commands can be run from inside the `backend/` directory, or from the root using `--directory backend`.

### Environment & Package Management (`uv`)

```bash
cd backend

# Create virtual environment and install all dependencies (including dev)
uv sync

# Activate the virtual environment manually in current shell
source .venv/bin/activate

# Add a production package
uv add <package-name>
# Example: uv add django-cors-headers

# Add a development/testing package
uv add --dev <package-name>
# Example: uv add --dev pytest-cov

# Remove a package
uv remove <package-name>

# Update dependencies to latest compatible versions
uv lock --upgrade
```

### Django Management Commands

```bash
cd backend

# Start local development server (default: http://127.0.0.1:8000/)
uv run python manage.py runserver

# Start on a specific port or network interface
uv run python manage.py runserver 0.0.0.0:8000

# Create a Django superuser (admin portal access)
uv run python manage.py createsuperuser

# Open Django interactive Python shell (with all models pre-configured)
uv run python manage.py shell

# Check for configuration and model validation issues without running the server
uv run python manage.py check

# Collect static files (for production deployment)
uv run python manage.py collectstatic --noinput

# Create a new Django app inside the apps/ folder
uv run python manage.py startapp <app_name> apps/<app_name>
```

---

## 3. ⚛️ Frontend & TypeScript (React / Vite / Oxlint)

All frontend commands should be executed from the `frontend/` directory.

### Dependencies & Setup

```bash
cd frontend

# Install all npm dependencies
npm install

# Install a new production dependency
npm install <package-name>
# Example: npm install lucide-react

# Install a dev dependency
npm install -D <package-name>
# Example: npm install -D @types/node
```

### Development & Build

```bash
cd frontend

# Start the Vite development server with Hot Module Replacement (HMR)
npm run dev

# Type-check TypeScript and build production bundle into frontend/dist
npm run build

# Preview the production build locally
npm run preview
```

### Linting & Formatting

```bash
cd frontend

# Run Oxlint to quickly check for lint issues
npm run lint

# Run Oxlint with autofix where supported
npx oxlint --fix
```

### Chakra UI Snippets & CLI

```bash
cd frontend

# Add official Chakra UI v3 snippet components (e.g., button, dialog, menu)
npx @chakra-ui/cli snippet add <component-name>
# Example: npx @chakra-ui/cli snippet add dialog
```

---

## 4. 🗄️ Database & Migrations (PostgreSQL)

```bash
cd backend

# Create migration files for all apps after modifying any models.py
uv run python manage.py makemigrations

# Create migrations for a specific app
uv run python manage.py makemigrations users
uv run python manage.py makemigrations projects
uv run python manage.py makemigrations tasks
uv run python manage.py makemigrations comments
uv run python manage.py makemigrations activity

# Apply all pending migrations to PostgreSQL
uv run python manage.py migrate

# Apply migrations for a specific app only
uv run python manage.py migrate <app_name>

# View status of all migrations (applied [X] vs unapplied [ ])
uv run python manage.py showmigrations

# View generated SQL for a specific migration (dry-run without applying)
uv run python manage.py sqlmigrate <app_name> <migration_number>
# Example: uv run python manage.py sqlmigrate tasks 0001_initial

# Open interactive PostgreSQL database CLI via Django
uv run python manage.py dbshell
```

---

## 5. 🧪 Testing & Quality Assurance

### Backend Tests (pytest)

```bash
cd backend

# Run all backend tests
uv run pytest

# Run all tests with verbose output (shows each test name and pass/fail)
uv run pytest -v

# Run tests in a specific app or test file
uv run pytest apps/users/tests/test_auth.py
uv run pytest apps/projects/tests/test_projects.py
uv run pytest apps/tasks/tests/test_tasks.py
uv run pytest apps/comments/tests/test_comments.py
uv run pytest apps/activity/tests/test_activity.py

# Run a specific single test method
uv run pytest apps/users/tests/test_auth.py::TestUserRegistration::test_register_user_success

# Run tests with code coverage summary
uv run pytest --cov=apps --cov=core

# Run tests with coverage and show exact missing lines
uv run pytest --cov=apps --cov=core --cov-report=term-missing

# Generate HTML coverage report (opens at htmlcov/index.html)
uv run pytest --cov=apps --cov=core --cov-report=html

# Stop test execution immediately on the first failure
uv run pytest -x
```

### Frontend Checks

```bash
cd frontend

# Run Oxlint linter
npm run lint

# Run full TypeScript compiler type check without emitting files
npx tsc --noEmit
```

---

## 6. 🐳 Docker & Docker Compose

All docker compose commands are executed from the **repository root**.

### Starting & Managing Containers

```bash
# Build images and start all containers (web + postgres) in the foreground
docker compose up --build

# Start all containers in the background (detached mode)
docker compose up -d

# Start only the PostgreSQL database container in the background
docker compose up db -d

# View real-time logs from all running containers
docker compose logs -f

# View logs only from the web server
docker compose logs -f web

# View logs only from PostgreSQL
docker compose logs -f db

# Stop and remove containers and networks (data in volumes is preserved)
docker compose down

# Stop containers and DELETE all persistent database data volumes
docker compose down -v
```

### Running Commands Inside Docker Containers

```bash
# Run migrations inside the Docker web container
docker compose exec web python manage.py migrate

# Run tests inside the Docker web container
docker compose exec web pytest -v

# Create superuser inside Docker
docker compose exec web python manage.py createsuperuser

# Open Django shell inside Docker
docker compose exec web python manage.py shell

# Access PostgreSQL CLI inside the Docker database container
docker compose exec -it db psql -U taskflow -d taskflow

# Open a shell inside the web container
docker compose exec -it web /bin/sh
```

### Standalone Docker PostgreSQL (if running only DB in Docker)

```bash
# Run PostgreSQL container standalone
docker run -d \
  --name taskflow_postgres \
  -e POSTGRES_USER=taskflow \
  -e POSTGRES_PASSWORD=taskflow \
  -e POSTGRES_DB=taskflow \
  -p 5432:5432 \
  postgres:16-alpine

# Grant CREATEDB permission (required for pytest test database creation)
docker exec -it taskflow_postgres psql -U taskflow -d taskflow -c "ALTER USER taskflow CREATEDB;"
```

---

## 7. 🌐 Application & API URLs

| Service / Tool | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000/` | React + Chakra UI TaskFlow Application |
| **API Base URL** | `http://localhost:8000/api/v1/` | Base URL for all API v1 endpoints |
| **Swagger UI** | `http://localhost:8000/api/docs/` | Interactive OpenAPI / Swagger API playground |
| **Redoc UI** | `http://localhost:8000/api/redoc/` | Clean, structured API documentation |
| **OpenAPI Schema** | `http://localhost:8000/api/schema/` | Raw OpenAPI 3.0 schema (JSON/YAML) |
| **Django Admin** | `http://localhost:8000/admin/` | Built-in Django administrative portal |

---

## 8. 🛠️ Useful Debugging & Troubleshooting

### Port Conflicts & Process Management

```bash
# Check what processes are running on frontend (3000), backend (8000), or DB (5432)
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Kill a process stuck on port 8000 or 5173
fuser -k 8000/tcp
fuser -k 5173/tcp
```

### Secret Key & Caches

```bash
# Generate a brand new secure Django SECRET_KEY
cd backend
uv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Clear all cached .pyc and __pycache__ files across the repository
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# Clean frontend build artifacts and cache
rm -rf frontend/dist frontend/node_modules/.vite
```

### Database Reset

```bash
# Complete local database reset (Warning: Erases all local dev data)
# 1. Drop and recreate DB in postgres:
docker compose exec db psql -U taskflow -c "DROP DATABASE taskflow; CREATE DATABASE taskflow;"

# 2. Re-apply all migrations:
cd backend
uv run python manage.py migrate
```
