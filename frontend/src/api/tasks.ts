import { apiClient } from './client'
import type { Task, PaginatedResponse } from '@/types'

export const tasksApi = {
  async listByProject(projectId: number): Promise<Task[]> {
    const data = await apiClient<PaginatedResponse<Task> | Task[]>(`/projects/${projectId}/tasks/`)
    if (Array.isArray(data)) return data
    return data.results || []
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
