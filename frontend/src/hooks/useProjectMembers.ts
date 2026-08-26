import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'
import { AddMemberInput } from '@/types/project'
import { toaster } from '@/components/ui/toaster'

export const useProjectMembersQuery = (projectId?: number) => {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId!),
    queryFn: () => projectsApi.listMembers(projectId!),
    enabled: !!projectId,
  })
}

export const useAddMemberMutation = (projectId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddMemberInput) => projectsApi.addMember(projectId, payload),
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(projectId) })
      toaster.create({
        title: 'Member added',
        description: `${member.user.email} joined the project.`,
        type: 'success',
      })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to add member.'
      toaster.create({
        title: 'Error',
        description: typeof message === 'string' ? message : 'Failed to add member.',
        type: 'error',
      })
    },
  })
}

export const useRemoveMemberMutation = (projectId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.members(projectId) })
      toaster.create({
        title: 'Member removed',
        type: 'success',
      })
    },
  })
}
