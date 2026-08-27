import type { User } from './auth'

export interface Comment {
  id: number
  task: number
  author: User
  content: string
  created_at: string
  updated_at: string
}

export interface CommentCreatePayload {
  content: string
}
