import { useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Flex,
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
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { Activity, Edit3, FileText, MessageSquare, Trash2 } from 'lucide-react'
import { MetaLabel, StatusBadge } from '@/components/ui'
import { TaskComments } from '@/features/comments'
import { TaskActivityLog } from '@/features/activity'
import {
  useTaskComments,
  useCreateComment,
  useDeleteComment,
  useTaskActivity,
} from '../index'
import type {
  Project,
  ProjectMember,
  Task,
  TaskPriority,
  TaskStatus,
  User,
} from '@/types'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTask: Task | null
  currentUser: User | null
  isOwner: boolean
  project: Project | null
  members: ProjectMember[]
  // Status Change
  onStatusChange: (task: Task, newStatus: TaskStatus) => void
  // Inline Edit
  isEditingTask: boolean
  setIsEditingTask: (val: boolean) => void
  editTitle: string
  setEditTitle: (val: string) => void
  editDesc: string
  setEditDesc: (val: string) => void
  editPriority: TaskPriority
  setEditPriority: (val: TaskPriority) => void
  editAssignee: string
  setEditAssignee: (val: string) => void
  editDueDate: string
  setEditDueDate: (val: string) => void
  savingEdit: boolean
  onSaveTaskEdits: () => void
  // Delete
  onDeleteTask: () => void
  isDeletingTask: boolean
}

