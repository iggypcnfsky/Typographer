import { MotionDirection, ZoomType, MotionConfig, WordData, AnimationType } from '@/types/typographer'
import { calculateWordPositions, createLayoutConfig } from './positioning'

/**
 * Parse motion language syntax: <[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>
 * Example: Hello <0.3F1.2F0.9> World means "Hello" enters from Front in 0.3s, displays 1.2s, exits Front in 0.9s
 * Motion tags apply to the word that PRECEDES them
 */
export function parseMotionLanguage(text: string): {
  words: WordData[]
  cleanText: string
} {
  const words: WordData[] = []
  let wordIndex = 0

  // First, extract clean text by removing all motion tags
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  
  // Split by spaces to get words and motion tags separately
  const parts = text.split(/(\s+)/)
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (!part) continue
    
    // Check if this part is a motion tag with new format
    const motionMatch = part.match(/^<(\d*\.?\d+)([LRFB])(\d*\.?\d+)([LRFB])(\d*\.?\d+)>$/)
    if (motionMatch) {
      // This is a motion tag - skip it (it will be processed when we find the preceding word)
      continue
    }
    
    // Check if this part is a word
    if (/^\w+$/.test(part)) {
      const wordText = part
      let motionConfig: MotionConfig | null = null
      
      // Look ahead to see if the next non-whitespace token is a motion tag
      for (let j = i + 1; j < parts.length; j++) {
        const nextPart = parts[j].trim()
        if (!nextPart) continue
        
        const nextMotionMatch = nextPart.match(/^<(\d*\.?\d+)([LRFB])(\d*\.?\d+)([LRFB])(\d*\.?\d+)>$/)
        if (nextMotionMatch) {
          // Parse the motion tag and apply it to this word
          const [, entrySpeedStr, entryDir, durationStr, exitDir, exitSpeedStr] = nextMotionMatch
          
          motionConfig = {
            entryDirection: entryDir as MotionDirection,
            speed: 50, // Legacy field, not used in new format
            displayDuration: parseFloat(durationStr),
            zoomType: ZoomType.ZOOM_IN, // Default zoom
            exitDirection: exitDir as MotionDirection,
            entrySpeed: parseFloat(entrySpeedStr),
            exitSpeed: parseFloat(exitSpeedStr)
          }
          break
        } else {
          // Found a non-motion token, stop looking
          break
        }
      }
      
      if (motionConfig) {
        // Word with motion language
        words.push({
          id: `word-${wordIndex}-${Date.now()}`,
          text: wordText,
          animation: AnimationType.MOTION_LANGUAGE,
          motionConfig,
          startTime: 0, // Will be calculated later
          duration: 0.6, // Default duration, will be recalculated
          easing: 'easeOut',
          position: { x: 0, y: 0 }, // Will be calculated later
          index: wordIndex
        })
      } else {
        // Regular word without motion
        words.push({
          id: `word-${wordIndex}-${Date.now()}`,
          text: wordText,
          animation: AnimationType.FADE_IN,
          startTime: 0,
          duration: 0.6,
          easing: 'easeOut',
          position: { x: 0, y: 0 },
          index: wordIndex
        })
      }
      
      wordIndex++
    }
  }

  return { words, cleanText }
}

/**
 * Validate motion language syntax: <[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>
 */
