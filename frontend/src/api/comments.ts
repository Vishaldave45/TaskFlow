import { apiClient } from './client'
import type { Comment, PaginatedResponse } from '@/types'

export const commentsApi = {
  async listByTask(taskId: number): Promise<Comment[]> {
    const data = await apiClient<PaginatedResponse<Comment> | Comment[]>(`/tasks/${taskId}/comments/`)
    if (Array.isArray(data)) return data
    return data.results || []
  },

  async create(taskId: number, data: { content: string }): Promise<Comment> {
    return apiClient<Comment>(`/tasks/${taskId}/comments/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async delete(commentId: number): Promise<void> {
    return apiClient<void>(`/comments/${commentId}/`, {
      method: 'DELETE',
    })
  },
}
