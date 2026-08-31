import { useEffect, useState, useCallback } from 'react'
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
import { tasksApi } from '@/api/tasks'
import { commentsApi } from '@/api/comments'
import { activityApi } from '@/api/activity'
import { PageContainer } from '@/components/layout'
import { ProjectHeader, ProjectStats } from '@/features/projects'
import {
  TaskBoard,
  TaskFilters,
  TaskCreateModal,
  TaskDetailModal,
} from '@/features/tasks'
import { MembersModal, MembersPanel } from '@/features/members'
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
  const {
    isOpen: isTaskModalOpen,
    onOpen: onOpenTaskModal,
    onClose: onCloseTaskModal,
  } = useDisclosure()
  const {
    isOpen: isMemberModalOpen,
    onOpen: onOpenMemberModal,
    onClose: onCloseMemberModal,
  } = useDisclosure()
  const {
    isOpen: isTaskDetailOpen,
    onOpen: onOpenTaskDetail,
    onClose: onCloseTaskDetail,
  } = useDisclosure()

  // Delete Alert
  const [isDeletingProject, setIsDeletingProject] = useState(false)
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
      activityApi
        .listByTask(selectedTask.id)
        .then(setTaskActivity)
        .catch(() => {})
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
      activityApi
        .listByTask(selectedTask.id)
        .then(setTaskActivity)
        .catch(() => {})
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
    : []

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
        isDeletingProject={isDeletingProject}
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
            Team Directory ({members.length + 1})
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel 1: Kanban Board */}
          <TabPanel p={0}>
            <TaskBoard
              tasks={filteredTasks}
              currentUser={currentUser}
              onOpenDetail={openTaskDetailModal}
              onStatusChange={handleStatusChange}
            />
          </TabPanel>

          {/* Panel 2: Team Members */}
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
        savingTask={savingTask}
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
        savingEdit={savingEdit}
        onSaveTaskEdits={handleSaveTaskEdits}
        onDeleteTask={handleDeleteTask}
        isDeletingTask={isDeletingTask}
        taskComments={taskComments}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        submittingComment={submittingComment}
        taskActivity={taskActivity}
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
