// Animation Engine - Core animation logic with Framer Motion integration

import { motion, Transition } from 'framer-motion'
import { 
  AnimationType, 
  WordData, 
  MotionDirection, 
  ZoomType 
} from '@/types/typographer'
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

/**
 * Animation Engine class that handles all animation logic
 */
export class AnimationEngine {
  private canvas: HTMLElement | null = null
  private activeAnimations: Map<string, any> = new Map()

  constructor(canvasElement?: HTMLElement) {
    this.canvas = canvasElement || null
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
    
    return {
      type: word.animation,
      startTime: word.startTime,
      duration: word.duration,
      position: word.position,
      variants: definition.variants,
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
   * Get transform values for motion directions
   */
  private getDirectionTransform(direction: MotionDirection): Record<string, number> {
    switch (direction) {
      case MotionDirection.LEFT:
        return { x: -100, y: 0, z: 0 } // Reduced from -200
      case MotionDirection.RIGHT:
        return { x: 100, y: 0, z: 0 }  // Reduced from 200
      case MotionDirection.FRONT:
        return { x: 0, y: 0, z: 100 }
      case MotionDirection.BACK:
        return { x: 0, y: 0, z: -100 }
      default:
        return { x: 0, y: 0, z: 0 }
    }
  }

  /**
   * Calculate motion animation duration based on speed
   */
  private calculateMotionDuration(speed: number): number {
    // Speed 0 = 2 seconds, Speed 99 = 0.1 seconds
    return Math.max(0.1, 2 - (speed / 99) * 1.9)
  }

  /**
   * Get appropriate easing for motion speed
   */
  private getMotionEasing(speed: number): any {
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