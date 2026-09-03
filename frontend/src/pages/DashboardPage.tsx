import { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Button,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useToast,
  Badge,
  HStack,
  Flex,
  Heading,
  Progress,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { projectsApi } from '@/api/projects'
import { useInfiniteAllTasks, useUpdateTask, InfiniteTaskList } from '@/features/tasks'
import { PageContainer, PageHeader } from '@/components/layout'
import { WorkroomSurface, MetaLabel } from '@/components/ui'
import type { Project, Task, TaskStatus } from '@/types'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Infinite Tasks Query & Mutation
  const {
    data: infiniteData,
    hasNextPage = false,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteAllTasks()
  const updateTask = useUpdateTask()

  // Flatten all pages into a single array
  const tasks = useMemo(
    () => infiniteData?.pages.flatMap((page) => page.results) ?? [],
    [infiniteData],
  )

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const projectsData = await projectsApi.list()
        setProjects(Array.isArray(projectsData) ? projectsData : [])
      } catch {
        toast({
          title: 'Error loading dashboard',
          description: 'Failed to retrieve workspace metrics.',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [toast])

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        projectId: task.project,
        data: { status: newStatus },
      })
      toast({
        title: `Task marked ${newStatus.replace('_', ' ')}`,
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

  // Derived Metrics
  const myTasks = tasks.filter((t) => t.assignee?.id === user?.id)
  const myPendingTasks = myTasks.filter((t) => t.status !== 'DONE')
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const totalTasks = tasks.length
  const overallVelocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityTasks = myPendingTasks.filter((t) => t.priority === 'HIGH')
  const overdueTasks = myPendingTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))
  )

  // Contextual State-Driven Copy Generators
  const getTasksCopy = (count: number) => {
    if (count === 0) return 'Inbox clear — nothing on your plate right now'
    if (count === 1) return '1 task assigned and ready to tackle'
    if (count <= 3) return `${count} tasks assigned across your active projects`
    return `${count} tasks in flight — recommended to prioritize`
  }

  const getVelocityCopy = (pct: number, completed: number, total: number) => {
    if (total === 0) return 'No tasks created yet to track velocity'
    if (pct >= 80) return `Strong sprint pace — ${completed} of ${total} wrapped`
    if (pct >= 50) return `On track — ${completed} of ${total} completed`
    if (pct > 0) return `Sprint in motion — ${completed} of ${total} finished`
    return `Sprint kicked off — 0 of ${total} done`
  }

  const getWorkspacesCopy = (count: number) => {
    if (count === 0) return 'No active workspaces initialized'
    if (count === 1) return '1 active workspace connected'
    return `${count} projects across owned and team workspaces`
  }

  const getOverdueCopy = (overdueCount: number, highPriorityCount: number) => {
    if (overdueCount === 0 && highPriorityCount === 0) return 'All clean — no overdue or urgent tasks'
    if (overdueCount === 0) return `${highPriorityCount} high-priority tasks on schedule`
    if (overdueCount === 1) return '1 item is past due — tackle this first'
    return `${overdueCount} items past due — attention required`
  }

  const getDashboardDescription = () => {
    if (overdueTasks.length > 0) {
      return `${overdueTasks.length} ${overdueTasks.length === 1 ? 'task needs' : 'tasks need'} attention across ${projects.length} ${projects.length === 1 ? 'workspace' : 'workspaces'}.`
    }
    if (myPendingTasks.length > 0) {
      return `You have ${myPendingTasks.length} active ${myPendingTasks.length === 1 ? 'task' : 'tasks'} in progress across ${projects.length} ${projects.length === 1 ? 'workspace' : 'workspaces'}.`
    }
    return `All tasks are up to date across ${projects.length} ${projects.length === 1 ? 'workspace' : 'workspaces'}.`
  }

  if (loading) {
    return (
      <PageContainer size="standard">
        <Stack spacing={6}>
          <Skeleton h="36px" w="220px" />
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Skeleton h="90px" />
            <Skeleton h="90px" />
            <Skeleton h="90px" />
            <Skeleton h="90px" />
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
            <Skeleton h="350px" />
            <Skeleton h="350px" />
            <Skeleton h="350px" />
          </SimpleGrid>
        </Stack>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="standard">
      {/* Editorial Page Header */}
      <PageHeader
        category="DASHBOARD"
        title="Dashboard"
        description={getDashboardDescription()}
        badge={
          <Badge variant="brand" fontSize="3xs">
            <Zap size={10} style={{ marginRight: 3 }} /> LIVE SYNC
          </Badge>
        }
        actions={
          <Button
            as={RouterLink}
            to="/projects"
            variant="solid"
            size="sm"
            leftIcon={<FolderKanban size={14} />}
          >
            All Workspaces
          </Button>
        }
      />

      {/* KPI Metric Summary Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <WorkroomSurface variant="base" p={3.5}>
          <HStack justify="space-between" mb={1.5}>
            <MetaLabel variant="subtle">MY ACTIVE TASKS</MetaLabel>
            <Zap size={14} color="#2563EB" />
          </HStack>
          <Text fontSize="2xl" fontWeight="700" color="ink.primary" fontFamily="mono">
            {myPendingTasks.length}
          </Text>
          <Text fontSize="3xs" color="ink.secondary" mt={0.5}>
            {getTasksCopy(myPendingTasks.length)}
          </Text>
        </WorkroomSurface>

        <WorkroomSurface variant="base" p={3.5}>
          <HStack justify="space-between" mb={1.5}>
            <MetaLabel variant="subtle">OVERALL VELOCITY</MetaLabel>
            <TrendingUp size={14} color="#16A34A" />
          </HStack>
          <Text fontSize="2xl" fontWeight="700" color="ink.primary" fontFamily="mono">
            {overallVelocity}%
          </Text>
          <Text fontSize="3xs" color="ink.secondary" mt={0.5}>
            {getVelocityCopy(overallVelocity, completedTasks, totalTasks)}
          </Text>
        </WorkroomSurface>

        <WorkroomSurface variant="base" p={3.5}>
          <HStack justify="space-between" mb={1.5}>
            <MetaLabel variant="subtle">ACTIVE WORKSPACES</MetaLabel>
            <FolderKanban size={14} color="#173B36" />
          </HStack>
          <Text fontSize="2xl" fontWeight="700" color="ink.primary" fontFamily="mono">
            {projects.length}
          </Text>
          <Text fontSize="3xs" color="ink.secondary" mt={0.5}>
            {getWorkspacesCopy(projects.length)}
          </Text>
        </WorkroomSurface>

        <WorkroomSurface variant="base" p={3.5}>
          <HStack justify="space-between" mb={1.5}>
            <MetaLabel variant="subtle">URGENT / OVERDUE</MetaLabel>
            <AlertCircle size={14} color={overdueTasks.length > 0 ? '#DC2626' : '#16A34A'} />
          </HStack>
          <Text fontSize="2xl" fontWeight="700" color={overdueTasks.length > 0 ? 'state.error.text' : 'ink.primary'} fontFamily="mono">
            {overdueTasks.length}
          </Text>
          <Text fontSize="3xs" color="ink.secondary" mt={0.5}>
            {getOverdueCopy(overdueTasks.length, highPriorityTasks.length)}
          </Text>
        </WorkroomSurface>
      </SimpleGrid>

      {/* Main Dashboard Grid */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Column 1 & 2: My Tasks Ledger with Infinite Scroll */}
        <Box gridColumn={{ base: 'span 1', lg: 'span 2' }}>
          <WorkroomSurface variant="base" p={0} overflow="hidden">
            <Flex justify="space-between" align="center" px={5} pt={5} pb={3} borderBottom="1px solid" borderColor="border.subtle">
              <HStack spacing={2}>
                <Heading as="h3" size="sm" color="ink.primary">
                  My Tasks Ledger
                </Heading>
                <Badge variant="neutral" fontSize="3xs">
                  {myPendingTasks.length} ACTIVE
                </Badge>
              </HStack>
            </Flex>

            {/* Infinite scrolling task list */}
            <InfiniteTaskList
              tasks={tasks}
              currentUser={user}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              onOpenDetail={(task) => navigate(`/projects/${task.project}`)}
              onStatusChange={handleStatusChange}
              onNavigateToProject={(projectId) => navigate(`/projects/${projectId}`)}
              showProject
            />
          </WorkroomSurface>
        </Box>

        {/* Column 3: Active Workspaces Snapshot */}
        <Box>
          <WorkroomSurface variant="base" p={5}>
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="border.subtle">
              <Heading as="h3" size="sm" color="ink.primary">
                Workspaces
              </Heading>
              <Button
                as={RouterLink}
                to="/projects"
                size="2xs"
                variant="ghost"
                rightIcon={<ArrowRight size={11} />}
              >
                View All
              </Button>
            </Flex>

            <Stack spacing={3}>
              {projects.slice(0, 5).map((p) => {
                const projectTasks = tasks.filter((t) => t.project === p.id)
                const pCompleted = projectTasks.filter((t) => t.status === 'DONE').length
                const pTotal = projectTasks.length
                const pPct = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0

                return (
                  <WorkroomSurface
                    key={p.id}
                    variant="subtle"
                    p={3.5}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="border.default"
                    cursor="pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                    _hover={{ borderColor: 'border.dark', boxShadow: 'tactileSm' }}
                    transition="all 0.1s ease-out"
                  >
                    <Flex justify="space-between" align="start" mb={1}>
                      <Text fontSize="xs" fontWeight="700" color="ink.primary">
                        {p.name}
                      </Text>
                      <Badge variant="brand" fontSize="3xs">
                        {pPct}%
                      </Badge>
                    </Flex>

                    <Text fontSize="2xs" color="ink.secondary" noOfLines={1} mb={2}>
                      {p.description || 'No description'}
                    </Text>

                    <Progress value={pPct} size="2xs" colorScheme="green" borderRadius="none" />
                  </WorkroomSurface>
                )
              })}

              {projects.length === 0 && (
                <Text fontSize="xs" color="ink.muted" textAlign="center" py={4}>
                  No workspaces created yet.
                </Text>
              )}
            </Stack>
          </WorkroomSurface>
        </Box>
      </SimpleGrid>
    </PageContainer>
  )
}
