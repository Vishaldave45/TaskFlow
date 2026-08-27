import { defineStyleConfig } from '@chakra-ui/react'

export const Badge = defineStyleConfig({
  baseStyle: {
    fontFamily: 'mono',
    fontSize: '2xs',
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    letterSpacing: 'wider',
    borderRadius: 'sm', // 2px crisp radius
    px: 2,
    py: 0.5,
    border: '1px solid',
    lineHeight: 'shorter',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  variants: {
    neutral: {
      bg: 'surface.subtle',
      color: 'ink.secondary',
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
      bg: 'brand.primary',
      color: 'ink.inverse',
      borderColor: 'brand.primary',
    },
    brandSubtle: {
      bg: 'brand.tint',
      color: 'brand.primary',
      borderColor: 'brand.subtle',
    },
    coral: {
      bg: '#FDF0EC',
      color: 'accent.coral',
      borderColor: '#F8C8BA',
    },
  },
  defaultProps: {
    variant: 'neutral',
  },
})
