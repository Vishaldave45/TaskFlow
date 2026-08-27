import {
  HStack,
  VStack,
  Text,
  Avatar,
  Box,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { Calendar, User as UserIcon } from 'lucide-react'
import { WorkroomSurface } from '../ui/WorkroomSurface'
import { MetaLabel } from '../ui/MetaLabel'
import { TaskStatus } from './TaskStatus'
import { TaskPriority } from './TaskPriority'
import type { Task } from '@/types'

export interface TaskRowProps {
  task: Task
  onClick?: () => void
  isSelected?: boolean
}

/**
 * TaskRow is the primary atomic task component in the Digital Workroom.
 * Uses Sans for titles and Mono for IDs, statuses, and dates.
 */
export function TaskRow({ task, onClick, isSelected = false }: TaskRowProps) {
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <WorkroomSurface
      variant={isSelected ? 'subtle' : 'base'}
      bordered
      borderColor={isSelected ? 'border.dark' : 'border.default'}
      p={3.5}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={{
        borderColor: 'border.dark',
        boxShadow: 'tactileSm',
        transform: 'translateY(-1px)',
      }}
      _active={{
        transform: 'translate(1px, 1px)',
        boxShadow: 'none',
      }}
      transition="transform 80ms ease-out, box-shadow 80ms ease-out, border-color 120ms ease-out"
      position="relative"
    >
      <VStack align="stretch" spacing={2.5}>
        {/* Top Rail: ID + Status + Priority */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2} align="center">
            <MetaLabel variant="subtle">
              #{task.id.toString().padStart(3, '0')}
            </MetaLabel>
            <TaskStatus status={task.status} />
          </HStack>
          <TaskPriority priority={task.priority} />
        </HStack>

        {/* Core Content: Title & Optional Description */}
        <Box>
          <Text
            fontSize="sm"
            fontWeight="600"
            color="ink.primary"
            lineHeight="short"
            noOfLines={2}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              fontSize="xs"
              color="ink.secondary"
              mt={1}
              lineHeight="base"
              noOfLines={1}
            >
              {task.description}
            </Text>
          )}
        </Box>

        {/* Bottom Rail: Assignee + Due Date */}
        <HStack justify="space-between" align="center" pt={1} borderTop="1px solid" borderColor="border.subtle">
          {/* Assignee */}
          <HStack spacing={1.5} align="center">
            {task.assignee ? (
              <Tooltip label={`Assigned to ${task.assignee.username}`} placement="top" hasArrow fontSize="xs">
                <HStack spacing={1.5}>
                  <Avatar
                    size="2xs"
                    name={task.assignee.username}
                    bg="brand.primary"
                    color="ink.inverse"
                    border="1px solid"
                    borderColor="border.dark"
                  />
                  <Text fontSize="2xs" fontFamily="mono" color="ink.secondary" fontWeight="500">
                    {task.assignee.username}
                  </Text>
                </HStack>
              </Tooltip>
            ) : (
              <HStack spacing={1} color="ink.muted">
                <UserIcon size={12} />
                <Text fontSize="2xs" fontFamily="mono">
                  Unassigned
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Due Date */}
          {formattedDueDate && (
            <HStack spacing={1} color="ink.secondary">
              <Calendar size={12} />
              <Text fontSize="2xs" fontFamily="mono" fontWeight="500">
                {formattedDueDate}
              </Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </WorkroomSurface>
  )
}
