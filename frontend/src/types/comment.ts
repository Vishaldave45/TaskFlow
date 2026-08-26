import { User } from './auth'

export interface Comment {
  id: number
  task: number
  author: User
  content: string
  created_at: string
  updated_at: string
}

export interface CreateCommentInput {
  content: string
}

export interface UpdateCommentInput {
  content: string
}
