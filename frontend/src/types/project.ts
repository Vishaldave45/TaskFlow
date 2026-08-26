import { User } from './auth'

export interface Project {
  id: number
  name: string
  description: string
  owner: User
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: number
  user: User
  joined_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface AddMemberInput {
  email: string
}
