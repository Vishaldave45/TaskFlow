import { modalAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys)

const baseStyle = definePartsStyle({
  overlay: {
    bg: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    borderRadius: 'xl',
    bg: 'surface.base',
    border: '1px solid',
    borderColor: 'border.default',
    boxShadow: 'hardLg',
    p: 0,
    overflow: 'hidden',
  },
  header: {
    fontFamily: 'heading',
    fontSize: 'lg',
    fontWeight: '600',
    color: 'ink.primary',
    px: 6,
    pt: 5,
    pb: 3,
    borderBottom: '1px solid',
    borderColor: 'border.subtle',
  },
  body: {
    px: 6,
    py: 5,
    color: 'ink.primary',
  },
  footer: {
    px: 6,
    py: 4,
    borderTop: '1px solid',
    borderColor: 'border.subtle',
    bg: 'surface.subtle',
  },
})

export const Modal = defineMultiStyleConfig({
  baseStyle,
})
