import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate project list cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(),
      })
      // Completely purge the deleted project's detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(id),
      })
    },
  })
}
