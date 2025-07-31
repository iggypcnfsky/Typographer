// Animation Engine - Core animation logic with Framer Motion integration

import { motion, Transition } from 'framer-motion'
import { 
  AnimationType, 
  WordData, 
  MotionDirection, 
  ZoomType 
} from '@/types/typographer'
import { MotionSettings, EasingCurve } from '@/types/motion'
import { 
  animationDefinitions, 
  easingCurves, 
  timingConfig 
} from './presets'
import { 
  AnimationVariants, 
  MotionConfig, 
  MotionLanguageConfig, 
  WordAnimationConfig 
} from './types'
import { easingCurveToFramerMotion } from '@/lib/utils/motion-utils'

/**
 * Animation Engine class that handles all animation logic
 */
export class AnimationEngine {
  private canvas: HTMLElement | null = null
  private activeAnimations: Map<string, unknown> = new Map()
  private motionSettings: MotionSettings | null = null
  private customEasingCurves: EasingCurve[] = []

  constructor(canvasElement?: HTMLElement, motionSettings?: MotionSettings, customEasingCurves?: EasingCurve[]) {
    this.canvas = canvasElement || null
    this.motionSettings = motionSettings || null
    this.customEasingCurves = customEasingCurves || []
  }

  /**
   * Update motion settings for the engine
   */
  updateMotionSettings(settings: MotionSettings, customCurves: EasingCurve[] = []) {
    this.motionSettings = settings
    this.customEasingCurves = customCurves
  }

  /**
   * Generate animation configuration for a word based on its type and motion config
   */
  generateWordAnimation(word: WordData): WordAnimationConfig {
    if (word.animation === AnimationType.MOTION_LANGUAGE && word.motionConfig) {
      return this.generateMotionLanguageAnimation(word)
    } else {
      return this.generateStandardAnimation(word)
    }
  }

  /**
   * Generate motion language specific animation
   */
  private generateMotionLanguageAnimation(word: WordData): WordAnimationConfig {
    const config = word.motionConfig!
    
    // Calculate animation phases
    const entryDuration = this.calculateMotionDuration(config.speed)
    const displayDuration = config.displayDuration
    const exitDuration = this.calculateMotionDuration(config.speed)
    const totalDuration = entryDuration + displayDuration + exitDuration

    // Generate variants for motion language
    const variants = this.createMotionLanguageVariants(config)
    
    return {
      type: AnimationType.MOTION_LANGUAGE,
      motionConfig: config,
      startTime: word.startTime,
      duration: totalDuration,
      position: word.position,
      variants,
      transition: {
        duration: totalDuration,
        ease: this.getMotionEasing(config.speed),
        delay: word.startTime,
        type: 'tween'
      }
    }
  }

  /**
   * Generate standard animation configuration
   */
  private generateStandardAnimation(word: WordData): WordAnimationConfig {
    const definition = animationDefinitions[word.animation]
    
    // Apply global position offsets to standard animations
    const variants = this.applyGlobalPositionToVariants(definition.variants, word.animation)
    
    return {
      type: word.animation,
      startTime: word.startTime,
      duration: word.duration,
      position: word.position,
      variants,
      transition: {
        duration: word.duration,
        ease: easingCurves[word.easing]?.curve || 'easeOut',
        delay: word.startTime,
        type: 'tween'
      }
    }
  }

  /**
   * Create Framer Motion variants for motion language animations
   */
  private createMotionLanguageVariants(config: MotionLanguageConfig): AnimationVariants {
    const entryTransform = this.getDirectionTransform(config.entryDirection)
    const exitTransform = this.getDirectionTransform(config.exitDirection)
    const zoomScale = config.zoomType === ZoomType.ZOOM_IN ? 1.2 : 0.8

    return {
      initial: {
        ...entryTransform,
        opacity: 0,
        scale: 0.5
      },
      animate: {
        x: 0,
        y: 0,
        z: 0,
        opacity: 1,
        scale: zoomScale,
        transition: {
          duration: this.calculateMotionDuration(config.speed),
          ease: this.getMotionEasing(config.speed)
        }
      },
      exit: {
        ...exitTransform,
        opacity: 0,
        scale: 0.3,
        transition: {
          duration: this.calculateMotionDuration(config.speed),
          ease: 'easeIn'
        }
      }
    }
  }

