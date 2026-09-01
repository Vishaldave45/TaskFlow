import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/api/activity'
import { queryKeys } from '@/lib/queryKeys'

export function useTaskActivity(taskId?: number) {
  return useQuery({
    queryKey: queryKeys.activity.byTask(taskId!),
    queryFn: () => activityApi.listByTask(taskId!),
    enabled: Boolean(taskId),
  })
}
