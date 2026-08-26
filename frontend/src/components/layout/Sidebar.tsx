import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Box, Flex, HStack, Text, VStack, Button } from '@chakra-ui/react'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Activity,
  Plus,
  Layers,
} from 'lucide-react'
import { useProjectsQuery } from '@/hooks/useProjects'

interface SidebarProps {
  onOpenCreateProject?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateProject }) => {
  const { projectId } = useParams()
  const { data: projects = [] } = useProjectsQuery()

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'All Projects', to: '/projects', icon: FolderKanban },
  ]

  return (
    <Box
      as="aside"
      w="64"
      minW="64"
      h="100vh"
      bg="bg.surface"
      borderRight="1px solid"
      borderColor="border.subtle"
      display="flex"
      flexDirection="column"
      position="sticky"
      top="0"
    >
      {/* Brand Header */}
      <Flex h="14" px="5" alignItems="center" gap="2.5" borderBottom="1px solid" borderColor="border.subtle">
        <Box p="1.5" bg="brand.500" borderRadius="6px" color="white">
          <Layers size={18} />
        </Box>
        <Text fontSize="sm" fontWeight="700" letterSpacing="-0.02em" color="fg.default">
          TaskFlow
        </Text>
      </Flex>

      {/* Main Nav */}
      <VStack gap="1" p="3" alignItems="stretch">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: isActive ? '#599eff' : '#8B95A5',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </VStack>

      {/* Projects Section */}
      <Box p="3" flex="1" overflowY="auto">
        <Flex justifyContent="space-between" alignItems="center" px="3" py="2">
          <Text fontSize="11px" fontWeight="600" color="fg.muted" letterSpacing="0.06em" textTransform="uppercase">
            Projects
          </Text>
          {onOpenCreateProject && (
            <Button
              size="2xs"
              variant="ghost"
              color="fg.muted"
              _hover={{ color: 'fg.default', bg: 'bg.subtle' }}
              onClick={onOpenCreateProject}
              p="1"
            >
              <Plus size={14} />
            </Button>
          )}
        </Flex>

        <VStack gap="1" alignItems="stretch" mt="1">
          {projects.map((proj) => {
            const isSelected = Number(projectId) === proj.id
            return (
              <NavLink
                key={proj.id}
                to={`/projects/${proj.id}`}
                style={{
                  textDecoration: 'none',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  color: isSelected ? '#599eff' : '#B4BCC8',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <Box as="span" w="6px" h="6px" borderRadius="full" bg={isSelected ? 'brand.500' : 'fg.muted'} />
                <Text truncate>{proj.name}</Text>
              </NavLink>
            )
          })}
          {projects.length === 0 && (
            <Text fontSize="xs" color="fg.muted" px="3" py="2">
              No projects yet
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  )
}
