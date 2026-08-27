/**
 * TaskFlow Typography System
 * Dual Font Pairing:
 * - Content & UI: IBM Plex Sans
 * - Technical Data & Metadata: IBM Plex Mono
 */

export const fonts = {
  heading: `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  body: `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  mono: `'IBM Plex Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace`,
}

export const fontSizes = {
  xs: '0.75rem',    // 12px - Technical labels, uppercase mono tags
  sm: '0.8125rem',  // 13px - Metadata, compact table cells
  md: '0.875rem',   // 14px - Body small, inputs, secondary text
  base: '1rem',     // 16px - Standard body
  lg: '1.125rem',   // 18px - Section headers
  xl: '1.25rem',    // 20px - Subheadings
  '2xl': '1.5rem',  // 24px - Page headlines
  '3xl': '2rem',    // 32px - Module titles
  '4xl': '3rem',    // 48px - Display
}

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

export const lineHeights = {
  tight: 1.1,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.6,
}

export const letterSpacings = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.03em',
  wider: '0.06em',
  mono: '0.05em', // uppercase technical mono tags
}
