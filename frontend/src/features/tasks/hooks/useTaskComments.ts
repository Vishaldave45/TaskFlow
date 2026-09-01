import { useQuery } from '@tanstack/react-query'
import { commentsApi } from '@/api/comments'
import { queryKeys } from '@/lib/queryKeys'

export function useTaskComments(taskId?: number) {
  return useQuery({
    queryKey: queryKeys.comments.byTask(taskId!),
    queryFn: () => commentsApi.listByTask(taskId!),
    enabled: Boolean(taskId),
  })
}
