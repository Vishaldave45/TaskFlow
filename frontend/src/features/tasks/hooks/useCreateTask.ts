import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { CreateTaskVariables } from '@/types'

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, data }: CreateTaskVariables) =>
      tasksApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      // Invalidate the project task list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.projectList(projectId),
      })
      // Also invalidate all tasks (e.g. for dashboard counts/lists)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      })
    },
  })
}
