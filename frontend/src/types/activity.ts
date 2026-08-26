import { User } from './auth'

export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'COMMENT_ADDED'

export interface ActivityLog {
  id: number
  task: number
  user: User
  action: ActivityAction
  details: Record<string, any>
  created_at: string
}
