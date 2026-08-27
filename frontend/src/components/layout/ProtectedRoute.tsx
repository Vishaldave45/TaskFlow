import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Flex, Spinner } from '@chakra-ui/react'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="canvas">
        <Spinner size="lg" color="brand.primary" />
      </Flex>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
