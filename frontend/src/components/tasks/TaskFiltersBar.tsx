import React from 'react'
import { Flex, HStack, Input, NativeSelect } from '@chakra-ui/react'
import { TaskFilters, TaskPriority, TaskStatus } from '@/types/task'
import { Search } from 'lucide-react'

interface TaskFiltersBarProps {
  filters: TaskFilters
  onChange: (newFilters: TaskFilters) => void
}

export const TaskFiltersBar: React.FC<TaskFiltersBarProps> = ({ filters, onChange }) => {
  return (
    <Flex
      gap="3"
      wrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      p="3"
      bg="bg.surface"
      borderRadius="6px"
      border="1px solid"
      borderColor="border.subtle"
    >
      {/* Search Input */}
      <HStack flex="1" minW="220px" bg="bg.subtle" px="3" borderRadius="6px" border="1px solid" borderColor="border.subtle">
        <Search size={14} color="#8B95A5" />
        <Input
          placeholder="Filter tasks..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          size="sm"
          border="none"
          _focus={{ outline: 'none' }}
          px="0"
          fontSize="13px"
        />
      </HStack>

      <HStack gap="2">
        {/* Status Select */}
        <NativeSelect.Root size="sm" width="130px">
          <NativeSelect.Field
            value={filters.status || ''}
            onChange={(e) => onChange({ ...filters, status: (e.target.value as TaskStatus) || undefined })}
            bg="bg.subtle"
            borderColor="border.subtle"
            fontSize="12px"
          >
            <option value="">All Statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </NativeSelect.Field>
        </NativeSelect.Root>

        {/* Priority Select */}
        <NativeSelect.Root size="sm" width="130px">
          <NativeSelect.Field
            value={filters.priority || ''}
            onChange={(e) => onChange({ ...filters, priority: (e.target.value as TaskPriority) || undefined })}
            bg="bg.subtle"
            borderColor="border.subtle"
            fontSize="12px"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </NativeSelect.Field>
        </NativeSelect.Root>

        {/* Ordering Select */}
        <NativeSelect.Root size="sm" width="140px">
          <NativeSelect.Field
            value={filters.ordering || '-created_at'}
            onChange={(e) => onChange({ ...filters, ordering: e.target.value })}
            bg="bg.subtle"
            borderColor="border.subtle"
            fontSize="12px"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="due_date">Due Date (Asc)</option>
            <option value="-due_date">Due Date (Desc)</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      </HStack>
    </Flex>
  )
}
