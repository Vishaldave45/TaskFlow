import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  SimpleGrid,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { projectsApi } from '@/api/projects'
import { PageContainer } from '@/components/layout'
import { ProjectHeader, ProjectStats, useDeleteProject } from '@/features/projects'
import {
  TaskBoard,
  TaskFilters,
  TaskCreateModal,
  TaskDetailModal,
  InfiniteTaskList,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useInfiniteProjectTasks,
} from '@/features/tasks'
import { MembersModal, MembersPanel } from '@/features/members'
import type {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  ProjectMember,
} from '@/types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)

  // Tasks Query & Mutations (full list for Kanban board)
  const { data: tasks = [] } = useTasks(projectId)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  // Infinite scroll query for List View tab
  const {
    data: infiniteData,
    hasNextPage = false,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteProjectTasks(projectId)

  // Flatten infinite query pages for the list view
  const infiniteTasks = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.results) ?? [],
    [infiniteData],
  )

  // Role Checks
  const isOwner = project?.owner?.id === currentUser?.id

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL')

  // Modals
  const {
    isOpen: isMemberModalOpen,
    onOpen: onOpenMemberModal,
    onClose: onCloseMemberModal,
  } = useDisclosure()

  const {
    isOpen: isTaskModalOpen,
    onOpen: onOpenTaskModal,
    onClose: onCloseTaskModal,
  } = useDisclosure()

  const {
    isOpen: isTaskDetailOpen,
    onOpen: onOpenTaskDetail,
    onClose: onCloseTaskDetail,
  } = useDisclosure()

  // Delete Alert
  const deleteProject = useDeleteProject()
  const {
    isOpen: isDeleteAlertOpen,
    onOpen: onOpenDeleteAlert,
    onClose: onCloseDeleteAlert,
  } = useDisclosure()

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM')
  const [taskAssignee, setTaskAssignee] = useState<string>('')
  const [taskDueDate, setTaskDueDate] = useState('')

  // Selected Task Detail & Edit
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM')
  const [editAssignee, setEditAssignee] = useState<string>('')
  const [editDueDate, setEditDueDate] = useState('')
  const [isEditingTask, setIsEditingTask] = useState(false)

  // Add Member Form
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const toast = useToast()

  const loadProjectData = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [projectData, membersData] = await Promise.all([
        projectsApi.get(projectId),
        projectsApi.listMembers(projectId).catch(() => []),
      ])
      setProject(projectData)
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
    if (!taskTitle.trim() || !projectId) return

    try {
      await createTask.mutateAsync({
        projectId,
        data: {
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          priority: taskPriority,
          assignee_id: taskAssignee ? Number(taskAssignee) : null,
          due_date: taskDueDate || null,
        },
      })
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
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      const updated = await updateTask.mutateAsync({
        taskId: task.id,
        projectId,
        data: { status: newStatus },
      })
      if (selectedTask && selectedTask.id === task.id) {
        setSelectedTask(updated)
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

  const openTaskDetailModal = (task: Task) => {
    setSelectedTask(task)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditPriority(task.priority)
    setEditAssignee(task.assignee ? String(task.assignee.id) : '')
    setEditDueDate(task.due_date || '')
    setIsEditingTask(false)
    onOpenTaskDetail()
  }

  const handleSaveTaskEdits = async () => {
    if (!selectedTask || !editTitle.trim()) return

    try {
      const updated = await updateTask.mutateAsync({
        taskId: selectedTask.id,
        projectId,
        data: {
          title: editTitle.trim(),
          description: editDesc.trim(),
          priority: editPriority,
          assignee_id: editAssignee ? Number(editAssignee) : null,
          due_date: editDueDate || null,
        },
      })
      setSelectedTask(updated)
      setIsEditingTask(false)
      toast({
        title: 'Task updated',
        status: 'success',
        duration: 2500,
      })
    } catch {
      toast({
        title: 'Update failed',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    try {
      await deleteTask.mutateAsync({
        taskId: selectedTask.id,
        projectId,
      })
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
    try {
      await deleteProject.mutateAsync(projectId)
      toast({
        title: 'Project deleted',
        status: 'success',
        duration: 2500,
      })
      onCloseDeleteAlert()
      navigate('/projects')
    } catch {
      toast({
        title: 'Failed to delete project',
        status: 'error',
        duration: 3000,
      })
    }
  }

  // Apply filters to both views
  const applyFilters = (taskList: Task[]) =>
    taskList.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority =
        priorityFilter === 'ALL' || t.priority === priorityFilter
      const matchesAssignee =
        assigneeFilter === 'ALL' ||
        (assigneeFilter === 'MY_TASKS'
          ? t.assignee?.id === currentUser?.id
          : assigneeFilter === 'UNASSIGNED'
          ? !t.assignee
          : t.assignee?.id === Number(assigneeFilter))
      return matchesSearch && matchesPriority && matchesAssignee
    })

  const filteredTasks = applyFilters(Array.isArray(tasks) ? tasks : [])
  const filteredInfiniteTasks = applyFilters(infiniteTasks)

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length

  if (loading) {
    return (
      <PageContainer size="standard">
        <Stack spacing={6}>
          <Skeleton h="24px" w="180px" />
          <Skeleton h="120px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Skeleton h="450px" />
            <Skeleton h="450px" />
            <Skeleton h="450px" />
          </SimpleGrid>
        </Stack>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="standard">
      {/* Editorial Page Header */}
      <ProjectHeader
        project={project}
        members={members}
        isOwner={isOwner}
        onOpenMemberModal={onOpenMemberModal}
        onOpenTaskModal={onOpenTaskModal}
        onOpenDeleteAlert={onOpenDeleteAlert}
        isDeleteAlertOpen={isDeleteAlertOpen}
        onCloseDeleteAlert={onCloseDeleteAlert}
        onDeleteProject={handleDeleteProject}
        isDeletingProject={deleteProject.isPending}
      />

      {/* Velocity Progress Rail Sheet */}
      <ProjectStats
        totalTasks={totalTasks}
        completedTasks={completedTasks}
      />

      {/* Filter Controls Bar */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        project={project}
        members={members}
      />

      {/* Workspace Tabs */}
      <Tabs variant="line">
        <TabList mb={6}>
          <Tab fontWeight="600" fontSize="sm">
            Kanban Board ({filteredTasks.length})
          </Tab>
          <Tab fontWeight="600" fontSize="sm">
            List View ({filteredInfiniteTasks.length})
          </Tab>
          <Tab fontWeight="600" fontSize="sm">
            Team Directory ({members.length + 1})
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel 1: Kanban Board — loads ALL tasks for drag-and-drop */}
          <TabPanel p={0}>
            <TaskBoard
              tasks={filteredTasks}
              currentUser={currentUser}
              onOpenDetail={openTaskDetailModal}
              onStatusChange={handleStatusChange}
            />
          </TabPanel>

          {/* Panel 2: List View — infinite scroll with pagination */}
          <TabPanel p={0}>
            <InfiniteTaskList
              tasks={filteredInfiniteTasks}
              currentUser={currentUser}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              onOpenDetail={openTaskDetailModal}
              onStatusChange={handleStatusChange}
            />
          </TabPanel>

          {/* Panel 3: Team Members */}
          <TabPanel p={0}>
            <MembersPanel
              project={project}
              members={members}
              currentUser={currentUser}
              isOwner={isOwner}
              onOpenInviteModal={onOpenMemberModal}
              onRemoveMember={handleRemoveMember}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Create Task Modal */}
      <TaskCreateModal
        isOpen={isTaskModalOpen}
        onClose={onCloseTaskModal}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskDesc={taskDesc}
        setTaskDesc={setTaskDesc}
        taskPriority={taskPriority}
        setTaskPriority={setTaskPriority}
        taskAssignee={taskAssignee}
        setTaskAssignee={setTaskAssignee}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
        savingTask={createTask.isPending}
        onCreateTask={handleCreateTask}
        project={project}
        members={members}
      />

      {/* Task Detail & Comments Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={onCloseTaskDetail}
        selectedTask={selectedTask}
        currentUser={currentUser}
        isOwner={isOwner}
        project={project}
        members={members}
        onStatusChange={handleStatusChange}
        isEditingTask={isEditingTask}
        setIsEditingTask={setIsEditingTask}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        editAssignee={editAssignee}
        setEditAssignee={setEditAssignee}
        editDueDate={editDueDate}
        setEditDueDate={setEditDueDate}
        savingEdit={updateTask.isPending}
        onSaveTaskEdits={handleSaveTaskEdits}
        onDeleteTask={handleDeleteTask}
        isDeletingTask={deleteTask.isPending}
      />

      {/* Add Member Modal */}
      <MembersModal
        isOpen={isMemberModalOpen}
        onClose={onCloseMemberModal}
        memberEmail={memberEmail}
        setMemberEmail={setMemberEmail}
        onAddMember={handleAddMember}
        addingMember={addingMember}
      />
    </PageContainer>
  )
}
