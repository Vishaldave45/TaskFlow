# 📋 TaskFlow — Master Command Cheatsheet

A complete reference guide containing all essential commands for development, testing, Docker, database management, migrations, and debugging for the TaskFlow backend.

---

## 📑 Table of Contents
1. [Environment & Package Management (`uv`)](#1-environment--package-management-uv)
2. [Django & Backend Commands](#2-django--backend-commands)
3. [Database & Migrations](#3-database--migrations)
4. [Testing & Quality Assurance](#4-testing--quality-assurance)
5. [Docker & Docker Compose](#5-docker--docker-compose)
6. [API & Documentation URLs](#6-api--documentation-urls)
7. [Useful Debugging & Troubleshooting Commands](#7-useful-debugging--troubleshooting-commands)

---

## 1. Environment & Package Management (`uv`)

```bash
# Create virtual environment and install all dependencies (including dev)
uv sync

# Activate the virtual environment in your current shell
source .venv/bin/activate

# Add a new production package
uv add <package-name>
# Example: uv add django-cors-headers

# Add a development/testing package
uv add --dev <package-name>
# Example: uv add --dev pytest-cov

# Remove a package
uv remove <package-name>

# Update all dependencies to latest compatible versions
uv lock --upgrade
```

---

## 2. Django & Backend Commands

```bash
# Start local development server (default: http://127.0.0.1:8000/)
uv run python manage.py runserver

# Start on a specific port or host
uv run python manage.py runserver 0.0.0.0:8000

# Create a Django superuser (admin user)
uv run python manage.py createsuperuser

# Open Django interactive Python shell (with all models loaded)
uv run python manage.py shell

# Check for configuration and system issues without running the server
uv run python manage.py check

# Collect static files (for production)
uv run python manage.py collectstatic --noinput

# Create a new Django app
uv run python manage.py startapp <app_name> apps/<app_name>
```

---

## 3. Database & Migrations

```bash
# Create migration files for all apps after modifying models.py
uv run python manage.py makemigrations

# Create migrations for a specific app
uv run python manage.py makemigrations users
uv run python manage.py makemigrations projects
uv run python manage.py makemigrations tasks
uv run python manage.py makemigrations comments
uv run python manage.py makemigrations activity

# Apply all pending migrations to PostgreSQL
uv run python manage.py migrate

# Apply migrations for a specific app
uv run python manage.py migrate <app_name>

# View status of all migrations (applied [X] vs unapplied [ ])
uv run python manage.py showmigrations

# View generated SQL for a specific migration (without running it)
uv run python manage.py sqlmigrate <app_name> <migration_number>
# Example: uv run python manage.py sqlmigrate tasks 0001_initial

# Open interactive PostgreSQL database shell (via Django)
uv run python manage.py dbshell
```

---

## 4. Testing & Quality Assurance

```bash
# Run all tests (quick mode)
uv run pytest

# Run all tests with verbose output (shows each test name and status)
uv run pytest -v

# Run tests in a specific file
uv run pytest apps/users/tests/test_auth.py
uv run pytest apps/projects/tests/test_projects.py
uv run pytest apps/tasks/tests/test_tasks.py
uv run pytest apps/comments/tests/test_comments.py
uv run pytest apps/activity/tests/test_activity.py

# Run a specific single test
uv run pytest apps/users/tests/test_auth.py::TestUserRegistration::test_register_user_success

# Run tests with code coverage report (summary)
uv run pytest --cov=apps --cov=core

# Run tests with code coverage and show exact missing lines
uv run pytest --cov=apps --cov=core --cov-report=term-missing

# Generate HTML coverage report (viewable in browser at htmlcov/index.html)
uv run pytest --cov=apps --cov=core --cov-report=html

# Stop test execution immediately on the first failure
uv run pytest -x
```

---

## 5. Docker & Docker Compose

### Starting & Stopping Services

```bash
# Build images and start all containers (web + postgres) in the foreground
docker compose up --build

# Start containers in the background (detached mode)
docker compose up -d

# View real-time logs from all running containers
docker compose logs -f

# View logs only from the web server
docker compose logs -f web

# View logs only from PostgreSQL
docker compose logs -f db

# Stop and remove all containers and networks (data in volumes is preserved)
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

# Open a bash shell inside the web container
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

## 6. API & Documentation URLs

| Resource | URL | Description |
| :--- | :--- | :--- |
| **API Base URL** | `http://localhost:8000/api/v1/` | Base URL for all API v1 endpoints |
| **Swagger UI** | `http://localhost:8000/api/docs/` | Interactive API testing documentation |
| **Redoc UI** | `http://localhost:8000/api/redoc/` | Clean read-only API documentation |
| **OpenAPI Schema** | `http://localhost:8000/api/schema/` | Raw OpenAPI 3.0 schema (JSON/YAML) |
| **Django Admin** | `http://localhost:8000/admin/` | Built-in Django administrative portal |

---

## 7. Useful Debugging & Troubleshooting Commands

```bash
# Generate a brand new secure Django SECRET_KEY
uv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Clear all cached .pyc and __pycache__ files across the repository
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# Check which processes are using port 8000 or 5432
lsof -i :8000
lsof -i :5432

# Kill process running on port 8000 (if server didn't shutdown cleanly)
fuser -k 8000/tcp

# Reset database completely (caution: deletes all dev data!)
# 1. Drop and recreate DB in postgres:
docker compose exec db psql -U taskflow -c "DROP DATABASE taskflow; CREATE DATABASE taskflow;"
# 2. Re-apply all migrations:
uv run python manage.py migrate
```
