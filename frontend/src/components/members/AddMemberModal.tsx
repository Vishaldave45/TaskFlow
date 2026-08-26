import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from '@chakra-ui/react'
import { useAddMemberMutation } from '@/hooks/useProjectMembers'

const addMemberSchema = z.object({
  email: z.string().email('Enter a valid user email'),
})

type AddMemberFormValues = z.infer<typeof addMemberSchema>

interface AddMemberModalProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { mutate: addMember, isPending } = useAddMemberMutation(projectId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
  })

  const onSubmit = (data: AddMemberFormValues) => {
    addMember(data, {
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
              <Dialog.Title fontSize="md" fontWeight="600">Add Project Member</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label fontSize="xs" fontWeight="500">Member Email</Field.Label>
                    <Input
                      {...register('email')}
                      placeholder="colleague@example.com"
                      type="email"
                      size="sm"
                      borderRadius="6px"
                      bg="bg.subtle"
                      borderColor="border.subtle"
                    />
                    {errors.email && <Field.ErrorText fontSize="xs">{errors.email.message}</Field.ErrorText>}
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer mt="2">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" bg="brand.500" color="white" loading={isPending} _hover={{ bg: 'brand.600' }}>
                  Add Member
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
