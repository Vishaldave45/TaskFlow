import React from 'react'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { Task, TaskStatus } from '@/types/task'
import { PriorityBadge, StatusBadge, TaskKeyBadge } from '@/components/ui/AppBadge'
import { Calendar, User as UserIcon, CheckCircle2, Circle, Clock } from 'lucide-react'
import { useUpdateTaskMutation } from '@/hooks/useTasks'

interface TaskRowProps {
  task: Task
  onClick?: () => void
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onClick }) => {
  const { mutate: updateTask } = useUpdateTaskMutation(task.project_id)

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    }
    updateTask({
      taskId: task.id,
      payload: { status: nextStatus[task.status] },
    })
  }

  const getStatusIcon = () => {
    if (task.status === 'DONE') return <CheckCircle2 size={16} color="#31D6C5" />
    if (task.status === 'IN_PROGRESS') return <Clock size={16} color="#599eff" />
    return <Circle size={16} color="#8B95A5" />
  }

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      p="3.5"
      bg="bg.surface"
      borderRadius="6px"
      border="1px solid"
      borderColor="border.subtle"
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{
        borderColor: 'brand.500',
        bg: 'bg.elevated',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
      onClick={onClick}
    >
      {/* Left section: Status toggle + Task ID + Title */}
      <HStack gap="3" flex="1" minW="0" mr="4">
        <Box
          cursor="pointer"
          p="1"
          borderRadius="4px"
          _hover={{ bg: 'rgba(255,255,255,0.08)' }}
          onClick={handleToggleStatus}
          title={`Click to change status (current: ${task.status})`}
        >
          {getStatusIcon()}
        </Box>

        <TaskKeyBadge id={task.id} />

        <Text
          fontSize="13px"
          fontWeight="500"
          color={task.status === 'DONE' ? 'fg.muted' : 'fg.default'}
          textDecoration={task.status === 'DONE' ? 'line-through' : 'none'}
          truncate
        >
          {task.title}
        </Text>
      </HStack>

      {/* Right section: Assignee + Due Date + Priority + Status Badge */}
      <HStack gap="3" flexShrink={0}>
        {task.assignee && (
          <HStack gap="1.5" px="2" py="1" borderRadius="4px" bg="bg.subtle">
            <UserIcon size={12} color="#8B95A5" />
            <Text fontSize="11px" color="fg.muted" fontWeight="500">
              {task.assignee.username}
            </Text>
          </HStack>
        )}

        {task.due_date && (
          <HStack gap="1.5" px="2" py="1" borderRadius="4px" bg="bg.subtle">
            <Calendar size={12} color="#8B95A5" />
            <Text fontSize="11px" color="fg.muted" fontFamily="mono">
              {task.due_date}
            </Text>
          </HStack>
        )}

        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </HStack>
    </Flex>
  )
}
