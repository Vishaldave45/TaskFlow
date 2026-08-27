import { Box, type BoxProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface WorkroomSurfaceProps extends BoxProps {
  variant?: 'base' | 'raised' | 'subtle' | 'canvas' | 'dark'
  bordered?: boolean
  elevated?: boolean
  stamp?: boolean
}

/**
 * WorkroomSurface represents an explicit physical paper/slate plane in the Digital Workroom.
 * Replaces repetitive ad-hoc surface + border styles across screens.
 */
export const WorkroomSurface = forwardRef<HTMLDivElement, WorkroomSurfaceProps>(
  ({ variant = 'base', bordered = true, elevated = false, stamp = false, children, ...props }, ref) => {
    let bg = 'surface.base'
    let borderColor = 'border.default'
    let color = 'ink.primary'

    if (variant === 'raised') {
      bg = 'surface.raised'
    } else if (variant === 'subtle') {
      bg = 'surface.subtle'
    } else if (variant === 'canvas') {
      bg = 'canvas'
    } else if (variant === 'dark') {
      bg = 'brand.primary'
      borderColor = 'border.dark'
      color = 'ink.inverse'
    }

    const shadow = stamp ? 'tactile' : elevated ? 'tactileSm' : 'none'

    return (
      <Box
        ref={ref}
        bg={bg}
        color={color}
        border={bordered ? '1px solid' : 'none'}
        borderColor={borderColor}
        borderRadius="sm"
        boxShadow={shadow}
        {...props}
      >
        {children}
      </Box>
    )
  }
)

WorkroomSurface.displayName = 'WorkroomSurface'
