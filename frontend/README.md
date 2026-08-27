# ⚛️ TaskFlow Frontend

A modern, high-performance **React 19 + TypeScript + Vite + Chakra UI** web application for TaskFlow with full Role-Based Access Control, Kanban boards, sprint metrics, and real-time task discussions.

---

## 🎨 Design System & Theme

TaskFlow uses a **Clean Minimalist Modern SaaS** design language:
- **Canvas / Background**: Crisp Cool Slate (`#F8FAFC`) with pure white card surfaces (`#FFFFFF`).
- **Brand Identity**: Sapphire Blue (`#2563EB`) with soft blue tint selections (`#EFF6FF`).
- **Typography**: IBM Plex Sans with IBM Plex Mono for IDs/code metrics.
- **Component Themes**: Pre-configured Chakra UI themes in `src/theme/` (`Button`, `Card`, `Badge`, `Input`, `Modal`, `Tabs`).

---

## 📁 Architecture & Folder Structure

```
frontend/
├── src/
│   ├── api/                    # Typed Fetch HTTP Client with JWT auto-refresh
│   │   ├── client.ts           # Central API client & error handler
│   │   ├── auth.ts             # Login, register, profile, logout
│   │   ├── projects.ts         # Project CRUD & member management
│   │   ├── tasks.ts            # Task CRUD, filters & status transitions
│   │   ├── comments.ts         # Comment feed & moderation
│   │   └── activity.ts         # Automated audit history
│   │
│   ├── components/
│   │   └── layout/             # Navbar, AppLayout, ProtectedRoute, PublicOnlyRoute
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Global JWT authentication provider & user state
│   │
│   ├── hooks/
│   │   └── useAuth.ts          # Authentication hook
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx       # Auth login page with validation alerts
│   │   ├── RegisterPage.tsx    # Auth registration with password checks
│   │   ├── ProjectsPage.tsx    # Projects dashboard with role tabs (Owned / Shared)
│   │   └── ProjectDetailPage.tsx # Kanban board, Sprint progress, Member RBAC & Task modal
│   │
│   ├── theme/                  # Extended Chakra UI design system
│   ├── types/                  # Shared TypeScript interfaces & models
│   ├── App.tsx                 # Client-side router setup
│   └── main.tsx                # Application root with ChakraProvider & AuthProvider
│
├── package.json
├── tsconfig.app.json
└── vite.config.ts              # Vite config with /api proxy to http://127.0.0.1:8000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will start on **`http://localhost:3000`**.

### 3. Build for Production
```bash
npm run build
```

---

## 🔐 Key Frontend Features

1. **Role-Based Access Control (RBAC)**:
   - **Project Owner (`👑`)**: Can invite/remove collaborators, delete the project, edit task properties, and moderate comments.
   - **Collaborator (`🛡️`)**: Can move tasks across Kanban lanes, create new tasks, update descriptions, and post comments.
2. **Interactive Kanban Board**:
   - Dynamic columns: `To Do`, `In Progress`, and `Done`.
   - Card quick-shift action menus (`⋮`) to move tasks without opening modals.
   - Priority indicator rails (`High` in Red, `Medium` in Amber, `Low` in Slate).
   - Overdue due-date alerts.
3. **Sprint Velocity Tracker**:
   - Live completion progress bar (`X of Y tasks completed (Z%)`).
4. **Task Detail Modal & Inline Editing**:
   - Edit task title, description, priority, assignee, and due date directly in-modal.
   - Live threaded comments feed with instant delete options for authors/owners.
   - Complete task audit trail timeline.
5. **Zero-Dependency JWT Client**:
   - Automatically injects `Authorization: Bearer <token>` on all API calls.
   - Handles automatic token refreshing via `/api/v1/auth/token/refresh/` on HTTP 401s.
