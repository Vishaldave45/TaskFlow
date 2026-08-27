import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" direction="column" gap={4} bg="canvas">
        <Spinner size="lg" color="brand.primary" thickness="3px" speed="0.7s" />
        <Text fontSize="sm" color="ink.secondary" fontFamily="mono">
          AUTHENTICATING...
        </Text>
      </Flex>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <Box minH="100vh" bg="canvas">
      <Outlet />
    </Box>
  )
}
