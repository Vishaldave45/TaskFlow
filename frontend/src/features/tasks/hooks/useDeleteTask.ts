import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { DeleteTaskVariables } from '@/types'

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId }: DeleteTaskVariables) =>
      tasksApi.delete(taskId),
    onSuccess: (_, { taskId, projectId }) => {
      // Invalidate project task list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.projectList(projectId),
      })

      // Completely purge deleted task detail from cache
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      })

      // Invalidate global tasks (dashboard sync)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      })
    },
  })
}
