import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import type { Project, ProjectMember, TaskPriority } from '@/types'

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  taskTitle: string
  setTaskTitle: (val: string) => void
  taskDesc: string
  setTaskDesc: (val: string) => void
  taskPriority: TaskPriority
  setTaskPriority: (val: TaskPriority) => void
  taskAssignee: string
  setTaskAssignee: (val: string) => void
  taskDueDate: string
  setTaskDueDate: (val: string) => void
  savingTask: boolean
  onCreateTask: (e: React.FormEvent) => void
  project: Project | null
  members: ProjectMember[]
}

export function TaskCreateModal({
  isOpen,
  onClose,
  taskTitle,
  setTaskTitle,
  taskDesc,
  setTaskDesc,
  taskPriority,
  setTaskPriority,
  taskAssignee,
  setTaskAssignee,
  taskDueDate,
  setTaskDueDate,
  savingTask,
  onCreateTask,
  project,
  members,
}: TaskCreateModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onCreateTask}>
        <ModalHeader>Create New Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3.5}>
            <FormControl isRequired>
              <FormLabel
                fontSize="2xs"
                fontFamily="mono"
                fontWeight="700"
                color="ink.secondary"
                textTransform="uppercase"
              >
                Task Title
              </FormLabel>
              <Input
                placeholder="Task summary..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="2xs"
                fontFamily="mono"
                fontWeight="700"
                color="ink.secondary"
                textTransform="uppercase"
              >
                Description
              </FormLabel>
              <Textarea
                placeholder="Detailed task scope or requirements..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={3}
              />
            </FormControl>

            <HStack spacing={3}>
              <FormControl>
                <FormLabel
                  fontSize="2xs"
                  fontFamily="mono"
                  fontWeight="700"
                  color="ink.secondary"
                  textTransform="uppercase"
                >
                  Priority
                </FormLabel>
                <Select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="2xs"
                  fontFamily="mono"
                  fontWeight="700"
                  color="ink.secondary"
                  textTransform="uppercase"
                >
                  Due Date
                </FormLabel>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel
                fontSize="2xs"
                fontFamily="mono"
                fontWeight="700"
                color="ink.secondary"
                textTransform="uppercase"
              >
                Assignee
              </FormLabel>
              <Select
                placeholder="Unassigned"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
              >
                {project?.owner && (
                  <option value={project.owner.id}>
                    {project.owner.username} (Owner)
                  </option>
                )}
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.username}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2.5}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" isLoading={savingTask}>
              Create Task
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
