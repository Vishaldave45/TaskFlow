import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { UpdateTaskVariables } from '@/types'

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskVariables) =>
      tasksApi.update(taskId, data),
    onSuccess: (updatedTask, { taskId, projectId }) => {
      // Invalidate the single task's detail query
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      })

      // If projectId is provided or available on the updated task, invalidate its project task list
      const pid = projectId ?? updatedTask.project
      if (pid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.projectList(pid),
        })
      }

      // Invalidate global tasks (for dashboard sync)
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      })
    },
  })
}
