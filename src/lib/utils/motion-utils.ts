// Motion utilities for easing curve validation and conversion

import { EasingCurve } from '@/types/motion'

/**
 * Convert an EasingCurve to a CSS cubic-bezier string
 */
export const easingCurveToCSS = (curve: EasingCurve): string => {
  return `cubic-bezier(${curve.cubicBezier.join(', ')})`
}

/**
 * Convert an EasingCurve to a Framer Motion easing array
 */
export const easingCurveToFramerMotion = (curve: EasingCurve): number[] => {
  return curve.cubicBezier
}

/**
 * Validate cubic-bezier values
 */
export const validateCubicBezier = (values: number[]): boolean => {
  if (values.length !== 4) return false
  return values.every(val => typeof val === 'number' && !isNaN(val) && val >= -2 && val <= 2)
}

/**
 * Generate SVG path for easing curve preview
 */
export const generateEasingPreview = (curve: EasingCurve, width = 100, height = 100): string => {
  const [x1, y1, x2, y2] = curve.cubicBezier
  
  // Normalize control points to SVG coordinates
  const cp1x = x1 * width
  const cp1y = height - (y1 * height)
  const cp2x = x2 * width  
  const cp2y = height - (y2 * height)
  
  // Create cubic bezier path from bottom-left to top-right
  const path = `M 0 ${height} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${width} 0`
  
  return path
}

/**
 * Create a complete SVG element for easing curve preview
 */
export const createEasingSVG = (curve: EasingCurve, width = 100, height = 100): string => {
  const path = generateEasingPreview(curve, width, height)
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.3"/>
      <path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
      <circle cx="0" cy="${height}" r="3" fill="#3b82f6"/>
      <circle cx="${width}" cy="0" r="3" fill="#3b82f6"/>
    </svg>
  `.trim()
}

/**
 * Parse CSS cubic-bezier string to EasingCurve values
 */
export const parseCubicBezier = (cssValue: string): number[] | null => {
  const match = cssValue.match(/cubic-bezier\(([^)]+)\)/)
  if (!match) return null
  
  const values = match[1].split(',').map(v => parseFloat(v.trim()))
  if (values.length !== 4 || values.some(isNaN)) return null
  
  return values
}

/**
 * Common easing curve presets for quick access
 */
export const EASING_PRESETS = {
  linear: [0, 0, 1, 1] as [number, number, number, number],
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  easeIn: [0.42, 0, 1, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.58, 1] as [number, number, number, number],
  easeInOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  elastic: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]
}

/**
 * Apply motion settings to animation variants
 */
export const applyMotionSettings = (
  baseVariants: Record<string, unknown>,
  motionSettings: MotionSettings,
  direction?: string
): Record<string, unknown> => {
  const { globalInitialPosition } = motionSettings
  
  const modifiedVariants = { ...baseVariants }
  
  // Apply global position offsets based on direction
  if (direction && modifiedVariants.initial && typeof modifiedVariants.initial === 'object') {
    const initial = modifiedVariants.initial as Record<string, number>
    
    switch (direction.toUpperCase()) {
      case 'L':
        initial.x = (initial.x || 0) + globalInitialPosition.left
        break
      case 'R':
        initial.x = (initial.x || 0) + globalInitialPosition.right
        break
      case 'F':
        initial.scale = (initial.scale || 1) * globalInitialPosition.front
        break
      case 'B':
        initial.scale = (initial.scale || 1) * globalInitialPosition.back
        break
    }
  }
  
  return modifiedVariants
}

/**
 * Calculate adjusted animation duration based on speed multiplier
 */
export const applySpeedMultiplier = (baseDuration: number, speedMultiplier: number): number => {
  return baseDuration / speedMultiplier
}

/**
 * Get easing curve by ID from available curves
 */
export const getEasingCurveById = (
  id: string, 
  allCurves: EasingCurve[]
): EasingCurve | undefined => {
  return allCurves.find(curve => curve.id === id)
}

/**
 * Validate motion settings values (basic type checking only)
 */
export const validateMotionSettings = (settings: Partial<MotionSettings>): boolean => {
  if (!settings || typeof settings !== 'object') return false
  
  const { globalInitialPosition, speedMultiplier, gapBetweenWords } = settings
  
  // Basic type validation only - no value limits
  if (globalInitialPosition) {
    const { left, right, front, back } = globalInitialPosition
    if (typeof left !== 'number' || isNaN(left)) return false
    if (typeof right !== 'number' || isNaN(right)) return false
    if (typeof front !== 'number' || isNaN(front)) return false
    if (typeof back !== 'number' || isNaN(back)) return false
  }
  
  if (speedMultiplier !== undefined) {
    if (typeof speedMultiplier !== 'number' || isNaN(speedMultiplier)) return false
  }
  
  if (gapBetweenWords !== undefined) {
    if (typeof gapBetweenWords !== 'number' || isNaN(gapBetweenWords)) return false
  }
  
  return true
}