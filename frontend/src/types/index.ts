// User & Auth Types
export interface User {
  id: number
  username: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// Project Types
export interface Project {
  id: number
  name: string
  description: string
  owner: User
  members_count?: number
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: number
  user: User
  role: string
  joined_at: string
}

// Task Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: User | null
  creator?: User
  project: number
  due_date: string | null
  created_at: string
  updated_at: string
}

// Comment Types
export interface Comment {
  id: number
  content: string
  author: User
  task: number
  created_at: string
}

// Activity Types
export type ActivityAction =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'

export interface Activity {
  id: number
  project: number
  user: User
  action: ActivityAction
  details: Record<string, unknown>
  created_at: string
}

export type ActivityLog = Activity

// Paginated Response
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Project Payloads
export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
}

export interface UpdateProjectVariables {
  id: number
  data: UpdateProjectPayload
}

// Task Payloads & Variables
export interface CreateTaskPayload {
  title: string
  description?: string
  priority?: TaskPriority
  assignee_id?: number | null
  due_date?: string | null
}

export interface CreateTaskVariables {
  projectId: number
  data: CreateTaskPayload
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: number | null
  due_date?: string | null
}

export interface UpdateTaskVariables {
  taskId: number
  projectId?: number
  data: UpdateTaskPayload
}

export interface DeleteTaskVariables {
  taskId: number
  projectId: number
}
