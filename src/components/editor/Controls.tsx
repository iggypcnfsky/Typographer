'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  Repeat,
  Type
} from 'lucide-react'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { useTypographyStore } from '@/lib/store/typography-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ControlsProps {
  className?: string
}

export function Controls({ className }: ControlsProps) {
  const {
    isPlaying,
    currentTime,
    totalDuration,
    playbackSpeed,
    words,
    playAnimation,
    pauseAnimation,
    seekTo
  } = useTypographerStore()
  
  const { showRightSidebar, toggleRightSidebar } = useTypographyStore()

  const [isLooping, setIsLooping] = React.useState(true)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Auto-advance time when playing
  React.useEffect(() => {
    if (isPlaying && totalDuration > 0) {
      intervalRef.current = setInterval(() => {
        const newTime = Math.min(currentTime + 0.1 * playbackSpeed, totalDuration)
        seekTo(newTime)
        
        // Auto-restart when looping, otherwise pause
        if (newTime >= totalDuration) {
          if (isLooping) {
            seekTo(0) // Restart from beginning
          } else {
            pauseAnimation()
          }
        }
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentTime, totalDuration, playbackSpeed, seekTo, pauseAnimation, isLooping])

  const handlePlay = () => {
    if (currentTime >= totalDuration) {
      seekTo(0) // Reset to beginning if at end
    }
    playAnimation()
  }

  const handleRestart = () => {
    seekTo(0)
    if (!isPlaying) {
      playAnimation()
    }
  }

  const handleSkipBack = () => {
    seekTo(Math.max(0, currentTime - 5))
  }

  const handleSkipForward = () => {
    seekTo(Math.min(totalDuration, currentTime + 5))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const canPlay = words.length > 0 && totalDuration > 0

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Main playback controls */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestart}
        disabled={!canPlay}
        className="p-2"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipBack}
        disabled={!canPlay}
        className="p-2"
      >
        <SkipBack className="h-4 w-4" />
      </Button>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={isPlaying ? pauseAnimation : handlePlay}
          disabled={!canPlay}
          className="p-3"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
      </motion.div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          pauseAnimation()
          seekTo(0)
        }}
        disabled={!canPlay}
        className="p-2"
      >
        <Square className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipForward}
        disabled={!canPlay}
        className="p-2"
      >
        <SkipForward className="h-4 w-4" />
      </Button>

      <Button
        variant={isLooping ? "default" : "outline"}
        size="sm"
        onClick={() => setIsLooping(!isLooping)}
        className="p-2"
        title="Toggle Loop"
      >
        <Repeat className="h-4 w-4" />
      </Button>

      {/* Typography Sidebar Toggle */}
      <Button
        variant={showRightSidebar ? "default" : "outline"}
        size="sm"
        onClick={toggleRightSidebar}
        className="p-2"
        title="Typography Settings"
      >
        <Type className="h-4 w-4" />
      </Button>

      {/* Time display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono ml-4">
        <span>{formatTime(currentTime)}</span>
        <span>/</span>
        <span>{formatTime(totalDuration)}</span>
      </div>


    </div>
  )
}