  /**
   * Apply global position offsets to standard animation variants
   */
  private applyGlobalPositionToVariants(variants: AnimationVariants, animationType: AnimationType): AnimationVariants {
    if (!this.motionSettings?.globalInitialPosition) {
      return variants
    }

    const settings = this.motionSettings.globalInitialPosition
    const modifiedVariants = { ...variants }

    // Apply offsets based on animation type
    if (modifiedVariants.initial) {
      const initial = { ...modifiedVariants.initial }
      
      // Apply horizontal offsets for slide animations
      if (animationType === AnimationType.SLIDE_LEFT && typeof initial.x === 'number') {
        initial.x = settings.right // Use right position for slide left (coming from right)
      } else if (animationType === AnimationType.SLIDE_RIGHT && typeof initial.x === 'number') {
        initial.x = settings.left // Use left position for slide right (coming from left)
      }
      
      // Apply vertical offsets for slide up/down animations
      if (animationType === AnimationType.SLIDE_UP && typeof initial.y === 'number') {
        // Keep original relative offset but apply speed multiplier if needed
        initial.y = initial.y * (this.motionSettings?.speedMultiplier || 1)
      } else if (animationType === AnimationType.SLIDE_DOWN && typeof initial.y === 'number') {
        initial.y = initial.y * (this.motionSettings?.speedMultiplier || 1)
      }
      
      // Apply scale offsets for scale-based animations
      if ((animationType === AnimationType.SCALE_IN || animationType === AnimationType.ZOOM_IN) && typeof initial.scale === 'number') {
        initial.scale = settings.front // Use front scale for scale-in animations
      }
      
      // Apply scale offsets for bounce and other scale animations
      if (animationType === AnimationType.BOUNCE && typeof initial.scale === 'number') {
        initial.scale = settings.front // Use front scale for bounce animations
      }
      
      modifiedVariants.initial = initial
    }

    return modifiedVariants
  }

  /**
   * Get transform values for motion directions with global position settings
   */
  private getDirectionTransform(direction: MotionDirection): Record<string, number> {
    const settings = this.motionSettings?.globalInitialPosition
    
    switch (direction) {
      case MotionDirection.LEFT:
        return { 
          x: settings?.left ?? -100, 
          y: 0, 
          z: 0,
          scale: 1
        }
      case MotionDirection.RIGHT:
        return { 
          x: settings?.right ?? 100, 
          y: 0, 
          z: 0,
          scale: 1
        }
      case MotionDirection.FRONT:
        return { 
          x: 0, 
          y: 0, 
          z: 0,
          scale: settings?.front ?? 0.6
        }
      case MotionDirection.BACK:
        return { 
          x: 0, 
          y: 0, 
          z: 0,
          scale: settings?.back ?? 1.4
        }
      default:
        return { x: 0, y: 0, z: 0, scale: 1 }
    }
  }

  /**
   * Calculate motion animation duration based on speed and global multiplier
   */
  private calculateMotionDuration(speed: number): number {
    // Speed 0 = 2 seconds, Speed 99 = 0.1 seconds
    const baseDuration = Math.max(0.1, 2 - (speed / 99) * 1.9)
    const speedMultiplier = this.motionSettings?.speedMultiplier ?? 1.0
    return baseDuration / speedMultiplier
  }

  /**
   * Get appropriate easing for motion speed using custom curves
   */
  private getMotionEasing(speed: number): string | number[] {
    // Use default easing curve if set
    const defaultEasingId = this.motionSettings?.defaultEasing
    if (defaultEasingId) {
      // Look for custom curve first
      const customCurve = this.customEasingCurves.find(curve => curve.id === defaultEasingId)
      if (customCurve) {
        return easingCurveToFramerMotion(customCurve)
      }
      
      // Fallback to built-in curves
      const builtInCurve = easingCurves[defaultEasingId]
      if (builtInCurve) {
        return builtInCurve.curve
      }
    }
    
    // Fallback to speed-based easing
    if (speed < 30) {
      return 'easeInOut'
    } else if (speed < 70) {
      return 'easeOut'
    } else {
      return [0.25, 0.46, 0.45, 0.94] // Custom fast easing
    }
  }

