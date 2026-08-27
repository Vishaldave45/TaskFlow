import { Box, HStack, VStack, Heading, Text, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { MetaLabel } from '../ui/MetaLabel'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  breadcrumbs?: Array<{ label: string; to?: string }>
  category?: string
  title: string
  description?: string
  actions?: ReactNode
  badge?: ReactNode
  meta?: ReactNode
}

/**
 * PageHeader standardizes top-of-page editorial titles, breadcrumb traces, and action rails.
 */
export function PageHeader({
  breadcrumbs,
  category,
  title,
  description,
  actions,
  badge,
  meta,
}: PageHeaderProps) {
  return (
    <Box pb={6} mb={6} borderBottom="1px solid" borderColor="border.default">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          spacing="6px"
          separator={<ChevronRight size={12} style={{ opacity: 0.5 }} />}
          mb={3}
          fontSize="xs"
          fontFamily="mono"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <BreadcrumbItem key={idx} isCurrentPage={isLast}>
                {crumb.to && !isLast ? (
                  <BreadcrumbLink as={RouterLink} to={crumb.to} color="ink.secondary" _hover={{ color: 'brand.primary' }}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <Text as="span" color={isLast ? 'ink.primary' : 'ink.secondary'} fontWeight={isLast ? '600' : '400'}>
                    {crumb.label}
                  </Text>
                )}
              </BreadcrumbItem>
            )
          })}
        </Breadcrumb>
      )}

      <FlexRow justify="space-between" align={{ base: 'flex-start', md: 'flex-end' }} wrap="wrap" gap={4}>
        <VStack align="flex-start" spacing={1.5} maxW="800px">
          {category && <MetaLabel variant="subtle">{category}</MetaLabel>}
          <HStack spacing={3} align="center" wrap="wrap">
            <Heading as="h1" size="xl" fontWeight="700" color="ink.primary" letterSpacing="tight">
              {title}
            </Heading>
            {badge && <Box>{badge}</Box>}
          </HStack>
          {description && (
            <Text fontSize="sm" color="ink.secondary" lineHeight="base">
              {description}
            </Text>
          )}
          {meta && <Box pt={1}>{meta}</Box>}
        </VStack>

        {actions && (
          <HStack spacing={2.5} align="center" pt={{ base: 2, md: 0 }} wrap="wrap">
            {actions}
          </HStack>
        )}
      </FlexRow>
    </Box>
  )
}

function FlexRow({ children, ...props }: { children: ReactNode; [key: string]: any }) {
  return (
    <HStack w="full" {...props}>
      {children}
    </HStack>
  )
}
