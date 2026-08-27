export const styles = {
  global: {
    'html, body': {
      bg: 'canvas',
      color: 'ink.primary',
      fontFamily: 'body',
      lineHeight: 'base',
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    '*::placeholder': {
      color: 'ink.muted',
      opacity: 1,
    },
    '*, *::before, *::after': {
      borderColor: 'border.default',
      wordWrap: 'break-word',
      boxSizing: 'border-box',
    },
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'surface.subtle',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'border.default',
      borderRadius: 'sm',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'border.strong',
    },
  },
}