  /**
   * Create Framer Motion component with animation config
   */
  createAnimatedComponent(
    word: WordData, 
    config: WordAnimationConfig,
    children: React.ReactNode
  ): React.ReactElement {
    return motion.div({
      key: word.id,
      initial: config.variants.initial,
      animate: config.variants.animate,
      exit: config.variants.exit,
      transition: config.transition,
      style: {
        position: 'absolute',
        left: config.position.x,
        top: config.position.y,
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'currentColor',
        userSelect: 'none',
        willChange: 'transform, opacity'
      },
      children
    })
  }

  /**
   * Start animation sequence for multiple words
   */
  async startAnimationSequence(words: WordData[]): Promise<void> {
    // Clear any existing animations
    this.stopAllAnimations()

    // Generate animation configs for all words
    const wordConfigs = words.map(word => ({
      word,
      config: this.generateWordAnimation(word)
    }))

    // Sort by start time
    wordConfigs.sort((a, b) => a.config.startTime - b.config.startTime)

    // Schedule animations
    wordConfigs.forEach(({ word, config }) => {
      const timeoutId = setTimeout(() => {
        this.activeAnimations.set(word.id, { word, config })
      }, config.startTime * 1000)

      this.activeAnimations.set(`timeout-${word.id}`, timeoutId)
    })
  }

  /**
   * Stop all active animations
   */
  stopAllAnimations(): void {
    this.activeAnimations.forEach((value, key) => {
      if (key.startsWith('timeout-')) {
        clearTimeout(value)
      }
    })
    this.activeAnimations.clear()
  }

  /**
   * Get animation state for timeline
   */
  getAnimationState(currentTime: number): {
    activeWords: string[]
    upcomingWords: string[]
    completedWords: string[]
  } {
    const activeWords: string[] = []
    const upcomingWords: string[] = []
    const completedWords: string[] = []

    this.activeAnimations.forEach((value, key) => {
      if (!key.startsWith('timeout-')) {
        const { config } = value
        const endTime = config.startTime + config.duration

        if (currentTime < config.startTime) {
          upcomingWords.push(key)
        } else if (currentTime >= config.startTime && currentTime <= endTime) {
          activeWords.push(key)
        } else {
          completedWords.push(key)
        }
      }
    })

    return { activeWords, upcomingWords, completedWords }
  }

  /**
   * Update canvas reference
   */
  setCanvas(canvas: HTMLElement): void {
    this.canvas = canvas
  }

  /**
   * Get canvas dimensions for positioning calculations
   */
  getCanvasDimensions(): { width: number; height: number } {
    if (!this.canvas) {
      return { width: 800, height: 600 } // Default dimensions
    }

    const rect = this.canvas.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }
}

// Export singleton instance
export const animationEngine = new AnimationEngine()

// Helper functions for external use
export function createMotionConfig(
  word: WordData,
  startTime: number = 0
): MotionConfig {
  const config = animationEngine.generateWordAnimation({
    ...word,
    startTime
  })

  return {
    initial: config.variants.initial,
    animate: config.variants.animate,
    exit: config.variants.exit,
    transition: config.transition
  }
}

export function getAnimationDuration(word: WordData): number {
  if (word.animation === AnimationType.MOTION_LANGUAGE && word.motionConfig) {
    const entryDuration = animationEngine['calculateMotionDuration'](word.motionConfig.speed)
    const exitDuration = animationEngine['calculateMotionDuration'](word.motionConfig.speed)
    return entryDuration + word.motionConfig.displayDuration + exitDuration
  }

  const definition = animationDefinitions[word.animation]
  return definition?.defaultDuration || word.duration
}