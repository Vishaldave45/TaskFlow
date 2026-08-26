import React from 'react'
import {
  Box,
  Button,
  Drawer,
  Flex,
  HStack,
  NativeSelect,
  Portal,
  Separator,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useTaskQuery, useUpdateTaskMutation, useDeleteTaskMutation } from '@/hooks/useTasks'
import { useProjectMembersQuery } from '@/hooks/useProjectMembers'
import { PriorityBadge, StatusBadge, TaskKeyBadge } from '@/components/ui/AppBadge'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { TaskPriority, TaskStatus } from '@/types/task'
import { Trash2, Calendar, User as UserIcon } from 'lucide-react'

interface TaskDetailDrawerProps {
  taskId: number | null
  projectOwnerId?: number
  onClose: () => void
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  taskId,
  projectOwnerId,
  onClose,
}) => {
  const { data: task, isLoading } = useTaskQuery(taskId || undefined)
  const { mutate: updateTask } = useUpdateTaskMutation(task?.project_id)
  const { mutate: deleteTask } = useDeleteTaskMutation()
  const { data: members = [] } = useProjectMembersQuery(task?.project_id)

  if (!taskId) return null

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete #TASK-${task?.id}?`)) {
      deleteTask(taskId, {
        onSuccess: () => onClose(),
      })
    }
  }

  return (
    <Drawer.Root open={!!taskId} onOpenChange={(e) => !e.open && onClose()} size="md">
      <Portal>
        <Drawer.Backdrop bg="rgba(0,0,0,0.6)" backdropFilter="blur(3px)" />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.surface" borderLeft="1px solid" borderColor="border.subtle" maxW="520px" overflowY="auto">
            <Drawer.Header borderBottom="1px solid" borderColor="border.subtle" py="4" px="6">
              <Flex justifyContent="space-between" alignItems="center" w="100%">
                <HStack gap="2">
                  <TaskKeyBadge id={taskId} />
                  {task && <StatusBadge status={task.status} />}
                </HStack>
                <HStack gap="2">
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#F06A6A"
                    _hover={{ bg: 'rgba(240,106,106,0.1)' }}
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} style={{ marginRight: '4px' }} />
                    Delete
                  </Button>
                  <Drawer.CloseTrigger asChild>
                    <Button size="xs" variant="ghost" onClick={onClose}>
                      ✕
                    </Button>
                  </Drawer.CloseTrigger>
                </HStack>
              </Flex>
            </Drawer.Header>

            <Drawer.Body p="6">
              {task && (
                <Stack gap="6">
                  {/* Task Title & Description */}
                  <Box>
                    <Text fontSize="lg" fontWeight="600" color="fg.default" mb="2">
                      {task.title}
                    </Text>
                    <Text fontSize="sm" color="fg.muted" whiteSpace="pre-wrap">
                      {task.description || 'No description provided.'}
                    </Text>
                  </Box>

                  {/* Task Properties grid */}
                  <Box p="4" bg="bg.subtle" borderRadius="8px" border="1px solid" borderColor="border.subtle">
                    <Stack gap="3">
                      {/* Status row */}
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" fontWeight="500" color="fg.muted">
                          Status
                        </Text>
                        <NativeSelect.Root size="xs" width="130px">
                          <NativeSelect.Field
                            value={task.status}
                            onChange={(e) =>
                              updateTask({
                                taskId: task.id,
                                payload: { status: e.target.value as TaskStatus },
                              })
                            }
                            bg="bg.surface"
                            borderColor="border.subtle"
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Flex>

                      {/* Priority row */}
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" fontWeight="500" color="fg.muted">
                          Priority
                        </Text>
                        <NativeSelect.Root size="xs" width="130px">
                          <NativeSelect.Field
                            value={task.priority}
                            onChange={(e) =>
                              updateTask({
                                taskId: task.id,
                                payload: { priority: e.target.value as TaskPriority },
                              })
                            }
                            bg="bg.surface"
                            borderColor="border.subtle"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Flex>

                      {/* Assignee row */}
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" fontWeight="500" color="fg.muted">
                          Assignee
                        </Text>
                        <NativeSelect.Root size="xs" width="160px">
                          <NativeSelect.Field
                            value={task.assignee?.id || ''}
                            onChange={(e) =>
                              updateTask({
                                taskId: task.id,
                                payload: {
                                  assignee_id: e.target.value ? Number(e.target.value) : null,
                                },
                              })
                            }
                            bg="bg.surface"
                            borderColor="border.subtle"
                          >
                            <option value="">Unassigned</option>
                            {members.map((m) => (
                              <option key={m.user.id} value={m.user.id}>
                                {m.user.username}
                              </option>
                            ))}
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Flex>

                      {/* Creator row */}
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontSize="xs" fontWeight="500" color="fg.muted">
                          Created By
                        </Text>
                        <Text fontSize="xs" color="fg.default">
                          {task.creator.username}
                        </Text>
                      </Flex>
                    </Stack>
                  </Box>

                  <Separator borderColor="border.subtle" />

                  {/* Comments Section */}
                  <CommentsSection taskId={task.id} projectOwnerId={projectOwnerId} />

                  <Separator borderColor="border.subtle" />

                  {/* Activity Timeline */}
                  <ActivityTimeline taskId={task.id} />
                </Stack>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
