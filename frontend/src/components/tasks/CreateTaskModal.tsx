import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useCreateTaskMutation } from '@/hooks/useTasks'
import { useProjectMembersQuery } from '@/hooks/useProjectMembers'
import { TaskPriority, TaskStatus } from '@/types/task'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  assignee_id: z.string().optional().transform((val) => (val ? Number(val) : null)),
  due_date: z.string().optional().transform((val) => val || null),
})

type CreateTaskFormValues = z.infer<typeof createTaskSchema>

interface CreateTaskModalProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { mutate: createTask, isPending } = useCreateTaskMutation(projectId)
  const { data: members = [] } = useProjectMembersQuery(projectId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
    },
  })

  const onSubmit = (data: CreateTaskFormValues) => {
    createTask(
      {
        title: data.title,
        description: data.description || '',
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        assignee_id: data.assignee_id,
        due_date: data.due_date,
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg="rgba(0,0,0,0.7)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content bg="bg.surface" border="1px solid" borderColor="border.subtle" borderRadius="10px" maxW="md">
            <Dialog.Header>
              <Dialog.Title fontSize="md" fontWeight="600">Create Task</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root invalid={!!errors.title}>
                    <Field.Label fontSize="xs" fontWeight="500">Title</Field.Label>
                    <Input
                      {...register('title')}
                      placeholder="e.g. Implement refresh token rotation"
                      size="sm"
                      borderRadius="6px"
                      bg="bg.subtle"
                      borderColor="border.subtle"
                    />
                    {errors.title && <Field.ErrorText fontSize="xs">{String(errors.title.message)}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="xs" fontWeight="500">Description</Field.Label>
                    <Textarea
                      {...register('description')}
                      placeholder="Add details, acceptance criteria, or links..."
                      size="sm"
                      borderRadius="6px"
                      bg="bg.subtle"
                      borderColor="border.subtle"
                      rows={3}
                    />
                  </Field.Root>

                  <Stack direction="row" gap="4">
                    <Field.Root flex="1">
                      <Field.Label fontSize="xs" fontWeight="500">Priority</Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field {...register('priority')} bg="bg.subtle" borderColor="border.subtle">
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root flex="1">
                      <Field.Label fontSize="xs" fontWeight="500">Status</Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field {...register('status')} bg="bg.subtle" borderColor="border.subtle">
                          <option value="TODO">Todo</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>
                  </Stack>

                  <Stack direction="row" gap="4">
                    <Field.Root flex="1">
                      <Field.Label fontSize="xs" fontWeight="500">Assignee</Field.Label>
                      <NativeSelect.Root size="sm">
                        <NativeSelect.Field {...register('assignee_id')} bg="bg.subtle" borderColor="border.subtle">
                          <option value="">Unassigned</option>
                          {members.map((m) => (
                            <option key={m.user.id} value={m.user.id}>
                              {m.user.username} ({m.user.email})
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root flex="1">
                      <Field.Label fontSize="xs" fontWeight="500">Due Date</Field.Label>
                      <Input
                        type="date"
                        {...register('due_date')}
                        size="sm"
                        borderRadius="6px"
                        bg="bg.subtle"
                        borderColor="border.subtle"
                      />
                    </Field.Root>
                  </Stack>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer mt="2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" bg="brand.500" color="white" loading={isPending} _hover={{ bg: 'brand.600' }}>
                  Create Task
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
