import {
  Box,
  Divider,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Badge,
} from '@chakra-ui/react'
import { Clock, GripVertical, MoreVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { WorkroomSurface } from '@/components/ui'
import type { Task, TaskStatus, User } from '@/types'

interface TaskCardProps {
  task: Task
  currentUser: User | null
  onOpenDetail: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  isDraggingOverlay?: boolean
}

export function TaskCard({
  task,
  currentUser,
  onOpenDetail,
  onStatusChange,
  isDraggingOverlay = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isDraggingOverlay,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const isAssignedToMe = task.assignee?.id === currentUser?.id
  const isOverdue =
    task.due_date &&
    task.status !== 'DONE' &&
    new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <Box
      ref={setNodeRef}
      style={style}
      position="relative"
      zIndex={isDragging ? 999 : 'auto'}
    >
      <WorkroomSurface
        variant="base"
        bordered
        p={3}
        pl={4.5}
        position="relative"
        overflow="hidden"
        cursor="default"
        boxShadow={isDraggingOverlay ? 'tactile' : undefined}
        transform={isDraggingOverlay ? 'rotate(1.5deg) scale(1.02)' : undefined}
        borderColor={isDraggingOverlay ? 'brand.primary' : undefined}
        transition="border-color 0.1s ease-out, box-shadow 0.1s ease-out"
        _hover={
          !isDraggingOverlay
            ? {
                borderColor: 'border.dark',
                boxShadow: 'tactileSm',
              }
            : undefined
        }
      >
        {/* Left Priority Indicator */}
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          w="3.5px"
          bg={
            task.priority === 'HIGH'
              ? 'priority.high'
              : task.priority === 'MEDIUM'
              ? 'priority.medium'
              : 'border.default'
          }
        />

        <Stack spacing={2}>
          <Flex justify="space-between" align="start" gap={2}>
            <HStack spacing={1.5} align="start" flex="1">
              {/* Drag Handle */}
              <Box
                {...attributes}
                {...listeners}
                cursor="grab"
                _active={{ cursor: 'grabbing' }}
                color="ink.muted"
                _hover={{ color: 'ink.primary' }}
                p={0.5}
                ml={-1}
                mt={0.5}
                title="Drag to move card"
              >
                <GripVertical size={13} />
              </Box>

              <Text
                fontWeight="600"
                fontSize="xs"
                color="ink.primary"
                cursor="pointer"
                onClick={() => onOpenDetail(task)}
                _hover={{ color: 'brand.primary' }}
                lineHeight="short"
              >
                {task.title}
              </Text>
            </HStack>

            {/* Quick Status Menu */}
            <Menu placement="bottom-end">
              <MenuButton
                as={IconButton}
                aria-label="Actions"
                icon={<MoreVertical size={13} />}
                size="2xs"
                variant="ghost"
                color="ink.muted"
              />
              <MenuList
                minW="130px"
                p={1}
                fontSize="xs"
                boxShadow="tactile"
                borderColor="border.dark"
                borderRadius="sm"
              >
                <MenuItem
                  isDisabled={task.status === 'TODO'}
                  onClick={() => onStatusChange(task, 'TODO')}
                >
                  Move to To Do
                </MenuItem>
                <MenuItem
                  isDisabled={task.status === 'IN_PROGRESS'}
                  onClick={() => onStatusChange(task, 'IN_PROGRESS')}
                >
                  Move to In Progress
                </MenuItem>
                <MenuItem
                  isDisabled={task.status === 'DONE'}
                  onClick={() => onStatusChange(task, 'DONE')}
                >
                  Mark as Done
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {task.description && (
            <Text
              fontSize="2xs"
              color="ink.secondary"
              noOfLines={2}
              cursor="pointer"
              onClick={() => onOpenDetail(task)}
            >
              {task.description}
            </Text>
          )}

          <Divider borderColor="border.subtle" />

          <Flex
            justify="space-between"
            align="center"
            fontSize="3xs"
            color="ink.muted"
            fontFamily="mono"
          >
            <HStack spacing={1.5}>
              <Text>#{task.id}</Text>
              {isAssignedToMe && (
                <Badge variant="brand" fontSize="3xs" px={1}>
                  YOU
                </Badge>
              )}
            </HStack>

            <HStack spacing={1}>
              <Clock size={11} color={isOverdue ? '#991B1B' : undefined} />
              <Text
                color={isOverdue ? 'state.error.text' : undefined}
                fontWeight={isOverdue ? 'bold' : 'normal'}
              >
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : 'NO DUE DATE'}
              </Text>
            </HStack>
          </Flex>
        </Stack>
      </WorkroomSurface>
    </Box>
  )
}
