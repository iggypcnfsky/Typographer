'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { AnimationType } from '@/types/typographer'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface TimelineProps {
  className?: string
}

export function Timeline({ className }: TimelineProps) {
  const { 
    words, 
    currentTime, 
    totalDuration, 
    wordGap,
    seekTo,
    setWordGap
  } = useTypographerStore()

  const timelineRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [showGapControl, setShowGapControl] = React.useState(false)

  // Format time for display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor((time % 1) * 100)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  // Handle timeline click
  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current || totalDuration === 0) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = Math.max(0, Math.min(totalDuration, percentage * totalDuration))
    
    seekTo(newTime)
  }

  // Handle drag start
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true)
    handleTimelineClick(event)
  }

  // Handle drag move
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !timelineRef.current || totalDuration === 0) return

      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, clickX / rect.width))
      const newTime = percentage * totalDuration
      
      seekTo(newTime)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, totalDuration, seekTo])

  if (words.length === 0 || totalDuration === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-center text-muted-foreground text-sm">
          Add text with animations to see timeline
        </div>
      </div>
    )
  }

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div 
      className={cn("p-4 space-y-4 relative", className)}
      onMouseEnter={() => setShowGapControl(true)}
      onMouseLeave={() => setShowGapControl(false)}
    >
      {/* Gap Control - Shows on hover */}
      {showGapControl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 right-2 bg-card border border-border rounded-md px-3 py-2 shadow-lg z-30"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">Gap:</span>
            <div className="w-20">
              <Slider
                value={[wordGap]}
                onValueChange={(value) => setWordGap(value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="cursor-pointer"
              />
            </div>
            <span className="text-muted-foreground w-10 text-right text-xs">
              {wordGap >= 0 ? '+' : ''}{wordGap.toFixed(1)}s
            </span>
          </div>
        </motion.div>
      )}

      {/* Time display */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span className="text-xs">
          {words.length} words • {words.filter(w => w.animation === AnimationType.MOTION_LANGUAGE).length} motion
        </span>
        <span>{formatTime(totalDuration)}</span>
      </div>

      {/* Timeline container */}
      <div className="relative">
        {/* Timeline track */}
        <div
          ref={timelineRef}
          className="relative h-12 bg-muted rounded-lg cursor-pointer overflow-hidden"
          onMouseDown={handleMouseDown}
        >
          {/* Word blocks */}
          {words.map((word) => {
            const startPercent = totalDuration > 0 ? (word.startTime / totalDuration) * 100 : 0
            const widthPercent = totalDuration > 0 ? (word.duration / totalDuration) * 100 : 0
            const isActive = currentTime >= word.startTime && currentTime <= word.startTime + word.duration
            const isMotionLanguage = word.animation === AnimationType.MOTION_LANGUAGE

            return (
              <motion.div
                key={word.id}
                className={cn(
                  "absolute top-1 bottom-1 rounded-sm border-2 transition-all duration-200",
                  isActive 
                    ? "bg-primary border-primary shadow-lg z-10" 
                    : isMotionLanguage
                      ? "bg-blue-500/70 border-blue-400"
                      : "bg-muted-foreground/50 border-muted-foreground/30",
                  "hover:opacity-80"
                )}
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(1, widthPercent)}%`
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: word.startTime * 0.1 }}
              >
                {/* Word label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className={cn(
                      "text-xs font-medium truncate px-1",
                      isActive 
                        ? "text-primary-foreground" 
                        : "text-foreground"
                    )}
                  >
                    {word.text}
                  </span>
                </div>

                {/* Motion language indicator */}
                {isMotionLanguage && word.motionConfig && (
                  <div className="absolute -top-6 left-0 text-xs text-blue-400 font-mono whitespace-nowrap">
                    {word.motionConfig.entrySpeed || 0.8}{word.motionConfig.entryDirection}{word.motionConfig.displayDuration}{word.motionConfig.exitDirection}{word.motionConfig.exitSpeed || 0.8}
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Progress indicator */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg z-20"
            style={{ left: `${progressPercentage}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Playhead */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full shadow-lg" />
            
            {/* Current time tooltip */}
            <div className="absolute -top-8 -left-6 bg-card border border-border rounded px-2 py-1 text-xs shadow-lg">
              {formatTime(currentTime)}
            </div>
          </motion.div>
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {Array.from({ length: 5 }).map((_, i) => {
            const time = (totalDuration / 4) * i
            return (
              <span key={i} className="flex flex-col items-center">
                <div className="w-px h-2 bg-muted-foreground/30" />
                {formatTime(time)}
              </span>
            )
          })}
        </div>
      </div>


    </div>
  )
}