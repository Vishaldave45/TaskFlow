import { apiClient } from './client'
import type { Comment, CommentCreatePayload, PaginatedResponse } from '@/types'

export const commentsApi = {
  listByTask: async (taskId: number): Promise<Comment[]> => {
    const data = await apiClient<Comment[] | PaginatedResponse<Comment>>(`/tasks/${taskId}/comments/`, {
      method: 'GET',
    })
    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as PaginatedResponse<Comment>).results)) {
      return (data as PaginatedResponse<Comment>).results
    }
    return []
  },

  create: async (taskId: number, payload: CommentCreatePayload): Promise<Comment> => {
    return apiClient<Comment>(`/tasks/${taskId}/comments/`, {
      method: 'POST',
      body: payload,
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/comments/${id}/`, {
      method: 'DELETE',
    })
  },
}
