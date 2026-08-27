import { apiClient } from './client'
import type { Project, ProjectMember } from '@/types'

export const projectsApi = {
  async list(): Promise<Project[]> {
    const data = await apiClient<{ results: Project[] } | Project[]>('/projects/')
    if (Array.isArray(data)) return data
    return data.results || []
  },

  async get(id: number): Promise<Project> {
    return apiClient<Project>(`/projects/${id}/`)
  },

  async create(data: { name: string; description?: string }): Promise<Project> {
    return apiClient<Project>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: Partial<{ name: string; description: string }>): Promise<Project> {
    return apiClient<Project>(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: number): Promise<void> {
    return apiClient<void>(`/projects/${id}/`, {
      method: 'DELETE',
    })
  },

  async listMembers(id: number): Promise<ProjectMember[]> {
    const data = await apiClient<{ results: ProjectMember[] } | ProjectMember[]>(`/projects/${id}/members/`)
    if (Array.isArray(data)) return data
    return data.results || []
  },

  async addMember(projectId: number, data: { email: string }): Promise<ProjectMember> {
    return apiClient<ProjectMember>(`/projects/${projectId}/members/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async removeMember(projectId: number, userId: number): Promise<void> {
    return apiClient<void>(`/projects/${projectId}/members/${userId}/`, {
      method: 'DELETE',
    })
  },
}
