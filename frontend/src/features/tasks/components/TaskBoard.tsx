import {
  Badge,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import { MetaLabel, WorkroomSurface } from '@/components/ui'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus, User } from '@/types'

interface TaskBoardProps {
  tasks: Task[]
  currentUser: User | null
  onOpenDetail: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
}

const columns: {
  status: TaskStatus
  label: string
  badge: 'neutral' | 'brand' | 'success'
}[] = [
  { status: 'TODO', label: 'To Do', badge: 'neutral' },
  { status: 'IN_PROGRESS', label: 'In Progress', badge: 'brand' },
  { status: 'DONE', label: 'Done', badge: 'success' },
]

export function TaskBoard({
  tasks,
  currentUser,
  onOpenDetail,
  onStatusChange,
}: TaskBoardProps) {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status)
        return (
          <WorkroomSurface
            key={col.status}
            variant="subtle"
            p={3.5}
            minH="500px"
          >
            {/* Column Header */}
            <Flex
              justify="space-between"
              align="center"
              mb={3}
              pb={2}
              borderBottom="1px solid"
              borderColor="border.subtle"
            >
              <HStack spacing={2}>
                <MetaLabel variant="dark">{col.label}</MetaLabel>
                <Badge variant="neutral" fontSize="3xs">
                  {columnTasks.length}
                </Badge>
              </HStack>
            </Flex>

            {/* Column Tasks */}
            <Stack spacing={2.5}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onOpenDetail={onOpenDetail}
                  onStatusChange={onStatusChange}
                />
              ))}

              {columnTasks.length === 0 && (
                <Flex
                  h="110px"
                  align="center"
                  justify="center"
                  border="1px dashed"
                  borderColor="border.default"
                  borderRadius="sm"
                  color="ink.muted"
                  fontSize="2xs"
                  fontFamily="mono"
                >
                  NO ACTIVE TASKS
                </Flex>
              )}
            </Stack>
          </WorkroomSurface>
        )
      })}
    </SimpleGrid>
  )
}
