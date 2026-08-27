# 🚀 TaskFlow

A modern, full-stack **Project Management & Task Tracking Platform** built with **Django 6.1 REST Framework** (Backend) and **React 19 + TypeScript + Vite + Chakra UI** (Frontend), backed by **PostgreSQL**.

---

## ✨ Key Features

### 💻 Modern Frontend (React 19 + Vite + Chakra UI)
- **Clean SaaS Design System** — Minimalist slate canvas (`#F8FAFC`), crisp white elevated cards, and sapphire blue (`#2563EB`) identity tokens.
- **Kanban Board** — Visual lanes (`To Do`, `In Progress`, `Done`) with priority indicator rails (`High`, `Medium`, `Low`) and quick-shift card menus.
- **Sprint Velocity Tracker** — Live progress bar calculating completion rates (`X of Y tasks completed (Z%)`).
- **Role-Based Access Control (RBAC)**:
  - **Project Owner (`👑`)**: Full project governance, member invite/removal, project deletion, and comment moderation.
  - **Collaborator (`🛡️`)**: Workspace visibility, task creation, status updates, inline editing, and comments.
- **Interactive Task Workspace** — Inline title & description editing, assignee switching, priority adjustment, threaded comments feed, and audit timeline.
- **Zero-Dependency JWT Client** — Automatic Bearer injection, 401 token auto-refresh via `/api/v1/auth/token/refresh/`, and DRF error handling.

### ⚙️ Robust Backend (Django 6.1 + DRF)
- **Layered Architecture** — Strict separation between `Views`, `Services`, `Repositories`, `Serializers`, and `Models`.
- **JWT Authentication** — `django-rest-framework-simplejwt` with registration, login, profile inspection, and refresh endpoints.
- **Audit Logging** — Automated `ActivityLog` capturing task lifecycle events (creation, status movement, assignee change).
- **Interactive API Documentation** — Swagger UI (`/api/docs/`) and Redoc (`/api/redoc/`) powered by `drf-spectacular`.
- **Standardized Error Envelope** — Consistent `{ "error": { "code": "...", "message": "...", "details": { ... } } }` responses.

---

## 🏗️ Architecture & Monorepo Structure

```
TaskFlow-task/
├── backend/                    # Django REST Framework Backend
│   ├── apps/
│   │   ├── users/              # Custom User model & JWT auth
│   │   ├── projects/           # Projects, membership & RBAC
│   │   ├── tasks/              # Task lifecycle & filtering
│   │   ├── comments/           # Task comments
│   │   └── activity/           # Audit logs & history
│   ├── config/                 # Settings, root URLs, WSGI/ASGI
│   ├── core/                   # Shared exceptions & pagination
│   ├── manage.py
│   ├── pyproject.toml          # UV dependency configuration
│   └── Dockerfile
│
├── frontend/                   # React 19 + Vite Frontend
│   ├── src/
│   │   ├── api/                # Fetch HTTP client & API wrappers
│   │   ├── components/         # Layout, Navbar, ProtectedRoute
│   │   ├── context/            # AuthContext & Session management
│   │   ├── pages/              # Login, Register, Projects, ProjectDetail (Kanban)
│   │   ├── theme/              # Chakra UI SaaS design tokens & component styles
│   │   ├── types/              # TypeScript contracts
│   │   └── App.tsx             # Client-side router
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml          # PostgreSQL database container
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.12+** with [uv](https://docs.astral.sh/uv/) installed
- **Node.js 18+** & **npm**
- **Docker** (for PostgreSQL database)

---

### Step 1: Start PostgreSQL Database
From the project root:
```bash
docker compose up db -d
```

---

### Step 2: Start Django Backend
```bash
cd backend

# Install dependencies and sync virtual environment
uv sync

# Run database migrations
uv run python manage.py migrate

# (Optional) Create an admin superuser
uv run python manage.py createsuperuser

# Start Django development server (Port 8000)
uv run python manage.py runserver
```
Backend API will be live at: **`http://127.0.0.1:8000/`**  
Swagger API Documentation: **`http://127.0.0.1:8000/api/docs/`**

---

### Step 3: Start React Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (Port 3000)
npm run dev
```
Frontend Web App will be live at: **`http://localhost:3000/`**

---

## 📡 REST API Reference

### Authentication (`/api/v1/auth/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register/` | Register new account | No |
| `POST` | `/api/v1/auth/login/` | Obtain JWT access + refresh tokens | No |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh access token | No |
| `GET` | `/api/v1/auth/me/` | Current user profile | Yes |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh token | Yes |

### Projects (`/api/v1/projects/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/projects/` | List user's projects (Owned & Collaborations) | Yes |
| `POST` | `/api/v1/projects/` | Create a new project | Yes |
| `GET` | `/api/v1/projects/{id}/` | Get project details | Yes (Member/Owner) |
| `PATCH`| `/api/v1/projects/{id}/` | Update project metadata | Yes (Owner) |
| `DELETE`| `/api/v1/projects/{id}/` | Delete project and cascade all tasks | Yes (Owner) |
| `GET` | `/api/v1/projects/{id}/members/` | List project collaborators | Yes (Member/Owner) |
| `POST` | `/api/v1/projects/{id}/members/` | Invite collaborator by email | Yes (Owner) |
| `DELETE`| `/api/v1/projects/{id}/members/{user_id}/` | Remove collaborator | Yes (Owner) |

### Tasks (`/api/v1/projects/{id}/tasks/` & `/api/v1/tasks/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/projects/{id}/tasks/` | List project tasks with filters | Yes (Member/Owner) |
| `POST` | `/api/v1/projects/{id}/tasks/` | Create task in project | Yes (Member/Owner) |
| `GET` | `/api/v1/tasks/{id}/` | Get task details | Yes (Member/Owner) |
| `PATCH`| `/api/v1/tasks/{id}/` | Update task (status, priority, assignee) | Yes (Member/Owner) |
| `DELETE`| `/api/v1/tasks/{id}/` | Delete task | Yes (Owner/Creator) |

### Comments & Activity (`/api/v1/tasks/{id}/`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/tasks/{id}/comments/` | List comments for task | Yes (Member/Owner) |
| `POST` | `/api/v1/tasks/{id}/comments/` | Post comment on task | Yes (Member/Owner) |
| `DELETE`| `/api/v1/comments/{id}/` | Delete comment | Yes (Author/Owner) |
| `GET` | `/api/v1/tasks/{id}/activity/` | View automated task audit log | Yes (Member/Owner) |

---

## 🧪 Testing

Run backend tests and generate code coverage reports:
```bash
cd backend
uv run pytest
```

---

## 🛡️ License
MIT License. Built with ❤️ for productive team collaboration.