export function TaskDetailModal({
  isOpen,
  onClose,
  selectedTask,
  currentUser,
  isOwner,
  project,
  members,
  onStatusChange,
  isEditingTask,
  setIsEditingTask,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editPriority,
  setEditPriority,
  editAssignee,
  setEditAssignee,
  editDueDate,
  setEditDueDate,
  savingEdit,
  onSaveTaskEdits,
  onDeleteTask,
  isDeletingTask,
}: TaskDetailModalProps) {
  const toast = useToast()
  const [newComment, setNewComment] = useState('')

  // TanStack Queries & Mutations for Comments & Activity
  const { data: comments = [] } = useTaskComments(selectedTask?.id)
  const { data: activity = [] } = useTaskActivity(selectedTask?.id)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()

  if (!selectedTask) return null

  const canDelete =
    isOwner || selectedTask.creator?.id === currentUser?.id

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await createComment.mutateAsync({
        taskId: selectedTask.id,
        content: newComment.trim(),
      })
      setNewComment('')
      toast({
        title: 'Comment added',
        status: 'success',
        duration: 2000,
      })
    } catch {
      toast({
        title: 'Failed to add comment',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment.mutateAsync({
        commentId,
        taskId: selectedTask.id,
      })
      toast({
        title: 'Comment deleted',
        status: 'info',
        duration: 2000,
      })
    } catch {
      toast({
        title: 'Could not delete comment',
        status: 'error',
        duration: 2000,
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justify="space-between" align="center" pr={8}>
            <Text isTruncated maxW="380px">
              {selectedTask.title}
            </Text>
            <Badge variant="brand">TASK #{selectedTask.id}</Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Status Bar */}
          <Flex
            justify="space-between"
            align="center"
            p={3}
            bg="surface.subtle"
            borderRadius="sm"
            mb={4}
          >
            <HStack spacing={2}>
              <Text fontSize="xs" fontWeight="600" color="ink.secondary">
                Status:
              </Text>
              <StatusBadge status={selectedTask.status} type="status" />
            </HStack>
            <HStack spacing={1}>
              <Button
                size="2xs"
                variant={selectedTask.status === 'TODO' ? 'solid' : 'ghost'}
                onClick={() => onStatusChange(selectedTask, 'TODO')}
              >
                To Do
              </Button>
              <Button
                size="2xs"
                variant={
                  selectedTask.status === 'IN_PROGRESS' ? 'solid' : 'ghost'
                }
                onClick={() => onStatusChange(selectedTask, 'IN_PROGRESS')}
              >
                In Progress
              </Button>
              <Button
                size="2xs"
                variant={selectedTask.status === 'DONE' ? 'solid' : 'ghost'}
                onClick={() => onStatusChange(selectedTask, 'DONE')}
              >
                Done
              </Button>
            </HStack>
          </Flex>

          <Tabs variant="line">
            <TabList mb={4}>
              <Tab fontSize="xs" fontWeight="600">
                <HStack spacing={1.5}>
                  <FileText size={13} />
                  <Text>Overview</Text>
                </HStack>
              </Tab>
              <Tab fontSize="xs" fontWeight="600">
                <HStack spacing={1.5}>
                  <MessageSquare size={13} />
                  <Text>Notes ({comments.length})</Text>
                </HStack>
              </Tab>
              <Tab fontSize="xs" fontWeight="600">
                <HStack spacing={1.5}>
                  <Activity size={13} />
                  <Text>Activity ({activity.length})</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Overview */}
              <TabPanel p={1}>
                {!isEditingTask ? (
                  <Stack spacing={4}>
                    <Box>
                      <MetaLabel variant="subtle" mb={1}>
                        DESCRIPTION
                      </MetaLabel>
                      <Text fontSize="xs" color="ink.primary" whiteSpace="pre-wrap">
                        {selectedTask.description || 'No description provided.'}
                      </Text>
                    </Box>

                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <MetaLabel variant="subtle" mb={1}>
                          PRIORITY
                        </MetaLabel>
                        <StatusBadge
                          priority={selectedTask.priority}
                          type="priority"
                        />
                      </Box>
                      <Box>
                        <MetaLabel variant="subtle" mb={1}>
                          ASSIGNEE
                        </MetaLabel>
                        <Text fontSize="xs" color="ink.primary">
                          {selectedTask.assignee
                            ? selectedTask.assignee.username
                            : 'Unassigned'}
                        </Text>
                      </Box>
                      <Box>
                        <MetaLabel variant="subtle" mb={1}>
                          DUE DATE
                        </MetaLabel>
                        <Text fontSize="xs" color="ink.primary">
                          {selectedTask.due_date
                            ? new Date(
                                selectedTask.due_date
                              ).toLocaleDateString()
                            : 'No deadline'}
                        </Text>
                      </Box>
                      <Box>
                        <MetaLabel variant="subtle" mb={1}>
                          CREATED BY
                        </MetaLabel>
                        <Text fontSize="xs" color="ink.primary">
                          {selectedTask.creator
                            ? selectedTask.creator.username
                            : 'System'}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Divider borderColor="border.subtle" />

                    <Flex justify="flex-end">
                      <Button
                        size="xs"
                        variant="outline"
                        leftIcon={<Edit3 size={12} />}
                        onClick={() => setIsEditingTask(true)}
                      >
                        Edit Task
                      </Button>
                    </Flex>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    <FormControl isRequired>
                      <FormLabel fontSize="2xs" fontWeight="700">
                        Title
                      </FormLabel>
                      <Input
                        size="sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="2xs" fontWeight="700">
                        Description
                      </FormLabel>
                      <Textarea
                        size="sm"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                      />
                    </FormControl>

                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="2xs" fontWeight="700">
                          Priority
                        </FormLabel>
                        <Select
                          size="sm"
                          value={editPriority}
                          onChange={(e) =>
                            setEditPriority(e.target.value as TaskPriority)
                          }
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="2xs" fontWeight="700">
                          Due Date
                        </FormLabel>
                        <Input
                          type="date"
                          size="sm"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel fontSize="2xs" fontWeight="700">
                        Assignee
                      </FormLabel>
                      <Select
                        size="sm"
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
                      >
                        <option value="">Unassigned</option>
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

                    <HStack spacing={2} justify="flex-end" pt={2}>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setIsEditingTask(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        variant="solid"
                        onClick={onSaveTaskEdits}
                        isLoading={savingEdit}
                      >
                        Save Changes
                      </Button>
                    </HStack>
                  </Stack>
                )}
              </TabPanel>

              {/* Tab 2: Comments */}
              <TabPanel p={1}>
                <TaskComments
                  comments={comments}
                  currentUser={currentUser}
                  isOwner={isOwner}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  submittingComment={createComment.isPending}
                />
              </TabPanel>

              {/* Tab 3: Activity Timeline */}
              <TabPanel p={1}>
                <TaskActivityLog activity={activity} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          {canDelete ? (
            <Button
              variant="danger"
              size="xs"
              leftIcon={<Trash2 size={13} />}
              onClick={onDeleteTask}
              isLoading={isDeletingTask}
            >
              Delete Task
            </Button>
          ) : (
            <Box />
          )}
          <Button variant="ghost" size="xs" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
