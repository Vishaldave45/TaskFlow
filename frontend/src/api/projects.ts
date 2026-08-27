import { apiClient } from './client'
import type {
  Project,
  ProjectCreatePayload,
  ProjectMember,
  ProjectMemberAddPayload,
  ProjectUpdatePayload,
} from '@/types'

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    return apiClient<Project[]>('/projects/', {
      method: 'GET',
    })
  },

  get: async (id: number): Promise<Project> => {
    return apiClient<Project>(`/projects/${id}/`, {
      method: 'GET',
    })
  },

  create: async (payload: ProjectCreatePayload): Promise<Project> => {
    return apiClient<Project>('/projects/', {
      method: 'POST',
      body: payload,
    })
  },

  update: async (id: number, payload: ProjectUpdatePayload): Promise<Project> => {
    return apiClient<Project>(`/projects/${id}/`, {
      method: 'PATCH',
      body: payload,
    })
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/projects/${id}/`, {
      method: 'DELETE',
    })
  },

  // Members
  listMembers: async (projectId: number): Promise<ProjectMember[]> => {
    return apiClient<ProjectMember[]>(`/projects/${projectId}/members/`, {
      method: 'GET',
    })
  },

  addMember: async (projectId: number, payload: ProjectMemberAddPayload): Promise<ProjectMember> => {
    return apiClient<ProjectMember>(`/projects/${projectId}/members/`, {
      method: 'POST',
      body: payload,
    })
  },

  removeMember: async (projectId: number, userId: number): Promise<void> => {
    return apiClient<void>(`/projects/${projectId}/members/${userId}/`, {
      method: 'DELETE',
    })
  },
}
