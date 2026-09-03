# 🏛️ TaskFlow — System Architecture & Design Specification

This document provides a comprehensive technical reference for the architecture, data models, state topologies, and security boundaries of the **TaskFlow** platform.

---

## 1. High-Level System Architecture

TaskFlow is designed as a decoupled, full-stack application following a modern API-first paradigm.

```mermaid
graph TD
    Client["Client (Browser / React 19 SPA)"]
    Proxy["Reverse Proxy (Nginx / Vite Dev)"]
    API["Django REST Framework (WSGI / Gunicorn)"]
    Auth["JWT Authentication & RBAC Layer"]
    Services["Domain Services & Business Logic"]
    Repos["Repository & ORM Layer"]
    DB[("PostgreSQL 16 Engine")]
    Swagger["OpenAPI / Swagger UI (drf-spectacular)"]

    Client -->|HTTP/REST Requests + Bearer JWT| Proxy
    Proxy -->|Proxy /api/v1| API
    API --> Auth
    Auth --> Services
    Services --> Repos
    Repos --> DB
    API -->|Schema Extraction| Swagger
```

---

## 2. Monorepo Directory Organization

```
TaskFlow-task/
├── .github/
│   └── workflows/
│       └── ci.yml             # Automated CI pipeline (Django + React)
├── backend/                   # Django REST Framework Backend
│   ├── apps/
│   │   ├── users/             # Custom User model, JWT auth & profile
│   │   ├── projects/          # Projects, membership & RBAC
│   │   ├── tasks/             # Task CRUD, statuses, priorities & cursor pagination
│   │   ├── comments/          # Task threaded comments
│   │   └── activity/          # Automated audit logging
│   ├── config/                # Django core settings, WSGI, ASGI, Root URLs
│   ├── core/                  # Shared middleware, pagination & exception handlers
│   ├── manage.py
│   ├── pyproject.toml         # UV/PEP-518 dependencies & Ruff config
│   └── Dockerfile             # Multi-stage production container
├── frontend/                  # React 19 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── api/               # Fetch HTTP client, JWT auto-refresh & API endpoints
│   │   ├── components/        # Layout, Navbar, Modal & UI design system
│   │   ├── context/           # AuthContext & Session management
│   │   ├── features/          # Feature slices: projects, tasks, auth
│   │   │   ├── projects/      # Project hooks & components
│   │   │   └── tasks/         # Kanban board, InfiniteTaskList, TaskCard, modals
│   │   ├── lib/               # QueryClient singleton & centralized queryKeys
│   │   ├── pages/             # Route views (Dashboard, Projects, ProjectDetail)
│   │   ├── theme/             # Chakra UI tokens, fonts & color scales
│   │   └── types/             # Shared TypeScript type contracts
│   ├── nginx.conf             # Production SPA web server configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile             # Multi-stage Node 20 + Nginx container
├── docs/                      # Architecture, API guides & implementation references
├── docker-compose.yml         # Full-stack container orchestration
├── .env.example               # Backend environment variable template
├── CONTRIBUTING.md            # Contribution guidelines & code standards
└── README.md                  # Project landing, quick start & documentation
```

---

## 3. Backend Architecture: Clean Layered Pattern

The Django backend enforces a strict separation of concerns to avoid bloated models or controllers:

```mermaid
graph LR
    subgraph Presentation Layer
        URL[urls.py] --> View[views.py]
        View --> Serializer[serializers.py]
    end

    subgraph Business Logic Layer
        View --> Service[services.py]
        Service --> Perms[permissions.py]
    end

    subgraph Persistence Layer
        Service --> Model[models.py]
        Model --> DB[(PostgreSQL)]
    end
```

1. **Views (`views.py`)**: Responsible solely for request parsing, status codes, view-level permissions, and delegating to services.
2. **Serializers (`serializers.py`)**: Handles data validation, deserialization, and representation.
3. **Services (`services.py`)**: Encapsulates business logic, state transitions, domain-level validation, and side effects (e.g., creating `ActivityLog` entries).
4. **Permissions (`permissions.py`)**: Granular authorization (e.g., `IsProjectOwner`, `IsProjectMember`).
5. **Models (`models.py`)**: Database definitions with database constraints, indexes, and relations.

---

