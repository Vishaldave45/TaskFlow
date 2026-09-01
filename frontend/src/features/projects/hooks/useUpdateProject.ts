import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'
import type { UpdateProjectVariables } from '@/types'


export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateProjectVariables) =>
      projectsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate project list cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(),
      })
      // Invalidate this specific project's detail cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      })
    },
  })
}
