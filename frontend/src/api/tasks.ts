import { apiClient } from './client'
import type { Task, PaginatedResponse } from '@/types'

/** Response shape for cursor-paginated global task list */
export interface CursorPaginatedResponse<T> {
  next: string | null
  previous: string | null
  results: T[]
}

/** Response shape for limit/offset-paginated project task list */
export interface OffsetPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const tasksApi = {
  /**
   * Fetch all accessible tasks (unpaginated — flattens paginated response).
   * Used by TanStack DB collection sync and backward-compatible hooks.
   */
  async listAll(params?: { assigned_to_me?: boolean }): Promise<Task[]> {
    const query = params?.assigned_to_me ? '?assigned_to_me=true' : ''
    const data = await apiClient<PaginatedResponse<Task> | Task[]>(`/tasks/${query}`)
    if (Array.isArray(data)) return data
    return data.results || []
  },

  /**
   * Fetch global tasks with cursor-based pagination.
   * Returns the raw paginated response for infinite scroll.
   * @param cursor - Cursor string from a previous `next` URL
   */
  async listAllPaginated(params?: {
    cursor?: string
    assigned_to_me?: boolean
  }): Promise<CursorPaginatedResponse<Task>> {
    const searchParams = new URLSearchParams()
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.assigned_to_me) searchParams.set('assigned_to_me', 'true')
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient<CursorPaginatedResponse<Task>>(`/tasks/${query}`)
  },

  /**
   * Fetch tasks for a specific project (unpaginated — flattens paginated response).
   * Used by Kanban board which needs all tasks for drag-and-drop.
   */
  async listByProject(projectId: number): Promise<Task[]> {
    const data = await apiClient<PaginatedResponse<Task> | Task[]>(`/projects/${projectId}/tasks/`)
    if (Array.isArray(data)) return data
    return data.results || []
  },

  /**
   * Fetch project tasks with offset-based pagination.
   * Returns the raw paginated response for infinite scroll.
   * @param offset - Starting position for the page
   * @param limit - Number of items per page
   */
  async listByProjectPaginated(
    projectId: number,
    params?: { offset?: number; limit?: number },
  ): Promise<OffsetPaginatedResponse<Task>> {
    const searchParams = new URLSearchParams()
    if (params?.offset !== undefined) searchParams.set('offset', String(params.offset))
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient<OffsetPaginatedResponse<Task>>(`/projects/${projectId}/tasks/${query}`)
  },

  async get(taskId: number): Promise<Task> {
    return apiClient<Task>(`/tasks/${taskId}/`)
  },

  async create(projectId: number, data: {
    title: string
    description?: string
    priority?: string
    assignee_id?: number | null
    due_date?: string | null
  }): Promise<Task> {
    return apiClient<Task>(`/projects/${projectId}/tasks/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(taskId: number, data: Partial<{
    title: string
    description: string
    status: string
    priority: string
    assignee_id: number | null
    due_date: string | null
  }>): Promise<Task> {
    return apiClient<Task>(`/tasks/${taskId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(taskId: number): Promise<void> {
    return apiClient<void>(`/tasks/${taskId}/`, {
      method: 'DELETE',
    })
  },
}
