import { cardAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    bg: 'surface.base',
    borderRadius: 'md', // 3px crisp edge
    border: '1px solid',
    borderColor: 'border.default',
    boxShadow: 'none',
    transition: 'border-color 0.12s ease-out',
    _hover: {
      borderColor: 'border.strong',
    },
  },
  header: {
    p: 4,
    pb: 3,
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
  body: {
    p: 4,
  },
  footer: {
    p: 4,
    pt: 3,
    borderTop: '1px solid',
    borderColor: 'border.subtle',
  },
})

export const Card = defineMultiStyleConfig({
  baseStyle,
})
