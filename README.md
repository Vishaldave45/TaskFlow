# 🚀 TaskFlow

A production-ready **project management & task tracking REST API** built with Django 6.1, Django REST Framework, and PostgreSQL.

---

## ✨ Features

- **JWT Authentication** — Register, login, logout, token refresh with automatic blacklisting
- **Projects** — Full CRUD with owner-based permissions and member management
- **Tasks** — Create, assign, filter, search, and track tasks within projects
- **Comments** — Threaded task comments with author/owner-level permissions
- **Activity Logs** — Automatic audit trail for task creation, status changes, priority changes, and reassignments
- **OpenAPI Documentation** — Interactive Swagger UI and Redoc at `/api/docs/` and `/api/redoc/`
- **Consistent Error Responses** — All errors follow a standardised `{error: {code, message, details}}` envelope
- **Advanced Filtering** — Filter tasks by status, priority, assignee, due date ranges, and full-text search

> 💡 **Quick Reference**: See [**COMMANDS.md**](file:///home/vishal-dave/Desktop/Django-learning/TaskFlow-task/COMMANDS.md) for a complete cheatsheet of all Django, UV, Docker, and Testing commands.


---

## 🏗️ Architecture

```
TaskFlow follows a strict layered architecture:

  Request → Views → Serializers → Services → Repositories → Models → PostgreSQL
                                     ↓
                              Business Logic
```

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Models** | Database schema, field definitions | `apps/*/models.py` |
| **Repositories** | Raw DB queries, encapsulate ORM calls | `apps/*/repositories.py` |
| **Services** | Business logic, validation, orchestration | `apps/*/services.py` |
| **Serializers** | Request validation & response shaping | `apps/*/serializers.py` |
| **Views** | HTTP handling, authentication, permissions | `apps/*/views.py` |
| **Permissions** | Custom permission classes | `apps/*/permissions.py` |
| **Filters** | Query parameter filtering | `apps/tasks/filters.py` |

### Project Structure

```
TaskFlow-task/
├── config/                 # Django project configuration
│   ├── settings.py         # All settings (env-driven)
│   ├── urls.py             # Root URL routing
│   ├── wsgi.py / asgi.py
├── core/                   # Shared utilities
│   ├── exceptions.py       # Global error handler
│   └── pagination.py       # Standard pagination class
├── apps/
│   ├── users/              # Authentication & user management
│   ├── projects/           # Projects & membership
│   ├── tasks/              # Tasks with filtering & ordering
│   ├── comments/           # Task comments
│   └── activity/           # Automatic activity logs
├── .env.example            # Environment variable template
├── pyproject.toml          # Dependencies (managed by uv)
└── pytest.ini              # Test configuration
```

### Database Schema (PostgreSQL)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │──────<│  ProjectMember   │>──────│   Project    │
│  (Custom)    │       │  (user, project) │       │ (name, owner)│
└──────┬───────┘       └──────────────────┘       └──────┬───────┘
       │                                                  │
       │  creator/assignee                                │
       │         ┌───────────────┐                        │
       └────────>│     Task      │<───────────────────────┘
                 │ (title,status)│
                 └───┬───────┬──┘
                     │       │
          ┌──────────┘       └──────────┐
          ▼                             ▼
   ┌──────────────┐            ┌────────────────┐
   │   Comment    │            │ ActivityLog    │
   │ (content)    │            │ (action, diff) │
   └──────────────┘            └────────────────┘
```

---

## 🛠️ Setup Instructions

### Prerequisites

- **Python 3.12+**
- **Docker** (for PostgreSQL)
- **[uv](https://docs.astral.sh/uv/)** (Python package manager)

### Option A: One-Command Setup (Docker Compose - Recommended)

```bash
# Start PostgreSQL and Django Web server together
docker compose up --build
```

The API will be live at `http://localhost:8000`.

---

### Option B: Local Environment Setup

#### 1. Clone & Install


```bash
git clone <your-repo-url> TaskFlow-task
cd TaskFlow-task

# Install dependencies
uv sync
```

### 2. Start PostgreSQL (Docker)

```bash
docker run -d \
  --name researchhub_db \
  -e POSTGRES_USER=researchhub \
  -e POSTGRES_PASSWORD=researchhub \
  -e POSTGRES_DB=researchhub \
  -p 5432:5432 \
  postgres:16

# Create the taskflow database and user
docker exec -it researchhub_db psql -U researchhub -d researchhub -c "
  CREATE USER taskflow WITH PASSWORD 'taskflow';
  CREATE DATABASE taskflow OWNER taskflow;
  ALTER USER taskflow CREATEDB;
"
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values (defaults work for local Docker setup)
```

### 4. Run Migrations

```bash
uv run python manage.py migrate
```

### 5. Start the Server

```bash
uv run python manage.py runserver
```

The API is now live at **http://localhost:8000**.  
Swagger docs: **http://localhost:8000/api/docs/**  
Redoc: **http://localhost:8000/api/redoc/**

### 6. Run Tests

```bash
uv run pytest               # All 69 tests
uv run pytest -v             # Verbose output
uv run pytest --cov=apps     # With coverage report
```

---

## 📡 API Reference

**Base URL:** `http://localhost:8000/api/v1/`

All protected endpoints require the header:  
`Authorization: Bearer <access_token>`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register/` | Register a new user | ✗ |
| `POST` | `/auth/login/` | Login, get JWT tokens | ✗ |
| `POST` | `/auth/logout/` | Blacklist refresh token | ✓ |
| `GET` | `/auth/me/` | Get current user profile | ✓ |
| `POST` | `/auth/token/refresh/` | Refresh access token | ✗ |

### Projects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/projects/` | List your projects | ✓ |
| `POST` | `/projects/` | Create a project | ✓ |
| `GET` | `/projects/:id/` | Get project detail | ✓ (member) |
| `PUT` | `/projects/:id/` | Update project | ✓ (owner) |
| `DELETE` | `/projects/:id/` | Delete project | ✓ (owner) |
| `GET` | `/projects/:id/members/` | List members | ✓ (member) |
| `POST` | `/projects/:id/members/` | Add member by email | ✓ (owner) |
| `DELETE` | `/projects/:id/members/:user_id/` | Remove member | ✓ (owner or self) |

### Tasks

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/projects/:id/tasks/` | List tasks (filterable) | ✓ (member) |
| `POST` | `/projects/:id/tasks/` | Create a task | ✓ (member) |
| `GET` | `/tasks/:id/` | Get task detail | ✓ (member) |
| `PATCH` | `/tasks/:id/` | Update task | ✓ (member) |
| `DELETE` | `/tasks/:id/` | Delete task | ✓ (member) |

**Task Filters:** `?status=TODO` `?priority=HIGH` `?assignee=1` `?search=keyword` `?due_date_after=2025-01-01` `?ordering=-created_at`

### Comments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/tasks/:id/comments/` | List task comments | ✓ (member) |
| `POST` | `/tasks/:id/comments/` | Add a comment | ✓ (member) |
| `PATCH` | `/comments/:id/` | Update comment | ✓ (author) |
| `DELETE` | `/comments/:id/` | Delete comment | ✓ (author or project owner) |

### Activity Logs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/tasks/:id/activity/` | Get task activity log | ✓ (member) |

---

## 📝 API Examples

### Register a User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "password": "SecurePass123!"
  }'
