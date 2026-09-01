import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/api/comments'
import { queryKeys } from '@/lib/queryKeys'

interface CreateCommentVariables {
  taskId: number
  content: string
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, content }: CreateCommentVariables) =>
      commentsApi.create(taskId, { content }),
    onSuccess: (_newComment, { taskId }) => {
      // Invalidate the comments query for this task
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTask(taskId),
      })
      // Also refresh the task activity log
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity.byTask(taskId),
      })
    },
  })
}
