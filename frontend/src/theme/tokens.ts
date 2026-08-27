/**
 * TaskFlow Design System — Digital Workroom Tokens
 * Aesthetics: Tactile Minimalism, Refined Neo-Brutalism, Editorial Typography
 * Palette: Warm Parchment Canvas (#F4F1E9) + Deep Forest Primary (#173B36) + Charcoal Ink (#171A18)
 */

export const colors = {
  // Canvas & Background Surfaces (Warm Parchment & Tactile Desk Sheets)
  canvas: '#F4F1E9',
  surface: {
    base: '#FAF9F5',      // Crisp workroom paper sheet
    raised: '#FFFFFF',    // Elevated white sheet
    subtle: '#EEECE4',    // Secondary toolbars, column lane fills, table headers
    active: '#E5EDE4',    // Soft forest tint for active/selected items
    muted: '#F4F1E9',     // Canvas-matched subtle background
  },

  // High-Contrast Editorial Typography / Ink
  ink: {
    primary: '#171A18',   // Deep Forest Charcoal for maximum editorial contrast
    secondary: '#5E645D', // Editorial Slate for labels, descriptions, and metadata
    muted: '#8E948D',     // Muted Slate for hairline notes, placeholders, and technical IDs
    inverse: '#FAF9F5',   // Crisp Parchment for text on dark forest buttons & headers
  },

  // Structural Drafting Borders
  border: {
    default: '#D8D6CD',   // Parchment hairline structural line
    subtle: '#E5E3DA',    // Internal list/divider hairline
    strong: '#9A9E96',    // Hover & emphasized line
    dark: '#171A18',      // High-contrast neo-brutalist stamp line
    focus: '#173B36',     // Deep forest focus line
  },

  // Brand Identity: Deep Forest Green
  brand: {
    primary: '#173B36',   // Deep Forest Green
    hover: '#23524B',     // Mid Forest Green
    active: '#0F2824',    // Dark Forest pressed
    subtle: '#D1DFDB',    // Soft forest badge border
    tint: '#E5EDE4',      // Soft forest pill fill
  },

  // Editorial Accents
  accent: {
    coral: '#E87555',     // Terracotta Coral (high priority, primary accents)
    coralHover: '#D46344',
    amber: '#D97706',     // Ochre / Amber
    amberSubtle: '#FEF3C7',
  },

  // State Tokens (Muted Tactile Alerts)
  state: {
    success: {
      text: '#1E6B4F',    // Deep Pine Green
      bg: '#EDF7F2',
      border: '#B4E0CC',
    },
    warning: {
      text: '#92400E',    // Dark Amber
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    error: {
      text: '#991B1B',    // Dark Terracotta Red
      bg: '#FEE2E2',
      border: '#FECACA',
    },
    info: {
      text: '#173B36',
      bg: '#E5EDE4',
      border: '#D1DFDB',
    },
  },

  // Task Priority Indicators
  priority: {
    high: '#E87555',      // Terracotta Coral
    medium: '#D97706',    // Warm Ochre Amber
    low: '#8E948D',       // Cool Drafting Slate
  },
}

// Tight, Architectural Radii (2px - 4px crisp edges, no bubbly curves)
export const radii = {
  none: '0',
  xs: '1px',
  sm: '2px',
  md: '3px',
  lg: '4px',
  xl: '6px',
  '2xl': '8px',
  full: '9999px',
}

// Hard Tactile Offset Shadows (Zero blur, physical stamp offset)
export const shadows = {
  none: 'none',
  tactileXs: '1px 1px 0px 0px #171A18',
  tactileSm: '2px 2px 0px 0px #171A18',
  tactile: '3px 3px 0px 0px #171A18',
  tactileLg: '4px 4px 0px 0px #171A18',
  inner: 'inset 0 1px 2px 0 rgba(23, 26, 24, 0.05)',
  // Backwards-compatible aliases mapping to clean architectural borders
  hardSm: 'none',
  hard: '1px 1px 0px 0px #171A18',
  hardLg: '3px 3px 0px 0px #171A18',
  hardBrand: 'none',
}

export const space = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
}
