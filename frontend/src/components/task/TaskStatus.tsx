import { HStack, Box, Text } from '@chakra-ui/react'
import type { TaskStatus as TaskStatusType } from '@/types'

export interface TaskStatusProps {
  status: TaskStatusType | string
  showIndicator?: boolean
}

export function TaskStatus({ status, showIndicator = true }: TaskStatusProps) {
  const s = (status || 'TODO').toUpperCase()
  let color = 'ink.secondary'
  let dotColor = 'border.strong'
  let label = 'To Do'

  if (s === 'DONE') {
    color = 'state.success.text'
    dotColor = 'state.success.text'
    label = 'Done'
  } else if (s === 'IN_PROGRESS') {
    color = 'brand.primary'
    dotColor = 'brand.primary'
    label = 'In Progress'
  }

  return (
    <HStack spacing={1.5} align="center">
      {showIndicator && (
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg={dotColor}
          flexShrink={0}
        />
      )}
      <Text
        fontFamily="mono"
        fontSize="xs"
        fontWeight="600"
        color={color}
        letterSpacing="wide"
      >
        {label}
      </Text>
    </HStack>
  )
}
