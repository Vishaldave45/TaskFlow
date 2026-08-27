import { inputAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys)

const baseStyle = definePartsStyle({
  field: {
    fontFamily: 'body',
    fontSize: 'sm',
    borderRadius: 'sm', // 2px crisp radius
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
      borderColor: 'border.dark',
      outline: '1px solid',
      outlineColor: 'border.dark',
      boxShadow: 'none',
      bg: 'surface.base',
    },
    _invalid: {
      borderColor: 'state.error.text',
      outline: '1px solid',
      outlineColor: 'state.error.text',
      boxShadow: 'none',
    },
    _disabled: {
      opacity: 0.5,
      bg: 'surface.subtle',
      cursor: 'not-allowed',
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
  lg: definePartsStyle({
    field: {
      h: '44px',
      px: 3.5,
      fontSize: 'md',
    },
  }),
}

export const Input = defineMultiStyleConfig({
  baseStyle,
  sizes,
  defaultProps: {
    size: 'sm',
  },
})
