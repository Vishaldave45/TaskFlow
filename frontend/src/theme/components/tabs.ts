import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

const baseStyle = definePartsStyle({
  tab: {
    fontWeight: '600',
    fontSize: 'sm',
    transition: 'all 0.15s ease-in-out',
    _focusVisible: {
      boxShadow: 'none',
    },
  },
})

const variants = {
  'soft-rounded': definePartsStyle({
    tab: {
      borderRadius: 'md',
      color: 'ink.secondary',
      bg: 'transparent',
      px: 3.5,
      py: 1.5,
      _hover: {
        bg: 'surface.subtle',
        color: 'ink.primary',
      },
      _selected: {
        bg: 'brand.tint', // #EFF6FF (Soft Sapphire Blue)
        color: 'brand.primary', // #2563EB
        fontWeight: '600',
      },
    },
  }),

  line: definePartsStyle({
    tablist: {
      borderBottom: '1px solid',
      borderColor: 'border.default',
    },
    tab: {
      color: 'ink.secondary',
      borderBottom: '2px solid transparent',
      mb: '-1px',
      px: 3,
      py: 2.5,
      _hover: {
        color: 'ink.primary',
      },
      _selected: {
        color: 'brand.primary',
        borderColor: 'brand.primary',
        fontWeight: '600',
      },
    },
  }),

  enclosed: definePartsStyle({
    tab: {
      color: 'ink.secondary',
      bg: 'transparent',
      border: '1px solid transparent',
      borderRadius: 'md md 0 0',
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
    variant: 'soft-rounded',
  },
})
