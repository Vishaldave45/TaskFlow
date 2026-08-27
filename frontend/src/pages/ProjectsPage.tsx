import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import {
  FolderPlus,
  Search,
  Users,
  Calendar,
  ArrowRight,
  FolderKanban,
  AlertCircle,
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import type { Project } from '@/types'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      setProjects(data)
    } catch (err: unknown) {
      setError('Failed to load projects. Please ensure the backend server is running.')
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
        description: `Project "${created.name}" was created successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err: unknown) {
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

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        {/* Page Header */}
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={8}>
          <Stack spacing={1}>
            <Heading as="h1" size="lg" fontWeight="700" color="ink.primary" letterSpacing="tight">
              Projects
            </Heading>
            <Text fontSize="sm" color="ink.secondary">
              Manage your workspace projects, track velocity, and coordinate team members.
            </Text>
          </Stack>

          <Button
            variant="solid"
            leftIcon={<FolderPlus size={18} />}
            onClick={onOpen}
            size="md"
          >
            New Project
          </Button>
        </Flex>

        {/* Filter / Search Bar */}
        <Card mb={8} p={2}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="#94A3B8" />
            </InputLeftElement>
            <Input
              placeholder="Search projects by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card>

        {/* Error State */}
        {error && (
          <Card p={6} mb={8} bg="state.error.bg" borderColor="state.error.border">
            <HStack spacing={3}>
              <AlertCircle size={20} color="#DC2626" />
              <Text fontSize="sm" color="state.error.text" fontWeight="500">
                {error}
              </Text>
            </HStack>
          </Card>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3].map((i) => (
              <Card key={i} p={5}>
                <Stack spacing={4}>
                  <Skeleton h="24px" w="60%" borderRadius="sm" />
                  <Skeleton h="40px" borderRadius="sm" />
                  <Skeleton h="16px" w="40%" borderRadius="sm" />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <Card p={12} textAlign="center">
            <Stack spacing={4} align="center" maxW="md" mx="auto">
              <Flex
                w="54px"
                h="54px"
                bg="surface.subtle"
                borderRadius="xl"
                align="center"
                justify="center"
                color="ink.secondary"
              >
                <FolderKanban size={28} />
              </Flex>
              <Heading as="h3" size="md" color="ink.primary">
                {search ? 'No projects matched your search' : 'No projects yet'}
              </Heading>
              <Text fontSize="sm" color="ink.secondary">
                {search
                  ? 'Try changing your search terms or filters.'
                  : 'Get started by creating your first project workspace.'}
              </Text>
              {!search && (
                <Button variant="solid" leftIcon={<FolderPlus size={16} />} onClick={onOpen}>
                  Create First Project
                </Button>
              )}
            </Stack>
          </Card>
        )}

        {/* Project Cards Grid */}
        {!loading && filteredProjects.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                as={RouterLink}
                to={`/projects/${project.id}`}
                _hover={{
                  textDecoration: 'none',
                  borderColor: 'border.strong',
                  boxShadow: 'hard',
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.15s ease-in-out"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="start" gap={2}>
                    <Heading as="h2" size="md" fontWeight="600" color="ink.primary" isTruncated>
                      {project.name}
                    </Heading>
                    <Badge variant="brand" fontSize="2xs">
                      #{project.id}
                    </Badge>
                  </Flex>
                </CardHeader>

                <CardBody py={2}>
                  <Text fontSize="sm" color="ink.secondary" noOfLines={2} minH="40px">
                    {project.description || 'No description provided.'}
                  </Text>
                </CardBody>

                <CardFooter pt={3} borderTop="1px solid" borderColor="border.subtle">
                  <Flex justify="space-between" align="center" w="full">
                    <HStack spacing={4} fontSize="xs" color="ink.muted">
                      <HStack spacing={1}>
                        <Users size={14} />
                        <Text>{project.members_count || 1} members</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Calendar size={14} />
                        <Text>{new Date(project.created_at).toLocaleDateString()}</Text>
                      </HStack>
                    </HStack>

                    <Flex color="brand.primary">
                      <ArrowRight size={16} />
                    </Flex>
                  </Flex>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent as="form" onSubmit={handleCreateProject}>
            <ModalHeader>Create New Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                    Project Name
                  </FormLabel>
                  <Input
                    placeholder="e.g. Core Platform Infrastructure"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="600" color="ink.secondary" textTransform="uppercase" letterSpacing="wider">
                    Description
                  </FormLabel>
                  <Input
                    placeholder="Brief objective and scope..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
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
