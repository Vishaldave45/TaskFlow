import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useProjectsQuery, useDeleteProjectMutation } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { FolderKanban, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react'

export const ProjectsPage: React.FC = () => {
  const { data: projects = [], isLoading } = useProjectsQuery()
  const { mutate: deleteProject } = useDeleteProjectMutation()
  const { user } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleDelete = (e: React.MouseEvent, projectId: number, name: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm(`Delete project "${name}" and all its tasks?`)) {
      deleteProject(projectId)
    }
  }

  return (
    <Box maxW="1100px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb="8">
        <Box>
          <Heading size="lg" fontWeight="700" color="fg.default">
            Projects
          </Heading>
          <Text fontSize="sm" color="fg.muted" mt="1">
            Manage your teams, tasks, and deliverables.
          </Text>
        </Box>

        <Button
          size="sm"
          bg="brand.500"
          color="white"
          _hover={{ bg: 'brand.600' }}
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Create Project
        </Button>
      </Flex>

      {projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {projects.map((proj) => {
            const isOwner = user?.id === proj.owner.id
            return (
              <RouterLink key={proj.id} to={`/projects/${proj.id}`} style={{ textDecoration: 'none' }}>
                <Box
                  p="5"
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="8px"
                  transition="all 0.15s ease"
                  _hover={{
                    borderColor: 'brand.500',
                    bg: 'bg.elevated',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  }}
                  minH="160px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <Box>
                    <Flex justifyContent="space-between" alignItems="center" mb="2">
                      <HStack gap="2">
                        <Box w="8px" h="8px" borderRadius="full" bg="brand.500" />
                        <Text fontSize="md" fontWeight="600" color="fg.default" truncate>
                          {proj.name}
                        </Text>
                      </HStack>

                      {isOwner && (
                        <HStack gap="1" px="1.5" py="0.5" borderRadius="4px" bg="rgba(59, 130, 246, 0.1)">
                          <ShieldCheck size={11} color="#599eff" />
                          <Text fontSize="10px" color="#599eff" fontWeight="600">
                            Owner
                          </Text>
                        </HStack>
                      )}
                    </Flex>

                    <Text fontSize="xs" color="fg.muted" lineClamp={3} mb="4">
                      {proj.description || 'No description provided.'}
                    </Text>
                  </Box>

                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    pt="3"
                    borderTop="1px solid"
                    borderColor="border.subtle"
                  >
                    <Text fontSize="11px" color="fg.muted">
                      Created {new Date(proj.created_at).toLocaleDateString()}
                    </Text>

                    <HStack gap="2">
                      {isOwner && (
                        <Button
                          size="2xs"
                          variant="ghost"
                          color="fg.muted"
                          _hover={{ color: '#F06A6A', bg: 'rgba(240,106,106,0.1)' }}
                          onClick={(e) => handleDelete(e, proj.id, proj.name)}
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                      <Text fontSize="xs" color="brand.400" fontWeight="500">
                        Open ›
                      </Text>
                    </HStack>
                  </Flex>
                </Box>
              </RouterLink>
            )
          })}
        </SimpleGrid>
      ) : (
        !isLoading && (
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description="Create your first project to start organizing tasks."
            actionLabel="Create Project"
            onAction={() => setIsCreateOpen(true)}
          />
        )
      )}

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </Box>
  )
}
