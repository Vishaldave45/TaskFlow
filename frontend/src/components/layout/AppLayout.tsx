import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppLayout() {
  return (
    <Box minH="100vh" bg="canvas" display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" flex="1">
        <Outlet />
      </Box>
    </Box>
  )
}
