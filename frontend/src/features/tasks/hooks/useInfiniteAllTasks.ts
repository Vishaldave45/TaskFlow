import { useInfiniteQuery } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'

/**
 * Infinite query hook for the global task list (cursor-based pagination).
 *
 * Django REST Framework's CursorPagination returns a `next` URL containing
 * the cursor parameter. We extract it and pass it to the next fetch call.
 */
export function useInfiniteAllTasks(params?: { assigned_to_me?: boolean }) {
  return useInfiniteQuery({
    queryKey: queryKeys.tasks.infiniteAll(params),
    queryFn: ({ pageParam }) =>
      tasksApi.listAllPaginated({
        cursor: pageParam,
        assigned_to_me: params?.assigned_to_me,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      // Extract cursor from the full URL returned by DRF CursorPagination
      try {
        const url = new URL(lastPage.next)
        return url.searchParams.get('cursor') ?? undefined
      } catch {
        // If it's a relative URL, parse the query string directly
        const match = lastPage.next.match(/[?&]cursor=([^&]+)/)
        return match?.[1] ?? undefined
      }
    },
  })
}
