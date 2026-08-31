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
} from '@chakra-ui/react'
import { Activity, Edit3, FileText, MessageSquare, Trash2 } from 'lucide-react'
import { MetaLabel, StatusBadge } from '@/components/ui'
import { TaskComments } from '@/features/comments'
import { TaskActivityLog } from '@/features/activity'
import type {
  ActivityLog,
  Comment,
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
  // Comments
  taskComments: Comment[]
  newComment: string
  setNewComment: (val: string) => void
  onAddComment: (e: React.FormEvent) => void
  onDeleteComment: (commentId: number) => void
  submittingComment: boolean
  // Activity
  taskActivity: ActivityLog[]
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
  taskComments,
  newComment,
  setNewComment,
  onAddComment,
  onDeleteComment,
  submittingComment,
  taskActivity,
}: TaskDetailModalProps) {
  if (!selectedTask) return null

  const canDelete =
    isOwner || selectedTask.creator?.id === currentUser?.id

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
            border="1px solid"
            borderColor="border.default"
            borderRadius="sm"
            mb={5}
          >
            <HStack spacing={2}>
              <Text
                fontSize="2xs"
                fontFamily="mono"
                fontWeight="700"
                color="ink.secondary"
              >
                STATUS:
              </Text>
              <Select
                size="sm"
                w="140px"
                value={selectedTask.status}
                onChange={(e) =>
                  onStatusChange(selectedTask, e.target.value as TaskStatus)
                }
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>
            </HStack>

            <StatusBadge priority={selectedTask.priority} type="priority" />
          </Flex>

          {/* Sub-Tabs: Details & Edit, Comments, Activity */}
          <Tabs variant="line">
            <TabList mb={4}>
              <Tab fontSize="xs" fontWeight="600" gap={1.5}>
                <FileText size={13} /> Details
              </Tab>
              <Tab fontSize="xs" fontWeight="600" gap={1.5}>
                <MessageSquare size={13} /> Notes ({taskComments.length})
              </Tab>
              <Tab fontSize="xs" fontWeight="600" gap={1.5}>
                <Activity size={13} /> Audit ({taskActivity.length})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Details & Edit */}
              <TabPanel p={1}>
                {!isEditingTask ? (
                  <Stack spacing={4}>
                    <Box>
                      <MetaLabel variant="subtle" mb={1}>
                        Description
                      </MetaLabel>
                      <Text
                        fontSize="xs"
                        color="ink.primary"
                        whiteSpace="pre-wrap"
                      >
                        {selectedTask.description || 'No description provided.'}
                      </Text>
                    </Box>

                    <Divider borderColor="border.subtle" />

                    <SimpleGrid columns={2} spacing={4} fontSize="xs">
                      <Box>
                        <MetaLabel variant="subtle">Assignee</MetaLabel>
                        <Text color="ink.primary" fontWeight="600" mt={1}>
                          {selectedTask.assignee
                            ? selectedTask.assignee.username
                            : 'Unassigned'}
                        </Text>
                      </Box>

                      <Box>
                        <MetaLabel variant="subtle">Due Date</MetaLabel>
                        <Text
                          color="ink.primary"
                          fontWeight="600"
                          fontFamily="mono"
                          mt={1}
                        >
                          {selectedTask.due_date
                            ? new Date(selectedTask.due_date).toLocaleDateString()
                            : 'None'}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Flex justify="flex-end" pt={2}>
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
                  /* Edit Mode Form */
                  <Stack spacing={3}>
                    <FormControl isRequired>
                      <FormLabel
                        fontSize="2xs"
                        fontFamily="mono"
                        fontWeight="700"
                        color="ink.secondary"
                        textTransform="uppercase"
                      >
                        Title
                      </FormLabel>
                      <Input
                        size="sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
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
                        size="sm"
                        rows={3}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
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
                          size="sm"
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
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
                        size="sm"
                        placeholder="Unassigned"
                        value={editAssignee}
                        onChange={(e) => setEditAssignee(e.target.value)}
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
                  comments={taskComments}
                  currentUser={currentUser}
                  isOwner={isOwner}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  onAddComment={onAddComment}
                  onDeleteComment={onDeleteComment}
                  submittingComment={submittingComment}
                />
              </TabPanel>

              {/* Tab 3: Activity Timeline */}
              <TabPanel p={1}>
                <TaskActivityLog activity={taskActivity} />
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
