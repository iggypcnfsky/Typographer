// Core type definitions for the Typographer application

export enum AnimationType {
  MOTION_LANGUAGE = 'motionLanguage',
  FADE_IN = 'fadeIn',
  SLIDE_UP = 'slideUp',
  SLIDE_DOWN = 'slideDown',
  SLIDE_LEFT = 'slideLeft',
  SLIDE_RIGHT = 'slideRight',
  BOUNCE = 'bounce',
  ROTATE = 'rotate',
  SCALE = 'scale',
  TYPEWRITER = 'typewriter',
  GLOW = 'glow'
}

export enum MotionDirection {
  LEFT = 'L',
  RIGHT = 'R',
  FRONT = 'F', // toward viewer (scale up)
  BACK = 'B'   // away from viewer (scale down)
}

export enum ZoomType {
  ZOOM_IN = 'ZI',
  ZOOM_OUT = 'ZO'
}

export interface MotionConfig {
  entryDirection: MotionDirection
  speed: number // 0-100 (legacy field, kept for compatibility)
  displayDuration: number // seconds
  zoomType: ZoomType
  exitDirection: MotionDirection
  entrySpeed?: number // Entry animation speed in seconds
  exitSpeed?: number // Exit animation speed in seconds
}

export interface WordData {
  id: string
  text: string // Can contain single words or grouped consecutive words without motion tags
  animation: AnimationType
  motionConfig?: MotionConfig // For motion language animations
  startTime: number
  duration: number
  easing: string
  position: { x: number; y: number }
  index: number // Position in the original text
}

export interface AnimationConfig {
  type: AnimationType
  duration: number
  easing: string
  delay?: number
  properties: Record<string, unknown>
}

export interface TimelineEvent {
  id: string
  wordId: string
  type: 'start' | 'end'
  time: number
  animation: AnimationType
}

export interface TypographerState {
  // Text and Animation Data
  textContent: string
  words: WordData[]
  currentWordIndex: number
  
  // Animation Control
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  playbackSpeed: number
  wordGap: number
  
  // UI State
  showAnimationSelector: boolean
  selectedWord: string | null
  cursorPosition: number
  selectorPosition: { x: number; y: number }
  
  // Timeline
  timeline: TimelineEvent[]
  
  // Actions
  updateText: (text: string) => void
  assignAnimation: (wordIndex: number, animation: AnimationType) => void
  playAnimation: () => void
  pauseAnimation: () => void
  seekTo: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setWordGap: (gap: number) => void
  selectWord: (wordId: string | null) => void
  showSelector: (show: boolean) => void
  setCursorPosition: (position: number) => void
}

export interface AnimationPreset {
  name: string
  type: AnimationType
  displayName: string
  description: string
  icon: string
  duration: number
  easing: string
  preview: string // CSS or description for preview
}

export interface ParsedText {
  words: Array<{
    text: string
    index: number
    start: number
    end: number
  }>
  punctuation: Array<{
    text: string
    index: number
    position: number
  }>
}

export interface ViewportDimensions {
  width: number
  height: number
}

export interface PanelSizes {
  preview: number
  input: number
}

// Component Props Types
export interface AnimationPreviewProps {
  words: WordData[]
  currentTime: number
  isPlaying: boolean
  viewportDimensions: ViewportDimensions
}

export interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  onCursorChange: (position: number) => void
  onBackslashTrigger: (wordIndex: number) => void
}

export interface AnimationSelectorProps {
  isVisible: boolean
  onSelect: (animation: AnimationType) => void
  onClose: () => void
  position?: { x: number; y: number }
}

export interface TimelineProps {
  timeline: TimelineEvent[]
  currentTime: number
  totalDuration: number
  onSeek: (time: number) => void
}

export interface ControlsProps {
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  playbackSpeed: number
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onSpeedChange: (speed: number) => void
}