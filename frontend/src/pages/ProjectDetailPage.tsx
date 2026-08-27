import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
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
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Textarea,
  IconButton,
  Avatar,
} from '@chakra-ui/react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Users,
  Clock,
  Send,
  UserPlus,
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { tasksApi } from '@/api/tasks'
import { commentsApi } from '@/api/comments'
import { activityApi } from '@/api/activity'
import type {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  Comment,
  ActivityLog,
  ProjectMember,
} from '@/types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const { isOpen: isTaskModalOpen, onOpen: onOpenTaskModal, onClose: onCloseTaskModal } = useDisclosure()
  const { isOpen: isMemberModalOpen, onOpen: onOpenMemberModal, onClose: onCloseMemberModal } = useDisclosure()
  const { isOpen: isTaskDetailOpen, onOpen: onOpenTaskDetail, onClose: onCloseTaskDetail } = useDisclosure()

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM')
  const [taskAssignee, setTaskAssignee] = useState<string>('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [savingTask, setSavingTask] = useState(false)

  // Selected Task Detail
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskComments, setTaskComments] = useState<Comment[]>([])
  const [taskActivity, setTaskActivity] = useState<ActivityLog[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Add Member Form
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const toast = useToast()

  const loadProjectData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [projectData, tasksData, membersData] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.listByProject(projectId),
        projectsApi.listMembers(projectId).catch(() => []),
      ])
      setProject(projectData)
      setTasks(tasksData)
      setMembers(membersData)
    } catch {
      toast({
        title: 'Error loading project',
        description: 'Failed to load project details.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [projectId, toast])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    setSavingTask(true)
    try {
      const created = await tasksApi.create(projectId, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        assignee_id: taskAssignee ? Number(taskAssignee) : null,
        due_date: taskDueDate || null,
      })
      setTasks((prev) => [created, ...prev])
      setTaskTitle('')
      setTaskDesc('')
      setTaskPriority('MEDIUM')
      setTaskAssignee('')
      setTaskDueDate('')
      onCloseTaskModal()
      toast({
        title: 'Task created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Failed to create task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSavingTask(false)
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updated = await tasksApi.update(task.id, { status: newStatus })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(updated)
      }
    } catch {
      toast({
        title: 'Status update failed',
        status: 'error',
        duration: 2000,
      })
    }
  }

  const openTaskDetailModal = async (task: Task) => {
    setSelectedTask(task)
    onOpenTaskDetail()
    try {
      const [comments, activity] = await Promise.all([
        commentsApi.listByTask(task.id).catch(() => []),
        activityApi.listByTask(task.id).catch(() => []),
      ])
      setTaskComments(comments)
      setTaskActivity(activity)
    } catch {
      // Non-blocking
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const comment = await commentsApi.create(selectedTask.id, {
        content: newComment.trim(),
      })
      setTaskComments((prev) => [...prev, comment])
      setNewComment('')
    } catch {
      toast({
        title: 'Failed to post comment',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberEmail.trim()) return

    setAddingMember(true)
    try {
      const member = await projectsApi.addMember(projectId, {
        email: memberEmail.trim(),
      })
      setMembers((prev) => [...prev, member])
      setMemberEmail('')
      onCloseMemberModal()
      toast({
        title: 'Member added',
        status: 'success',
        duration: 3000,
      })
    } catch {
      toast({
        title: 'Failed to add member',
        description: 'Verify the user exists by email address.',
        status: 'error',
        duration: 4000,
      })
    } finally {
      setAddingMember(false)
    }
  }

  const columns: { status: TaskStatus; label: string; badge: 'neutral' | 'brand' | 'success' }[] = [
    { status: 'TODO', label: 'To Do', badge: 'neutral' },
    { status: 'IN_PROGRESS', label: 'In Progress', badge: 'brand' },
    { status: 'DONE', label: 'Done', badge: 'success' },
  ]

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Stack spacing={6}>
          <Skeleton h="32px" w="200px" />
          <Skeleton h="120px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Skeleton h="400px" />
            <Skeleton h="400px" />
            <Skeleton h="400px" />
          </SimpleGrid>
        </Stack>
      </Container>
    )
  }

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        {/* Back Link */}
        <Button
          as={RouterLink}
          to="/projects"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          mb={4}
        >
          All Projects
        </Button>

        {/* Project Header Card */}
        <Card mb={8} p={6}>
          <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
            <Stack spacing={2}>
              <HStack spacing={2}>
                <Heading as="h1" size="xl" fontWeight="700" color="ink.primary">
                  {project?.name}
                </Heading>
                <Badge variant="brand">PROJECT #{project?.id}</Badge>
              </HStack>
              <Text fontSize="sm" color="ink.secondary" maxW="2xl">
                {project?.description || 'No description provided for this project.'}
              </Text>
            </Stack>

            <HStack spacing={3}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users size={16} />}
                onClick={onOpenMemberModal}
              >
                Members ({members.length})
              </Button>
              <Button
                variant="solid"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={onOpenTaskModal}
              >
                New Task
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* Tabs: Kanban Board & Team Members */}
        <Tabs variant="soft-rounded" colorScheme="brand">
          <TabList mb={6}>
            <Tab fontWeight="600" fontSize="sm">Kanban Board</Tab>
            <Tab fontWeight="600" fontSize="sm">Team Members ({members.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Panel 1: Kanban Board */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {columns.map((col) => {
                  const columnTasks = tasks.filter((t) => t.status === col.status)
                  return (
                    <Box
                      key={col.status}
                      bg="surface.subtle"
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="border.default"
                      minH="500px"
                    >
                      <Flex justify="space-between" align="center" mb={4}>
                        <HStack spacing={2}>
                          <Text fontWeight="600" fontSize="sm" color="ink.primary">
                            {col.label}
                          </Text>
                          <Badge variant={col.badge} fontSize="xs">
                            {columnTasks.length}
                          </Badge>
                        </HStack>
                      </Flex>

                      <Stack spacing={3}>
                        {columnTasks.map((task) => (
                          <Card
                            key={task.id}
                            cursor="pointer"
                            onClick={() => openTaskDetailModal(task)}
                            _hover={{
                              borderColor: 'border.strong',
                              boxShadow: 'hard',
                              transform: 'translateY(-1px)',
                            }}
                            transition="all 0.15s ease-in-out"
                          >
                            <CardBody p={4}>
                              <Stack spacing={2.5}>
                                <Flex justify="space-between" align="start">
                                  <Text fontWeight="600" fontSize="sm" color="ink.primary">
                                    {task.title}
                                  </Text>
                                  <Badge
                                    variant={
                                      task.priority === 'HIGH'
                                        ? 'error'
                                        : task.priority === 'MEDIUM'
                                        ? 'warning'
                                        : 'neutral'
                                    }
                                    fontSize="2xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                </Flex>

                                {task.description && (
                                  <Text fontSize="xs" color="ink.secondary" noOfLines={2}>
                                    {task.description}
                                  </Text>
                                )}

                                <Divider borderColor="border.subtle" />

                                <Flex justify="space-between" align="center" fontSize="2xs" color="ink.muted">
                                  <Text fontFamily="mono">#{task.id}</Text>
                                  <HStack spacing={1}>
                                    <Clock size={12} />
                                    <Text>
                                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                                    </Text>
                                  </HStack>
                                </Flex>
                              </Stack>
                            </CardBody>
                          </Card>
                        ))}

                        {columnTasks.length === 0 && (
                          <Flex
                            h="100px"
                            align="center"
                            justify="center"
                            border="1px dashed"
                            borderColor="border.default"
                            borderRadius="md"
                            color="ink.muted"
                            fontSize="xs"
                          >
                            No tasks
                          </Flex>
                        )}
                      </Stack>
                    </Box>
                  )
                })}
              </SimpleGrid>
            </TabPanel>

            {/* Panel 2: Members */}
            <TabPanel p={0}>
              <Card p={6}>
                <CardHeader px={0} pt={0}>
                  <Flex justify="space-between" align="center">
                    <Heading as="h3" size="md" color="ink.primary">
                      Project Collaborators
                    </Heading>
                    <Button
                      variant="solid"
                      size="sm"
                      leftIcon={<UserPlus size={16} />}
                      onClick={onOpenMemberModal}
                    >
                      Invite Member
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody px={0} pb={0}>
                  <Stack spacing={3}>
                    {members.map((member) => (
                      <Flex
                        key={member.id}
                        justify="space-between"
                        align="center"
                        p={3}
                        borderRadius="md"
                        bg="surface.subtle"
                        border="1px solid"
                        borderColor="border.default"
                      >
                        <HStack spacing={3}>
                          <Avatar size="sm" name={member.user.username} bg="brand.primary" color="white" />
                          <Box>
                            <Text fontSize="sm" fontWeight="600" color="ink.primary">
                              {member.user.username}
                            </Text>
                            <Text fontSize="xs" color="ink.secondary">
                              {member.user.email}
                            </Text>
                          </Box>
                        </HStack>

                        <Badge variant="brand" fontSize="2xs">
                          MEMBER
                        </Badge>
                      </Flex>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Create Task Modal */}
        <Modal isOpen={isTaskModalOpen} onClose={onCloseTaskModal} isCentered>
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCreateTask}>
            <ModalHeader>New Task</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                    Title
                  </FormLabel>
                  <Input
                    placeholder="Task summary..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                    Description
                  </FormLabel>
                  <Textarea
                    placeholder="Additional context or requirements..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={3}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
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
                    <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
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
                  <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                    Assignee
                  </FormLabel>
                  <Select
                    placeholder="Unassigned"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                  >
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.username} ({m.user.email})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onCloseTaskModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid" isLoading={savingTask}>
                  Create Task
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Task Detail & Comments Modal */}
        {selectedTask && (
          <Modal isOpen={isTaskDetailOpen} onClose={onCloseTaskDetail} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Flex justify="space-between" align="center" pr={8}>
                  <Text isTruncated>{selectedTask.title}</Text>
                  <Badge variant="brand">#{selectedTask.id}</Badge>
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={6}>
                  {/* Status Bar */}
                  <Flex justify="space-between" align="center" p={3} bg="surface.subtle" borderRadius="md">
                    <HStack spacing={2}>
                      <Text fontSize="xs" fontWeight="600" color="ink.secondary">
                        STATUS:
                      </Text>
                      <Select
                        size="sm"
                        w="150px"
                        value={selectedTask.status}
                        onChange={(e) => handleStatusChange(selectedTask, e.target.value as TaskStatus)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </Select>
                    </HStack>

                    <HStack spacing={2}>
                      <Badge
                        variant={
                          selectedTask.priority === 'HIGH'
                            ? 'error'
                            : selectedTask.priority === 'MEDIUM'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {selectedTask.priority} PRIORITY
                      </Badge>
                    </HStack>
                  </Flex>

                  {/* Description */}
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" mb={1}>
                      Description
                    </Text>
                    <Text fontSize="sm" color="ink.primary">
                      {selectedTask.description || 'No description provided.'}
                    </Text>
                  </Box>

                  <Divider borderColor="border.subtle" />

                  {/* Comments Section */}
                  <Stack spacing={4}>
                    <Text fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase">
                      Comments ({taskComments.length})
                    </Text>

                    <Stack spacing={3} maxH="200px" overflowY="auto">
                      {taskComments.map((c) => (
                        <Box key={c.id} p={3} bg="surface.subtle" borderRadius="md" border="1px solid" borderColor="border.subtle">
                          <Flex justify="space-between" align="center" mb={1}>
                            <Text fontSize="xs" fontWeight="600" color="ink.primary">
                              {c.author.username}
                            </Text>
                            <Text fontSize="2xs" color="ink.muted">
                              {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </Flex>
                          <Text fontSize="sm" color="ink.primary">
                            {c.content}
                          </Text>
                        </Box>
                      ))}

                      {taskComments.length === 0 && (
                        <Text fontSize="xs" color="ink.muted" textAlign="center" py={2}>
                          No comments yet. Start the conversation!
                        </Text>
                      )}
                    </Stack>

                    {/* New Comment Input */}
                    <Flex as="form" onSubmit={handleAddComment} gap={2}>
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        size="sm"
                      />
                      <IconButton
                        type="submit"
                        aria-label="Post comment"
                        icon={<Send size={16} />}
                        variant="solid"
                        size="sm"
                        isLoading={submittingComment}
                      />
                    </Flex>
                  </Stack>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onCloseTaskDetail}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Add Member Modal */}
        <Modal isOpen={isMemberModalOpen} onClose={onCloseMemberModal} isCentered>
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleAddMember}>
            <ModalHeader>Add Collaborator</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                  User Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="collaborator@company.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  autoFocus
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onCloseMemberModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid" isLoading={addingMember}>
                  Add Member
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}
