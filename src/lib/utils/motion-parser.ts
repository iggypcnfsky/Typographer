import { MotionDirection, ZoomType, MotionConfig, WordData, AnimationType } from '@/types/typographer'
import { calculateWordPositions, createLayoutConfig } from './positioning'

/**
 * Parse motion language syntax: <[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>
 * Example: Hello Beautiful <0.3F1.2F0.9> Beautiful <0.5L1.8F0.4> World <0.8R2.0B1.2>
 * Groups consecutive words without motion tags into single text layers
 * Motion tags apply to the word or word group that PRECEDES them
 */
export function parseMotionLanguage(text: string): {
  words: WordData[]
  cleanText: string
} {
  const words: WordData[] = []
  let wordIndex = 0

  // First, extract clean text by removing all motion tags
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  
  // Split text into tokens (words and motion tags)
  const tokens = text.split(/(\s+|<[^>]*>)/).filter(token => token.trim())
  
  let i = 0
  while (i < tokens.length) {
    const token = tokens[i].trim()
    
    // Check if this token is a motion tag
    const motionMatch = token.match(/^<(\d*\.?\d+)([LRFB])(\d*\.?\d+)([LRFB])(\d*\.?\d+)>$/)
    if (motionMatch) {
      // Skip motion tags - they'll be processed when we find the preceding text
      i++
      continue
    }
    
    // Check if this token is a word
    if (/^\w+$/.test(token)) {
      const textParts = [token]
      let motionConfig: MotionConfig | null = null
      let j = i + 1
      
      // Look ahead to group consecutive words or find motion tag
      while (j < tokens.length) {
        const nextToken = tokens[j].trim()
        
        // Check if next token is a motion tag
        const nextMotionMatch = nextToken.match(/^<(\d*\.?\d+)([LRFB])(\d*\.?\d+)([LRFB])(\d*\.?\d+)>$/)
        if (nextMotionMatch) {
          // Found motion tag - parse it and apply to current text group
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
          j++ // Move past the motion tag
          break
        }
        // Check if next token is a word (continue grouping)
        else if (/^\w+$/.test(nextToken)) {
          textParts.push(nextToken)
          j++
        }
        // If it's neither a word nor motion tag, stop grouping
        else {
          break
        }
      }
      
      // Create word data for the text group
      const groupedText = textParts.join(' ')
      
      if (motionConfig) {
        // Text group with motion language
        words.push({
          id: `word-${wordIndex}-${Date.now()}`,
          text: groupedText,
          animation: AnimationType.MOTION_LANGUAGE,
          motionConfig,
          startTime: 0, // Will be calculated later
          duration: 0.6, // Default duration, will be recalculated
          easing: 'easeOut',
          position: { x: 0, y: 0 }, // Will be calculated later
          index: wordIndex
        })
      } else {
        // Regular text group without motion
        words.push({
          id: `word-${wordIndex}-${Date.now()}`,
          text: groupedText,
          animation: AnimationType.FADE_IN,
          startTime: 0,
          duration: 0.6,
          easing: 'easeOut',
          position: { x: 0, y: 0 },
          index: wordIndex
        })
      }
      
      wordIndex++
      i = j // Move to next unprocessed token
    } else {
      // Skip non-word tokens (shouldn't happen with our regex)
      i++
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