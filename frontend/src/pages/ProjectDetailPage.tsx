import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Users,
  Clock,
  Send,
  UserPlus,
  Search,
  Trash2,
  Activity,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Crown,
  Shield,
  Edit3,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
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
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)

  // Role Checks
  const isOwner = currentUser?.id === project?.owner?.id

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL')

  // Modals
  const { isOpen: isTaskModalOpen, onOpen: onOpenTaskModal, onClose: onCloseTaskModal } = useDisclosure()
  const { isOpen: isMemberModalOpen, onOpen: onOpenMemberModal, onClose: onCloseMemberModal } = useDisclosure()
  const { isOpen: isTaskDetailOpen, onOpen: onOpenTaskDetail, onClose: onCloseTaskDetail } = useDisclosure()

  // Delete Alert
  const [isDeletingProject, setIsDeletingProject] = useState(false)
  const { isOpen: isDeleteAlertOpen, onOpen: onOpenDeleteAlert, onClose: onCloseDeleteAlert } = useDisclosure()
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM')
  const [taskAssignee, setTaskAssignee] = useState<string>('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [savingTask, setSavingTask] = useState(false)

  // Selected Task Detail & Edit
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM')
  const [editAssignee, setEditAssignee] = useState<string>('')
  const [editDueDate, setEditDueDate] = useState('')
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  const [taskComments, setTaskComments] = useState<Comment[]>([])
  const [taskActivity, setTaskActivity] = useState<ActivityLog[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

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
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setMembers(Array.isArray(membersData) ? membersData : [])
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
        activityApi.listByTask(task.id).then(setTaskActivity).catch(() => {})
      }
      toast({
        title: `Status: ${newStatus.replace('_', ' ')}`,
        status: 'info',
        duration: 2000,
      })
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
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditPriority(task.priority)
    setEditAssignee(task.assignee ? String(task.assignee.id) : '')
    setEditDueDate(task.due_date || '')
    setIsEditingTask(false)
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

  const handleSaveTaskEdits = async () => {
    if (!selectedTask || !editTitle.trim()) return

    setSavingEdit(true)
    try {
      const updated = await tasksApi.update(selectedTask.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        assignee_id: editAssignee ? Number(editAssignee) : null,
        due_date: editDueDate || null,
      })
      setSelectedTask(updated)
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setIsEditingTask(false)
      toast({
        title: 'Task updated',
        status: 'success',
        duration: 2500,
      })
      activityApi.listByTask(selectedTask.id).then(setTaskActivity).catch(() => {})
    } catch {
      toast({
        title: 'Update failed',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    setIsDeletingTask(true)
    try {
      await tasksApi.delete(selectedTask.id)
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
      onCloseTaskDetail()
      toast({
        title: 'Task deleted',
        status: 'success',
        duration: 2500,
      })
    } catch {
      toast({
        title: 'Could not delete task',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsDeletingTask(false)
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
      activityApi.listByTask(selectedTask.id).then(setTaskActivity).catch(() => {})
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

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentsApi.delete(commentId)
      setTaskComments((prev) => prev.filter((c) => c.id !== commentId))
      toast({
        title: 'Comment deleted',
        status: 'success',
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
        description: 'Verify a user with this email exists.',
        status: 'error',
        duration: 4000,
      })
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      await projectsApi.removeMember(projectId, userId)
      setMembers((prev) => prev.filter((m) => m.user.id !== userId))
      toast({
        title: 'Member removed',
        status: 'success',
        duration: 2500,
      })
    } catch {
      toast({
        title: 'Could not remove member',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteProject = async () => {
    setIsDeletingProject(true)
    try {
      await projectsApi.delete(projectId)
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 2500,
      })
      navigate('/projects')
    } catch {
      toast({
        title: 'Failed to delete project',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsDeletingProject(false)
      onCloseDeleteAlert()
    }
  }

  // Filter tasks
  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
        const matchesAssignee =
          assigneeFilter === 'ALL' ||
          (assigneeFilter === 'MY_TASKS'
            ? t.assignee?.id === currentUser?.id
            : assigneeFilter === 'UNASSIGNED'
            ? !t.assignee
            : t.assignee?.id === Number(assigneeFilter))
        return matchesSearch && matchesPriority && matchesAssignee
      })
    : []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const columns: { status: TaskStatus; label: string; badge: 'neutral' | 'brand' | 'success' }[] = [
    { status: 'TODO', label: 'To Do', badge: 'neutral' },
    { status: 'IN_PROGRESS', label: 'In Progress', badge: 'brand' },
    { status: 'DONE', label: 'Done', badge: 'success' },
  ]

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Stack spacing={6}>
          <Skeleton h="24px" w="180px" />
          <Skeleton h="120px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Skeleton h="450px" />
            <Skeleton h="450px" />
            <Skeleton h="450px" />
          </SimpleGrid>
        </Stack>
      </Container>
    )
  }

  return (
    <Box py={{ base: 6, md: 8 }}>
      <Container maxW="container.xl">
        {/* Navigation Breadcrumb */}
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            as={RouterLink}
            to="/projects"
            variant="ghost"
            size="xs"
            leftIcon={<ArrowLeft size={14} />}
          >
            Project Directory
          </Button>

          <HStack spacing={2}>
            {isOwner ? (
              <Badge variant="brand" fontSize="3xs">
                <Crown size={10} style={{ marginRight: 3 }} /> OWNER (FULL ACCESS)
              </Badge>
            ) : (
              <Badge variant="neutral" fontSize="3xs">
                <Shield size={10} style={{ marginRight: 3 }} /> COLLABORATOR
              </Badge>
            )}
          </HStack>
        </Flex>

        {/* Project Header Sheet with Sprint Progress */}
        <Box
          bg="surface.base"
          border="1px solid"
          borderColor="border.default"
          borderRadius="md"
          p={{ base: 5, md: 6 }}
          mb={6}
        >
          <Stack spacing={5}>
            <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
              <Stack spacing={1}>
                <HStack spacing={2.5}>
                  <Heading as="h1" size="lg" fontWeight="700" color="ink.primary" letterSpacing="tight">
                    {project?.name}
                  </Heading>
                  <Badge variant="neutral" fontSize="3xs">
                    ID #{project?.id}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color="ink.secondary" maxW="2xl">
                  {project?.description || 'No project description provided.'}
                </Text>
              </Stack>

              <HStack spacing={2.5} wrap="wrap">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Users size={14} />}
                  onClick={onOpenMemberModal}
                >
                  Team ({members.length + 1})
                </Button>

                <Button
                  variant="solid"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={onOpenTaskModal}
                >
                  New Task
                </Button>

                {isOwner && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={onOpenDeleteAlert}
                  >
                    Delete Project
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Velocity Progress Rail */}
            <Box bg="surface.subtle" p={3.5} borderRadius="sm" border="1px solid" borderColor="border.subtle">
              <Flex justify="space-between" align="center" mb={2}>
                <HStack spacing={2} fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary">
                  <CheckCircle2 size={13} color="#173B36" />
                  <Text>SPRINT COMPLETION</Text>
                </HStack>
                <Text fontSize="2xs" fontFamily="mono" fontWeight="600" color="ink.primary">
                  {completedTasks} / {totalTasks} TASKS COMPLETED ({progressPercent}%)
                </Text>
              </Flex>
              <Progress value={progressPercent} size="xs" colorScheme="green" borderRadius="none" />
            </Box>
          </Stack>
        </Box>

        {/* Filter Controls */}
        <Box
          bg="surface.base"
          border="1px solid"
          borderColor="border.default"
          borderRadius="sm"
          p={3}
          mb={6}
        >
          <Flex direction={{ base: 'column', md: 'row' }} gap={3} align="center">
            <InputGroup size="sm" flex="1">
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="#8E948D" />
              </InputLeftElement>
              <Input
                placeholder="Filter tasks by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <HStack spacing={2} w={{ base: 'full', md: 'auto' }}>
              <Select
                size="sm"
                w={{ base: 'full', md: '140px' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </Select>

              <Select
                size="sm"
                w={{ base: 'full', md: '170px' }}
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="ALL">All Assignees</option>
                <option value="MY_TASKS">⚡ Assigned to Me</option>
                <option value="UNASSIGNED">Unassigned</option>
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
            </HStack>
          </Flex>
        </Box>

        {/* Workspace Tabs */}
        <Tabs variant="line">
          <TabList mb={6}>
            <Tab fontWeight="600" fontSize="sm">
              Kanban Board ({filteredTasks.length})
            </Tab>
            <Tab fontWeight="600" fontSize="sm">
              Team Directory ({members.length + 1})
            </Tab>
          </TabList>

          <TabPanels>
            {/* Panel 1: Kanban Board */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                {columns.map((col) => {
                  const columnTasks = filteredTasks.filter((t) => t.status === col.status)
                  return (
                    <Box
                      key={col.status}
                      bg="surface.subtle"
                      p={3.5}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="border.default"
                      minH="500px"
                    >
                      {/* Column Header */}
                      <Flex justify="space-between" align="center" mb={3} pb={2} borderBottom="1px solid" borderColor="border.subtle">
                        <HStack spacing={2}>
                          <Text fontWeight="700" fontSize="2xs" fontFamily="mono" textTransform="uppercase" letterSpacing="wider" color="ink.primary">
                            {col.label}
                          </Text>
                          <Badge variant="neutral" fontSize="3xs">
                            {columnTasks.length}
                          </Badge>
                        </HStack>
                      </Flex>

                      {/* Column Tasks */}
                      <Stack spacing={2.5}>
                        {columnTasks.map((task) => {
                          const isAssignedToMe = task.assignee?.id === currentUser?.id
                          const isOverdue =
                            task.due_date &&
                            task.status !== 'DONE' &&
                            new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0))

                          return (
                            <Box
                              key={task.id}
                              bg="surface.base"
                              border="1px solid"
                              borderColor="border.default"
                              borderRadius="sm"
                              p={3.5}
                              pl={4.5}
                              position="relative"
                              overflow="hidden"
                              transition="all 0.1s ease-out"
                              _hover={{
                                borderColor: 'border.dark',
                                transform: 'translate(0, -1px)',
                              }}
                            >
                              {/* Left Priority Rail */}
                              <Box
                                position="absolute"
                                top={0}
                                left={0}
                                bottom={0}
                                w="3px"
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
                                  <Text
                                    fontWeight="600"
                                    fontSize="xs"
                                    color="ink.primary"
                                    cursor="pointer"
                                    onClick={() => openTaskDetailModal(task)}
                                    _hover={{ color: 'brand.primary' }}
                                    lineHeight="short"
                                  >
                                    {task.title}
                                  </Text>

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
                                    <MenuList minW="130px" p={1} fontSize="xs" boxShadow="tactile" borderColor="border.dark" borderRadius="sm">
                                      <MenuItem
                                        isDisabled={task.status === 'TODO'}
                                        onClick={() => handleStatusChange(task, 'TODO')}
                                      >
                                        Move to To Do
                                      </MenuItem>
                                      <MenuItem
                                        isDisabled={task.status === 'IN_PROGRESS'}
                                        onClick={() => handleStatusChange(task, 'IN_PROGRESS')}
                                      >
                                        Move to In Progress
                                      </MenuItem>
                                      <MenuItem
                                        isDisabled={task.status === 'DONE'}
                                        onClick={() => handleStatusChange(task, 'DONE')}
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
                                    onClick={() => openTaskDetailModal(task)}
                                  >
                                    {task.description}
                                  </Text>
                                )}

                                <Divider borderColor="border.subtle" />

                                <Flex justify="space-between" align="center" fontSize="3xs" color="ink.muted" fontFamily="mono">
                                  <HStack spacing={1.5}>
                                    <Text>#{task.id}</Text>
                                    {isAssignedToMe && (
                                      <Badge variant="brandSubtle" fontSize="3xs" px={1}>
                                        YOU
                                      </Badge>
                                    )}
                                  </HStack>

                                  <HStack spacing={1}>
                                    <Clock size={11} color={isOverdue ? '#991B1B' : undefined} />
                                    <Text color={isOverdue ? 'state.error.text' : undefined} fontWeight={isOverdue ? 'bold' : 'normal'}>
                                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'NO DUE DATE'}
                                    </Text>
                                  </HStack>
                                </Flex>
                              </Stack>
                            </Box>
                          )
                        })}

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
                    </Box>
                  )
                })}
              </SimpleGrid>
            </TabPanel>

            {/* Panel 2: Team Members */}
            <TabPanel p={0}>
              <Box
                bg="surface.base"
                border="1px solid"
                borderColor="border.default"
                borderRadius="md"
                p={5}
              >
                <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="border.subtle">
                  <Stack spacing={0.5}>
                    <Heading as="h3" size="sm" color="ink.primary">
                      Project Collaborators
                    </Heading>
                    <Text fontSize="xs" color="ink.secondary">
                      Members with authorization to assign tasks and post project notes.
                    </Text>
                  </Stack>

                  {isOwner && (
                    <Button
                      variant="solid"
                      size="xs"
                      leftIcon={<UserPlus size={14} />}
                      onClick={onOpenMemberModal}
                    >
                      Invite Member
                    </Button>
                  )}
                </Flex>

                <Stack spacing={2.5}>
                  {/* Owner Row */}
                  {project?.owner && (
                    <Flex
                      justify="space-between"
                      align="center"
                      p={3}
                      borderRadius="sm"
                      bg="surface.subtle"
                      border="1px solid"
                      borderColor="border.default"
                    >
                      <HStack spacing={3}>
                        <Avatar size="xs" name={project.owner.username} bg="brand.primary" color="ink.inverse" />
                        <Box>
                          <HStack spacing={1.5}>
                            <Text fontSize="xs" fontWeight="600" color="ink.primary">
                              {project.owner.username}
                            </Text>
                            <Crown size={13} color="#173B36" />
                            {project.owner.id === currentUser?.id && (
                              <Badge variant="neutral" fontSize="3xs">YOU</Badge>
                            )}
                          </HStack>
                          <Text fontSize="2xs" color="ink.secondary">
                            {project.owner.email}
                          </Text>
                        </Box>
                      </HStack>

                      <Badge variant="brand" fontSize="3xs">
                        PROJECT OWNER
                      </Badge>
                    </Flex>
                  )}

                  {/* Collaborator Rows */}
                  {members
                    .filter((m) => m.user.id !== project?.owner?.id)
                    .map((member) => {
                      const isMe = member.user.id === currentUser?.id
                      return (
                        <Flex
                          key={member.id}
                          justify="space-between"
                          align="center"
                          p={3}
                          borderRadius="sm"
                          bg="surface.base"
                          border="1px solid"
                          borderColor="border.default"
                        >
                          <HStack spacing={3}>
                            <Avatar size="xs" name={member.user.username} bg="slate.500" />
                            <Box>
                              <HStack spacing={1.5}>
                                <Text fontSize="xs" fontWeight="600" color="ink.primary">
                                  {member.user.username}
                                </Text>
                                {isMe && <Badge variant="neutral" fontSize="3xs">YOU</Badge>}
                              </HStack>
                              <Text fontSize="2xs" color="ink.secondary">
                                {member.user.email}
                              </Text>
                            </Box>
                          </HStack>

                          <HStack spacing={3}>
                            <Badge variant="neutral" fontSize="3xs">
                              COLLABORATOR
                            </Badge>

                            {isOwner && (
                              <Tooltip label="Remove collaborator" placement="top">
                                <IconButton
                                  aria-label="Remove collaborator"
                                  icon={<Trash2 size={13} />}
                                  variant="ghost"
                                  size="xs"
                                  color="state.error.text"
                                  onClick={() => handleRemoveMember(member.user.id)}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Flex>
                      )
                    })}

                  {members.filter((m) => m.user.id !== project?.owner?.id).length === 0 && (
                    <Text fontSize="xs" color="ink.muted" textAlign="center" py={3}>
                      No additional collaborators invited yet.
                    </Text>
                  )}
                </Stack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Create Task Modal */}
        <Modal isOpen={isTaskModalOpen} onClose={onCloseTaskModal} isCentered>
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCreateTask}>
            <ModalHeader>Create New Task</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={3.5}>
                <FormControl isRequired>
                  <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                  <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                    <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                    <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                  <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                  <Text isTruncated maxW="380px">{selectedTask.title}</Text>
                  <Badge variant="brandSubtle">TASK #{selectedTask.id}</Badge>
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* Status Bar */}
                <Flex justify="space-between" align="center" p={3} bg="surface.subtle" border="1px solid" borderColor="border.default" borderRadius="sm" mb={5}>
                  <HStack spacing={2}>
                    <Text fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary">
                      STATUS:
                    </Text>
                    <Select
                      size="sm"
                      w="140px"
                      value={selectedTask.status}
                      onChange={(e) => handleStatusChange(selectedTask, e.target.value as TaskStatus)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </Select>
                  </HStack>

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
                            <Text fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.muted" textTransform="uppercase" mb={1}>
                              Description
                            </Text>
                            <Text fontSize="xs" color="ink.primary" whiteSpace="pre-wrap">
                              {selectedTask.description || 'No description provided.'}
                            </Text>
                          </Box>

                          <Divider borderColor="border.subtle" />

                          <SimpleGrid columns={2} spacing={4} fontSize="xs">
                            <Box>
                              <Text fontSize="3xs" fontFamily="mono" fontWeight="700" color="ink.muted" textTransform="uppercase">
                                Assignee
                              </Text>
                              <Text color="ink.primary" fontWeight="600">
                                {selectedTask.assignee ? selectedTask.assignee.username : 'Unassigned'}
                              </Text>
                            </Box>

                            <Box>
                              <Text fontSize="3xs" fontFamily="mono" fontWeight="700" color="ink.muted" textTransform="uppercase">
                                Due Date
                              </Text>
                              <Text color="ink.primary" fontWeight="600" fontFamily="mono">
                                {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'None'}
                              </Text>
                            </Box>
                          </SimpleGrid>

                          <Flex justify="flex-end" pt={2}>
                            <Button size="xs" variant="outline" leftIcon={<Edit3 size={12} />} onClick={() => setIsEditingTask(true)}>
                              Edit Task
                            </Button>
                          </Flex>
                        </Stack>
                      ) : (
                        /* Edit Mode Form */
                        <Stack spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
                              Title
                            </FormLabel>
                            <Input
                              size="sm"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                              <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
                                Priority
                              </FormLabel>
                              <Select
                                size="sm"
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                            <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
                            <Button size="xs" variant="ghost" onClick={() => setIsEditingTask(false)}>
                              Cancel
                            </Button>
                            <Button
                              size="xs"
                              variant="solid"
                              onClick={handleSaveTaskEdits}
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
                      <Stack spacing={3}>
                        <Stack spacing={2} maxH="200px" overflowY="auto">
                          {taskComments.map((c) => {
                            const canDelete = isOwner || c.author.id === currentUser?.id
                            return (
                              <Box key={c.id} p={2.5} bg="surface.subtle" borderRadius="sm" border="1px solid" borderColor="border.subtle">
                                <Flex justify="space-between" align="center" mb={1}>
                                  <HStack spacing={1.5}>
                                    <Text fontSize="xs" fontWeight="700" color="ink.primary">
                                      {c.author.username}
                                    </Text>
                                    {c.author.id === currentUser?.id && (
                                      <Badge variant="neutral" fontSize="3xs">YOU</Badge>
                                    )}
                                  </HStack>
                                  <HStack spacing={2}>
                                    <Text fontSize="3xs" fontFamily="mono" color="ink.muted">
                                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    {canDelete && (
                                      <IconButton
                                        aria-label="Delete note"
                                        icon={<Trash2 size={11} />}
                                        size="2xs"
                                        variant="ghost"
                                        color="state.error.text"
                                        onClick={() => handleDeleteComment(c.id)}
                                      />
                                    )}
                                  </HStack>
                                </Flex>
                                <Text fontSize="xs" color="ink.primary">
                                  {c.content}
                                </Text>
                              </Box>
                            )
                          })}

                          {taskComments.length === 0 && (
                            <Text fontSize="2xs" color="ink.muted" textAlign="center" py={3}>
                              No notes posted yet.
                            </Text>
                          )}
                        </Stack>

                        <Flex as="form" onSubmit={handleAddComment} gap={2}>
                          <Input
                            placeholder="Write note..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            type="submit"
                            aria-label="Send"
                            icon={<Send size={13} />}
                            variant="solid"
                            size="sm"
                            isLoading={submittingComment}
                          />
                        </Flex>
                      </Stack>
                    </TabPanel>

                    {/* Tab 3: Activity Timeline */}
                    <TabPanel p={1}>
                      <Stack spacing={2} maxH="200px" overflowY="auto">
                        {taskActivity.map((log) => (
                          <Flex key={log.id} gap={2.5} p={2} bg="surface.subtle" borderRadius="sm" align="start">
                            <Box mt={0.5}>
                              <CheckCircle size={13} color="#173B36" />
                            </Box>
                            <Box flex="1">
                              <HStack justify="space-between">
                                <Text fontSize="xs" fontWeight="700" color="ink.primary">
                                  {log.user ? log.user.username : 'System'}
                                </Text>
                                <Text fontSize="3xs" fontFamily="mono" color="ink.muted">
                                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </HStack>
                              <Text fontSize="2xs" color="ink.secondary">
                                {log.action}
                              </Text>
                            </Box>
                          </Flex>
                        ))}

                        {taskActivity.length === 0 && (
                          <Text fontSize="2xs" color="ink.muted" textAlign="center" py={3}>
                            No activity logged yet.
                          </Text>
                        )}
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              <ModalFooter justifyContent="space-between">
                {(isOwner || selectedTask.creator?.id === currentUser?.id) ? (
                  <Button
                    variant="danger"
                    size="xs"
                    leftIcon={<Trash2 size={13} />}
                    onClick={handleDeleteTask}
                    isLoading={isDeletingTask}
                  >
                    Delete Task
                  </Button>
                ) : (
                  <Box />
                )}
                <Button variant="ghost" size="xs" onClick={onCloseTaskDetail}>
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
                <FormLabel fontSize="2xs" fontFamily="mono" fontWeight="700" color="ink.secondary" textTransform="uppercase">
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
              <HStack spacing={2.5}>
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

        {/* Delete Project Alert Dialog */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelDeleteRef}
          onClose={onCloseDeleteAlert}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="md" fontWeight="bold">
                <HStack spacing={2}>
                  <AlertCircle size={18} color="#991B1B" />
                  <Text>Delete Project</Text>
                </HStack>
              </AlertDialogHeader>

              <AlertDialogBody fontSize="xs">
                Are you sure you want to delete <strong>{project?.name}</strong>? All associated tasks, comments, and member allocations will be permanently removed.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={onCloseDeleteAlert} variant="ghost" size="xs">
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteProject}
                  ml={2}
                  size="xs"
                  isLoading={isDeletingProject}
                >
                  Delete Project
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  )
}
