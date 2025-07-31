import { ParsedText } from '@/types/typographer'

/**
 * Parse text into words and punctuation for animation processing
 */
export function parseText(text: string): ParsedText {
  if (!text.trim()) {
    return { words: [], punctuation: [] }
  }

  const words: ParsedText['words'] = []
  const punctuation: ParsedText['punctuation'] = []
  
  // Split text while preserving positions
  const regex = /(\S+)/g
  let match
  let wordIndex = 0
  
  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[1]
    const start = match.index
    const end = start + fullMatch.length
    
    // Separate word from punctuation
    const wordMatch = fullMatch.match(/^([a-zA-Z0-9]+)(.*)$/)
    
    if (wordMatch) {
      const [, wordPart, punctuationPart] = wordMatch
      
      // Add the word
      words.push({
        text: wordPart,
        index: wordIndex++,
        start,
        end: start + wordPart.length
      })
      
      // Add punctuation if exists
      if (punctuationPart) {
        punctuation.push({
          text: punctuationPart,
          index: punctuation.length,
          position: start + wordPart.length
        })
      }
    } else {
      // If no word pattern matched, treat entire match as punctuation
      punctuation.push({
        text: fullMatch,
        index: punctuation.length,
        position: start
      })
    }
  }
  
  return { words, punctuation }
}

/**
 * Find the word at a specific cursor position
 */
export function findWordAtPosition(text: string, position: number): {
  wordIndex: number
  word: string
  start: number
  end: number
} | null {
  const parsed = parseText(text)
  
  for (const word of parsed.words) {
    if (position >= word.start && position <= word.end) {
      return {
        wordIndex: word.index,
        word: word.text,
        start: word.start,
        end: word.end
      }
    }
  }
  
  return null
}

/**
 * Find the word immediately before a cursor position
 */
export function findWordBeforePosition(text: string, position: number): {
  wordIndex: number
  word: string
  start: number
  end: number
} | null {
  const parsed = parseText(text)
  
  // Find the last word that ends before or at the position
  let lastWord = null
  
  for (const word of parsed.words) {
    if (word.end <= position) {
      lastWord = {
        wordIndex: word.index,
        word: word.text,
        start: word.start,
        end: word.end
      }
    } else {
      break
    }
  }
  
  return lastWord
}

/**
 * Check if position is immediately after a word (for backslash trigger)
 */
export function isPositionAfterWord(text: string, position: number): boolean {
  if (position === 0) return false
  
  const charBefore = text[position - 1]
  const charAt = text[position] || ' '
  
  // Position is after a word if:
  // - Previous character is alphanumeric
  // - Current character is whitespace or end of string
  return /[a-zA-Z0-9]/.test(charBefore) && /\s/.test(charAt)
}

/**
 * Extract words with their original spacing for display
 */
export function extractWordsWithSpacing(text: string): Array<{
  word: string
  index: number
  leadingSpace: string
  trailingSpace: string
}> {
  const words = []
  const regex = /(\s*)(\S+)(\s*)/g
  let match
  let index = 0
  
  while ((match = regex.exec(text)) !== null) {
    const [, leadingSpace, word, trailingSpace] = match
    
    words.push({
      word,
      index: index++,
      leadingSpace,
      trailingSpace
    })
  }
  
  return words
}

/**
 * Calculate reading time for text
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 180): number {
  const parsed = parseText(text)
  const wordCount = parsed.words.length
  
  if (wordCount === 0) return 0
  
  // Convert words per minute to seconds
  return (wordCount / wordsPerMinute) * 60
}

/**
 * Normalize text for processing (remove extra whitespace, etc.)
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim() // Remove leading/trailing whitespace
}

/**
 * Split text into sentences for better animation timing
 */
export function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting - can be enhanced with more sophisticated logic
  return text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
}