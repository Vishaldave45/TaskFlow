import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys)

const baseStyle = definePartsStyle({
  field: {
    fontFamily: 'body',
    fontSize: 'sm',
    borderRadius: 'md',
    bg: 'surface.base',
    color: 'ink.primary',
    border: '1px solid',
    borderColor: 'border.default',
    _placeholder: {
      color: 'ink.muted',
    },
    _hover: {
      borderColor: 'border.strong',
    },
    _focusVisible: {
      borderColor: 'brand.primary',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
      bg: 'surface.base',
    },
    _invalid: {
      borderColor: 'state.error.text',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.15)',
    },
  },
})

const sizes = {
  sm: definePartsStyle({
    field: {
      h: '32px',
      px: 2.5,
      fontSize: 'xs',
    },
  }),
  md: definePartsStyle({
    field: {
      h: '38px',
      px: 3,
      fontSize: 'sm',
    },
  }),
}

export const Input = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: 'md',
  },
})
