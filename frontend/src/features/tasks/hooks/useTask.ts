import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'

export function useTask(taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId!),
    queryFn: () => tasksApi.get(taskId!),
    enabled: Boolean(taskId),
  })
}
