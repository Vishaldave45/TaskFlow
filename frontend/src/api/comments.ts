import { apiClient } from './client'
import type { Comment, CommentCreatePayload } from '@/types'

export const commentsApi = {
  listByTask: async (taskId: number): Promise<Comment[]> => {
    return apiClient<Comment[]>(`/tasks/${taskId}/comments/`, {
      method: 'GET',
    })
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
