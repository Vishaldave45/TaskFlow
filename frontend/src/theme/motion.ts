/**
 * TaskFlow Design System — Motion System
 * 
 * Defines standardized timing, easing curves, and framer-motion variants.
 * Motion in Digital Workroom communicates state, hierarchy, and spatial relationships
 * without gratuitous float or bounce effects.
 */

export const motionTokens = {
  duration: {
    // Micro: button press, state toggle, border/color changes, icon movements
    microFast: 0.08,
    micro: 0.12,
    
    // UI: dropdowns, drawers, modal sheet appearances, task expansions
    uiFast: 0.16,
    ui: 0.22,
    
    // Page: route transitions, major content view layout shifts
    page: 0.28,
  },
  
  ease: {
    // Crisp physical deceleration
    out: [0.16, 1, 0.3, 1] as const,
    // Symmetrical smooth transition
    inOut: [0.4, 0, 0.2, 1] as const,
    // Linear / immediate
    linear: [0, 0, 1, 1] as const,
  },
}

// Framer Motion preset variants
export const pageTransitionVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: motionTokens.duration.page, 
      ease: motionTokens.ease.out 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -4, 
    transition: { 
      duration: motionTokens.duration.uiFast, 
      ease: motionTokens.ease.inOut 
    } 
  },
}

export const taskItemVariants = {
  initial: { opacity: 0, y: 3 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: motionTokens.duration.uiFast, 
      ease: motionTokens.ease.out 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    transition: { 
      duration: motionTokens.duration.micro, 
      ease: motionTokens.ease.inOut 
    } 
  },
}
