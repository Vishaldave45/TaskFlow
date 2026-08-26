import React from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      py="16"
      px="6"
      textAlign="center"
      borderRadius="8px"
      border="1px dashed"
      borderColor="border.subtle"
      bg="rgba(17, 21, 26, 0.4)"
      w="100%"
    >
      <VStack gap="3" maxW="sm" mx="auto">
        {Icon && (
          <Box p="3" borderRadius="8px" bg="bg.subtle" color="fg.muted">
            <Icon size={24} />
          </Box>
        )}
        <Heading size="sm" fontWeight="600" color="fg.default">
          {title}
        </Heading>
        <Text fontSize="sm" color="fg.muted">
          {description}
        </Text>
        {actionLabel && onAction && (
          <Button
            size="sm"
            mt="2"
            bg="brand.500"
            color="white"
            _hover={{ bg: 'brand.600' }}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  )
}
