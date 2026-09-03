# TaskFlow — React Frontend Guide (Scratch → Done)

This builds a React frontend that consumes the Django/DRF API from the backend guide. Same philosophy: clean layering, typed where possible, one vertical feature at a time.

## 0. Stack choices

| Concern | Choice | Why |
|---|---|---|
| Build tool | Vite | Fast dev server, minimal config |
| Language | TypeScript | Matches the backend's "type hints everywhere" discipline |
| Routing | React Router v6 | Standard, works well with nested layouts |
| Server state | TanStack Query (React Query) | Caching, refetching, loading/error states for API calls — don't hand-roll this with useEffect |
| Client/UI state | React state + Context (only where needed, e.g. auth) | Avoid Redux for a project this size |
| Forms | React Hook Form + Zod | Typed validation that mirrors the backend's Pydantic/serializer contracts |
| HTTP client | Axios (with interceptors for JWT refresh) | Cleaner than raw fetch for auth header injection + refresh-on-401 |
| Styling | Tailwind CSS | Fast to build with, easy to keep consistent |

---

## 1. Bootstrap

```bash
npm create vite@latest taskflow-frontend -- --template react-ts
cd taskflow-frontend
npm install react-router-dom @tanstack/react-query axios \
            react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js` → set `content: ["./index.html", "./src/**/*.{ts,tsx}"]`. Add the Tailwind directives to `src/index.css`.

---

## 2. Project structure

```
src/
├── main.tsx
├── App.tsx
├── api/
│   ├── client.ts          # axios instance + interceptors
│   ├── auth.ts            # register/login/logout/me calls
│   ├── projects.ts
│   ├── tasks.ts
│   └── comments.ts
├── types/
│   ├── user.ts
│   ├── project.ts
│   ├── task.ts
│   └── comment.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useProjectMembers.ts
│   ├── useTasks.ts
│   └── useComments.ts
├── context/
│   └── AuthContext.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── MemberList.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskDetail.tsx
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   └── CommentForm.tsx
│   └── activity/
│       └── ActivityFeed.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   └── TaskDetailPage.tsx
└── lib/
    └── queryKeys.ts
```

`api/` = your only layer that knows about HTTP/URLs. `hooks/` = React Query wrappers (the "service layer" of the frontend). `components/` and `pages/` never call `axios` directly — same separation-of-concerns discipline as the backend.

---

## 3. Types mirror the backend contracts

```typescript
// src/types/task.ts
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: number;
  creator: number;
  assignee: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
```

Keep an input type (`TaskCreateInput`) separate from the entity type (`Task`) — same reason the backend keeps `TaskCreate` separate from `TaskResponse`.

---

## 4. API client with JWT refresh

```typescript
// src/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing ??= refreshAccessToken();
      try {
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      } finally {
        refreshing = null;
      }
    }
    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refresh_token");
  const { data } = await axios.post(
    `${apiClient.defaults.baseURL}/auth/token/refresh`,
    { refresh }
  );
  localStorage.setItem("access_token", data.access);
  return data.access;
}
```

This is the piece people usually skip and then wonder why users get logged out every 30 minutes — the interceptor transparently refreshes on a 401 instead of bouncing the user.

---

## 5. Auth context + hook

```typescript
// src/api/auth.ts
import { apiClient } from "./client";

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    apiClient.post("/auth/register", data),

  login: async (data: { email: string; password: string }) => {
    const { data: tokens } = await apiClient.post("/auth/login", data);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    return tokens;
  },

  logout: async () => {
    const refresh = localStorage.getItem("refresh_token");
    await apiClient.post("/auth/logout", { refresh });
    localStorage.clear();
  },

  me: () => apiClient.get("/users/me").then((r) => r.data),
};
```

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/auth";
import type { User } from "../types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setLoading(false);
      return;
    }
    authApi.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await authApi.login({ email, password });
    setUser(await authApi.me());
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

Wrap `<App />` in `<AuthProvider>` in `main.tsx`, alongside `<QueryClientProvider>`.

---

## 6. React Query hooks (the "service layer")

```typescript
// src/api/tasks.ts
import { apiClient } from "./client";
import type { Task, TaskCreateInput, PaginatedResponse } from "../types/task";

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee?: number;
  page?: number;
  page_size?: number;
}

export const tasksApi = {
  list: (projectId: number, filters: TaskFilters = {}) =>
    apiClient
      .get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, { params: filters })
      .then((r) => r.data),

  get: (taskId: number) => apiClient.get<Task>(`/tasks/${taskId}`).then((r) => r.data),

  create: (projectId: number, data: TaskCreateInput) =>
    apiClient.post<Task>(`/projects/${projectId}/tasks`, data).then((r) => r.data),

  update: (taskId: number, data: Partial<TaskCreateInput & { status: string }>) =>
    apiClient.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data),

  remove: (taskId: number) => apiClient.delete(`/tasks/${taskId}`),
};
```

```typescript
// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, TaskFilters } from "../api/tasks";
import type { TaskCreateInput } from "../types/task";

export function useTasks(projectId: number, filters: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: () => tasksApi.list(projectId, filters),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreateInput) => tasksApi.create(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useUpdateTaskStatus(taskId: number, projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => tasksApi.update(taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}
```

