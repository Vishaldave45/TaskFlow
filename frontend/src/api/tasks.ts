import { apiClient } from './client'
import { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '@/types/task'
import { PaginatedResponse } from '@/types/api'

export const tasksApi = {
  listForProject: async (
    projectId: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task> | Task[]> => {
    const { data } = await apiClient.get<PaginatedResponse<Task> | Task[]>(
      `/projects/${projectId}/tasks/`,
      { params: filters }
    )
    return data
  },

  get: async (taskId: number): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${taskId}/`)
    return data
  },

  create: async (projectId: number, payload: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post<Task>(`/projects/${projectId}/tasks/`, payload)
    return data
  },

  update: async (taskId: number, payload: UpdateTaskInput): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${taskId}/`, payload)
    return data
  },

  delete: async (taskId: number): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/`)
  },
}