export function validateMotionSyntax(motionTag: string): {
  isValid: boolean
  error?: string
} {
  // Remove < and > brackets
  const content = motionTag.replace(/[<>]/g, '')
  
  // Check if it matches the pattern: [number][LRFB][number][LRFB][number]
  const match = content.match(/^(\d*\.?\d+)([LRFB])(\d*\.?\d+)([LRFB])(\d*\.?\d+)$/)
  
  if (!match) {
    return {
      isValid: false,
      error: `Invalid motion syntax. Use format <[EntrySpeed][EntryDir][Duration][ExitDir][ExitSpeed]> like <0.3F1.2R0.9>`
    }
  }

  const [, entrySpeedStr, entryDir, durationStr, exitDir, exitSpeedStr] = match

  // Validate entry speed
  const entrySpeed = parseFloat(entrySpeedStr)
  if (isNaN(entrySpeed) || entrySpeed <= 0 || entrySpeed > 10) {
    return {
      isValid: false,
      error: `Invalid entry speed '${entrySpeedStr}'. Use a positive number (0.1 to 10 seconds)`
    }
  }

  // Validate entry direction
  if (!['L', 'R', 'F', 'B'].includes(entryDir)) {
    return {
      isValid: false,
      error: `Invalid entry direction '${entryDir}'. Use L, R, F, or B`
    }
  }

  // Validate display duration
  const duration = parseFloat(durationStr)
  if (isNaN(duration) || duration <= 0 || duration > 30) {
    return {
      isValid: false,
      error: `Invalid display duration '${durationStr}'. Use a positive number (0.1 to 30 seconds)`
    }
  }

  // Validate exit direction
  if (!['L', 'R', 'F', 'B'].includes(exitDir)) {
    return {
      isValid: false,
      error: `Invalid exit direction '${exitDir}'. Use L, R, F, or B`
    }
  }

  // Validate exit speed
  const exitSpeed = parseFloat(exitSpeedStr)
  if (isNaN(exitSpeed) || exitSpeed <= 0 || exitSpeed > 10) {
    return {
      isValid: false,
      error: `Invalid exit speed '${exitSpeedStr}'. Use a positive number (0.1 to 10 seconds)`
    }
  }

  return { isValid: true }
}

/**
 * Calculate animation timing for motion language words with configurable gap
 */
export function calculateMotionTiming(words: WordData[], gapBetweenWords: number = 0.3): WordData[] {
  if (words.length === 0) return []

  let currentTime = 0
  const calculatedWords: WordData[] = []

  // First pass: calculate timing
  words.forEach((word, index) => {
    if (word.motionConfig) {
      // For motion language words, use the specified speeds and duration
      const entryDuration = word.motionConfig.entrySpeed || 0.8 // Use specified or default
      const displayDuration = word.motionConfig.displayDuration
      const exitDuration = word.motionConfig.exitSpeed || 0.8 // Use specified or default
      const totalDuration = entryDuration + displayDuration + exitDuration

      calculatedWords.push({
        ...word,
        startTime: currentTime,
        duration: totalDuration,
        position: { x: 0, y: 0 } // Temporary position
      })

      // Next word starts after this word completes (sequential, no overlap)
      currentTime += totalDuration + gapBetweenWords
    } else {
      // Default animation timing for non-motion words
      const defaultDuration = 2.0 // Longer duration for fade-in words
      
      calculatedWords.push({
        ...word,
        startTime: currentTime,
        duration: defaultDuration,
        position: { x: 0, y: 0 } // Temporary position
      })

      currentTime += defaultDuration + gapBetweenWords
    }
  })

  // Second pass: calculate positions using the positioning system
  const config = createLayoutConfig(800, 600) // Default canvas size
  return calculateWordPositions(calculatedWords, config)
}

/**
 * Calculate entry animation duration based on speed
 */
function calculateEntryDuration(speed: number): number {
  // Speed 0 = 2 seconds, Speed 99 = 0.1 seconds
  return 2 - (speed / 99) * 1.9
}

/**
 * Calculate exit animation duration based on speed
 */
function calculateExitDuration(speed: number): number {
  // Same as entry duration
  return calculateEntryDuration(speed)
}



/**
 * Generate example motion tags for reference
 */
export const motionExamples = [
  { tag: '<0.3F1.2R0.9>', description: 'Front entry (0.3s), display 1.2s, exit right (0.9s)' },
  { tag: '<0.5L1.8B0.4>', description: 'Left entry (0.5s), display 1.8s, exit back (0.4s)' },
  { tag: '<0.8R2.0F1.2>', description: 'Right entry (0.8s), display 2.0s, exit front (1.2s)' },
  { tag: '<0.2B0.5L0.6>', description: 'Back entry (0.2s), display 0.5s, exit left (0.6s)' }
]