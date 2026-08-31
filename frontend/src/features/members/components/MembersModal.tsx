import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Flex,
  Stack,
  Heading,
  Text,
  Avatar,
  Box,
  Badge,
  Tooltip,
  IconButton,
} from '@chakra-ui/react'
import { Crown, Trash2, UserPlus } from 'lucide-react'
import { WorkroomSurface } from '@/components/ui'
import type { Project, ProjectMember, User } from '@/types'

interface MembersModalProps {
  isOpen: boolean
  onClose: () => void
  memberEmail: string
  setMemberEmail: (email: string) => void
  onAddMember: (e: React.FormEvent) => void
  addingMember: boolean
}

export function MembersModal({
  isOpen,
  onClose,
  memberEmail,
  setMemberEmail,
  onAddMember,
  addingMember,
}: MembersModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={onAddMember}>
        <ModalHeader>Add Collaborator</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel
              fontSize="2xs"
              fontFamily="mono"
              fontWeight="700"
              color="ink.secondary"
              textTransform="uppercase"
            >
              User Email
            </FormLabel>
            <Input
              type="email"
              placeholder="collaborator@company.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              autoFocus
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2.5}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" isLoading={addingMember}>
              Add Member
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

interface MembersPanelProps {
  project: Project | null
  members: ProjectMember[]
  currentUser: User | null
  isOwner: boolean
  onOpenInviteModal: () => void
  onRemoveMember: (userId: number) => void
}

export function MembersPanel({
  project,
  members,
  currentUser,
  isOwner,
  onOpenInviteModal,
  onRemoveMember,
}: MembersPanelProps) {
  const nonOwnerMembers = members.filter((m) => m.user.id !== project?.owner?.id)

  return (
    <WorkroomSurface variant="base" p={5}>
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        pb={3}
        borderBottom="1px solid"
        borderColor="border.subtle"
      >
        <Stack spacing={0.5}>
          <Heading as="h3" size="sm" color="ink.primary">
            Project Collaborators
          </Heading>
          <Text fontSize="xs" color="ink.secondary">
            Members with authorization to assign tasks and post project notes.
          </Text>
        </Stack>

        {isOwner && (
          <Button
            variant="solid"
            size="xs"
            leftIcon={<UserPlus size={14} />}
            onClick={onOpenInviteModal}
          >
            Invite Member
          </Button>
        )}
      </Flex>

      <Stack spacing={2.5}>
        {/* Owner Row */}
        {project?.owner && (
          <Flex
            justify="space-between"
            align="center"
            p={3}
            borderRadius="sm"
            bg="surface.subtle"
            border="1px solid"
            borderColor="border.default"
          >
            <HStack spacing={3}>
              <Avatar
                size="xs"
                name={project.owner.username}
                bg="brand.primary"
                color="ink.inverse"
              />
              <Box>
                <HStack spacing={1.5}>
                  <Text fontSize="xs" fontWeight="600" color="ink.primary">
                    {project.owner.username}
                  </Text>
                  <Crown size={13} color="#173B36" />
                  {project.owner.id === currentUser?.id && (
                    <Badge variant="neutral" fontSize="3xs">
                      YOU
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="2xs" color="ink.secondary">
                  {project.owner.email}
                </Text>
              </Box>
            </HStack>

            <Badge variant="brand" fontSize="3xs">
              PROJECT OWNER
            </Badge>
          </Flex>
        )}

        {/* Collaborator Rows */}
        {nonOwnerMembers.map((member) => {
          const isMe = member.user.id === currentUser?.id
          return (
            <Flex
              key={member.id}
              justify="space-between"
              align="center"
              p={3}
              borderRadius="sm"
              bg="surface.base"
              border="1px solid"
              borderColor="border.default"
            >
              <HStack spacing={3}>
                <Avatar
                  size="xs"
                  name={member.user.username}
                  bg="brand.primary"
                  color="ink.inverse"
                />
                <Box>
                  <HStack spacing={1.5}>
                    <Text fontSize="xs" fontWeight="600" color="ink.primary">
                      {member.user.username}
                    </Text>
                    {isMe && (
                      <Badge variant="neutral" fontSize="3xs">
                        YOU
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="2xs" color="ink.secondary">
                    {member.user.email}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={3}>
                <Badge variant="neutral" fontSize="3xs">
                  COLLABORATOR
                </Badge>

                {isOwner && (
                  <Tooltip label="Remove collaborator" placement="top">
                    <IconButton
                      aria-label="Remove collaborator"
                      icon={<Trash2 size={13} />}
                      variant="ghost"
                      size="xs"
                      color="state.error.text"
                      onClick={() => onRemoveMember(member.user.id)}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>
          )
        })}

        {nonOwnerMembers.length === 0 && (
          <Text fontSize="xs" color="ink.muted" textAlign="center" py={3}>
            No additional collaborators invited yet.
          </Text>
        )}
      </Stack>
    </WorkroomSurface>
  )
}
