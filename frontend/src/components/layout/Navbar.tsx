import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon, FolderKanban, ChevronDown, Terminal } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Box
      as="header"
      bg="surface.base"
      borderBottom="1px solid"
      borderColor="border.default"
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Container maxW="container.xl">
        <Flex h="56px" align="center" justify="space-between">
          {/* Logo & Brand Identity */}
          <HStack spacing={6}>
            <RouterLink to="/projects">
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
                  <Terminal size={15} />
                </Flex>
                <Text
                  fontFamily="mono"
                  fontWeight="700"
                  fontSize="md"
                  letterSpacing="wider"
                  color="ink.primary"
                >
                  TASKFLOW
                </Text>
              </HStack>
            </RouterLink>

            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
              <Button
                as={RouterLink}
                to="/projects"
                variant="ghost"
                size="sm"
                leftIcon={<FolderKanban size={15} />}
              >
                Workspaces
              </Button>
            </HStack>
          </HStack>

          {/* User Profile & Menu */}
          <HStack spacing={3}>
            {user && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronDown size={13} />}
                  px={2.5}
                  py={1}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="2xs"
                      name={user.username || user.email}
                      bg="brand.primary"
                      color="ink.inverse"
                    />
                    <Text fontSize="xs" fontWeight="600" color="ink.primary" display={{ base: 'none', sm: 'block' }}>
                      {user.username}
                    </Text>
                  </HStack>
                </MenuButton>

                <MenuList
                  bg="surface.base"
                  borderColor="border.dark"
                  borderWidth="1px"
                  boxShadow="tactile"
                  borderRadius="md"
                  p={1.5}
                  minW="220px"
                >
                  <Box px={3} py={2}>
                    <Text fontSize="3xs" fontWeight="bold" color="ink.muted" textTransform="uppercase" letterSpacing="wider" fontFamily="mono">
                      Signed in as
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="ink.primary" isTruncated>
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
                    borderRadius="sm"
                    fontSize="xs"
                    fontWeight="500"
                    _hover={{ bg: 'surface.subtle' }}
                  >
                    Profile & Session
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
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
