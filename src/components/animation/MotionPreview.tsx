'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { useTypographyStore } from '@/lib/store/typography-store'
import { AnimationType, WordData } from '@/types/typographer'
import { animationEngine, createMotionConfig } from '@/lib/animations/engine'
import { cn } from '@/lib/utils'

interface MotionPreviewProps {
  className?: string
}

export function MotionPreview({ className }: MotionPreviewProps) {
  const { words, textContent, isPlaying, currentTime } = useTypographerStore()
  const { settings: typography } = useTypographyStore()
  const canvasRef = React.useRef<HTMLDivElement>(null)

  // Set up animation engine with canvas reference
  React.useEffect(() => {
    if (canvasRef.current) {
      animationEngine.setCanvas(canvasRef.current)
    }
  }, [])

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
        className="absolute inset-0 flex items-center justify-center bg-transparent"
        style={{ 
          perspective: '1000px',
          backgroundColor: typography.backgroundColor === 'transparent' ? 'transparent' : typography.backgroundColor,
        }}
      >
        <AnimatePresence>
          {words.map((word) => (
            <AnimatedWord 
              key={word.id} 
              word={word} 
              isPlaying={isPlaying}
              currentTime={currentTime}
              typography={typography}
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
}

function AnimatedWord({ word, isPlaying, currentTime, typography }: AnimatedWordProps) {
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

  // Create motion variants based on phase and motion config
  const getMotionVariants = () => {
    if (word.motionConfig) {
      const { entryDirection, exitDirection } = word.motionConfig
      
      const entryTransform = getDirectionTransform(entryDirection)
      const exitTransform = getDirectionTransform(exitDirection)
      
      return {
        initial: {
          x: entryTransform.x === 0 ? '-50%' : entryTransform.x > 0 ? 'calc(-50% + 100px)' : 'calc(-50% - 100px)',
          y: entryTransform.y === 0 ? '-50%' : entryTransform.y > 0 ? 'calc(-50% + 100px)' : 'calc(-50% - 100px)',
          z: entryTransform.z,
          opacity: 0
        },
        animate: animationPhase === 'entry' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          opacity: 1
        } : animationPhase === 'display' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          opacity: 1
        } : animationPhase === 'complete' ? {
          x: '-50%',
          y: '-50%',
          z: 0,
          opacity: 0.3
        } : { // exit phase
          x: exitTransform.x === 0 ? '-50%' : exitTransform.x > 0 ? 'calc(-50% + 100px)' : 'calc(-50% - 100px)',
          y: exitTransform.y === 0 ? '-50%' : exitTransform.y > 0 ? 'calc(-50% + 100px)' : 'calc(-50% - 100px)',
          z: exitTransform.z,
          opacity: 0
        },
        transition: {
          duration: isPlaying ? (
            animationPhase === 'entry' ? (word.motionConfig?.entrySpeed || 0.8) : 
            animationPhase === 'display' ? 0.3 : 
            (word.motionConfig?.exitSpeed || 0.8)
          ) : 0, // No transition when paused
          ease: animationPhase === 'entry' ? [0.25, 0.46, 0.45, 0.94] : // easeOutCubic for entry
                animationPhase === 'display' ? [0.4, 0, 0.2, 1] : // easeInOut for display
                [0.55, 0.085, 0.68, 0.53] // easeInCubic for exit
        }
      }
    } else {
      // Default fade animation for non-motion words
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 1, ease: 'easeOut' }
      }
    }
  }

  const motionVariants = getMotionVariants()

  // Helper function to get direction transforms
  function getDirectionTransform(direction: string): Record<string, number> {
    switch (direction) {
      case 'L': return { x: -100, y: 0, z: 0 } // Reduced from -200
      case 'R': return { x: 100, y: 0, z: 0 }  // Reduced from 200
      case 'F': return { x: 0, y: 0, z: 100 }
      case 'B': return { x: 0, y: 0, z: -100 }
      default: return { x: 0, y: 0, z: 0 }
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
}