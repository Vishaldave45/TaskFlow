/**
 * TaskFlow Design System — Clean Modern SaaS Tokens
 * Palette: Crisp White / Cool Slate with Sapphire Blue (#2563EB) Accents
 */

export const colors = {
  // Canvas & Backgrounds (Crisp slate & pure white)
  canvas: '#F8FAFC',
  surface: {
    base: '#FFFFFF',      // Crisp white card base
    raised: '#FFFFFF',    // Elevated white sheet
    subtle: '#F1F5F9',    // Secondary toolbars, table headers (slate-100)
    active: '#EFF6FF',    // Sapphire tint for selected/active items (blue-50)
    muted: '#F8FAFC',     // Subtle hover background
  },

  // High-Contrast Typography / Ink
  ink: {
    primary: '#0F172A',   // Deep slate-900 for high-contrast readability
    secondary: '#475569', // Slate-600 for metadata & subheadings
    muted: '#94A3B8',     // Slate-400 for placeholders & disabled items
    inverse: '#FFFFFF',   // Pure white for buttons & dark badges
  },

  // Crisp Structural Borders
  border: {
    default: '#E2E8F0',   // Slate-200 standard card and input borders
    subtle: '#F1F5F9',    // Slate-100 internal list dividers
    strong: '#CBD5E1',    // Slate-300 hover border
    focus: '#2563EB',     // Sapphire blue focus ring
  },

  // Brand Identity: Sapphire Blue
  brand: {
    primary: '#2563EB',   // Sapphire blue (blue-600)
    hover: '#1D4ED8',     // Deep sapphire (blue-700)
    active: '#1E40AF',    // Pressed sapphire (blue-800)
    subtle: '#DBEAFE',    // Soft blue badge border / active tint (blue-100)
    tint: '#EFF6FF',      // Very light blue pill fill (blue-50)
  },

  // State Tokens (Clean modern alerts)
  state: {
    success: {
      text: '#059669',    // Emerald-600
      bg: '#ECFDF5',      // Emerald-50
      border: '#A7F3D0',  // Emerald-200
    },
    warning: {
      text: '#D97706',    // Amber-600
      bg: '#FFFBEB',      // Amber-50
      border: '#FDE68A',  // Amber-200
    },
    error: {
      text: '#DC2626',    // Red-600
      bg: '#FEF2F2',      // Red-50
      border: '#FECACA',  // Red-200
    },
    info: {
      text: '#2563EB',    // Blue-600
      bg: '#EFF6FF',      // Blue-50
      border: '#BFDBFE',  // Blue-200
    },
  },

  // Priority Visual Rails
  priority: {
    high: '#DC2626',
    medium: '#D97706',
    low: '#64748B',
  },
}

export const radii = {
  none: '0',
  sm: '6px',      // Tags, small badges
  md: '8px',      // Buttons, inputs, chips
  lg: '12px',     // Cards, dialogs, drawers
  xl: '16px',     // Large modals
  full: '9999px', // Circular avatars & status pills
}

export const shadows = {
  none: 'none',
  hardSm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  hard: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
  hardLg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
  hardBrand: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
}

export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
}
