import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Badge,
  Tabs,
  TabList,
  Tab,
  Textarea,
  Divider,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Plus,
  Search,
  Users,
  Calendar,
  ArrowRight,
  FolderKanban,
  AlertCircle,
  Crown,
  Shield,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { projectsApi } from '@/api/projects'
import type { Project } from '@/types'

export function ProjectsPage() {
  const { user: currentUser } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tabFilter, setTabFilter] = useState<'ALL' | 'OWNED' | 'SHARED'>('ALL')
  const [error, setError] = useState<string | null>(null)

  // New Project Modal
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const toast = useToast()

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await projectsApi.list()
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load projects. Please verify backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const created = await projectsApi.create({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      })
      setProjects((prev) => [created, ...prev])
      setNewProjectName('')
      setNewProjectDesc('')
      onClose()
      toast({
        title: 'Project created.',
        description: `Project "${created.name}" was initialized successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Creation failed.',
        description: 'Could not create project.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setCreating(false)
    }
  }

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))

    const isOwner = p.owner?.id === currentUser?.id
    if (tabFilter === 'OWNED') return matchesSearch && isOwner
    if (tabFilter === 'SHARED') return matchesSearch && !isOwner
    return matchesSearch
  })

  return (
    <Box py={{ base: 6, md: 10 }}>
      <Container maxW="container.xl">
        {/* Page Header */}
        <Flex
          justify="space-between"
          align={{ base: 'start', md: 'flex-end' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          pb={6}
          borderBottom="1px solid"
          borderColor="border.default"
          mb={8}
        >
          <Stack spacing={1.5}>
            <HStack spacing={2} fontSize="2xs" fontFamily="mono" color="ink.muted" textTransform="uppercase" letterSpacing="widest">
              <Layers size={13} />
              <Text>DIRECTORY // WORKSPACES</Text>
            </HStack>
            <Heading as="h1" size="xl" fontWeight="700" color="ink.primary" letterSpacing="tight">
              Project Registry
            </Heading>
            <Text fontSize="sm" color="ink.secondary">
              Active workspaces, team allocations, and task execution pipelines.
            </Text>
          </Stack>

          <Button
            variant="solid"
            leftIcon={<Plus size={16} />}
            onClick={onOpen}
            size="md"
          >
            New Project
          </Button>
        </Flex>

        {/* Filter Controls & Role Tabs */}
        <Box mb={6}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            gap={4}
          >
            <Tabs
              variant="line"
              size="sm"
              onChange={(idx) => {
                if (idx === 0) setTabFilter('ALL')
                if (idx === 1) setTabFilter('OWNED')
                if (idx === 2) setTabFilter('SHARED')
              }}
            >
              <TabList borderBottom="none">
                <Tab>All ({projects.length})</Tab>
                <Tab>
                  Owned by Me ({projects.filter((p) => p.owner?.id === currentUser?.id).length})
                </Tab>
                <Tab>
                  Shared ({projects.filter((p) => p.owner?.id !== currentUser?.id).length})
                </Tab>
              </TabList>
            </Tabs>

            <InputGroup size="sm" maxW={{ base: 'full', md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="#8E948D" />
              </InputLeftElement>
              <Input
                placeholder="Search registry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Flex>
        </Box>

        {/* Error State */}
        {error && (
          <Box p={4} mb={6} bg="state.error.bg" border="1px solid" borderColor="state.error.border" borderRadius="sm">
            <HStack spacing={3}>
              <AlertCircle size={18} color="#991B1B" />
              <Text fontSize="xs" color="state.error.text" fontWeight="500">
                {error}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Box key={i} p={5} bg="surface.base" border="1px solid" borderColor="border.default" borderRadius="sm">
                <HStack justify="space-between">
                  <Stack spacing={2} w="50%">
                    <Skeleton h="20px" w="60%" />
                    <Skeleton h="14px" w="90%" />
                  </Stack>
                  <Skeleton h="28px" w="100px" />
                </HStack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <Box
            p={12}
            textAlign="center"
            bg="surface.base"
            border="1px dashed"
            borderColor="border.default"
            borderRadius="md"
          >
            <Stack spacing={3} align="center" maxW="md" mx="auto">
              <Flex
                w="44px"
                h="44px"
                bg="surface.subtle"
                borderRadius="sm"
                align="center"
                justify="center"
                color="ink.secondary"
              >
                <FolderKanban size={22} />
              </Flex>
              <Heading as="h3" size="sm" color="ink.primary">
                {search || tabFilter !== 'ALL' ? 'No projects match your filter' : 'No projects initialized'}
              </Heading>
              <Text fontSize="xs" color="ink.secondary">
                {search || tabFilter !== 'ALL'
                  ? 'Try clearing your search query or switching role tabs.'
                  : 'Get started by creating your first collaborative workspace.'}
              </Text>
              {!search && tabFilter === 'ALL' && (
                <Button variant="solid" size="sm" leftIcon={<Plus size={14} />} onClick={onOpen} mt={2}>
                  Create Project
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* Structured Executive Project Ledger */}
        {!loading && filteredProjects.length > 0 && (
          <Box
            bg="surface.base"
            border="1px solid"
            borderColor="border.default"
            borderRadius="md"
            overflow="hidden"
          >
            {/* Ledger Header */}
            <Flex
              px={6}
              py={3}
              bg="surface.subtle"
              borderBottom="1px solid"
              borderColor="border.default"
              fontSize="2xs"
              fontFamily="mono"
              fontWeight="700"
              color="ink.muted"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{ base: 'none', md: 'flex' }}
            >
              <Box flex="5">PROJECT // SCOPE</Box>
              <Box flex="2">YOUR ROLE</Box>
              <Box flex="2">COLLABORATORS</Box>
              <Box flex="2">INITIALIZED</Box>
              <Box flex="1" textAlign="right">ACTION</Box>
            </Flex>

            {/* Ledger Rows */}
            <Stack spacing={0} divider={<Divider borderColor="border.subtle" />}>
              {filteredProjects.map((project) => {
                const isOwner = project.owner?.id === currentUser?.id
                const monogram = project.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <Flex
                    key={project.id}
                    as={RouterLink}
                    to={`/projects/${project.id}`}
                    px={6}
                    py={4.5}
                    align={{ base: 'start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 3, md: 4 }}
                    _hover={{
                      bg: 'surface.active',
                      textDecoration: 'none',
                    }}
                    transition="background 0.1s ease-out"
                  >
                    {/* Project Name & Description */}
                    <Box flex="5" w={{ base: 'full', md: 'auto' }}>
                      <HStack spacing={3.5} align="start">
                        <Flex
                          w="34px"
                          h="34px"
                          minW="34px"
                          bg={isOwner ? 'brand.primary' : 'surface.subtle'}
                          color={isOwner ? 'ink.inverse' : 'ink.primary'}
                          border="1px solid"
                          borderColor={isOwner ? 'brand.primary' : 'border.default'}
                          borderRadius="sm"
                          align="center"
                          justify="center"
                          fontFamily="mono"
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {monogram}
                        </Flex>

                        <Stack spacing={0.5}>
                          <HStack spacing={2}>
                            <Text fontWeight="600" fontSize="sm" color="ink.primary">
                              {project.name}
                            </Text>
                            <Text fontSize="2xs" fontFamily="mono" color="ink.muted">
                              #{project.id}
                            </Text>
                          </HStack>
                          <Text fontSize="xs" color="ink.secondary" noOfLines={1}>
                            {project.description || 'No description provided.'}
                          </Text>
                        </Stack>
                      </HStack>
                    </Box>

                    {/* Role Badge */}
                    <Box flex="2" w={{ base: 'full', md: 'auto' }}>
                      {isOwner ? (
                        <Badge variant="brand" fontSize="3xs">
                          <Crown size={10} style={{ marginRight: 3 }} /> OWNER
                        </Badge>
                      ) : (
                        <Badge variant="neutral" fontSize="3xs">
                          <Shield size={10} style={{ marginRight: 3 }} /> COLLABORATOR
                        </Badge>
                      )}
                    </Box>

                    {/* Collaborators Count */}
                    <Box flex="2" fontSize="xs" color="ink.secondary" w={{ base: 'full', md: 'auto' }}>
                      <HStack spacing={1.5}>
                        <Users size={13} color="#5E645D" />
                        <Text>{project.members_count || 1} team members</Text>
                      </HStack>
                    </Box>

                    {/* Date */}
                    <Box flex="2" fontSize="2xs" fontFamily="mono" color="ink.muted" w={{ base: 'full', md: 'auto' }}>
                      <HStack spacing={1.5}>
                        <Calendar size={12} />
                        <Text>{new Date(project.created_at).toLocaleDateString()}</Text>
                      </HStack>
                    </Box>

                    {/* Action Arrow */}
                    <Flex flex="1" justify="flex-end" color="ink.primary" display={{ base: 'none', md: 'flex' }}>
                      <ArrowRight size={15} />
                    </Flex>
                  </Flex>
                )
              })}
            </Stack>
          </Box>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCreateProject}>
            <ModalHeader>Initialize Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel
                    fontSize="2xs"
                    fontFamily="mono"
                    fontWeight="700"
                    color="ink.secondary"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Project Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. Core Infrastructure Engine"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="2xs"
                    fontFamily="mono"
                    fontWeight="700"
                    color="ink.secondary"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Scope & Description
                  </FormLabel>
                  <Textarea
                    placeholder="Scope, technical deliverables, and goals..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    rows={3}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={2.5}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  isLoading={creating}
                  loadingText="Creating..."
                >
                  Create Project
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}
