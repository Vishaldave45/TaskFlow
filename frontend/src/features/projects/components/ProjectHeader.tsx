import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react'
import { AlertCircle, Crown, Plus, Shield, Trash2, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import type { Project, ProjectMember } from '@/types'

interface ProjectHeaderProps {
  project: Project | null
  members: ProjectMember[]
  isOwner: boolean
  onOpenMemberModal: () => void
  onOpenTaskModal: () => void
  onOpenDeleteAlert: () => void
  isDeleteAlertOpen: boolean
  onCloseDeleteAlert: () => void
  onDeleteProject: () => void
  isDeletingProject: boolean
}

export function ProjectHeader({
  project,
  members,
  isOwner,
  onOpenMemberModal,
  onOpenTaskModal,
  onOpenDeleteAlert,
  isDeleteAlertOpen,
  onCloseDeleteAlert,
  onDeleteProject,
  isDeletingProject,
}: ProjectHeaderProps) {
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspaces', to: '/projects' },
          { label: project?.name || 'Workspace' },
        ]}
        category="WORKSPACE PIPELINE"
        title={project?.name || 'Project Details'}
        description={project?.description || 'No project description provided.'}
        badge={
          isOwner ? (
            <Badge variant="brand" fontSize="3xs">
              <Crown size={10} style={{ marginRight: 3 }} /> OWNER
            </Badge>
          ) : (
            <Badge variant="outline" fontSize="3xs">
              <Shield size={10} style={{ marginRight: 3 }} /> COLLABORATOR
            </Badge>
          )
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users size={14} />}
              onClick={onOpenMemberModal}
            >
              Team ({members.length + 1})
            </Button>

            <Button
              variant="solid"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={onOpenTaskModal}
            >
              New Task
            </Button>

            {isOwner && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 size={14} />}
                onClick={onOpenDeleteAlert}
              >
                Delete
              </Button>
            )}
          </>
        }
      />

      {/* Delete Project Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onCloseDeleteAlert}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="md" fontWeight="bold">
              <HStack spacing={2}>
                <AlertCircle size={18} color="#991B1B" />
                <Text>Delete Project</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody fontSize="xs">
              Are you sure you want to delete <strong>{project?.name}</strong>?
              All associated tasks, comments, and member allocations will be
              permanently removed.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelDeleteRef}
                onClick={onCloseDeleteAlert}
                variant="ghost"
                size="xs"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={onDeleteProject}
                ml={2}
                size="xs"
                isLoading={isDeletingProject}
              >
                Delete Project
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
