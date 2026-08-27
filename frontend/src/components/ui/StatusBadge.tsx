import { Badge, type BadgeProps } from '@chakra-ui/react'
import type { TaskStatus, TaskPriority } from '@/types'

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status?: TaskStatus | string
  priority?: TaskPriority | string
  type?: 'status' | 'priority'
  label?: string
}

/**
 * StatusBadge provides consistent visual tokens for task statuses and priorities.
 */
export function StatusBadge({
  status,
  priority,
  type = 'status',
  label,
  ...props
}: StatusBadgeProps) {
  if (type === 'priority' || priority) {
    const p = (priority || status || 'LOW').toUpperCase()
    let variant = 'subtle'
    let text = label || p

    if (p === 'HIGH') {
      variant = 'coral'
      text = label || 'HIGH'
    } else if (p === 'MEDIUM') {
      variant = 'warning'
      text = label || 'MED'
    } else {
      variant = 'outline'
      text = label || 'LOW'
    }

    return (
      <Badge variant={variant} fontSize="3xs" px={2} py={0.5} {...props}>
        {text}
      </Badge>
    )
  }

  // Task Status
  const s = (status || 'TODO').toUpperCase()
  let variant = 'outline'
  let text = label || s

  if (s === 'DONE') {
    variant = 'success'
    text = label || 'DONE'
  } else if (s === 'IN_PROGRESS') {
    variant = 'brand'
    text = label || 'IN PROGRESS'
  } else {
    variant = 'outline'
    text = label || 'TODO'
  }

  return (
    <Badge variant={variant} fontSize="3xs" px={2} py={0.5} {...props}>
      {text}
    </Badge>
  )
}
