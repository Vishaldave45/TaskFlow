import { apiClient } from './client'
import { Comment, CreateCommentInput, UpdateCommentInput } from '@/types/comment'
import { PaginatedResponse } from '@/types/api'

export const commentsApi = {
  listForTask: async (taskId: number): Promise<PaginatedResponse<Comment> | Comment[]> => {
    const { data } = await apiClient.get<PaginatedResponse<Comment> | Comment[]>(
      `/tasks/${taskId}/comments/`
    )
    return data
  },

  create: async (taskId: number, payload: CreateCommentInput): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>(`/tasks/${taskId}/comments/`, payload)
    return data
  },

  update: async (commentId: number, payload: UpdateCommentInput): Promise<Comment> => {
    const { data } = await apiClient.patch<Comment>(`/comments/${commentId}/`, payload)
    return data
  },

  delete: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}/`)
  },
}
