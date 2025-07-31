// Word positioning system with collision detection

import { WordData, AnimationType } from '@/types/typographer'
import { PositionCalculation, CollisionBounds } from '@/lib/animations/types'

export interface LayoutConfig {
  canvasWidth: number
  canvasHeight: number
  margin: number
  minWordSpacing: number
  lineHeight: number
  centerBias: number // 0-1, how much to bias towards center
}

export interface WordDimensions {
  width: number
  height: number
  fontSize: number
}

/**
 * Calculate optimal positions for all words with collision detection
 */
export function calculateWordPositions(
  words: WordData[], 
  config: LayoutConfig
): WordData[] {
  if (words.length === 0) return []

  // Get estimated dimensions for each word
  const wordsWithDimensions = words.map(word => ({
    word,
    dimensions: estimateWordDimensions(word.text, config)
  }))

  // Calculate positions using different strategies
  const positionedWords = layoutWords(wordsWithDimensions, config)

  return positionedWords.map(({ word, position }) => ({
    ...word,
    position
  }))
}

/**
 * Layout words using multiple strategies
 */
function layoutWords(
  wordsWithDimensions: Array<{ word: WordData; dimensions: WordDimensions }>,
  config: LayoutConfig
): Array<{ word: WordData; position: PositionCalculation }> {
  const positioned: Array<{ word: WordData; position: PositionCalculation }> = []
  const occupiedAreas: CollisionBounds[] = []

  for (const { word, dimensions } of wordsWithDimensions) {
    let position: PositionCalculation

    // Try different positioning strategies
    if (word.animation === AnimationType.MOTION_LANGUAGE && word.motionConfig) {
      // Motion language words use entrance direction for initial positioning
      position = calculateMotionLanguagePosition(word, dimensions, config)
    } else {
      // Standard animations use flow-based positioning
      position = calculateFlowPosition(word, dimensions, config, occupiedAreas)
    }

    // Ensure position is within canvas bounds
    position = constrainToCanvas(position, dimensions, config)

    // Add collision bounds for future words
    const bounds = createCollisionBounds(position, dimensions, config.minWordSpacing)
    occupiedAreas.push(bounds)

    positioned.push({ word, position })
  }

  return positioned
}

/**
 * Calculate position for motion language words based on entrance direction
 */
function calculateMotionLanguagePosition(
  word: WordData,
  dimensions: WordDimensions,
  config: LayoutConfig
): PositionCalculation {
  const { canvasWidth, canvasHeight } = config
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  // Base position near center with some randomization
  const offsetRange = Math.min(canvasWidth, canvasHeight) * 0.1
  const randomX = (Math.random() - 0.5) * offsetRange
  const randomY = (Math.random() - 0.5) * offsetRange

  return {
    x: centerX + randomX - dimensions.width / 2,
    y: centerY + randomY - dimensions.height / 2
  }
}

/**
 * Calculate position using flow-based layout
 */
function calculateFlowPosition(
  word: WordData,
  dimensions: WordDimensions,
  config: LayoutConfig,
  occupiedAreas: CollisionBounds[]
): PositionCalculation {
  const { canvasWidth, canvasHeight, margin, centerBias, lineHeight } = config

  // Start from center and spiral outward
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  // Try positions in expanding spiral
  for (let radius = 0; radius < Math.min(canvasWidth, canvasHeight) / 2; radius += 20) {
    const positions = generateSpiralPositions(centerX, centerY, radius, 8)
    
    for (const pos of positions) {
      const candidate: PositionCalculation = {
        x: pos.x - dimensions.width / 2,
        y: pos.y - dimensions.height / 2
      }

      // Check if position is valid
      if (isPositionValid(candidate, dimensions, config, occupiedAreas)) {
        return candidate
      }
    }
  }

  // Fallback: place at center even if it overlaps
  return {
    x: centerX - dimensions.width / 2,
    y: centerY - dimensions.height / 2
  }
}

