import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/api/comments'
import { queryKeys } from '@/lib/queryKeys'

interface DeleteCommentVariables {
  commentId: number
  taskId: number
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentVariables) =>
      commentsApi.delete(commentId),
    onSuccess: (_data, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byTask(taskId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.activity.byTask(taskId),
      })
    },
  })
}
