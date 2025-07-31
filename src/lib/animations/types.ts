// Animation system type definitions

import { AnimationType, MotionDirection, ZoomType } from '@/types/typographer'

export interface AnimationVariants {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit?: Record<string, unknown>
}

export interface EasingCurve {
  name: string
  curve: string | number[]
  description: string
}

export interface AnimationDefinition {
  type: AnimationType
  variants: AnimationVariants
  defaultDuration: number
  defaultEasing: string
  description: string
  properties: string[] // List of CSS properties this animation affects
}

export interface TimingConfig {
  wordsPerMinute: number
  minWordDelay: number
  maxWordDelay: number
  animationOverlap: number // Percentage of overlap between word animations
}

export interface PositionCalculation {
  x: number
  y: number
  rotation?: number
  scale?: number
}

export interface CollisionBounds {
  top: number
  right: number
  bottom: number
  left: number
}

// Framer Motion specific types
export interface MotionConfig {
  initial: Record<string, unknown>
  animate: Record<string, unknown>
  exit?: Record<string, unknown>
  transition: Record<string, unknown>
}

// Motion Language Animation Configuration
export interface MotionLanguageConfig {
  entryDirection: MotionDirection
  speed: number // 0-99
  displayDuration: number // 1-9 seconds
  zoomType: ZoomType
  exitDirection: MotionDirection
}

// Complete animation configuration for a word
export interface WordAnimationConfig {
  type: AnimationType
  motionConfig?: MotionLanguageConfig
  startTime: number
  duration: number
  position: PositionCalculation
  variants: AnimationVariants
  transition: Record<string, unknown>
}