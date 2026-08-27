import { Stack, Heading, Text, Box, HStack, type StackProps } from '@chakra-ui/react'
import { MetaLabel } from './MetaLabel'
import type { ReactNode } from 'react'

export interface SectionHeaderProps extends StackProps {
  category?: string
  title: string
  description?: string
  action?: ReactNode
  badge?: ReactNode
  headingSize?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * SectionHeader standardizes editorial headings with category overline and optional actions.
 */
export function SectionHeader({
  category,
  title,
  description,
  action,
  badge,
  headingSize = 'lg',
  ...props
}: SectionHeaderProps) {
  return (
    <Stack spacing={2} {...props}>
      <HStack justify="space-between" align="flex-start" wrap="wrap" gap={3}>
        <Stack spacing={1}>
          {category && <MetaLabel variant="subtle">{category}</MetaLabel>}
          <HStack spacing={2.5} align="center">
            <Heading
              as="h2"
              size={headingSize}
              fontWeight="700"
              color="ink.primary"
              letterSpacing="tight"
            >
              {title}
            </Heading>
            {badge && <Box>{badge}</Box>}
          </HStack>
          {description && (
            <Text fontSize="sm" color="ink.secondary" maxW="640px" lineHeight="short">
              {description}
            </Text>
          )}
        </Stack>

        {action && (
          <Box alignSelf={{ base: 'flex-start', sm: 'center' }} pt={{ base: 1, sm: 0 }}>
            {action}
          </Box>
        )}
      </HStack>
    </Stack>
  )
}
