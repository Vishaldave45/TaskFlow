import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

const baseStyle = definePartsStyle({
  tab: {
    fontWeight: '600',
    fontSize: 'sm',
    transition: 'all 0.12s ease-out',
    _focusVisible: {
      boxShadow: 'none',
      outline: '2px solid',
      outlineColor: 'border.dark',
      outlineOffset: '2px',
    },
  },
})

const variants = {
  line: definePartsStyle({
    tablist: {
      borderBottom: '1px solid',
      borderColor: 'border.default',
      gap: 2,
    },
    tab: {
      color: 'ink.secondary',
      borderBottom: '2px solid transparent',
      mb: '-1px',
      px: 3.5,
      py: 2.5,
      fontSize: 'sm',
      fontWeight: '500',
      _hover: {
        color: 'ink.primary',
        borderColor: 'border.strong',
      },
      _selected: {
        color: 'brand.primary',
        borderColor: 'brand.primary',
        fontWeight: '600',
      },
    },
  }),

  'soft-rounded': definePartsStyle({
    tab: {
      borderRadius: 'sm', // 2px crisp radius
      color: 'ink.secondary',
      bg: 'transparent',
      px: 3,
      py: 1.5,
      fontSize: 'xs',
      _hover: {
        bg: 'surface.subtle',
        color: 'ink.primary',
      },
      _selected: {
        bg: 'brand.primary',
        color: 'ink.inverse',
        fontWeight: '600',
      },
    },
  }),

  enclosed: definePartsStyle({
    tab: {
      color: 'ink.secondary',
      bg: 'surface.subtle',
      border: '1px solid',
      borderColor: 'border.default',
      borderBottom: 'none',
      borderRadius: 'sm sm 0 0',
      fontSize: 'xs',
      mr: 1,
      _selected: {
        color: 'brand.primary',
        bg: 'surface.base',
        borderColor: 'border.default',
        borderBottomColor: 'surface.base',
        fontWeight: '600',
      },
    },
  }),
}

export const Tabs = defineMultiStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: 'line',
  },
})
