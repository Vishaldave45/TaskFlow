import { Navigate, Outlet } from 'react-router-dom'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { useAuth } from '@/context/AuthContext'

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" direction="column" gap={4} bg="canvas">
        <Spinner size="lg" color="brand.primary" thickness="3px" speed="0.7s" />
        <Text fontSize="sm" color="ink.secondary" fontFamily="mono">
          LOADING...
        </Text>
      </Flex>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/projects" replace />
  }

  return (
    <Box minH="100vh" bg="canvas">
      <Outlet />
    </Box>
  )
}
