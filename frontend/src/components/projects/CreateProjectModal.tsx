import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useCreateProjectMutation } from '@/hooks/useProjects'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
})

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { mutate: createProject, isPending } = useCreateProjectMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
  })

  const onSubmit = (data: CreateProjectFormValues) => {
    createProject(data, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop bg="rgba(0,0,0,0.7)" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content bg="bg.surface" border="1px solid" borderColor="border.subtle" borderRadius="10px" maxW="md">
            <Dialog.Header>
              <Dialog.Title fontSize="md" fontWeight="600">Create New Project</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label fontSize="xs" fontWeight="500">Project Name</Field.Label>
                    <Input
                      {...register('name')}
                      placeholder="e.g. Mobile App Redesign"
                      size="sm"
                      borderRadius="6px"
                      bg="bg.subtle"
                      borderColor="border.subtle"
                    />
                    {errors.name && <Field.ErrorText fontSize="xs">{errors.name.message}</Field.ErrorText>}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="xs" fontWeight="500">Description (optional)</Field.Label>
                    <Textarea
                      {...register('description')}
                      placeholder="Brief overview of project goals..."
                      size="sm"
                      borderRadius="6px"
                      bg="bg.subtle"
                      borderColor="border.subtle"
                      rows={3}
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer mt="2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" bg="brand.500" color="white" loading={isPending} _hover={{ bg: 'brand.600' }}>
                  Create Project
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
