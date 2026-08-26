import { useQuery } from '@tanstack/react-query'
import { activityApi } from '@/api/activity'
import { queryKeys } from '@/lib/queryKeys'

export const useActivityQuery = (taskId?: number) => {
  return useQuery({
    queryKey: queryKeys.activity.list(taskId!),
    queryFn: async () => {
      const res = await activityApi.listForTask(taskId!)
      if (Array.isArray(res)) return res
      return res.results || []
    },
    enabled: !!taskId,
  })
}
