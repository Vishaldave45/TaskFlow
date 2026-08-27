import { Flex, Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { NavigationRail } from './NavigationRail'

/**
 * AppShell delivers the complete Workbench structure:
 * - Narrow vertical tool rail on the left
 * - Warm parchment continuous workspace on the right
 */
export function AppShell() {
  return (
    <Flex minH="100vh" bg="canvas" w="full" overflow="hidden">
      {/* Workbench Navigation Rail */}
      <NavigationRail />

      {/* Primary Canvas / Viewport */}
      <Box
        as="main"
        flex="1"
        minW={0}
        h="100vh"
        overflowY="auto"
        overflowX="hidden"
        bg="canvas"
      >
        <Outlet />
      </Box>
    </Flex>
  )
}
