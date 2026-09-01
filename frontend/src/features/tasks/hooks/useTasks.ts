import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'

export function useTasks(projectId: number) {
  return useQuery({
    queryKey: queryKeys.tasks.projectList(projectId),
    queryFn: () => tasksApi.listByProject(projectId),
    enabled: Boolean(projectId),
  })
}