Components call `useTasks(...)` / `useCreateTask(...)` — never `tasksApi` directly, never raw `axios`. Loading/error/caching are handled once, here, instead of re-implemented in every component.

---

## 7. Example components

**Filters drive the query params directly (§21 pagination/filtering, client side):**

```tsx
// src/components/tasks/TaskFilters.tsx
interface Props {
  value: { status?: string; priority?: string };
  onChange: (v: { status?: string; priority?: string }) => void;
}

export function TaskFilters({ value, onChange }: Props) {
  return (
    <div className="flex gap-3">
      <select
        value={value.status ?? ""}
        onChange={(e) => onChange({ ...value, status: e.target.value || undefined })}
        className="border rounded px-2 py-1"
      >
        <option value="">All statuses</option>
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={value.priority ?? ""}
        onChange={(e) => onChange({ ...value, priority: e.target.value || undefined })}
        className="border rounded px-2 py-1"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
    </div>
  );
}
```

**Task list, wired to the filters + pagination:**

```tsx
// src/components/tasks/TaskList.tsx
import { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { TaskFilters } from "./TaskFilters";
import { TaskCard } from "./TaskCard";

export function TaskList({ projectId }: { projectId: number }) {
  const [filters, setFilters] = useState<{ status?: string; priority?: string }>({});
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useTasks(projectId, { ...filters, page });

  if (isLoading) return <p>Loading tasks…</p>;
  if (isError) return <p className="text-red-600">Couldn't load tasks.</p>;

  return (
    <div className="space-y-4">
      <TaskFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />
      <div className="grid gap-3">
        {data!.results.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <div className="flex gap-2">
        <button disabled={!data?.previous} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <button disabled={!data?.next} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
```

**Form with Zod validation matching the backend serializer:**

```tsx
// src/components/tasks/TaskForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "../../hooks/useTasks";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  due_date: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export function TaskForm({ projectId, onCreated }: { projectId: number; onCreated?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { priority: "MEDIUM" } });
  const createTask = useCreateTask(projectId);

  const onSubmit = handleSubmit(async (values) => {
    await createTask.mutateAsync(values);
    reset();
    onCreated?.();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input {...register("title")} placeholder="Task title" className="border rounded px-2 py-1 w-full" />
      {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

      <textarea {...register("description")} placeholder="Description" className="border rounded px-2 py-1 w-full" />

      <select {...register("priority")} className="border rounded px-2 py-1">
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <input type="date" {...register("due_date")} className="border rounded px-2 py-1" />

      <button type="submit" disabled={isSubmitting} className="bg-black text-white px-3 py-1 rounded">
        Create task
      </button>
    </form>
  );
}
```

---

## 8. Routing + protected routes

```tsx
// src/components/layout/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
```

```tsx
// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 9. Handling backend error shapes consistently

Your Django exception handler returns `{"detail": "..."}` for most errors and DRF's default field-level shape (`{"field": ["msg"]}`) for validation errors. Centralize the parsing so components don't each reinvent it:

```typescript
// src/lib/errors.ts
import { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (typeof data?.detail === "string") return data.detail;
    if (data && typeof data === "object") {
      const firstField = Object.values(data)[0];
      if (Array.isArray(firstField)) return String(firstField[0]);
    }
  }
  return "Something went wrong. Please try again.";
}
```

Use it in mutation `onError` handlers and in forms to surface 403 ("not a project member") vs 409 ("duplicate member") vs 422 (validation) distinctly if you want, or generically.

---

## 10. Testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw
```

- **Component/unit tests**: Vitest + React Testing Library for components like `TaskForm` (validation errors show, submit calls the mutation).
- **API mocking**: MSW (Mock Service Worker) to intercept `axios` calls in tests, so you test hooks/components against a fake backend instead of a real one.
- **E2E** (optional but recommended once core flows work): Playwright, hitting a real running Django instance (e.g. via Docker Compose) for register → login → create project → create task → comment.

---

## 11. Suggested build order

1. **Scaffolding** — Vite + TS + Tailwind + React Router + React Query wired up, empty pages routed.
2. **Auth** — register/login pages, `AuthContext`, `ProtectedRoute`, JWT refresh interceptor. Confirm you stay logged in across a refresh.
3. **Projects** — list + create + detail page, using the hooks pattern.
4. **Project members** — add/remove/list members on the project detail page.
5. **Tasks** — list with filters + pagination, create form, detail page, status/priority updates.
6. **Comments** — list + create + edit/delete own comment on the task detail page.
7. **Activity feed** — read-only feed on the task detail page, driven by `GET /tasks/{id}/activity`.
8. **Error/loading polish** — consistent loading skeletons, error banners via `extractErrorMessage`, empty states.
9. **Tests** — component tests for forms/lists, MSW-backed hook tests, then an E2E happy path.

Build against the real Django backend running via `docker compose up` from the start (point `VITE_API_BASE_URL` at `http://localhost:8000/api/v1`) rather than mocking everything — you'll catch schema mismatches between the two sides immediately instead of at integration time.
