import { cardAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys)

const baseStyle = definePartsStyle({
  container: {
    bg: 'surface.base',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'border.default',
    boxShadow: 'hardSm',
    transition: 'all 0.2s ease-in-out',
    _hover: {
      borderColor: 'border.strong',
      boxShadow: 'hard',
    },
  },
  header: {
    p: 5,
    pb: 3,
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
  body: {
    p: 5,
  },
  footer: {
    p: 5,
    pt: 3,
    borderTop: '1px solid',
    borderColor: 'border.subtle',
  },
})

export const Card = defineMultiStyleConfig({
  baseStyle,
})
