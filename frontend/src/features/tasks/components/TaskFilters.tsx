import {
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { WorkroomSurface } from '@/components/ui'
import type { Project, ProjectMember } from '@/types'

interface TaskFiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  priorityFilter: string
  setPriorityFilter: (val: string) => void
  assigneeFilter: string
  setAssigneeFilter: (val: string) => void
  project: Project | null
  members: ProjectMember[]
}

export function TaskFilters({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  project,
  members,
}: TaskFiltersProps) {
  return (
    <WorkroomSurface variant="base" p={3} mb={6}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={3} align="center">
        <InputGroup size="sm" flex="1">
          <InputLeftElement pointerEvents="none">
            <Search size={14} color="#8E948D" />
          </InputLeftElement>
          <Input
            placeholder="Filter tasks by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <HStack spacing={2} w={{ base: 'full', md: 'auto' }}>
          <Select
            size="sm"
            w={{ base: 'full', md: '140px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </Select>

          <Select
            size="sm"
            w={{ base: 'full', md: '170px' }}
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="ALL">All Assignees</option>
            <option value="MY_TASKS">⚡ Assigned to Me</option>
            <option value="UNASSIGNED">Unassigned</option>
            {project?.owner && (
              <option value={project.owner.id}>
                {project.owner.username} (Owner)
              </option>
            )}
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.username}
              </option>
            ))}
          </Select>
        </HStack>
      </Flex>
    </WorkroomSurface>
  )
}
