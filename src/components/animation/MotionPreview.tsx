'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { useTypographyStore } from '@/lib/store/typography-store'
import { useMotionStore } from '@/lib/store/motion-store'
import { WordData } from '@/types/typographer'
import { AnimationEngine } from '@/lib/animations/engine'
import { setSyncGapCallback } from '@/lib/store/motion-store'
import { cn } from '@/lib/utils'

interface MotionPreviewProps {
  className?: string
}

export function MotionPreview({ className }: MotionPreviewProps) {
  const { words, textContent, isPlaying, currentTime, setWordGap } = useTypographerStore()
  const { settings: typography } = useTypographyStore()
  const { settings: motionSettings, easingCurves, customEasingCurves } = useMotionStore()

  // Force re-render when typography changes
  const typographyKey = React.useMemo(() => {
    return `${typography.fontFamily}-${typography.fontSize}-${typography.fontWeight}-${typography.letterSpacing}-${typography.lineHeight}-${typography.textColor}`
  }, [typography.fontFamily, typography.fontSize, typography.fontWeight, typography.letterSpacing, typography.lineHeight, typography.textColor])

  const canvasRef = React.useRef<HTMLDivElement>(null)
  const animationEngineRef = React.useRef<AnimationEngine | null>(null)

  // Set up gap synchronization
  React.useEffect(() => {
    setSyncGapCallback(setWordGap)
  }, [setWordGap])

  // Initialize animation engine with motion settings
  React.useEffect(() => {
    if (canvasRef.current && motionSettings) {
      const allEasingCurves = [...easingCurves, ...customEasingCurves]
      animationEngineRef.current = new AnimationEngine(
        canvasRef.current,
        motionSettings,
        allEasingCurves
      )
    }
  }, [motionSettings, easingCurves, customEasingCurves])

  // Update motion settings when they change
  React.useEffect(() => {
    if (animationEngineRef.current && motionSettings) {
      const allEasingCurves = [...easingCurves, ...customEasingCurves]
      animationEngineRef.current.updateMotionSettings(motionSettings, allEasingCurves)
    }
  }, [motionSettings, easingCurves, customEasingCurves])

  // Trigger text re-parsing when motion settings change to apply to existing animations
  const previousDefaultEasing = React.useRef(motionSettings?.defaultEasing)
  const previousGlobalPosition = React.useRef(motionSettings?.globalInitialPosition)
  const previousSpeedMultiplier = React.useRef(motionSettings?.speedMultiplier)
  
  React.useEffect(() => {
    const easingChanged = motionSettings?.defaultEasing !== previousDefaultEasing.current
    const positionChanged = JSON.stringify(motionSettings?.globalInitialPosition) !== JSON.stringify(previousGlobalPosition.current)
    const speedChanged = motionSettings?.speedMultiplier !== previousSpeedMultiplier.current
    
    if ((easingChanged || positionChanged || speedChanged) && textContent) {
      previousDefaultEasing.current = motionSettings?.defaultEasing
      previousGlobalPosition.current = motionSettings?.globalInitialPosition
      previousSpeedMultiplier.current = motionSettings?.speedMultiplier
      
      const { updateText } = useTypographerStore.getState()
      updateText(textContent)
    }
  }, [motionSettings?.defaultEasing, motionSettings?.globalInitialPosition, motionSettings?.speedMultiplier, textContent])

  // Extract clean text without motion language tags
  const cleanText = textContent.replace(/<[^>]*>/g, '')

  if (!cleanText.trim()) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-6">
          <div className="text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Motion Preview
          </div>
          <div className="text-lg text-muted-foreground max-w-md">
            Start typing with motion language tags to see your animated typography come to life
          </div>
          <div className="text-sm text-muted-foreground">
            Example: Type <code className="px-2 py-1 bg-muted rounded">Hello &lt;0.3F1.2R0.9&gt; World &lt;0.5L1.8B0.4&gt;</code> to see &ldquo;Hello World&rdquo; with animations
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full overflow-hidden relative bg-transparent", className)}>
      {/* Animation Canvas - Clean background */}
      <div 
        ref={canvasRef}
        data-animation-preview
        className="absolute inset-0 flex items-center justify-center bg-transparent"
        style={{ 
          perspective: '1000px',
          backgroundColor: typography.backgroundColor === 'transparent' ? 'transparent' : typography.backgroundColor,
        }}
      >
        <AnimatePresence key={typographyKey}>
          {words.map((word) => (
            <AnimatedWord 
              key={`${word.id}-${typographyKey}`} 
              word={word} 
              isPlaying={isPlaying}
              currentTime={currentTime}
              typography={typography}
              motionSettings={motionSettings}
              easingCurves={easingCurves}
              customEasingCurves={customEasingCurves}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface AnimatedWordProps {
  word: WordData
  isPlaying: boolean
  currentTime: number
  typography: {
    fontFamily: string
    fontSize: number
    fontWeight: number
    letterSpacing: number
    lineHeight: number
    textColor: string
    backgroundColor: string
    textAlign: 'left' | 'center' | 'right'
    textDecoration: 'none' | 'underline' | 'line-through'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  }
  motionSettings: any
  easingCurves: any[]
  customEasingCurves: any[]
}

const AnimatedWord = React.memo(function AnimatedWord({ word, isPlaying, currentTime, typography, motionSettings, easingCurves, customEasingCurves }: AnimatedWordProps) {
  const [shouldAnimate, setShouldAnimate] = React.useState(false)
  const [animationPhase, setAnimationPhase] = React.useState<'entry' | 'display' | 'exit' | 'complete'>('entry')
  
  // Check if word should be animating at current time
  React.useEffect(() => {
    const startTime = word.startTime
    const endTime = word.startTime + word.duration
    const isInTimeRange = currentTime >= startTime && currentTime <= endTime
    
    setShouldAnimate(isPlaying && isInTimeRange)
    
    // Calculate animation phase for motion language words
    if (word.motionConfig && isInTimeRange) {
      const relativeTime = currentTime - startTime
      const entryDuration = word.motionConfig.entrySpeed || 0.8 // Use specified or default
      const displayDuration = word.motionConfig.displayDuration
      
      if (relativeTime < entryDuration) {
        setAnimationPhase('entry')
      } else if (relativeTime < entryDuration + displayDuration) {
        setAnimationPhase('display')
      } else {
        setAnimationPhase('exit')
      }
    } else if (!isInTimeRange && currentTime > endTime) {
      setAnimationPhase('complete')
    }
  }, [isPlaying, currentTime, word.startTime, word.duration, word.motionConfig])

  // Don't show if completely outside time range
  if (!shouldAnimate && currentTime < word.startTime) {
    return null
  }
  
  // Show word at current state when paused or completed
  const isCompleted = currentTime > word.startTime + word.duration

  // Resolve default easing to actual curve values
  const speedMultiplier = motionSettings?.speedMultiplier ?? 1.0
  const defaultEasingId = motionSettings?.defaultEasing ?? 'easeOut'
  
  let defaultEasing: string | number[] = 'easeOut'
  if (defaultEasingId) {
    // First check custom curves
    const customCurve = customEasingCurves.find(curve => curve.id === defaultEasingId)
    if (customCurve) {
      defaultEasing = customCurve.cubicBezier
    } else {
      // Check built-in curves
      const builtInCurve = easingCurves.find(curve => curve.id === defaultEasingId)
      if (builtInCurve) {
        defaultEasing = builtInCurve.cubicBezier
      }
    }
  }

  // Create motion variants based on phase and motion config
  const getMotionVariants = () => {
    
    if (word.motionConfig) {
      const { entryDirection, exitDirection } = word.motionConfig
      
      const entryTransform = getDirectionTransform(entryDirection)
      const exitTransform = getDirectionTransform(exitDirection)
      
      return {
        initial: {
          x: `calc(-50% + ${entryTransform.x}px)`,
          y: `calc(-50% + ${entryTransform.y}px)`,
          z: entryTransform.z,
          scale: entryTransform.scale,
          opacity: 0
        },
        animate: animationPhase === 'entry' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          scale: 1,
          opacity: 1
        } : animationPhase === 'display' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          scale: 1,
          opacity: 1
        } : animationPhase === 'complete' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          scale: 1,
          opacity: 0.3
        } : { // exit phase
          x: `calc(-50% + ${exitTransform.x}px)`,
          y: `calc(-50% + ${exitTransform.y}px)`,
          z: exitTransform.z,
          scale: exitTransform.scale,
          opacity: 0
        },
        transition: {
          duration: isPlaying ? (
            animationPhase === 'entry' ? (word.motionConfig?.entrySpeed || 0.8) / speedMultiplier : 
            animationPhase === 'display' ? 0.3 / speedMultiplier : 
            (word.motionConfig?.exitSpeed || 0.8) / speedMultiplier
          ) : 0, // No transition when paused
          ease: defaultEasing
        }
      }
    } else {
      // Standard animations for non-motion words - also use global settings
      return {
        initial: { 
          x: '-50%',
          y: '-50%',
          opacity: 0,
          scale: motionSettings?.globalInitialPosition?.front ?? 0.8
        },
        animate: { 
          x: '-50%',
          y: '-50%',
          opacity: 1,
          scale: 1
        },
        transition: { 
          duration: 1 / speedMultiplier, 
          ease: defaultEasing 
        }
      }
    }
  }

  const motionVariants = getMotionVariants()

  // Helper function to get direction transforms using global motion settings
  function getDirectionTransform(direction: string): Record<string, number> {
    const settings = motionSettings?.globalInitialPosition
    switch (direction) {
      case 'L': return { x: settings?.left ?? -100, y: 0, z: 0, scale: 1 }
      case 'R': return { x: settings?.right ?? 100, y: 0, z: 0, scale: 1 }
      case 'F': return { x: 0, y: 0, z: 0, scale: settings?.front ?? 0.6 }
      case 'B': return { x: 0, y: 0, z: 0, scale: settings?.back ?? 1.4 }
      default: return { x: 0, y: 0, z: 0, scale: 1 }
    }
  }

  // Show word if it's in time range or paused and has started
  const shouldShowWord = shouldAnimate || (!isPlaying && currentTime >= word.startTime && !isCompleted)

  return (
    <AnimatePresence>
      {shouldShowWord && (
        <motion.div
          key={word.id}
          initial={motionVariants.initial}
          animate={motionVariants.animate}
          exit={motionVariants.initial}
          transition={motionVariants.transition}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontSize: `${typography.fontSize}rem`,
            fontFamily: typography.fontFamily,
            fontWeight: typography.fontWeight,
            letterSpacing: `${typography.letterSpacing}em`,
            lineHeight: typography.lineHeight,
            color: typography.textColor,
            textDecoration: typography.textDecoration,
            textTransform: typography.textTransform,
            textAlign: typography.textAlign,
            userSelect: 'none',
            willChange: 'transform, opacity',
            zIndex: 20,
            whiteSpace: 'nowrap',
            transformOrigin: 'center center'
          }}
        >
          {word.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
})