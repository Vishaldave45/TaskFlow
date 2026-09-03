import { useRef, useEffect, useCallback } from 'react'
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
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Clock, MoreVertical } from 'lucide-react'
import { WorkroomSurface, StatusBadge } from '@/components/ui'
import type { Task, TaskStatus, User } from '@/types'

interface InfiniteTaskListProps {
  /** Flattened array of tasks from all loaded pages */
  tasks: Task[]
  /** Current authenticated user */
  currentUser: User | null
  /** Whether more pages are available */
  hasNextPage: boolean
  /** Whether a next page is currently being fetched */
  isFetchingNextPage: boolean
  /** Callback to fetch the next page */
  fetchNextPage: () => void
  /** Called when a task row is clicked to open its detail view */
  onOpenDetail: (task: Task) => void
  /** Called when a task's status should be changed */
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  /** Optional: navigate to the task's parent project */
  onNavigateToProject?: (projectId: number) => void
  /** If true, show project reference in each row (e.g. on Dashboard) */
  showProject?: boolean
}

/**
 * InfiniteTaskList — A scrollable list of tasks with IntersectionObserver-based
 * infinite scroll. Renders each task as a compact ledger row with status, priority,
 * title, due date, and quick status-change actions.
 */
export function InfiniteTaskList({
  tasks,
  currentUser,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onOpenDetail,
  onStatusChange,
  onNavigateToProject,
  showProject = false,
}: InfiniteTaskListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Use IntersectionObserver to auto-trigger fetchNextPage when the sentinel enters viewport
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '200px', // Start loading 200px before the user reaches the bottom
      threshold: 0,
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [observerCallback])

  if (tasks.length === 0 && !isFetchingNextPage) {
    return (
      <Box py={8} textAlign="center">
        <Text fontSize="sm" fontWeight="600" color="ink.primary">
          No tasks to display
        </Text>
        <Text fontSize="xs" color="ink.muted" mt={1}>
          Tasks will appear here as they are created.
        </Text>
      </Box>
    )
  }

  return (
    <Stack spacing={0} divider={<Divider borderColor="border.subtle" />}>
      {tasks.map((task) => {
        const isAssignedToMe = task.assignee?.id === currentUser?.id
        const isOverdue =
          task.due_date &&
          task.status !== 'DONE' &&
          new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0))

        return (
          <WorkroomSurface
            key={task.id}
            variant="subtle"
            px={4}
            py={3}
            borderRadius="none"
            _hover={{ bg: 'surface.active' }}
            transition="background-color 0.1s ease-out"
          >
            <Flex justify="space-between" align="center" gap={3}>
              {/* Left: Status + Priority + Title */}
              <Flex align="center" gap={2.5} flex="1" minW={0}>
                <HStack spacing={1.5} flexShrink={0}>
                  <StatusBadge status={task.status} type="status" />
                  <StatusBadge priority={task.priority} type="priority" />
                </HStack>

                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="ink.primary"
                  cursor="pointer"
                  onClick={() => onOpenDetail(task)}
                  _hover={{ color: 'brand.primary' }}
                  isTruncated
                >
                  {task.title}
                </Text>

                {showProject && (
                  <Text
                    fontSize="3xs"
                    fontFamily="mono"
                    color="ink.muted"
                    flexShrink={0}
                    cursor={onNavigateToProject ? 'pointer' : 'default'}
                    onClick={() => onNavigateToProject?.(task.project)}
                    _hover={onNavigateToProject ? { color: 'brand.primary' } : undefined}
                  >
                    PROJECT #{task.project}
                  </Text>
                )}
              </Flex>

              {/* Right: Assignee badge + Due date + Actions */}
              <HStack spacing={3} flexShrink={0}>
                {isAssignedToMe && (
                  <Text
                    fontSize="3xs"
                    fontFamily="mono"
                    fontWeight="700"
                    color="brand.primary"
                    bg="surface.active"
                    px={1.5}
                    py={0.5}
                    borderRadius="sm"
                  >
                    YOU
                  </Text>
                )}

                <HStack spacing={1} fontSize="3xs" fontFamily="mono" color="ink.muted">
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
                    {onNavigateToProject && (
                      <MenuItem onClick={() => onNavigateToProject(task.project)}>
                        Go to Project
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </WorkroomSurface>
        )
      })}

      {/* Infinite Scroll Sentinel — observed by IntersectionObserver */}
      <Box ref={sentinelRef} h="1px" />

      {/* Loading indicator while fetching next page */}
      {isFetchingNextPage && (
        <Flex justify="center" py={4}>
          <HStack spacing={2}>
            <Spinner size="sm" color="brand.primary" />
            <Text fontSize="xs" color="ink.muted" fontFamily="mono">
              Loading more tasks...
            </Text>
          </HStack>
        </Flex>
      )}

      {/* End-of-list indicator */}
      {!hasNextPage && tasks.length > 0 && (
        <Flex justify="center" py={3}>
          <Text fontSize="3xs" color="ink.muted" fontFamily="mono">
            ALL {tasks.length} TASKS LOADED
          </Text>
        </Flex>
      )}
    </Stack>
  )
}
