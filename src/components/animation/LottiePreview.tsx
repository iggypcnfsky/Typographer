'use client'

import * as React from 'react'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { useTypographyStore } from '@/lib/store/typography-store'
import { useMotionStore } from '@/lib/store/motion-store'
import { lottieConverter } from '@/lib/export/lottie-converter'
import { cn } from '@/lib/utils'

interface LottiePreviewProps {
  className?: string
}

export function LottiePreview({ className }: LottiePreviewProps) {
  const { words, textContent, isPlaying, currentTime } = useTypographerStore()
  const { settings: typography } = useTypographyStore()
  const { settings: motionSettings, easingCurves, customEasingCurves } = useMotionStore()
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  const lottieRef = React.useRef<any>(null)
  const [lottieLoaded, setLottieLoaded] = React.useState(false)

  // Load Lottie library dynamically
  React.useEffect(() => {
    const loadLottie = async () => {
      try {
        const lottieModule = await import('lottie-web')
        // Handle both default export and named export
        const lottie = lottieModule.default || lottieModule
        if (lottie && typeof lottie.loadAnimation === 'function') {
          lottieRef.current = lottie
          setLottieLoaded(true)
        } else {
          console.error('Lottie library does not have loadAnimation method')
        }
      } catch (error) {
        console.error('Failed to load Lottie:', error)
      }
    }

    loadLottie()
  }, [])

  // Create and render Lottie animation
  React.useEffect(() => {
    if (!lottieLoaded || !lottieRef.current || !containerRef.current) {
      return
    }

    // Clear previous animation
    containerRef.current.innerHTML = ''

    // If no words, don't try to create animation
    if (!words.length) {
      return
    }

    try {
      // Validate lottie reference
      if (!lottieRef.current.loadAnimation) {
        console.error('Lottie loadAnimation method not available')
        return
      }

      // Convert to Lottie animation
      const lottieAnimation = lottieConverter.convertToLottie(
        words,
        typography,
        motionSettings
      )

      // Validate animation data
      if (!lottieAnimation || !lottieAnimation.layers) {
        console.error('Invalid Lottie animation data generated')
        return
      }

      // Create Lottie animation
      const animationInstance = lottieRef.current.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: isPlaying,
        animationData: lottieAnimation
      })

      // Sync with playback controls
      if (currentTime > 0 && lottieAnimation.op && lottieAnimation.fr) {
        const totalFrames = lottieAnimation.op
        const currentFrame = (currentTime / (totalFrames / lottieAnimation.fr)) * totalFrames
        animationInstance.goToAndStop(currentFrame, true)
      }

      return () => {
        try {
          if (animationInstance && animationInstance.destroy) {
            animationInstance.destroy()
          }
        } catch (error) {
          console.warn('Error destroying Lottie animation:', error)
        }
      }
    } catch (error) {
      console.error('Error creating Lottie animation:', error)
    }
  }, [words, typography, motionSettings, lottieLoaded, isPlaying, currentTime])

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
            Example: Type <code className="px-2 py-1 bg-muted rounded">Hello &lt;0.3F1.2R0.9&gt; World &lt;0.5L1.8B0.4&gt;</code> to see animated text
          </div>
        </div>
      </div>
    )
  }

  if (!lottieLoaded) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading animation engine...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full overflow-hidden relative bg-transparent", className)}>
      {/* Lottie Animation Container */}
      <div 
        ref={containerRef}
        data-animation-preview
        data-lottie-preview
        className="absolute inset-0 flex items-center justify-center bg-transparent"
        style={{ 
          backgroundColor: typography.backgroundColor === 'transparent' ? 'transparent' : typography.backgroundColor,
        }}
      />
    </div>
  )
}

// Remove the preview mode hook as we only use Lottie now