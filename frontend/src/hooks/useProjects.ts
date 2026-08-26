import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'
import { CreateProjectInput } from '@/types/project'
import { toaster } from '@/components/ui/toaster'

export const useProjectsQuery = () => {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectsApi.list(),
  })
}

export const useProjectQuery = (projectId?: number) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId!),
    queryFn: () => projectsApi.get(projectId!),
    enabled: !!projectId,
  })
}

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProjectInput) => projectsApi.create(payload),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toaster.create({
        title: 'Project created',
        description: `Project "${newProject.name}" has been created.`,
        type: 'success',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create project.'
      toaster.create({
        title: 'Error',
        description: typeof message === 'string' ? message : 'Invalid project data.',
        type: 'error',
      })
    },
  })
}

export const useUpdateProjectMutation = (projectId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<CreateProjectInput>) => projectsApi.update(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toaster.create({
        title: 'Project updated',
        type: 'success',
      })
    },
  })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: number) => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() })
      toaster.create({
        title: 'Project deleted',
        type: 'success',
      })
    },
  })
}
