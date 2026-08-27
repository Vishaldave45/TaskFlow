import { apiClient } from './client'
import type { Task, TaskCreatePayload, TaskFilters, TaskUpdatePayload } from '@/types'

export const tasksApi = {
  listByProject: async (projectId: number, filters: TaskFilters = {}): Promise<Task[]> => {
    return apiClient<Task[]>(`/projects/${projectId}/tasks/`, {
      method: 'GET',
      params: filters as Record<string, string | number | boolean | undefined | null>,
    })
  },

  get: async (id: number): Promise<Task> => {
    return apiClient<Task>(`/tasks/${id}/`, {
      method: 'GET',
    })
  },

  create: async (projectId: number, payload: TaskCreatePayload): Promise<Task> => {
    return apiClient<Task>(`/projects/${projectId}/tasks/`, {
      method: 'POST',
      body: payload,
    })
  },

  update: async (id: number, payload: TaskUpdatePayload): Promise<Task> => {
    return apiClient<Task>(`/tasks/${id}/`, {
      method: 'PATCH',
      body: payload,
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/tasks/${id}/`, {
      method: 'DELETE',
    })
  },
}
