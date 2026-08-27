import { StatusBadge } from '../ui/StatusBadge'
import type { TaskPriority as TaskPriorityType } from '@/types'

export interface TaskPriorityProps {
  priority: TaskPriorityType | string
}

export function TaskPriority({ priority }: TaskPriorityProps) {
  return <StatusBadge priority={priority} type="priority" />
}
