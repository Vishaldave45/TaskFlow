import { useEffect, useState } from 'react'
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  TrendingUp,
  AlertCircle,
  Zap,
  CheckCircle2,
  Clock,
  MoreVertical,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { projectsApi } from '@/api/projects'
import { useAllTasks, useUpdateTask } from '@/features/tasks'
import { PageContainer, PageHeader } from '@/components/layout'
import { WorkroomSurface, MetaLabel, StatusBadge } from '@/components/ui'
import type { Project, Task, TaskStatus } from '@/types'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // TanStack Tasks Query & Mutation
  const {
    data: tasks = [],
  } = useAllTasks()
  const updateTask = useUpdateTask()

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
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const totalTasks = tasks.length
  const overallVelocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityTasks = myPendingTasks.filter((t) => t.priority === 'HIGH')
  const overdueTasks = myPendingTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))
  )

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
        category="EXECUTIVE OVERVIEW"
        title="Workspace Dashboard"
        description="Consolidated sprint metrics, high-priority allocations, and workspace tracking."
        badge={
          <Badge variant="brand" fontSize="3xs">
            <Zap size={10} style={{ marginRight: 3 }} /> LIVE PULSE
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
            Assigned to you across all projects
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
            {completedTasks} of {totalTasks} tasks finished
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
            Owned & collaboration projects
          </Text>
        </WorkroomSurface>

        <WorkroomSurface variant="base" p={3.5}>
          <HStack justify="space-between" mb={1.5}>
            <MetaLabel variant="subtle">URGENT / OVERDUE</MetaLabel>
            <AlertCircle size={14} color="#DC2626" />
          </HStack>
          <Text fontSize="2xl" fontWeight="700" color={overdueTasks.length > 0 ? 'state.error.text' : 'ink.primary'} fontFamily="mono">
            {overdueTasks.length}
          </Text>
          <Text fontSize="3xs" color="ink.secondary" mt={0.5}>
            {highPriorityTasks.length} high priority allocations
          </Text>
        </WorkroomSurface>
      </SimpleGrid>

      {/* Main Dashboard Grid */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Column 1 & 2: Assigned to Me Tasks Ledger */}
        <Box gridColumn={{ base: 'span 1', lg: 'span 2' }}>
          <WorkroomSurface variant="base" p={5}>
            <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid" borderColor="border.subtle">
              <HStack spacing={2}>
                <Heading as="h3" size="sm" color="ink.primary">
                  My Tasks Ledger
                </Heading>
                <Badge variant="neutral" fontSize="3xs">
                  {myPendingTasks.length} ACTIVE
                </Badge>
              </HStack>
            </Flex>

            <Stack spacing={3}>
              {myPendingTasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0))

                return (
                  <WorkroomSurface
                    key={task.id}
                    variant="subtle"
                    p={3.5}
                    borderRadius="sm"
                    border="1px solid"
                    borderColor="border.default"
                    _hover={{ borderColor: 'border.dark', boxShadow: 'tactileSm' }}
                    transition="all 0.1s ease-out"
                  >
                    <Flex justify="space-between" align="start" gap={3}>
                      <Box flex="1">
                        <HStack spacing={2} mb={1}>
                          <StatusBadge status={task.status} type="status" />
                          <StatusBadge priority={task.priority} type="priority" />
                          <Text fontSize="3xs" fontFamily="mono" color="ink.muted">
                            PROJECT #{task.project}
                          </Text>
                        </HStack>

                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="ink.primary"
                          cursor="pointer"
                          onClick={() => navigate(`/projects/${task.project}`)}
                          _hover={{ color: 'brand.primary' }}
                        >
                          {task.title}
                        </Text>

                        {task.description && (
                          <Text fontSize="xs" color="ink.secondary" noOfLines={1} mt={0.5}>
                            {task.description}
                          </Text>
                        )}
                      </Box>

                      {/* Right Action Menu */}
                      <HStack spacing={2}>
                        <HStack spacing={1} fontSize="3xs" fontFamily="mono" color="ink.muted">
                          <Clock size={12} color={isOverdue ? '#991B1B' : undefined} />
                          <Text color={isOverdue ? 'state.error.text' : undefined} fontWeight={isOverdue ? 'bold' : 'normal'}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'NO DUE DATE'}
                          </Text>
                        </HStack>

                        <Menu placement="bottom-end">
                          <MenuButton
                            as={IconButton}
                            aria-label="Actions"
                            icon={<MoreVertical size={13} />}
                            size="2xs"
                            variant="ghost"
                          />
                          <MenuList minW="130px" p={1} fontSize="xs" boxShadow="tactile" borderColor="border.dark">
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
                            <MenuItem onClick={() => navigate(`/projects/${task.project}`)}>
                              Go to Project Workspace
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Flex>
                  </WorkroomSurface>
                )
              })}

              {myPendingTasks.length === 0 && (
                <Box py={8} textAlign="center">
                  <CheckCircle2 size={24} color="#16A34A" style={{ margin: '0 auto 8px' }} />
                  <Text fontSize="sm" fontWeight="600" color="ink.primary">
                    All caught up!
                  </Text>
                  <Text fontSize="xs" color="ink.muted" mt={1}>
                    No active tasks currently assigned to your profile.
                  </Text>
                </Box>
              )}
            </Stack>
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
