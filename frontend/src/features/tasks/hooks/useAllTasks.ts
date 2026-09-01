import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'

export function useAllTasks(params?: { assigned_to_me?: boolean }) {
  return useQuery({
    queryKey: queryKeys.tasks.allList(params),
    queryFn: () => tasksApi.listAll(params),
  })
}
