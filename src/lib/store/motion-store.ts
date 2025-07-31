// Motion settings and easing curve management store using Zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  MotionStore, 
  MotionSettings, 
  EasingCurve, 
  MotionPreset,
  DEFAULT_MOTION_SETTINGS,
  MOTION_PRESETS,
  BUILT_IN_EASING_CURVES
} from '@/types/motion'

// Function to sync gap with typographer store
let syncGapWithTypographer: ((gap: number) => void) | null = null

export const setSyncGapCallback = (callback: (gap: number) => void) => {
  syncGapWithTypographer = callback
}

export const useMotionStore = create<MotionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_MOTION_SETTINGS,
      presets: MOTION_PRESETS,
      customPresets: [],
      easingCurves: BUILT_IN_EASING_CURVES,
      customEasingCurves: [],
      isLoading: false,
      error: null,
      showMotionSidebar: false,

      // Motion Settings Actions
      updateMotion: (updates: Partial<MotionSettings>) => {
        const currentSettings = get().settings
        const newSettings = { ...currentSettings, ...updates }
        
        // Apply updates without constraints - let users put any values they want
        if (updates.gapBetweenWords !== undefined) {
          // Sync with typographer store
          if (syncGapWithTypographer) {
            syncGapWithTypographer(newSettings.gapBetweenWords)
          }
        }
        
        set({ settings: newSettings })
      },

      resetMotion: () => {
        set({ settings: { ...DEFAULT_MOTION_SETTINGS } })
      },

      applyMotionPreset: (presetId: string) => {
        const { presets, customPresets } = get()
        const allPresets = [...presets, ...customPresets]
        const preset = allPresets.find(p => p.id === presetId)
        
        if (preset) {
          set({ settings: { ...preset.settings } })
        }
      },

      saveAsMotionPreset: (name: string, description?: string) => {
        const { settings, customPresets } = get()
        const newPreset: MotionPreset = {
          id: `custom-motion-${Date.now()}`,
          name: name.trim(),
          description: description?.trim(),
          settings: { ...settings }
        }
        
        set({ customPresets: [...customPresets, newPreset] })
      },

      deleteMotionPreset: (presetId: string) => {
        const { customPresets } = get()
        set({ 
          customPresets: customPresets.filter(p => p.id !== presetId) 
        })
      },

      // Easing Curves Actions
      createEasingCurve: (curve: Omit<EasingCurve, 'id'>) => {
        const { customEasingCurves } = get()
        const newCurve: EasingCurve = {
          ...curve,
          id: `custom-easing-${Date.now()}`,
          type: 'custom'
        }
        
        // Validate cubic-bezier values (should be between 0 and 1, except for bouncy effects)
        const validatedBezier: [number, number, number, number] = [
          Math.max(-2, Math.min(2, newCurve.cubicBezier[0])),
          Math.max(-2, Math.min(2, newCurve.cubicBezier[1])),
          Math.max(-2, Math.min(2, newCurve.cubicBezier[2])),
          Math.max(-2, Math.min(2, newCurve.cubicBezier[3]))
        ]
        
        newCurve.cubicBezier = validatedBezier
        
        set({ customEasingCurves: [...customEasingCurves, newCurve] })
      },

      updateEasingCurve: (id: string, updates: Partial<EasingCurve>) => {
        const { customEasingCurves } = get()
        const updatedCurves = customEasingCurves.map(curve => {
          if (curve.id === id) {
            const updated = { ...curve, ...updates }
            
            // Validate cubic-bezier values if they're being updated
            if (updates.cubicBezier) {
              updated.cubicBezier = [
                Math.max(-2, Math.min(2, updates.cubicBezier[0])),
                Math.max(-2, Math.min(2, updates.cubicBezier[1])),
                Math.max(-2, Math.min(2, updates.cubicBezier[2])),
                Math.max(-2, Math.min(2, updates.cubicBezier[3]))
              ]
            }
            
            return updated
          }
          return curve
        })
        
        set({ customEasingCurves: updatedCurves })
      },

      deleteEasingCurve: (id: string) => {
        const { customEasingCurves } = get()
        set({ 
          customEasingCurves: customEasingCurves.filter(curve => curve.id !== id) 
        })
      },

      duplicateEasingCurve: (id: string, newName: string) => {
        const { easingCurves, customEasingCurves } = get()
        const allCurves = [...easingCurves, ...customEasingCurves]
        const originalCurve = allCurves.find(curve => curve.id === id)
        
        if (originalCurve) {
          const duplicatedCurve: EasingCurve = {
            ...originalCurve,
            id: `custom-easing-${Date.now()}`,
            name: newName.trim(),
            type: 'custom'
          }
          
          set({ 
            customEasingCurves: [...customEasingCurves, duplicatedCurve] 
          })
        }
      },

      // UI Actions
      toggleMotionSidebar: () => {
        set(state => ({ showMotionSidebar: !state.showMotionSidebar }))
      },

      setError: (error: string | null) => {
        set({ error })
      }
    }),
    {
      name: 'motion-store',
      // Only persist the settings and custom data, not UI state
      partialize: (state) => ({
        settings: state.settings,
        customPresets: state.customPresets,
        customEasingCurves: state.customEasingCurves
      })
    }
  )
)

// Helper functions for easing curve utilities
export const easingCurveToCSS = (curve: EasingCurve): string => {
  return `cubic-bezier(${curve.cubicBezier.join(', ')})`
}

export const validateCubicBezier = (values: number[]): boolean => {
  if (values.length !== 4) return false
  return values.every(val => typeof val === 'number' && !isNaN(val))
}

export const generateEasingPreview = (curve: EasingCurve): string => {
  const [x1, y1, x2, y2] = curve.cubicBezier
  
  // Generate a simple SVG path for preview
  // This creates a cubic bezier curve from (0,0) to (100,100)
  const path = `M 0 100 C ${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`
  
  return path
}