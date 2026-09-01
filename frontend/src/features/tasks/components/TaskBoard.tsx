import { useState } from 'react'
import {
  Badge,
  Box,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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

interface ColumnLaneProps {
  status: TaskStatus
  label: string
  tasks: Task[]
  currentUser: User | null
  onOpenDetail: (task: Task) => void
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
}

function ColumnLane({
  status,
  label,
  tasks,
  currentUser,
  onOpenDetail,
  onStatusChange,
}: ColumnLaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  })

  return (
    <WorkroomSurface
      ref={setNodeRef}
      variant="subtle"
      p={3.5}
      minH="550px"
      bg={isOver ? 'surface.active' : undefined}
      borderColor={isOver ? 'brand.primary' : undefined}
      transition="background-color 0.15s ease-out, border-color 0.15s ease-out"
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
          <MetaLabel variant="dark">{label}</MetaLabel>
          <Badge variant="neutral" fontSize="3xs">
            {tasks.length}
          </Badge>
        </HStack>
      </Flex>

      {/* Sortable Task List Container */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing={2.5} minH="450px">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onOpenDetail={onOpenDetail}
              onStatusChange={onStatusChange}
            />
          ))}

          {tasks.length === 0 && (
            <Flex
              h="120px"
              align="center"
              justify="center"
              border="1px dashed"
              borderColor={isOver ? 'brand.primary' : 'border.default'}
              bg={isOver ? 'rgba(23, 59, 54, 0.04)' : 'transparent'}
              borderRadius="sm"
              color="ink.muted"
              fontSize="2xs"
              fontFamily="mono"
              transition="all 0.15s ease"
            >
              DRAG TASKS HERE
            </Flex>
          )}
        </Stack>
      </SortableContext>
    </WorkroomSurface>
  )
}

export function TaskBoard({
  tasks,
  currentUser,
  onOpenDetail,
  onStatusChange,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Configure Sensors (Pointer with 4px activation constraint to prevent accidental drags on clicks)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === Number(event.active.id))
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = Number(active.id)
    const task = tasks.find((t) => t.id === activeTaskId)
    if (!task) return

    // 1. Dropped directly over a Column container
    const overStatus = columns.find((c) => c.status === over.id)?.status

    // 2. Dropped over another Task in a Column
    const overTask = tasks.find((t) => t.id === Number(over.id))
    const targetStatus = overStatus || overTask?.status

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(task, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status)
          return (
            <ColumnLane
              key={col.status}
              status={col.status}
              label={col.label}
              tasks={columnTasks}
              currentUser={currentUser}
              onOpenDetail={onOpenDetail}
              onStatusChange={onStatusChange}
            />
          )
        })}
      </SimpleGrid>

      {/* Floating Drag Overlay Preview */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <Box w="320px">
            <TaskCard
              task={activeTask}
              currentUser={currentUser}
              onOpenDetail={() => {}}
              onStatusChange={() => {}}
              isDraggingOverlay
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
