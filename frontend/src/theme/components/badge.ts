import { defineStyleConfig } from '@chakra-ui/react'

export const Badge = defineStyleConfig({
  baseStyle: {
    fontFamily: 'mono',
    fontSize: 'xs',
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: 'mono',
    borderRadius: 'sm', // 4px
    px: 2,
    py: 0.5,
    border: '1px solid',
  },
  variants: {
    neutral: {
      bg: 'surface.subtle',
      color: 'ink.primary',
      borderColor: 'border.default',
    },
    success: {
      bg: 'state.success.bg',
      color: 'state.success.text',
      borderColor: 'state.success.border',
    },
    warning: {
      bg: 'state.warning.bg',
      color: 'state.warning.text',
      borderColor: 'state.warning.border',
    },
    error: {
      bg: 'state.error.bg',
      color: 'state.error.text',
      borderColor: 'state.error.border',
    },
    brand: {
      bg: 'brand.tint',
      color: 'brand.primary',
      borderColor: 'brand.subtle',
    },
  },
  defaultProps: {
    variant: 'neutral',
  },
})
