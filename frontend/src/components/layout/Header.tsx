import React from 'react'
import { Box, Flex, HStack, Text, Button, Menu } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User as UserIcon, Bell } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <Flex
      as="header"
      h="14"
      px="6"
      alignItems="center"
      justifyContent="space-between"
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.subtle"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <HStack gap="4">
        <Text fontSize="xs" fontWeight="600" color="fg.muted" letterSpacing="0.08em" textTransform="uppercase">
          TaskFlow Workspace
        </Text>
      </HStack>

      <HStack gap="4">
        <Box color="fg.muted" cursor="pointer" _hover={{ color: 'fg.default' }} p="2">
          <Bell size={18} />
        </Box>

        <Flex alignItems="center" gap="3">
          <Flex
            w="8"
            h="8"
            borderRadius="full"
            bg="brand.500"
            color="white"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="600"
          >
            {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon size={14} />}
          </Flex>
          <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
            <Text fontSize="xs" fontWeight="600" color="fg.default">
              {user?.username}
            </Text>
            <Text fontSize="11px" color="fg.muted">
              {user?.email}
            </Text>
          </Box>
          <Button
            size="xs"
            variant="ghost"
            color="fg.muted"
            _hover={{ color: '#F06A6A', bg: 'rgba(240, 106, 106, 0.1)' }}
            onClick={() => logout()}
            title="Sign out"
          >
            <LogOut size={14} />
          </Button>
        </Flex>
      </HStack>
    </Flex>
  )
}
