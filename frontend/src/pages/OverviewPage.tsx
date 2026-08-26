import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { useProjectsQuery } from '@/hooks/useProjects'
import { useTasksQuery } from '@/hooks/useTasks'
import { TaskRow } from '@/components/tasks/TaskRow'
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { FolderKanban, CheckSquare, Plus, ArrowRight } from 'lucide-react'

export const OverviewPage: React.FC = () => {
  const { user } = useAuth()
  const { data: projects = [] } = useProjectsQuery()
  const firstProjectId = projects[0]?.id
  const { data: tasks = [] } = useTasksQuery(firstProjectId)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  const pendingTasks = tasks.filter((t) => t.status !== 'DONE')

  return (
    <Box maxW="1100px" mx="auto">
      {/* Welcome Header */}
      <Flex justifyContent="space-between" alignItems="flex-start" mb="8">
        <Box>
          <Text fontSize="xs" fontWeight="600" color="brand.400" letterSpacing="0.05em" textTransform="uppercase">
            Workspace Overview
          </Text>
          <Heading size="lg" fontWeight="700" color="fg.default" mt="1">
            Good afternoon, {user?.username}
          </Heading>
          <Text fontSize="sm" color="fg.muted" mt="1">
            {pendingTasks.length > 0
              ? `You have ${pendingTasks.length} pending tasks requiring attention.`
              : 'All caught up! No urgent tasks pending.'}
          </Text>
        </Box>

        <Button
          size="sm"
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600' }}
          onClick={() => setIsCreateProjectOpen(true)}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          New Project
        </Button>
      </Flex>

      {/* Projects Quick View */}
      <Box mb="10">
        <Flex justifyContent="space-between" alignItems="center" mb="4">
          <Text fontSize="xs" fontWeight="600" color="fg.muted" letterSpacing="0.06em" textTransform="uppercase">
            Active Projects ({projects.length})
          </Text>
          <RouterLink to="/projects" style={{ fontSize: '12px', color: '#599eff', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all <ArrowRight size={12} />
          </RouterLink>
        </Flex>

        {projects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            {projects.slice(0, 3).map((proj) => (
              <RouterLink key={proj.id} to={`/projects/${proj.id}`} style={{ textDecoration: 'none' }}>
                <Box
                  p="4"
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="8px"
                  transition="all 0.15s ease"
                  _hover={{
                    borderColor: 'brand.500',
                    bg: 'bg.elevated',
                    transform: 'translateY(-1px)',
                  }}
                >
                  <HStack gap="2" mb="2">
                    <Box w="6px" h="6px" borderRadius="full" bg="brand.500" />
                    <Text fontSize="sm" fontWeight="600" color="fg.default" truncate>
                      {proj.name}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="fg.muted" lineClamp={2} minH="32px">
                    {proj.description || 'No description.'}
                  </Text>
                  <Flex justifyContent="space-between" alignItems="center" mt="4" pt="3" borderTop="1px solid" borderColor="border.subtle">
                    <Text fontSize="11px" color="fg.muted">
                      Owner: {proj.owner.username}
                    </Text>
                    <Text fontSize="11px" color="brand.400" fontWeight="500">
                      Open ›
                    </Text>
                  </Flex>
                </Box>
              </RouterLink>
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects created yet"
            description="Create your first engineering project to start organizing tasks and collaborating."
            actionLabel="Create Project"
            onAction={() => setIsCreateProjectOpen(true)}
          />
        )}
      </Box>

      {/* Focus: Tasks Section */}
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb="4">
          <Text fontSize="xs" fontWeight="600" color="fg.muted" letterSpacing="0.06em" textTransform="uppercase">
            Recent Work & Tasks
          </Text>
          {firstProjectId && (
            <RouterLink to={`/projects/${firstProjectId}`} style={{ fontSize: '12px', color: '#599eff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Project Board <ArrowRight size={12} />
            </RouterLink>
          )}
        </Flex>

        <VStack gap="2" alignItems="stretch">
          {tasks.slice(0, 8).map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onClick={() => setSelectedTaskId(task.id)}
            />
          ))}

          {tasks.length === 0 && projects.length > 0 && (
            <EmptyState
              icon={CheckSquare}
              title="No tasks in current project"
              description="Open the project board to create and assign tasks."
            />
          )}
        </VStack>
      </Box>

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        projectOwnerId={projects[0]?.owner.id}
        onClose={() => setSelectedTaskId(null)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </Box>
  )
}
