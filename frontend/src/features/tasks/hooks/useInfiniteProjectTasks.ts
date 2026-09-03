import { useInfiniteQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'

const PAGE_SIZE = 20

/**
 * Infinite query hook for project-scoped tasks (offset-based pagination).
 *
 * Uses limit/offset pagination since project tasks are a bounded set
 * and offset supports random access (useful for total count).
 */
export function useInfiniteProjectTasks(projectId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.tasks.infiniteProject(projectId),
    queryFn: ({ pageParam = 0 }) =>
      tasksApi.listByProjectPaginated(projectId, {
        offset: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // If there's a next URL, there are more pages
      if (!lastPage.next) return undefined
      return (lastPageParam as number) + PAGE_SIZE
    },
    enabled: Boolean(projectId),
  })
}
