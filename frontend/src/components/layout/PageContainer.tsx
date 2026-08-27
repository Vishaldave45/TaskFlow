import { Container, type ContainerProps } from '@chakra-ui/react'

export interface PageContainerProps extends ContainerProps {
  size?: 'standard' | 'wide' | 'narrow' | 'full'
}

/**
 * PageContainer provides structured layout padding, alignment, and max-widths across all views.
 */
export function PageContainer({ size = 'standard', children, ...props }: PageContainerProps) {
  let maxW = 'container.xl'

  if (size === 'wide') {
    maxW = '1600px'
  } else if (size === 'narrow') {
    maxW = 'container.md'
  } else if (size === 'full') {
    maxW = 'full'
  }

  return (
    <Container
      maxW={maxW}
      px={{ base: 4, sm: 6, md: 8 }}
      py={{ base: 4, md: 6 }}
      {...props}
    >
      {children}
    </Container>
  )
}
