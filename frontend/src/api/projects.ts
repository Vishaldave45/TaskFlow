import { apiClient } from './client'
import { AddMemberInput, CreateProjectInput, Project, ProjectMember } from '@/types/project'

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects/')
    return data
  },

  get: async (projectId: number): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${projectId}/`)
    return data
  },

  create: async (payload: CreateProjectInput): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects/', payload)
    return data
  },

  update: async (projectId: number, payload: Partial<CreateProjectInput>): Promise<Project> => {
    const { data } = await apiClient.put<Project>(`/projects/${projectId}/`, payload)
    return data
  },

  delete: async (projectId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/`)
  },

  listMembers: async (projectId: number): Promise<ProjectMember[]> => {
    const { data } = await apiClient.get<ProjectMember[]>(`/projects/${projectId}/members/`)
    return data
  },

  addMember: async (projectId: number, payload: AddMemberInput): Promise<ProjectMember> => {
    const { data } = await apiClient.post<ProjectMember>(`/projects/${projectId}/members/`, payload)
    return data
  },

  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}/`)
  },
}
