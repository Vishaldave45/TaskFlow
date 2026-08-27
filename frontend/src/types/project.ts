import type { User } from './auth'

export interface Project {
  id: number
  name: string
  description: string
  owner: User
  members_count: number
  created_at: string
  updated_at: string
}

export interface ProjectCreatePayload {
  name: string
  description?: string
}

export interface ProjectUpdatePayload {
  name?: string
  description?: string
}

export interface ProjectMember {
  id: number
  project_id: number
  user: User
  created_at: string
}

export interface ProjectMemberAddPayload {
  email: string
}
