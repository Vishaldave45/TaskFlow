import type { User } from './auth'

export interface ActivityLog {
  id: number
  task: number
  user: User
  action: string
  details: Record<string, unknown>
  created_at: string
}
