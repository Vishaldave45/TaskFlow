import { Text, type TextProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface MetaLabelProps extends TextProps {
  variant?: 'subtle' | 'muted' | 'brand' | 'dark'
}

/**
 * MetaLabel provides standard technical/editorial typography for micro-labels,
 * breadcrumbs, category tags, and system indicators.
 */
export const MetaLabel = forwardRef<HTMLParagraphElement, MetaLabelProps>(
  ({ variant = 'muted', children, ...props }, ref) => {
    let color = 'ink.secondary'

    if (variant === 'subtle') {
      color = 'ink.muted'
    } else if (variant === 'brand') {
      color = 'brand.primary'
    } else if (variant === 'dark') {
      color = 'ink.primary'
    }

    return (
      <Text
        ref={ref}
        as="span"
        fontFamily="mono"
        fontSize="2xs"
        fontWeight="700"
        textTransform="uppercase"
        letterSpacing="widest"
        color={color}
        lineHeight="none"
        {...props}
      >
        {children}
      </Text>
    )
  }
)

MetaLabel.displayName = 'MetaLabel'
