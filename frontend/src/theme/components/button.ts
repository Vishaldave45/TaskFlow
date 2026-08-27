import { defineStyleConfig } from '@chakra-ui/react'

export const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: '600',
    fontFamily: 'body',
    borderRadius: 'md',
    transition: 'all 0.15s ease-in-out',
    _focusVisible: {
      boxShadow: 'none',
      outline: '2px solid',
      outlineColor: 'brand.primary',
      outlineOffset: '2px',
    },
  },
  sizes: {
    sm: {
      fontSize: 'xs',
      px: 3,
      py: 1.5,
      h: '32px',
    },
    md: {
      fontSize: 'sm',
      px: 4,
      py: 2,
      h: '38px',
    },
    lg: {
      fontSize: 'md',
      px: 5,
      py: 2.5,
      h: '44px',
    },
  },
  variants: {
    // Primary Solid: Vibrant Sapphire Blue with soft elevation
    solid: {
      bg: 'brand.primary',
      color: 'ink.inverse',
      boxShadow: 'hardSm',
      _hover: {
        bg: 'brand.hover',
        boxShadow: 'hardBrand',
        _disabled: {
          bg: 'brand.primary',
        },
      },
      _active: {
        bg: 'brand.active',
        transform: 'translateY(1px)',
      },
    },

    // Secondary Outline: Crisp white surface with clean border
    outline: {
      bg: 'surface.base',
      color: 'ink.primary',
      border: '1px solid',
      borderColor: 'border.default',
      boxShadow: 'hardSm',
      _hover: {
        bg: 'surface.subtle',
        borderColor: 'border.strong',
      },
      _active: {
        bg: 'surface.active',
        transform: 'translateY(1px)',
      },
    },

    // Ghost: Subtle hover highlight
    ghost: {
      color: 'ink.secondary',
      _hover: {
        bg: 'surface.subtle',
        color: 'ink.primary',
      },
      _active: {
        bg: 'surface.active',
      },
    },

    // Danger: Clean red action
    danger: {
      bg: 'state.error.bg',
      color: 'state.error.text',
      border: '1px solid',
      borderColor: 'state.error.border',
      _hover: {
        bg: 'state.error.border',
      },
    },

    // Technical action: Mono button
    technical: {
      fontFamily: 'mono',
      fontSize: 'xs',
      letterSpacing: 'mono',
      textTransform: 'uppercase',
      bg: 'surface.subtle',
      color: 'ink.primary',
      border: '1px solid',
      borderColor: 'border.default',
      _hover: {
        borderColor: 'brand.primary',
        color: 'brand.primary',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
    size: 'md',
  },
})
