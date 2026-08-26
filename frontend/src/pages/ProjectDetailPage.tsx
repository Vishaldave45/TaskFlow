import React, { useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useProjectQuery } from '@/hooks/useProjects'
import { useTasksQuery } from '@/hooks/useTasks'
import { useProjectMembersQuery, useRemoveMemberMutation } from '@/hooks/useProjectMembers'
import { useAuth } from '@/hooks/useAuth'
import { TaskRow } from '@/components/tasks/TaskRow'
import { TaskFiltersBar } from '@/components/tasks/TaskFiltersBar'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'
import { AddMemberModal } from '@/components/members/AddMemberModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TaskFilters } from '@/types/task'
import {
  CheckSquare,
  Plus,
  Users,
  UserPlus,
  Trash2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const pId = Number(projectId)
  const { user } = useAuth()

  const { data: project, isLoading: isProjectLoading } = useProjectQuery(pId)
  const [filters, setFilters] = useState<TaskFilters>({ ordering: '-created_at' })
  const { data: tasks = [], isLoading: isTasksLoading } = useTasksQuery(pId, filters)
  const { data: members = [] } = useProjectMembersQuery(pId)
  const { mutate: removeMember } = useRemoveMemberMutation(pId)

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  const isOwner = user?.id === project?.owner.id

  if (isProjectLoading) {
    return <Text color="fg.muted">Loading project workspace...</Text>
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The requested project does not exist or you do not have permission."
      />
    )
  }

  const todoTasks = tasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = tasks.filter((t) => t.status === 'DONE')

  return (
    <Box maxW="1100px" mx="auto">
      {/* Back link & Project Header */}
      <Box mb="6">
        <RouterLink
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#8B95A5',
            marginBottom: '12px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </RouterLink>

        <Flex justifyContent="space-between" alignItems="flex-start">
          <Box>
            <HStack gap="3" mb="1">
              <Heading size="lg" fontWeight="700" color="fg.default">
                {project.name}
              </Heading>
              {isOwner && (
                <HStack gap="1" px="2" py="0.5" borderRadius="4px" bg="rgba(59, 130, 246, 0.12)">
                  <ShieldCheck size={12} color="#599eff" />
                  <Text fontSize="11px" color="#599eff" fontWeight="600">
                    Project Owner
                  </Text>
                </HStack>
              )}
            </HStack>
            <Text fontSize="sm" color="fg.muted">
              {project.description || 'No description provided.'}
            </Text>
          </Box>

          <HStack gap="2">
            <Button
              size="sm"
              variant="outline"
              borderColor="border.subtle"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <UserPlus size={15} style={{ marginRight: '6px' }} />
              Add Member
            </Button>
            <Button
              size="sm"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus size={16} style={{ marginRight: '6px' }} />
              New Task
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Task Summary Badges */}
      <HStack gap="3" mb="6" p="3" bg="bg.surface" borderRadius="8px" border="1px solid" borderColor="border.subtle">
        <HStack gap="2" px="3" py="1" borderRadius="6px" bg="bg.subtle">
          <Text fontSize="xs" color="fg.muted">Total Tasks:</Text>
          <Text fontSize="xs" fontWeight="600" color="fg.default">{tasks.length}</Text>
        </HStack>
        <HStack gap="2" px="3" py="1" borderRadius="6px" bg="rgba(139, 149, 165, 0.1)">
          <Text fontSize="xs" color="#8B95A5">Todo:</Text>
          <Text fontSize="xs" fontWeight="600" color="#8B95A5">{todoTasks.length}</Text>
        </HStack>
        <HStack gap="2" px="3" py="1" borderRadius="6px" bg="rgba(59, 130, 246, 0.1)">
          <Text fontSize="xs" color="#599eff">In Progress:</Text>
          <Text fontSize="xs" fontWeight="600" color="#599eff">{inProgressTasks.length}</Text>
        </HStack>
        <HStack gap="2" px="3" py="1" borderRadius="6px" bg="rgba(49, 214, 197, 0.1)">
          <Text fontSize="xs" color="#31D6C5">Done:</Text>
          <Text fontSize="xs" fontWeight="600" color="#31D6C5">{doneTasks.length}</Text>
        </HStack>
      </HStack>

      {/* Tabs: Tasks & Members */}
      <Tabs.Root defaultValue="tasks">
        <Tabs.List borderBottom="1px solid" borderColor="border.subtle" mb="6">
          <Tabs.Trigger value="tasks" fontSize="sm" fontWeight="600" pb="3">
            <CheckSquare size={16} style={{ marginRight: '6px' }} />
            Tasks ({tasks.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="members" fontSize="sm" fontWeight="600" pb="3">
            <Users size={16} style={{ marginRight: '6px' }} />
            Members ({members.length})
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tasks Tab Content */}
        <Tabs.Content value="tasks">
          <Stack gap="4">
            <TaskFiltersBar filters={filters} onChange={setFilters} />

            <VStack gap="2" alignItems="stretch">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTaskId(task.id)}
                />
              ))}

              {!isTasksLoading && tasks.length === 0 && (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks match the filters"
                  description="Create a task or clear filters to view project tasks."
                  actionLabel="New Task"
                  onAction={() => setIsCreateTaskOpen(true)}
                />
              )}
            </VStack>
          </Stack>
        </Tabs.Content>

        {/* Members Tab Content */}
        <Tabs.Content value="members">
          <VStack gap="3" alignItems="stretch">
            {members.map((member) => (
              <Flex
                key={member.id}
                alignItems="center"
                justifyContent="space-between"
                p="3.5"
                bg="bg.surface"
                borderRadius="6px"
                border="1px solid"
                borderColor="border.subtle"
              >
                <HStack gap="3">
                  <Flex
                    w="8"
                    h="8"
                    borderRadius="full"
                    bg="brand.500"
                    color="white"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="600"
                  >
                    {member.user.username.slice(0, 2).toUpperCase()}
                  </Flex>
                  <Box>
                    <Text fontSize="13px" fontWeight="600" color="fg.default">
                      {member.user.username}{' '}
                      {member.user.id === project.owner.id && (
                        <Text as="span" fontSize="10px" color="brand.400" fontWeight="600" ml="1">
                          (Owner)
                        </Text>
                      )}
                    </Text>
                    <Text fontSize="11px" color="fg.muted">
                      {member.user.email}
                    </Text>
                  </Box>
                </HStack>

                <HStack gap="3">
                  <Text fontSize="11px" color="fg.muted">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </Text>
                  {(isOwner || user?.id === member.user.id) && member.user.id !== project.owner.id && (
                    <Button
                      size="2xs"
                      variant="ghost"
                      color="fg.muted"
                      _hover={{ color: '#F06A6A', bg: 'rgba(240,106,106,0.1)' }}
                      onClick={() => removeMember(member.user.id)}
                      title="Remove member"
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        projectOwnerId={project.owner.id}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        projectId={pId}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        projectId={pId}
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </Box>
  )
}
