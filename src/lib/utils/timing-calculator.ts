import { WordData, AnimationType } from '@/types/typographer'
import { animationDefinitions, timingConfig } from '@/lib/animations/presets'

/**
 * Calculate optimal timing for word animations
 */
export function calculateAnimationTiming(words: WordData[]): WordData[] {
  if (words.length === 0) return []
  
  let currentTime = 0
  const calculatedWords: WordData[] = []
  
  words.forEach((word, index) => {
    const animationDef = animationDefinitions[word.animation]
    const duration = animationDef?.defaultDuration || 0.6
    
    // Calculate delay based on word characteristics
    const delay = calculateWordDelay(word, index, words)
    
    // Add some overlap between animations for smoother flow
    const overlap = index > 0 ? timingConfig.animationOverlap : 0
    const startTime = Math.max(0, currentTime - overlap)
    
    calculatedWords.push({
      ...word,
      startTime,
      duration,
      easing: animationDef?.defaultEasing || 'easeOut'
    })
    
    // Update current time for next word
    currentTime = startTime + duration + delay
  })
  
  return calculatedWords
}

/**
 * Calculate delay between word animations
 */
function calculateWordDelay(word: WordData, index: number, allWords: WordData[]): number {
  const { minWordDelay, maxWordDelay, wordsPerMinute } = timingConfig
  
  // Base delay based on reading speed
  const baseDelay = 60 / wordsPerMinute // Convert WPM to seconds per word
  
  // Adjust delay based on word characteristics
  let adjustedDelay = baseDelay
  
  // Longer words get slightly more time
  if (word.text.length > 8) {
    adjustedDelay *= 1.2
  } else if (word.text.length < 4) {
    adjustedDelay *= 0.8
  }
  
  // Add pause after punctuation
  if (index > 0 && hasPunctuation(allWords[index - 1].text)) {
    adjustedDelay *= 1.5
  }
  
  // Ensure delay is within bounds
  return Math.max(minWordDelay, Math.min(adjustedDelay, maxWordDelay))
}

/**
 * Check if text contains sentence-ending punctuation
 */
function hasPunctuation(text: string): boolean {
  return /[.!?;:]$/.test(text.trim())
}

/**
 * Calculate total animation duration
 */
export function calculateTotalDuration(words: WordData[]): number {
  if (words.length === 0) return 0
  
  return Math.max(
    ...words.map(word => word.startTime + word.duration)
  )
}

/**
 * Calculate animation timing for a specific time point
 */
export function getAnimationStateAtTime(words: WordData[], time: number): {
  activeWords: WordData[]
  completedWords: WordData[]
  upcomingWords: WordData[]
} {
  const activeWords: WordData[] = []
  const completedWords: WordData[] = []
  const upcomingWords: WordData[] = []
  
  words.forEach(word => {
    const startTime = word.startTime
    const endTime = word.startTime + word.duration
    
    if (time >= startTime && time <= endTime) {
      activeWords.push(word)
    } else if (time > endTime) {
      completedWords.push(word)
    } else {
      upcomingWords.push(word)
    }
  })
  
  return { activeWords, completedWords, upcomingWords }
}

/**
 * Calculate progress percentage for a word at a specific time
 */
export function getWordProgress(word: WordData, time: number): number {
  const startTime = word.startTime
  const endTime = word.startTime + word.duration
  
  if (time < startTime) return 0
  if (time > endTime) return 1
  
  return (time - startTime) / word.duration
}

/**
 * Get the next animation event time
 */
export function getNextEventTime(words: WordData[], currentTime: number): number | null {
  const upcomingEvents: number[] = []
  
  words.forEach(word => {
    // Add start time if it's in the future
    if (word.startTime > currentTime) {
      upcomingEvents.push(word.startTime)
    }
    
    // Add end time if it's in the future
    const endTime = word.startTime + word.duration
    if (endTime > currentTime) {
      upcomingEvents.push(endTime)
    }
  })
  
  if (upcomingEvents.length === 0) return null
  
  return Math.min(...upcomingEvents)
}

/**
 * Adjust timing for animation type changes
 */
export function recalculateTimingForWord(
  words: WordData[], 
  wordIndex: number, 
  newAnimation: AnimationType
): WordData[] {
  const updatedWords = [...words]
  const word = updatedWords[wordIndex]
  
  if (!word) return words
  
  // Update animation type
  word.animation = newAnimation
  
  // Get new duration from animation definition
  const animationDef = animationDefinitions[newAnimation]
  word.duration = animationDef?.defaultDuration || 0.6
  word.easing = animationDef?.defaultEasing || 'easeOut'
  
  // Recalculate timing for all subsequent words
  return calculateAnimationTiming(updatedWords)
}

/**
 * Optimize timing for better readability
 */
export function optimizeReadability(words: WordData[]): WordData[] {
  // Group words into phrases/sentences for better pacing
  const optimizedWords = [...words]
  
  words.forEach((word, index) => {
    // Add extra pause at sentence boundaries
    if (index > 0 && hasPunctuation(words[index - 1].text)) {
      optimizedWords[index] = {
        ...word,
        startTime: word.startTime + 0.3 // Extra pause after sentences
      }
    }
    
    // Reduce timing for articles and prepositions
    if (isShortFunctionWord(word.text)) {
      optimizedWords[index] = {
        ...word,
        duration: word.duration * 0.7
      }
    }
  })
  
  return optimizedWords
}

/**
 * Check if word is a short function word (articles, prepositions, etc.)
 */
function isShortFunctionWord(text: string): boolean {
  const functionWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
  ]
  
  return functionWords.includes(text.toLowerCase())
}