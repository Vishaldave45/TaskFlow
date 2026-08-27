import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Flex,
} from '@chakra-ui/react'
import {
  Layers,
  Plus,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Flame,
} from 'lucide-react'

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" py={12} bg="canvas">
      <Container maxW="container.lg">
        {/* Workspace Top Bar */}
        <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={10}>
          <VStack spacing={2} align="start">
            <HStack spacing={2}>
              <Badge variant="brand">TASKFLOW SAAS</Badge>
              <Badge variant="success">PRODUCTION READY</Badge>
            </HStack>
            <Heading as="h1" size="xl" letterSpacing="tight" fontWeight="700" color="ink.primary">
              Modern SaaS Workspace
            </Heading>
            <Text fontSize="md" color="ink.secondary">
              Crisp white cards, cool slate tones, and vibrant sapphire blue accents.
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Button variant="outline" size="sm" onClick={onOpen}>
              Quick Action
            </Button>
            <Button variant="solid" size="sm" leftIcon={<Plus size={16} />} onClick={onOpen}>
              Create Task
            </Button>
          </HStack>
        </Flex>

        {/* Search & Filter Bar */}
        <Card mb={8} p={3}>
          <HStack spacing={4}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="#94A3B8" />
              </InputLeftElement>
              <Input placeholder="Search tasks, projects, or team members..." />
            </InputGroup>
            <Button variant="solid" px={6}>
              Search
            </Button>
          </HStack>
        </Card>

        {/* Feature Cards Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
          {/* Card 1: Task State */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Text fontWeight="600" fontSize="xs" fontFamily="mono" color="ink.secondary" letterSpacing="mono">
                  STATUS BADGES
                </Text>
                <Clock size={16} color="#475569" />
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <Badge variant="neutral">BACKLOG</Badge>
                  <Text fontSize="xs" color="ink.secondary">3 items</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge variant="brand">IN PROGRESS</Badge>
                  <Text fontSize="xs" color="brand.primary" fontWeight="500">Active</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge variant="success">DONE</Badge>
                  <Text fontSize="xs" color="state.success.text" fontWeight="500">Completed</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Badge variant="error">BLOCKED</Badge>
                  <Text fontSize="xs" color="state.error.text">Review needed</Text>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter>
              <Text fontSize="xs" color="ink.muted">
                Clean tinted backgrounds with 1px border
              </Text>
            </CardFooter>
          </Card>

          {/* Card 2: Priority Levels */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Text fontWeight="600" fontSize="xs" fontFamily="mono" color="ink.secondary" letterSpacing="mono">
                  PRIORITY TIERS
                </Text>
                <Flame size={16} color="#DC2626" />
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={2} h={2} borderRadius="full" bg="priority.high" />
                    <Text fontSize="sm" fontWeight="500">P1 Urgent</Text>
                  </HStack>
                  <Badge variant="error">HIGH</Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={2} h={2} borderRadius="full" bg="priority.medium" />
                    <Text fontSize="sm" fontWeight="500">P2 Medium</Text>
                  </HStack>
                  <Badge variant="warning">MEDIUM</Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <HStack spacing={2}>
                    <Box w={2} h={2} borderRadius="full" bg="priority.low" />
                    <Text fontSize="sm" fontWeight="500">P3 Normal</Text>
                  </HStack>
                  <Badge variant="neutral">LOW</Badge>
                </HStack>
              </VStack>
            </CardBody>
            <CardFooter>
              <Text fontSize="xs" color="ink.muted">
                High-contrast triage indicators
              </Text>
            </CardFooter>
          </Card>

          {/* Card 3: Dialog Modal Preview */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Text fontWeight="600" fontSize="xs" fontFamily="mono" color="ink.secondary" letterSpacing="mono">
                  INTERACTIVE MODAL
                </Text>
                <Layers size={16} color="#2563EB" />
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="ink.secondary">
                  Dialogs with crisp backdrop blur, slate header separation, and action buttons.
                </Text>
                <Button variant="outline" onClick={onOpen} rightIcon={<ArrowRight size={16} />}>
                  Open Dialog
                </Button>
              </VStack>
            </CardBody>
            <CardFooter>
              <Text fontSize="xs" color="ink.muted">
                Elevation shadow with smooth overlay
              </Text>
            </CardFooter>
          </Card>
        </SimpleGrid>

        <Divider mb={8} borderColor="border.default" />

        {/* Buttons Showcase */}
        <Card p={6}>
          <VStack spacing={4} align="start">
            <HStack spacing={2}>
              <Sparkles size={18} color="#2563EB" />
              <Text fontWeight="600" fontSize="sm" color="ink.primary">
                BUTTON & ACTION STATES
              </Text>
            </HStack>
            <HStack spacing={3} wrap="wrap">
              <Button variant="solid" leftIcon={<Plus size={16} />}>
                Primary Solid
              </Button>
              <Button variant="outline">Secondary Outline</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="danger">Destructive Action</Button>
              <Button variant="technical">TK-092 DEPLOY</Button>
            </HStack>
          </VStack>
        </Card>

        {/* Modal Dialog */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Task</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="ink.secondary">
                  Fill in the details below to initialize a new workflow item.
                </Text>
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="ink.secondary" mb={1}>
                    TASK TITLE
                  </Text>
                  <Input placeholder="e.g. Implement JWT refresh token rotation" />
                </Box>
                <HStack spacing={2}>
                  <Badge variant="brand">FEATURE</Badge>
                  <Badge variant="warning">P2 MEDIUM</Badge>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="solid" onClick={onClose} leftIcon={<CheckCircle2 size={16} />}>
                  Save Task
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}

export default App