```

**Response (201):**
```json
{
  "id": 1,
  "email": "alice@example.com",
  "username": "alice"
}
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Create a Project

```bash
curl -X POST http://localhost:8000/api/v1/projects/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q3 Sprint",
    "description": "Third quarter development sprint"
  }'
```

### Create a Task

```bash
curl -X POST http://localhost:8000/api/v1/projects/1/tasks/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement auth module",
    "description": "JWT-based authentication",
    "priority": "HIGH",
    "assignee_id": 1,
    "due_date": "2025-09-15"
  }'
```

### Filter & Search Tasks

```bash
# High priority tasks due after 2025-09-01, ordered by due date
curl "http://localhost:8000/api/v1/projects/1/tasks/?priority=HIGH&due_date_after=2025-09-01&ordering=due_date" \
  -H "Authorization: Bearer <access_token>"

# Search by keyword
curl "http://localhost:8000/api/v1/projects/1/tasks/?search=auth" \
  -H "Authorization: Bearer <access_token>"
```

### Add a Comment

```bash
curl -X POST http://localhost:8000/api/v1/tasks/1/comments/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Looks good, merging now!"}'
```

### Error Response Example

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input.",
    "details": {
      "email": ["A user with that email already exists."]
    }
  }
}
```

---

## 🧪 Testing

The project includes **69 tests** covering all layers:

| Module | Tests | Coverage |
|--------|-------|----------|
| Users (auth, registration) | 13 | Services, Repository, API |
| Projects (CRUD, membership) | 20 | Services, Repository, API |
| Tasks (CRUD, filtering) | 13 | Services, Repository, API |
| Comments (CRUD, permissions) | 15 | Services, API |
| Activity (auto-logging) | 8 | Services, API |

```bash
uv run pytest -v --cov=apps
```

---

## 🔧 Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Django 6.1 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL 16 (Docker) |
| API Docs | drf-spectacular (OpenAPI 3.0) |
| Filtering | django-filter |
| CORS | django-cors-headers |
| Testing | pytest + pytest-django + factory-boy |
| Package Manager | uv |

---

## 📄 License

MIT
