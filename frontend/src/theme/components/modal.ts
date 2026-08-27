import { modalAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys)

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'rgba(23, 26, 24, 0.45)', // Clean dark tactile scrim, no heavy blur
  },
  dialog: {
    borderRadius: 'lg', // 4px crisp radius
    bg: 'surface.base',
    border: '1px solid',
    borderColor: 'border.dark',
    boxShadow: 'tactile',
    p: 0,
    overflow: 'hidden',
  },
  header: {
    fontFamily: 'heading',
    fontSize: 'md',
    fontWeight: '700',
    color: 'ink.primary',
    px: 5,
    pt: 4,
    pb: 3,
    borderBottom: '1px solid',
    borderColor: 'border.default',
  },
  body: {
    px: 5,
    py: 4,
    color: 'ink.primary',
  },
  footer: {
    px: 5,
    py: 3,
    borderTop: '1px solid',
    borderColor: 'border.default',
    bg: 'surface.subtle',
  },
})

export const Modal = defineMultiStyleConfig({
  baseStyle,
})
