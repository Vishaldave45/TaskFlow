# 📡 TaskFlow — REST API Reference Guide

TaskFlow exposes a comprehensive RESTful API built with **Django REST Framework**. Interactive documentation is available out of the box via Swagger UI and ReDoc.

- **Swagger UI**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
- **ReDoc**: [http://localhost:8000/api/redoc/](http://localhost:8000/api/redoc/)
- **OpenAPI Schema (JSON)**: [http://localhost:8000/api/schema/](http://localhost:8000/api/schema/)

---

## 1. General Conventions

### 1.1 Base URL
All endpoints are versioned under `/api/v1/`:
```
http://127.0.0.1:8000/api/v1
```

### 1.2 Authentication Header
Protected endpoints require a JSON Web Token (JWT) in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

### 1.3 Tracing Headers
Every response includes a unique request correlation ID for observability:
```http
X-Request-ID: f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### 1.4 Error Response Envelope
Errors adhere to a consistent JSON envelope across all endpoints:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid field inputs provided.",
    "details": {
      "email": ["Enter a valid email address."]
    }
  }
}
```

---

## 2. Pagination Specifications

TaskFlow supports two pagination strategies:

### 2.1 Cursor Pagination (Recommended for Real-time Feeds)
Used on `/api/v1/tasks/` and `/api/v1/projects/{id}/tasks/` for stable infinite scrolling without duplicate or missing items during concurrent mutations.

**Query Parameters:**
- `cursor` *(string, optional)*: Opaque pointer to the current cursor position.
- `page_size` *(int, optional, default: 20, max: 100)*: Number of items per page.

**Response Envelope:**
```json
{
  "next": "http://127.0.0.1:8000/api/v1/tasks/?cursor=cD0yMDI2LTA5LTAzKzA2",
  "previous": null,
  "results": [
    {
      "id": 101,
      "title": "Build cursor pagination",
      "status": "DONE",
      "priority": "HIGH",
      "created_at": "2026-09-03T06:00:00Z"
    }
  ]
}
```

---

## 3. API Endpoints Reference

### 3.1 Authentication (`/api/v1/auth/`)

#### Register User
`POST /api/v1/auth/register/`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "username": "jane",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": 1,
    "email": "jane@example.com",
    "username": "jane",
    "role": "MEMBER"
  }
  ```

#### Obtain JWT Tokens (Login)
`POST /api/v1/auth/login/`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>",
    "user": {
      "id": 1,
      "email": "jane@example.com",
      "username": "jane"
    }
  }
  ```

#### Refresh Access Token
`POST /api/v1/auth/token/refresh/`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "refresh": "<jwt_refresh_token>"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access": "<new_jwt_access_token>",
    "refresh": "<new_rotated_refresh_token>"
  }
  ```

#### Get Current User Profile
`GET /api/v1/auth/me/`
- **Auth**: Bearer Token
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "email": "jane@example.com",
    "username": "jane"
  }
  ```

---

### 3.2 Projects (`/api/v1/projects/`)

#### List Projects
`GET /api/v1/projects/`
- **Auth**: Bearer Token
- **Description**: Returns all projects where the authenticated user is either the Owner or a Collaborator.
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "name": "TaskFlow Core Engine",
      "description": "Orchestration & real-time sync",
      "owner": {
        "id": 1,
        "email": "admin@taskflow.dev",
        "username": "admin"
      },
      "created_at": "2026-09-01T10:00:00Z"
    }
  ]
  ```

#### Create Project
`POST /api/v1/projects/`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "name": "Mobile Companion App",
    "description": "Cross-platform React Native client"
  }
  ```
- **Response `201 Created`**

#### Project Detail, Update & Delete
- `GET /api/v1/projects/{id}/` — Retrieve project detail (Members only)
- `PATCH /api/v1/projects/{id}/` — Partial update (Owner only)
- `DELETE /api/v1/projects/{id}/` — Delete project & cascade tasks (Owner only)

#### Project Collaborators
- `GET /api/v1/projects/{id}/members/` — List collaborators
- `POST /api/v1/projects/{id}/members/` — Invite collaborator by email (`{"email": "collab@dev.com", "role": "COLLABORATOR"}`)
- `DELETE /api/v1/projects/{id}/members/{user_id}/` — Remove collaborator

---

### 3.3 Tasks (`/api/v1/tasks/` & `/api/v1/projects/{id}/tasks/`)

#### List All User Tasks (Paginated)
`GET /api/v1/tasks/?cursor=<cursor>&page_size=20`
- **Auth**: Bearer Token
- **Returns**: Paginated envelope of tasks across all accessible projects.

#### List Project Tasks
`GET /api/v1/projects/{id}/tasks/?cursor=<cursor>&status=TODO&priority=HIGH`
- **Query Filters**: `status` (`TODO`, `IN_PROGRESS`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`), `search` (matches title/description).

#### Create Task
`POST /api/v1/projects/{id}/tasks/`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "title": "Implement optimistic UI updates",
    "description": "Use queryClient.setQueryData for instant UI response",
    "status": "TODO",
    "priority": "HIGH",
    "assignee_id": 2,
    "due_date": "2026-09-15"
  }
  ```
- **Response `201 Created`**

#### Task Detail, Update & Delete
- `GET /api/v1/tasks/{id}/` — Retrieve task details
- `PATCH /api/v1/tasks/{id}/` — Update status, priority, title, description, assignee, due date
- `DELETE /api/v1/tasks/{id}/` — Delete task (Owner or Task Creator)

---

### 3.4 Comments & Activity Feed

#### List / Create Comments
- `GET /api/v1/tasks/{id}/comments/` — Retrieve comments on a task
- `POST /api/v1/tasks/{id}/comments/` — Post new comment (`{"content": "Reviewing PR now"}`)
- `DELETE /api/v1/comments/{id}/` — Delete comment (Author or Project Owner)

#### Task Audit Activity Log
- `GET /api/v1/tasks/{id}/activity/` — View audit log entries (task status transitions, assignee reassignments)
