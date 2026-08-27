import { VStack, Heading, Text, Box, type StackProps } from '@chakra-ui/react'
import type { ReactNode, ElementType } from 'react'
import { WorkroomSurface } from './WorkroomSurface'

export interface EmptyStateProps extends StackProps {
  icon?: ElementType
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
}

/**
 * EmptyState standardizes empty sheets, zero results, and initialized states.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  ...props
}: EmptyStateProps) {
  return (
    <WorkroomSurface
      variant="base"
      bordered
      py={12}
      px={6}
      w="full"
      textAlign="center"
    >
      <VStack spacing={4} maxW="420px" mx="auto" {...props}>
        {Icon && (
          <Box
            p={3}
            bg="surface.subtle"
            border="1px solid"
            borderColor="border.default"
            borderRadius="sm"
            color="ink.secondary"
          >
            <Icon size={24} />
          </Box>
        )}

        <VStack spacing={1}>
          <Heading as="h3" size="sm" fontWeight="700" color="ink.primary">
            {title}
          </Heading>
          {description && (
            <Text fontSize="xs" color="ink.secondary" lineHeight="base">
              {description}
            </Text>
          )}
        </VStack>

        {(action || secondaryAction) && (
          <VStack spacing={2} pt={2}>
            {action}
            {secondaryAction}
          </VStack>
        )}
      </VStack>
    </WorkroomSurface>
  )
}
