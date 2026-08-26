import { User } from './auth'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: number
  creator: User
  assignee: User | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  assignee_id?: number | null
  due_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: number | null
  due_date?: string | null
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: number
  search?: string
  due_date_after?: string
  due_date_before?: string
  ordering?: string
}
