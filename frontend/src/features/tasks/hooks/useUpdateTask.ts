import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { Task, UpdateTaskVariables } from '@/types'

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: UpdateTaskVariables) =>
      tasksApi.update(taskId, data),

    // 1. When mutate is called, apply optimistic update immediately
    onMutate: async (variables: UpdateTaskVariables) => {
      const { taskId, projectId, data } = variables

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all })

      // Snapshot the previous values for rollback on error
      const previousProjectTasks = projectId
        ? queryClient.getQueryData<Task[]>(queryKeys.tasks.projectList(projectId))
        : undefined

      const previousGlobalTasks = queryClient.getQueryData<Task[]>(
        queryKeys.tasks.allList()
      )

      const previousTaskDetail = queryClient.getQueryData<Task>(
        queryKeys.tasks.detail(taskId)
      )

      // Optimistically update the project tasks list
      if (projectId && previousProjectTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasks.projectList(projectId),
          (oldTasks) => {
            if (!oldTasks) return []
            return oldTasks.map((task) =>
              task.id === taskId ? { ...task, ...data } : task
            )
          }
        )
      }

      // Optimistically update global tasks list (used by Dashboard)
      if (previousGlobalTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasks.allList(),
          (oldTasks) => {
            if (!oldTasks) return []
            return oldTasks.map((task) =>
              task.id === taskId ? { ...task, ...data } : task
            )
          }
        )
      }

      // Optimistically update single task detail
      if (previousTaskDetail) {
        queryClient.setQueryData<Task>(
          queryKeys.tasks.detail(taskId),
          (oldTask) => (oldTask ? { ...oldTask, ...data } : oldTask)
        )
      }

      // Return context with snapshots for onError rollback
      return {
        previousProjectTasks,
        previousGlobalTasks,
        previousTaskDetail,
        projectId,
        taskId,
      }
    },

    // 2. If the mutation fails, rollback to snapshot
    onError: (_err, _variables, context) => {
      if (context?.projectId && context.previousProjectTasks) {
        queryClient.setQueryData(
          queryKeys.tasks.projectList(context.projectId),
          context.previousProjectTasks
        )
      }

      if (context?.previousGlobalTasks) {
        queryClient.setQueryData(
          queryKeys.tasks.allList(),
          context.previousGlobalTasks
        )
      }

      if (context?.taskId && context.previousTaskDetail) {
        queryClient.setQueryData(
          queryKeys.tasks.detail(context.taskId),
          context.previousTaskDetail
        )
      }
    },

    // 3. Always refetch on settled to sync with server truth
    onSettled: (_data, _error, { taskId, projectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      })

      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.projectList(projectId),
        })
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      })
    },
  })
}