/**
 * Generate positions in a spiral pattern
 */
function generateSpiralPositions(
  centerX: number, 
  centerY: number, 
  radius: number, 
  numPoints: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    positions.push({ x, y })
  }

  return positions
}

/**
 * Check if a position is valid (no collisions, within bounds)
 */
function isPositionValid(
  position: PositionCalculation,
  dimensions: WordDimensions,
  config: LayoutConfig,
  occupiedAreas: CollisionBounds[]
): boolean {
  // Check canvas bounds
  if (position.x < config.margin || 
      position.y < config.margin ||
      position.x + dimensions.width > config.canvasWidth - config.margin ||
      position.y + dimensions.height > config.canvasHeight - config.margin) {
    return false
  }

  // Check collisions with existing words
  const bounds = createCollisionBounds(position, dimensions, config.minWordSpacing)
  
  for (const occupied of occupiedAreas) {
    if (boundsOverlap(bounds, occupied)) {
      return false
    }
  }

  return true
}

/**
 * Create collision bounds for a word
 */
function createCollisionBounds(
  position: PositionCalculation,
  dimensions: WordDimensions,
  spacing: number
): CollisionBounds {
  return {
    left: position.x - spacing,
    top: position.y - spacing,
    right: position.x + dimensions.width + spacing,
    bottom: position.y + dimensions.height + spacing
  }
}

/**
 * Check if two bounds overlap
 */
function boundsOverlap(a: CollisionBounds, b: CollisionBounds): boolean {
  return !(a.right < b.left || 
           a.left > b.right || 
           a.bottom < b.top || 
           a.top > b.bottom)
}

/**
 * Constrain position to canvas bounds
 */
function constrainToCanvas(
  position: PositionCalculation,
  dimensions: WordDimensions,
  config: LayoutConfig
): PositionCalculation {
  return {
    x: Math.max(config.margin, 
        Math.min(position.x, config.canvasWidth - dimensions.width - config.margin)),
    y: Math.max(config.margin, 
        Math.min(position.y, config.canvasHeight - dimensions.height - config.margin))
  }
}

/**
 * Estimate word dimensions based on text and font size
 */
function estimateWordDimensions(text: string, config: LayoutConfig): WordDimensions {
  // Rough estimation based on character count and font size
  // In a real implementation, you might want to use canvas measureText
  const fontSize = 32 // Default font size for animations
  const charWidth = fontSize * 0.6 // Average character width
  const width = text.length * charWidth
  const height = fontSize * 1.2 // Include line height

  return {
    width,
    height,
    fontSize
  }
}

/**
 * Create responsive layout configuration
 */
export function createLayoutConfig(
  canvasWidth: number,
  canvasHeight: number
): LayoutConfig {
  return {
    canvasWidth,
    canvasHeight,
    margin: Math.min(canvasWidth, canvasHeight) * 0.05,
    minWordSpacing: 20,
    lineHeight: 40,
    centerBias: 0.7
  }
}

/**
 * Update positions when canvas size changes
 */
export function updatePositionsForResize(
  words: WordData[],
  oldConfig: LayoutConfig,
  newConfig: LayoutConfig
): WordData[] {
  // Scale positions proportionally
  const scaleX = newConfig.canvasWidth / oldConfig.canvasWidth
  const scaleY = newConfig.canvasHeight / oldConfig.canvasHeight

  return words.map(word => ({
    ...word,
    position: {
      x: word.position.x * scaleX,
      y: word.position.y * scaleY
    }
  }))
}

/**
 * Optimize positions for better visual balance
 */
export function optimizePositions(words: WordData[], config: LayoutConfig): WordData[] {
  // Group words by animation timing for better visual flow
  const sortedWords = [...words].sort((a, b) => a.startTime - b.startTime)
  
  // Apply position optimizations
  return calculateWordPositions(sortedWords, config)
}