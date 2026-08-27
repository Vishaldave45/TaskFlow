import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const baseStyle = defineStyle({
  fontWeight: '600',
  borderRadius: 'sm', // 2px crisp radius
  transition: 'all 0.1s ease-out',
  cursor: 'pointer',
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'border.dark',
    outlineOffset: '2px',
    boxShadow: 'none',
  },
  _disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
})

const sizes = {
  xs: defineStyle({
    h: '26px',
    minW: '26px',
    fontSize: 'xs',
    px: 2,
  }),
  sm: defineStyle({
    h: '32px',
    minW: '32px',
    fontSize: 'xs',
    px: 3,
  }),
  md: defineStyle({
    h: '38px',
    minW: '38px',
    fontSize: 'sm',
    px: 4,
  }),
  lg: defineStyle({
    h: '44px',
    minW: '44px',
    fontSize: 'md',
    px: 6,
  }),
}

const variants = {
  solid: defineStyle({
    bg: 'brand.primary',
    color: 'ink.inverse',
    border: '1px solid',
    borderColor: 'brand.primary',
    _hover: {
      bg: 'brand.hover',
      borderColor: 'brand.hover',
      _disabled: {
        bg: 'brand.primary',
      },
    },
    _active: {
      bg: 'brand.active',
      borderColor: 'brand.active',
      transform: 'translate(1px, 1px)',
    },
  }),

  outline: defineStyle({
    bg: 'surface.base',
    color: 'ink.primary',
    border: '1px solid',
    borderColor: 'border.default',
    _hover: {
      bg: 'surface.subtle',
      borderColor: 'border.strong',
    },
    _active: {
      bg: 'surface.subtle',
      borderColor: 'border.dark',
      transform: 'translate(1px, 1px)',
    },
  }),

  ghost: defineStyle({
    bg: 'transparent',
    color: 'ink.secondary',
    border: '1px solid transparent',
    _hover: {
      bg: 'surface.subtle',
      color: 'ink.primary',
    },
    _active: {
      bg: 'surface.active',
      transform: 'translate(1px, 1px)',
    },
  }),

  danger: defineStyle({
    bg: 'state.error.bg',
    color: 'state.error.text',
    border: '1px solid',
    borderColor: 'state.error.border',
    _hover: {
      bg: '#FEE2E2',
      borderColor: '#FCA5A5',
    },
    _active: {
      bg: '#FECACA',
      transform: 'translate(1px, 1px)',
    },
  }),

  technical: defineStyle({
    fontFamily: 'mono',
    fontSize: 'xs',
    textTransform: 'uppercase',
    letterSpacing: 'wide',
    bg: 'surface.subtle',
    color: 'ink.primary',
    border: '1px solid',
    borderColor: 'border.default',
    _hover: {
      bg: 'surface.base',
      borderColor: 'border.dark',
    },
    _active: {
      transform: 'translate(1px, 1px)',
    },
  }),
}

export const Button = defineStyleConfig({
  baseStyle,
  sizes,
  variants,
  defaultProps: {
    size: 'sm',
    variant: 'outline',
  },
})