## 4. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ PROJECT_MEMBER : "member_of"
    PROJECT ||--o{ PROJECT_MEMBER : "has_members"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ TASK : "created"
    USER ||--o{ TASK : "assigned_to"
    TASK ||--o{ COMMENT : "has_comments"
    USER ||--o{ COMMENT : "authored"
    TASK ||--o{ ACTIVITY_LOG : "has_history"
    USER ||--o{ ACTIVITY_LOG : "triggered_by"

    USER {
        int id PK
        string email UK
        string username
        string role
        datetime date_joined
    }

    PROJECT {
        int id PK
        string name
        string description
        int owner_id FK
        datetime created_at
        datetime updated_at
    }

    PROJECT_MEMBER {
        int id PK
        int project_id FK
        int user_id FK
        string role "OWNER | COLLABORATOR"
        datetime joined_at
    }

    TASK {
        int id PK
        string title
        string description
        string status "TODO | IN_PROGRESS | DONE"
        string priority "LOW | MEDIUM | HIGH"
        int project_id FK
        int creator_id FK
        int assignee_id FK
        date due_date
        datetime created_at
        datetime updated_at
    }

    COMMENT {
        int id PK
        string content
        int task_id FK
        int author_id FK
        datetime created_at
    }

    ACTIVITY_LOG {
        int id PK
        int task_id FK
        int user_id FK
        string action
        json details
        datetime created_at
    }
```

---

## 5. Frontend Architecture & State Topology

TaskFlow uses **TanStack Query v5** for server-state caching and synchronization.

```mermaid
graph TD
    subgraph UI Layer
        Dashboard[DashboardPage]
        ProjectDetail[ProjectDetailPage]
        Kanban[TaskBoard / Kanban]
        InfiniteList[InfiniteTaskList]
    end

    subgraph Hooks Layer
        useInfAll[useInfiniteAllTasks]
        useInfProj[useInfiniteProjectTasks]
        useUpdate[useUpdateTask]
        useCreate[useCreateTask]
    end

    subgraph Cache Layer
        QC[QueryClient Singleton]
        Keys[queryKeys.ts Hierarchy]
    end

    subgraph Network Layer
        Client[api/client.ts]
        BE[(Django REST API)]
    end

    Dashboard --> useInfAll
    ProjectDetail --> useInfProj
    Kanban --> useUpdate
    InfiniteList --> useInfAll
    InfiniteList --> useInfProj

    useInfAll --> QC
    useInfProj --> QC
    useUpdate --> QC
    useCreate --> QC
    QC --> Keys
    QC --> Client
    Client --> BE
```

### 5.1 Query Keys Hierarchy (`src/lib/queryKeys.ts`)
```typescript
queryKeys = {
  projects: {
    all: ['projects'],
    list: () => ['projects', 'list'],
    detail: (id) => ['projects', 'detail', id],
    members: (id) => ['projects', id, 'members'],
  },
  tasks: {
    all: ['tasks'],
    list: () => ['tasks', 'list'],
    infiniteList: () => ['tasks', 'infinite'],
    projectList: (projectId) => ['tasks', 'project', projectId],
    projectInfiniteList: (projectId) => ['tasks', 'project', projectId, 'infinite'],
    detail: (id) => ['tasks', 'detail', id],
    comments: (taskId) => ['tasks', taskId, 'comments'],
    activity: (taskId) => ['tasks', taskId, 'activity'],
  }
}
```

### 5.2 Optimistic Mutation Flow
When a task status is changed via the Kanban board or Infinite List:
1. `onMutate`: Inactive network queries are cancelled. Previous task cache is snapshotted. The local cache is updated immediately.
2. `onError`: If the HTTP PATCH fails, the cache is rolled back to the previous snapshot, and an error toast is surfaced.
3. `onSettled`: Relevant query keys (`['tasks']`) are invalidated in the background to ensure consistency with the database.

---

## 6. Authentication & Security Model

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant React as React SPA
    participant DRF as Django Backend
    participant DB as PostgreSQL

    User->>React: Submit Credentials
    React->>DRF: POST /api/v1/auth/login/
    DRF->>DB: Validate User & Password Hash
    DB-->>DRF: Valid
    DRF-->>React: 200 OK (access_token, refresh_token)
    React->>React: Store tokens in localStorage

    Note over React,DRF: Authenticated Requests
    React->>DRF: GET /api/v1/projects/ (Authorization: Bearer <access>)
    DRF-->>React: 200 OK [Projects]

    Note over React,DRF: Token Expiration & Refresh Flow
    React->>DRF: GET /api/v1/tasks/ (Expired Access Token)
    DRF-->>React: 401 Unauthorized
    React->>DRF: POST /api/v1/auth/token/refresh/ (refresh_token)
    DRF-->>React: 200 OK (new access_token, rotated refresh_token)
    React->>DRF: Retry original request with new access token
    DRF-->>React: 200 OK
```

### Role-Based Access Control (RBAC) Matrix

| Resource / Action | Anonymous | Collaborator | Project Owner | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| View Owned/Member Projects | ❌ | ✅ | ✅ | ✅ |
| Create Project | ❌ | ✅ | ✅ | ✅ |
| Update Project Metadata | ❌ | ❌ | ✅ | ✅ |
| Delete Project | ❌ | ❌ | ✅ | ✅ |
| Invite / Remove Members | ❌ | ❌ | ✅ | ✅ |
| View Project Tasks | ❌ | ✅ | ✅ | ✅ |
| Create / Update Tasks | ❌ | ✅ | ✅ | ✅ |
| Delete Tasks | ❌ | Creator Only | ✅ | ✅ |
| Post / Delete Comments | ❌ | Author Only | ✅ | ✅ |
| View Activity Audit Log | ❌ | ✅ | ✅ | ✅ |

---

## 7. Tracing & Error Handling

- **Request ID Tracing**: Every inbound request is assigned a unique `X-Request-ID` via `core.middleware.RequestIDMiddleware` which is logged and returned in the HTTP response headers.
- **Standardized Error Envelope**:
  ```json
  {
    "error": {
      "code": "PERMISSION_DENIED",
      "message": "You must be the project owner to perform this action.",
      "details": {}
    }
  }
  ```
