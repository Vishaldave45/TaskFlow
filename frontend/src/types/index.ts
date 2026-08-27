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
  updated_at: string
}

// Activity Log Types
export interface ActivityLog {
  id: number
  action: string
  user: User | null
  task: number
  old_value: string | null
  new_value: string | null
  created_at: string
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
