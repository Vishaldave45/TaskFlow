import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Flex, Spinner } from '@chakra-ui/react'

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="canvas">
        <Spinner size="lg" color="brand.primary" />
      </Flex>
    )
  }

  if (user) {
    return <Navigate to="/projects" replace />
  }

  return <Outlet />
}
