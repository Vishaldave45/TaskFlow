import React from 'react'
import { Badge, Box } from '@chakra-ui/react'
import { TaskPriority, TaskStatus } from '@/types/task'

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const configs: Record<TaskStatus, { label: string; bg: string; color: string; border: string }> = {
    TODO: {
      label: 'Todo',
      bg: 'rgba(139, 149, 165, 0.12)',
      color: '#8B95A5',
      border: 'rgba(139, 149, 165, 0.3)',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'rgba(59, 130, 246, 0.12)',
      color: '#599eff',
      border: 'rgba(59, 130, 246, 0.35)',
    },
    DONE: {
      label: 'Done',
      bg: 'rgba(49, 214, 197, 0.12)',
      color: '#31D6C5',
      border: 'rgba(49, 214, 197, 0.35)',
    },
  }

  const config = configs[status] || configs.TODO

  return (
    <Badge
      px="2.5"
      py="0.5"
      borderRadius="4px"
      fontWeight="500"
      fontSize="xs"
      bg={config.bg}
      color={config.color}
      border="1px solid"
      borderColor={config.border}
      textTransform="none"
      letterSpacing="0.01em"
    >
      <Box as="span" display="inline-block" w="6px" h="6px" borderRadius="full" bg={config.color} mr="1.5" />
      {config.label}
    </Badge>
  )
}

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const configs: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
    LOW: {
      label: 'Low',
      color: '#8B95A5',
      bg: 'rgba(139, 149, 165, 0.08)',
      border: 'rgba(139, 149, 165, 0.2)',
    },
    MEDIUM: {
      label: 'Medium',
      color: '#F2B84B',
      bg: 'rgba(242, 184, 75, 0.12)',
      border: 'rgba(242, 184, 75, 0.3)',
    },
    HIGH: {
      label: 'High',
      color: '#F06A6A',
      bg: 'rgba(240, 106, 106, 0.12)',
      border: 'rgba(240, 106, 106, 0.3)',
    },
  }

  const config = configs[priority] || configs.MEDIUM

  return (
    <Badge
      px="2"
      py="0.5"
      borderRadius="4px"
      fontWeight="600"
      fontSize="10px"
      bg={config.bg}
      color={config.color}
      border="1px solid"
      borderColor={config.border}
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {config.label}
    </Badge>
  )
}

export const TaskKeyBadge: React.FC<{ id: number }> = ({ id }) => {
  return (
    <Box
      as="span"
      fontFamily="mono"
      fontSize="xs"
      fontWeight="500"
      color="fg.muted"
      px="1.5"
      py="0.5"
      bg="rgba(255,255,255,0.04)"
      borderRadius="3px"
      border="1px solid"
      borderColor="border.subtle"
    >
      #TASK-{id}
    </Box>
  )
}
