import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'

export const AppLayout: React.FC = () => {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  return (
    <Flex minH="100vh" bg="bg.canvas" color="fg.default">
      <Sidebar onOpenCreateProject={() => setIsCreateProjectOpen(true)} />
      <Flex flex="1" flexDirection="column" minW="0" overflow="hidden">
        <Header />
        <Box as="main" flex="1" p="8" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </Flex>
  )
}
