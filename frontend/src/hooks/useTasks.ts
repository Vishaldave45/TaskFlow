import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '@/types/task'
import { toaster } from '@/components/ui/toaster'

export const useTasksQuery = (projectId?: number, filters?: TaskFilters) => {
  return useQuery({
    queryKey: queryKeys.tasks.list(projectId!, filters),
    queryFn: async () => {
      const res = await tasksApi.listForProject(projectId!, filters)
      if (Array.isArray(res)) return res
      return res.results || []
    },
    enabled: !!projectId,
  })
}

export const useTaskQuery = (taskId?: number) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId!),
    queryFn: () => tasksApi.get(taskId!),
    enabled: !!taskId,
  })
}

export const useCreateTaskMutation = (projectId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTaskInput) => tasksApi.create(projectId, payload),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      toaster.create({
        title: 'Task created',
        description: `#TASK-${newTask.id} created successfully.`,
        type: 'success',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create task.'
      toaster.create({
        title: 'Error',
        description: typeof message === 'string' ? message : 'Invalid task data.',
        type: 'error',
      })
    },
  })
}

export const useUpdateTaskMutation = (projectId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: UpdateTaskInput }) =>
      tasksApi.update(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      // Optimistic update for snappy Kanban dragging/status toggle
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all })
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list(projectId!))

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasks.list(projectId!),
          previousTasks.map((t) => (t.id === taskId ? { ...t, ...payload } : t))
        )
      }

      return { previousTasks }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks && projectId) {
        queryClient.setQueryData(queryKeys.tasks.list(projectId), context.previousTasks)
      }
      toaster.create({
        title: 'Update failed',
        type: 'error',
      })
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(vars.taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.list(vars.taskId) })
    },
  })
}

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      toaster.create({
        title: 'Task deleted',
        type: 'success',
      })
    },
  })
}
