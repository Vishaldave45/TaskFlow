# TaskFlow — Architecture & TanStack Implementation Reference

This document serves as the single source of truth for the frontend state management, query cache topology, mutation workflows, optimistic updates, and component architecture implemented across TaskFlow.

---

## 1. Executive Summary & Core Principles

TaskFlow separates **UI State** (modals, local filters, active tabs) from **Server State** (projects, tasks, comments, memberships).

- **UI State**: Handled locally with React hooks (`useState`, Chakra's `useDisclosure`).
- **Server State**: Managed exclusively through **TanStack Query v5**, guaranteeing automatic deduplication, background synchronization, and predictable cache invalidations.
- **Microcopy**: State-driven and contextual, reflecting live sprint metrics rather than static decorative slogans.

---

## 2. Infrastructure & Provider Setup

### 2.1 Query Client Configuration
Located at `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes before refetching in background
      gcTime: 1000 * 60 * 10,   // 10 minutes inactive cache retention
      retry: 1,                 // 1 automatic retry on network failure
      refetchOnWindowFocus: false,
    },
  },
})
```

### 2.2 Provider Hierarchy
Configured in `src/main.tsx`:

```tsx
<React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </QueryClientProvider>
</React.StrictMode>
```

---

## 3. Query Key Topology

All cache keys are centralized and typed in `src/lib/queryKeys.ts` to avoid accidental key collision and make bulk invalidation intuitive.

```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.projects.all, 'detail', id] as const,
    members: (id: number) => [...queryKeys.projects.detail(id), 'members'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    allList: (params?: { assigned_to_me?: boolean }) =>
      [...queryKeys.tasks.all, 'allList', params] as const,
    projectList: (projectId: number) =>
      [...queryKeys.tasks.all, 'project', projectId] as const,
    detail: (taskId: number) =>
      [...queryKeys.tasks.all, 'detail', taskId] as const,
  },
  comments: {
    byTask: (taskId: number) => ['comments', 'task', taskId] as const,
  },
  activity: {
    byTask: (taskId: number) => ['activity', 'task', taskId] as const,
  },
}
```

---

## 4. Feature Hooks Matrix

### 4.1 Projects Feature (`src/features/projects/`)
| Hook | Type | Cache Key | Trigger / Invalidation |
| :--- | :--- | :--- | :--- |
| `useProjects()` | Query | `['projects', 'list']` | Reads user projects (Owned & Collaborations) |
| `useCreateProject()` | Mutation | N/A | Invalidates `['projects', 'list']` on success |
| `useUpdateProject()` | Mutation | N/A | Invalidates `['projects', 'list']` & `['projects', 'detail', id]` |
| `useDeleteProject()` | Mutation | N/A | Invalidates `['projects', 'list']`, calls `removeQueries` on `['projects', 'detail', id]` |

### 4.2 Tasks Feature (`src/features/tasks/`)
| Hook | Type | Cache Key | Invalidation / Action |
| :--- | :--- | :--- | :--- |
| `useTasks(projectId)` | Query | `['tasks', 'project', projectId]` | Loads tasks for project Kanban board |
| `useAllTasks(params)` | Query | `['tasks', 'allList', params]` | Loads global tasks for Dashboard |
| `useTask(taskId)` | Query | `['tasks', 'detail', taskId]` | Loads single task modal details |
| `useCreateTask()` | Mutation | N/A | Invalidates `['tasks', 'project', projectId]` & `['tasks']` |
| `useUpdateTask()` | Mutation | N/A | Supports optimistic status updates & invalidates task/project/global keys |
| `useDeleteTask()` | Mutation | N/A | Invalidates `['tasks', 'project', pid]` and purges `['tasks', 'detail', taskId]` |

---

## 5. Cache Lifecycle & Mutation Flow

```
                      User Action (e.g. Move Task)
                                  │
                                  ▼
                        useUpdateTask.mutate()
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
      [Step 1: onMutate]                             [Step 2: Network]
  • Cancel active refetches                       • tasksApi.update(...)
  • Snapshot current cache
  • Optimistically write draft
          │
          ├───────────────────────────────┬───────────────────────────────┐
          ▼                               ▼                               ▼
      [Success]                       [Failure]                       [Settled]
  • Keep UI updated               • Revert to snapshot in onError • Invalidate keys
  • Background sync matches truth • Show error notification       • Fresh data ensured
```

---

## 6. State-Driven Contextual Microcopy (Dashboard)

The dashboard replaces static slogans with reactive copy that computes strings dynamically based on live data values:

```typescript
// 1. Task Volume Framing
const getTasksCopy = (count: number) => {
  if (count === 0) return 'Inbox clear — nothing on your plate right now'
  if (count === 1) return '1 task assigned and ready to tackle'
  if (count <= 3) return `${count} tasks assigned across your active projects`
  return `${count} tasks in flight — recommended to prioritize`
}

// 2. Sprint Velocity Framing
const getVelocityCopy = (pct: number, completed: number, total: number) => {
  if (total === 0) return 'No tasks created yet to track velocity'
  if (pct >= 80) return `Strong sprint pace — ${completed} of ${total} wrapped`
  if (pct >= 50) return `On track — ${completed} of ${total} completed`
  if (pct > 0) return `Sprint in motion — ${completed} of ${total} finished`
  return `Sprint kicked off — 0 of ${total} done`
}

// 3. Overdue & Urgency Alerting
const getOverdueCopy = (overdueCount: number, highPriorityCount: number) => {
  if (overdueCount === 0 && highPriorityCount === 0) return 'All clean — no overdue or urgent tasks'
  if (overdueCount === 0) return `${highPriorityCount} high-priority tasks on schedule`
  if (overdueCount === 1) return '1 item is past due — tackle this first'
  return `${overdueCount} items past due — attention required`
}
```

---

## 7. Next Step: Kanban Drag-and-Drop Architecture (`@dnd-kit`)

### Target Structure
- **Root Context**: `<DndContext onDragEnd={handleDragEnd} sensors={sensors}>` in `TaskBoard.tsx`.
- **Column Containers**: `<SortableContext items={columnTaskIds}>` in each of the 3 status columns.
- **Card Items**: `useSortable({ id: task.id })` in `TaskCard.tsx`.
- **Latency**: 0ms visual transfer powered by `onMutate` cache snapshots.
