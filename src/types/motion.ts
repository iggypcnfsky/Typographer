// Motion settings and easing curve type definitions

export interface MotionSettings {
  globalInitialPosition: {
    left: number    // pixels from center for L direction (-500 to +500)
    right: number   // pixels from center for R direction (-500 to +500)
    front: number   // scale factor for F direction (0.1 to 3.0)
    back: number    // scale factor for B direction (0.1 to 3.0)
  }
  speedMultiplier: number // global speed multiplier (0.1 - 5.0)
  defaultEasing: string   // default easing curve ID
  gapBetweenWords: number // default gap in seconds (-2.0 to +5.0)
}

export interface EasingCurve {
  id: string
  name: string
  description?: string
  type: 'built-in' | 'custom'
  cubicBezier: [number, number, number, number] // CSS cubic-bezier values
  preview?: string // SVG path for visual preview
}

export interface MotionPreset {
  id: string
  name: string
  description?: string
  settings: MotionSettings
  easingCurves?: EasingCurve[]
}

export interface MotionStore {
  // Motion Settings
  settings: MotionSettings
  presets: MotionPreset[]
  customPresets: MotionPreset[]
  
  // Easing Curves
  easingCurves: EasingCurve[]
  customEasingCurves: EasingCurve[]
  
  // UI State
  isLoading: boolean
  error: string | null
  showMotionSidebar: boolean
  
  // Actions - Motion Settings
  updateMotion: (settings: Partial<MotionSettings>) => void
  resetMotion: () => void
  applyMotionPreset: (presetId: string) => void
  saveAsMotionPreset: (name: string, description?: string) => void
  deleteMotionPreset: (presetId: string) => void
  
  // Actions - Easing Curves
  createEasingCurve: (curve: Omit<EasingCurve, 'id'>) => void
  updateEasingCurve: (id: string, curve: Partial<EasingCurve>) => void
  deleteEasingCurve: (id: string) => void
  duplicateEasingCurve: (id: string, newName: string) => void
  
  // Actions - UI
  toggleMotionSidebar: () => void
  setError: (error: string | null) => void
}

// Built-in motion presets
export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'subtle',
    name: 'Subtle',
    description: 'Gentle, minimal movement',
    settings: {
      globalInitialPosition: {
        left: -50,
        right: 50,
        front: 0.8,
        back: 1.2
      },
      speedMultiplier: 0.8,
      defaultEasing: 'easeInOutCubic',
      gapBetweenWords: 0.2
    }
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    description: 'Balanced motion with energy',
    settings: {
      globalInitialPosition: {
        left: -100,
        right: 100,
        front: 0.5,
        back: 1.5
      },
      speedMultiplier: 1.0,
      defaultEasing: 'easeOutCubic',
      gapBetweenWords: 0.1
    }
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Bold, sweeping movements',
    settings: {
      globalInitialPosition: {
        left: -200,
        right: 200,
        front: 0.3,
        back: 2.0
      },
      speedMultiplier: 1.3,
      defaultEasing: 'easeOutQuart',
      gapBetweenWords: -0.1
    }
  }
]

// Default motion settings
export const DEFAULT_MOTION_SETTINGS: MotionSettings = {
  globalInitialPosition: {
    left: -100,
    right: 100,
    front: 0.6,
    back: 1.4
  },
  speedMultiplier: 1.0,
  defaultEasing: 'easeOutCubic',
  gapBetweenWords: 0.0
}

// Built-in easing curves from animation presets
export const BUILT_IN_EASING_CURVES: EasingCurve[] = [
  {
    id: 'easeInOut',
    name: 'Ease In Out',
    description: 'Smooth start and end',
    type: 'built-in',
    cubicBezier: [0.4, 0, 0.2, 1]
  },
  {
    id: 'easeOut',
    name: 'Ease Out',
    description: 'Fast start, slow end',
    type: 'built-in',
    cubicBezier: [0, 0, 0.2, 1]
  },
  {
    id: 'easeIn',
    name: 'Ease In',
    description: 'Slow start, fast end',
    type: 'built-in',
    cubicBezier: [0.4, 0, 1, 1]
  },
  {
    id: 'easeOutCubic',
    name: 'Ease Out Cubic',
    description: 'Natural entry movement',
    type: 'built-in',
    cubicBezier: [0.25, 0.46, 0.45, 0.94]
  },
  {
    id: 'easeInCubic',
    name: 'Ease In Cubic',
    description: 'Natural exit movement',
    type: 'built-in',
    cubicBezier: [0.55, 0.085, 0.68, 0.53]
  },
  {
    id: 'easeInOutCubic',
    name: 'Ease In Out Cubic',
    description: 'Smooth cubic transition',
    type: 'built-in',
    cubicBezier: [0.645, 0.045, 0.355, 1]
  },
  {
    id: 'easeOutQuart',
    name: 'Ease Out Quart',
    description: 'Strong deceleration for dramatic entry',
    type: 'built-in',
    cubicBezier: [0.25, 1, 0.5, 1]
  },
  {
    id: 'easeInQuart',
    name: 'Ease In Quart',
    description: 'Strong acceleration for dramatic exit',
    type: 'built-in',
    cubicBezier: [0.5, 0, 0.75, 0]
  },
  {
    id: 'subtleSpring',
    name: 'Subtle Spring',
    description: 'Gentle spring without overshoot',
    type: 'built-in',
    cubicBezier: [0.68, -0.35, 0.265, 1.35]
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bouncy effect',
    type: 'built-in',
    cubicBezier: [0.68, -0.55, 0.265, 1.55]
  }
]