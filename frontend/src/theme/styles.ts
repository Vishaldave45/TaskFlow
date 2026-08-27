export const styles = {
  global: {
    'html, body': {
      bg: 'canvas',
      color: 'ink.primary',
      fontFamily: 'body',
      lineHeight: 'normal',
      minHeight: '100vh',
    },
    '*::placeholder': {
      color: 'ink.muted',
    },
    '*, *::before, &::after': {
      borderColor: 'border.default',
      wordWrap: 'break-word',
    },
    '::-webkit-scrollbar': {
      width: '6px',
      height: '6px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'border.strong',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'ink.muted',
    },
  },
}
