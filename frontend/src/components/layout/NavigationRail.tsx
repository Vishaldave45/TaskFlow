import {
  VStack,
  Flex,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Box,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { FolderKanban, Terminal, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { WorkroomSurface } from '@/components/ui'

interface NavItemProps {
  icon: typeof FolderKanban
  label: string
  to: string
  isActive: boolean
}

function NavItem({ icon: Icon, label, to, isActive }: NavItemProps) {
  return (
    <Tooltip label={label} placement="right" hasArrow openDelay={200} bg="brand.primary" color="ink.inverse" fontSize="xs">
      <Flex
        as={RouterLink}
        to={to}
        w="44px"
        h="44px"
        align="center"
        justify="center"
        borderRadius="sm"
        position="relative"
        bg={isActive ? 'surface.active' : 'transparent'}
        color={isActive ? 'brand.primary' : 'ink.secondary'}
        border="1px solid"
        borderColor={isActive ? 'border.default' : 'transparent'}
        _hover={{
          bg: isActive ? 'surface.active' : 'surface.subtle',
          color: 'ink.primary',
          borderColor: 'border.default',
        }}
        transition="background-color 120ms ease-out, color 120ms ease-out, border-color 120ms ease-out"
      >
        {isActive && (
          <Box
            position="absolute"
            left="-8px"
            top="8px"
            bottom="8px"
            w="3px"
            bg="brand.primary"
            borderRadius="0 2px 2px 0"
          />
        )}
        <Icon size={19} />
      </Flex>
    </Tooltip>
  )
}

export function NavigationRail() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOpen: isProfileOpen, onOpen: onOpenProfile, onClose: onCloseProfile } = useDisclosure()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isProjectsActive = location.pathname.startsWith('/projects')

  return (
    <>
      <VStack
        as="aside"
        w="64px"
        h="100vh"
        bg="surface.base"
        borderRight="1px solid"
        borderColor="border.default"
        py={3.5}
        px={2}
        spacing={6}
        justify="space-between"
        position="sticky"
        top={0}
        zIndex={100}
        flexShrink={0}
      >
        {/* Brand Icon & Main Tools */}
        <VStack spacing={4} w="full" align="center">
          {/* Brand Stamp */}
          <Tooltip label="TaskFlow" placement="right" hasArrow bg="brand.primary" color="ink.inverse" fontSize="xs">
            <Flex
              as={RouterLink}
              to="/projects"
              w="40px"
              h="40px"
              bg="brand.primary"
              color="ink.inverse"
              borderRadius="sm"
              align="center"
              justify="center"
              boxShadow="tactileSm"
              _active={{ transform: 'translate(1px, 1px)' }}
              transition="transform 80ms ease-out"
            >
              <Terminal size={18} />
            </Flex>
          </Tooltip>

          <Box w="24px" h="1px" bg="border.subtle" my={1} />

          {/* Primary Navigation Rail Items */}
          <VStack spacing={2} w="full" align="center">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard & Metrics"
              to="/dashboard"
              isActive={location.pathname === '/dashboard'}
            />
            <NavItem
              icon={FolderKanban}
              label="Workspaces & Projects"
              to="/projects"
              isActive={isProjectsActive}
            />
          </VStack>
        </VStack>

        {/* User Session & Menu at bottom rail */}
        <VStack spacing={2} w="full" align="center">
          {user && (
            <Menu placement="right-end" gutter={12}>
              <Tooltip label={`${user.username} (${user.email})`} placement="right" hasArrow bg="brand.primary" color="ink.inverse" fontSize="xs">
                <MenuButton
                  as={IconButton}
                  aria-label="User Account"
                  variant="ghost"
                  w="40px"
                  h="40px"
                  p={0}
                  borderRadius="sm"
                  _hover={{ bg: 'surface.subtle' }}
                  icon={
                    <Avatar
                      size="xs"
                      name={user.username || user.email}
                      bg="brand.primary"
                      color="ink.inverse"
                      border="1px solid"
                      borderColor="border.dark"
                    />
                  }
                />
              </Tooltip>

              <MenuList
                bg="surface.base"
                borderColor="border.dark"
                borderWidth="1px"
                boxShadow="tactile"
                borderRadius="sm"
                p={1.5}
                minW="220px"
              >
                <Box px={3} py={2}>
                  <Text fontSize="3xs" fontWeight="700" color="ink.muted" textTransform="uppercase" letterSpacing="widest" fontFamily="mono">
                    Current Session
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="ink.primary" isTruncated>
                    {user.username}
                  </Text>
                  <Text fontSize="xs" color="ink.secondary" isTruncated>
                    {user.email}
                  </Text>
                  <Badge variant="brand" mt={1.5} fontSize="3xs">
                    USER #{user.id}
                  </Badge>
                </Box>

                <MenuDivider borderColor="border.subtle" />

                <MenuItem
                  as={RouterLink}
                  to="/projects"
                  icon={<FolderKanban size={14} />}
                  borderRadius="sm"
                  fontSize="xs"
                  fontWeight="500"
                  _hover={{ bg: 'surface.subtle' }}
                >
                  All Workspaces
                </MenuItem>

                <MenuItem
                  icon={<UserIcon size={14} />}
                  onClick={onOpenProfile}
                  borderRadius="sm"
                  fontSize="xs"
                  fontWeight="500"
                  _hover={{ bg: 'surface.subtle' }}
                >
                  Workspace Profile
                </MenuItem>

                <MenuDivider borderColor="border.subtle" />

                <MenuItem
                  icon={<LogOut size={14} />}
                  onClick={handleLogout}
                  borderRadius="sm"
                  fontSize="xs"
                  fontWeight="600"
                  color="state.error.text"
                  _hover={{ bg: 'state.error.bg' }}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </VStack>
      </VStack>

      {/* Workspace Profile Modal */}
      {user && (
        <Modal isOpen={isProfileOpen} onClose={onCloseProfile} isCentered size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2.5}>
                <Flex
                  w="28px"
                  h="28px"
                  bg="brand.primary"
                  color="ink.inverse"
                  borderRadius="sm"
                  align="center"
                  justify="center"
                >
                  <UserIcon size={15} />
                </Flex>
                <Text>Workspace Profile</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* User Identity Card */}
                <WorkroomSurface variant="subtle" p={4}>
                  <HStack spacing={3.5} align="center">
                    <Avatar
                      size="md"
                      name={user.username || user.email}
                      bg="brand.primary"
                      color="ink.inverse"
                      border="2px solid"
                      borderColor="border.dark"
                    />
                    <VStack align="flex-start" spacing={0.5}>
                      <Text fontSize="md" fontWeight="700" color="ink.primary">
                        {user.username}
                      </Text>
                      <Text fontSize="xs" color="ink.secondary">
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                </WorkroomSurface>
              </VStack>
            </ModalBody>
            <ModalFooter justifyContent="space-between">
              <Button
                variant="danger"
                size="xs"
                leftIcon={<LogOut size={13} />}
                onClick={() => {
                  onCloseProfile()
                  handleLogout()
                }}
              >
                Sign Out
              </Button>
              <Button variant="outline" size="xs" onClick={onCloseProfile}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

