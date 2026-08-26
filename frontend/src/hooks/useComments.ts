import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/api/comments'
import { queryKeys } from '@/lib/queryKeys'
import { CreateCommentInput } from '@/types/comment'
import { toaster } from '@/components/ui/toaster'

export const useCommentsQuery = (taskId?: number) => {
  return useQuery({
    queryKey: queryKeys.comments.list(taskId!),
    queryFn: async () => {
      const res = await commentsApi.listForTask(taskId!)
      if (Array.isArray(res)) return res
      return res.results || []
    },
    enabled: !!taskId,
  })
}

export const useCreateCommentMutation = (taskId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCommentInput) => commentsApi.create(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.list(taskId) })
      toaster.create({
        title: 'Comment added',
        type: 'success',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to post comment.'
      toaster.create({
        title: 'Error',
        description: typeof message === 'string' ? message : 'Failed to post comment.',
        type: 'error',
      })
    },
  })
}

export const useDeleteCommentMutation = (taskId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: number) => commentsApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) })
      toaster.create({
        title: 'Comment deleted',
        type: 'success',
      })
    },
  })
}
