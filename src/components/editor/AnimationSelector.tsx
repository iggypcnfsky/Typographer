'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { animationPresets } from '@/lib/animations/presets'
import { AnimationType } from '@/types/typographer'
import { findWordBeforePosition } from '@/lib/utils/text-parser'
import { cn } from '@/lib/utils'

interface AnimationSelectorProps {
  className?: string
}

export function AnimationSelector({ className }: AnimationSelectorProps) {
  const {
    showAnimationSelector,
    textContent,
    cursorPosition,
    selectorPosition,
    showSelector,
    assignAnimation
  } = useTypographerStore()

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Handle animation selection
  const handleAnimationSelect = (animationType: AnimationType) => {
    // Find the word before cursor position
    const wordInfo = findWordBeforePosition(textContent, cursorPosition)
    
    if (wordInfo) {
      assignAnimation(wordInfo.wordIndex, animationType)
    }
    
    // Close the selector
    showSelector(false)
  }

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showAnimationSelector) return

      switch (e.key) {
        case 'Escape':
          showSelector(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, animationPresets.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          handleAnimationSelect(animationPresets[selectedIndex].type)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showAnimationSelector, selectedIndex, showSelector, handleAnimationSelect])

  // Reset selection when opened
  React.useEffect(() => {
    if (showAnimationSelector) {
      setSelectedIndex(0)
    }
  }, [showAnimationSelector])

  // Calculate smart positioning to avoid going off screen
  const getSmartPosition = () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return selectorPosition // Fallback for SSR
    }
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const popupWidth = 256 // w-64 = 16rem = 256px
    const popupHeight = 320 // max-h-80 = 20rem = 320px
    
    let x = selectorPosition.x
    let y = selectorPosition.y
    
    // Adjust if popup would go off right edge
    if (x + popupWidth > viewportWidth) {
      x = viewportWidth - popupWidth - 16 // 16px margin
    }
    
    // Adjust if popup would go off bottom edge
    if (y + popupHeight > viewportHeight) {
      y = selectorPosition.y - popupHeight - 20 // Show above cursor instead
    }
    
    // Ensure minimum margins
    x = Math.max(16, x)
    y = Math.max(16, y)
    
    return { x, y }
  }

  const [smartPosition, setSmartPosition] = React.useState(selectorPosition)

  // Update position when selector is shown
  React.useEffect(() => {
    if (showAnimationSelector && typeof window !== 'undefined') {
      setSmartPosition(getSmartPosition())
    }
  }, [showAnimationSelector, selectorPosition])

  return (
    <AnimatePresence>
      {showAnimationSelector && (
        <>
          {/* Backdrop - invisible but clickable */}
          <div
            onClick={() => showSelector(false)}
            className="fixed inset-0 z-40"
          />
          
          {/* Compact Selector Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{
              left: smartPosition.x,
              top: smartPosition.y
            }}
            className={cn(
              "fixed z-50",
              "w-64 max-h-80 overflow-auto",
              "bg-card border border-border rounded-lg shadow-xl",
              "backdrop-blur-sm",
              className
            )}
          >
            <div className="p-2">
              {animationPresets.map((preset, index) => (
                <motion.button
                  key={preset.type}
                  onClick={() => handleAnimationSelect(preset.type)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left",
                    "hover:bg-accent/60 transition-colors duration-75",
                    "focus:outline-none focus:bg-accent/60",
                    selectedIndex === index && "bg-accent/60"
                  )}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{preset.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {preset.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Footer with hints */}
            <div className="border-t border-border px-3 py-2 bg-muted/20">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>↑↓ Navigate</span>
                <span>Enter to select</span>
                <span>Esc to cancel</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Simplified keyboard hints component (optional)
export function AnimationSelectorKeyboardHints() {
  // Hints are now built into the selector itself
  return null
}