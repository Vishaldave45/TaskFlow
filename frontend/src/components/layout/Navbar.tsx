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
import { CheckSquare, LogOut, User as UserIcon, FolderKanban, ChevronDown } from 'lucide-react'
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
      boxShadow="hardSm"
    >
      <Container maxW="container.xl">
        <Flex h="64px" align="center" justify="space-between">
          {/* Logo & Brand */}
          <HStack spacing={6}>
            <RouterLink to="/projects">
              <HStack spacing={2.5}>
                <Flex
                  w="32px"
                  h="32px"
                  bg="brand.primary"
                  color="white"
                  borderRadius="md"
                  align="center"
                  justify="center"
                  boxShadow="hardSm"
                >
                  <CheckSquare size={18} />
                </Flex>
                <Text fontWeight="700" fontSize="lg" letterSpacing="tight" color="ink.primary">
                  TaskFlow
                </Text>
              </HStack>
            </RouterLink>

            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
              <Button
                as={RouterLink}
                to="/projects"
                variant="ghost"
                size="sm"
                leftIcon={<FolderKanban size={16} />}
              >
                Projects
              </Button>
            </HStack>
          </HStack>

          {/* User Profile & Menu */}
          <HStack spacing={3}>
            {user && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="sm"
                  rightIcon={<ChevronDown size={14} />}
                  px={2}
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="xs"
                      name={user.username || user.email}
                      bg="brand.primary"
                      color="white"
                    />
                    <Text fontSize="sm" fontWeight="600" color="ink.primary" display={{ base: 'none', sm: 'block' }}>
                      {user.username}
                    </Text>
                  </HStack>
                </MenuButton>

                <MenuList
                  bg="surface.base"
                  borderColor="border.default"
                  boxShadow="hardLg"
                  borderRadius="lg"
                  p={2}
                  minW="220px"
                >
                  <Box px={3} py={2}>
                    <Text fontSize="xs" fontWeight="bold" color="ink.muted" textTransform="uppercase" letterSpacing="wider">
                      Signed in as
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="ink.primary" isTruncated>
                      {user.username}
                    </Text>
                    <Text fontSize="xs" color="ink.secondary" isTruncated>
                      {user.email}
                    </Text>
                    <Badge variant="brand" mt={1.5} fontSize="2xs">
                      ID #{user.id}
                    </Badge>
                  </Box>

                  <MenuDivider borderColor="border.subtle" />

                  <MenuItem
                    as={RouterLink}
                    to="/projects"
                    icon={<FolderKanban size={16} />}
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ bg: 'surface.subtle' }}
                  >
                    All Projects
                  </MenuItem>

                  <MenuItem
                    icon={<UserIcon size={16} />}
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ bg: 'surface.subtle' }}
                  >
                    Account Info
                  </MenuItem>

                  <MenuDivider borderColor="border.subtle" />

                  <MenuItem
                    icon={<LogOut size={16} />}
                    onClick={handleLogout}
                    borderRadius="md"
                    fontSize="sm"
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
