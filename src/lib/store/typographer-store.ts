import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { AnimationType, WordData, TimelineEvent, TypographerState } from '@/types/typographer'
import { defaultAnimation } from '@/lib/animations/presets'
import { parseMotionLanguage, calculateMotionTiming } from '@/lib/utils/motion-parser'

interface TypographerStore extends TypographerState {
  // Additional state
  wordGap: number
  
  // Actions
  updateText: (text: string) => void
  assignAnimation: (wordIndex: number, animation: AnimationType) => void
  playAnimation: () => void
  pauseAnimation: () => void
  seekTo: (time: number) => void
  setPlaybackSpeed: (speed: number) => void
  setWordGap: (gap: number) => void
  selectWord: (wordId: string | null) => void
  showSelector: (show: boolean, position?: { x: number; y: number }) => void
  setCursorPosition: (position: number) => void
}

const defaultText = 'Hello <0.3F1.2R0.9> Beautiful <0.5L1.8F0.4> World <0.8R2.0B1.2>'

export const useTypographerStore = create<TypographerStore>()(
  devtools(
    subscribeWithSelector((set, get) => {
      // Initialize with default text
      const { words } = parseMotionLanguage(defaultText)
      const defaultGap = 0 // Default gap between words
      const wordsWithTiming = calculateMotionTiming(words, defaultGap)
      const timeline = generateTimeline(wordsWithTiming)
      const totalDuration = Math.max(
        ...wordsWithTiming.map(word => word.startTime + word.duration),
        0
      )

      return {
        // Text and Animation Data - with default example
        textContent: defaultText,
        words: wordsWithTiming,
        currentWordIndex: wordsWithTiming.length > 0 ? 0 : -1,
      
        // Animation Control  
        isPlaying: true, // Auto-start with demo
        currentTime: 0,
        totalDuration,
        playbackSpeed: 1,
        wordGap: defaultGap,
        
        // UI State
        showAnimationSelector: false,
        selectedWord: null,
        cursorPosition: 0,
        selectorPosition: { x: 0, y: 0 },
        
        // Timeline
        timeline,
        
        // Actions
        updateText: (text: string) => {
          const state = get()
          const { words } = parseMotionLanguage(text)
          const wordsWithTiming = calculateMotionTiming(words, state.wordGap)
          const timeline = generateTimeline(wordsWithTiming)
          const totalDuration = Math.max(
            ...wordsWithTiming.map(word => word.startTime + word.duration),
            0
          )
          
          set({
            textContent: text,
            words: wordsWithTiming,
            timeline,
            totalDuration,
            currentWordIndex: wordsWithTiming.length > 0 ? 0 : -1,
            isPlaying: wordsWithTiming.length > 0,
            currentTime: 0
          })
        },
      
        assignAnimation: (wordIndex: number, animation: AnimationType) => {
          const state = get()
          const updatedWords = [...state.words]
          
          if (updatedWords[wordIndex]) {
            updatedWords[wordIndex] = {
              ...updatedWords[wordIndex],
              animation
            }
            
            const wordsWithTiming = calculateMotionTiming(updatedWords, state.wordGap)
            const timeline = generateTimeline(wordsWithTiming)
            const totalDuration = Math.max(
              ...wordsWithTiming.map(word => word.startTime + word.duration),
              0
            )
            
            set({
              words: wordsWithTiming,
              timeline,
              totalDuration,
              showAnimationSelector: false,
              selectedWord: null
            })
          }
        },
        
        playAnimation: () => {
          set({ isPlaying: true })
        },
        
        pauseAnimation: () => {
          set({ isPlaying: false })
        },
        
        seekTo: (time: number) => {
          const state = get()
          set({ 
            currentTime: Math.max(0, Math.min(time, state.totalDuration))
          })
        },
        
        setPlaybackSpeed: (speed: number) => {
          set({ playbackSpeed: Math.max(0.1, Math.min(speed, 3)) })
        },
        
        setWordGap: (gap: number) => {
          const state = get()
          const newGap = Math.max(-2, Math.min(gap, 5)) // Allow negative gap for overlap (-2 to 5 seconds)
          
          // Recalculate timing with new gap
          const wordsWithTiming = calculateMotionTiming(state.words, newGap)
          const timeline = generateTimeline(wordsWithTiming)
          const totalDuration = Math.max(
            ...wordsWithTiming.map(word => word.startTime + word.duration),
            0
          )
          
          set({
            wordGap: newGap,
            words: wordsWithTiming,
            timeline,
            totalDuration,
            currentTime: 0 // Reset playback to beginning when gap changes
          })
        },
        
        selectWord: (wordId: string | null) => {
          set({ selectedWord: wordId })
        },
        
        showSelector: (show: boolean, position?: { x: number; y: number }) => {
          set({ 
            showAnimationSelector: show,
            selectorPosition: position || { x: 0, y: 0 }
          })
        },
        
        setCursorPosition: (position: number) => {
          set({ cursorPosition: position })
        }
      }
    }),
    {
      name: 'typographer-store'
    }
  )
)

// Helper functions

function generateTimeline(words: WordData[]): TimelineEvent[] {
  const events: TimelineEvent[] = []
  
  words.forEach(word => {
    // Start event
    events.push({
      id: `start-${word.id}`,
      wordId: word.id,
      type: 'start',
      time: word.startTime,
      animation: word.animation
    })
    
    // End event
    events.push({
      id: `end-${word.id}`,
      wordId: word.id,
      type: 'end',
      time: word.startTime + word.duration,
      animation: word.animation
    })
  })
  
  return events.sort((a, b) => a.time - b.time)
}

// Selectors for derived state
export const useWords = () => useTypographerStore(state => state.words)
export const useCurrentWord = () => useTypographerStore(state => {
  const { words, currentWordIndex } = state
  return currentWordIndex >= 0 && currentWordIndex < words.length 
    ? words[currentWordIndex] 
    : null
})
export const useAnimationState = () => useTypographerStore(state => ({
  isPlaying: state.isPlaying,
  currentTime: state.currentTime,
  totalDuration: state.totalDuration,
  playbackSpeed: state.playbackSpeed
}))
export const useUIState = () => useTypographerStore(state => ({
  showAnimationSelector: state.showAnimationSelector,
  selectedWord: state.selectedWord,
  cursorPosition: state.cursorPosition,
  selectorPosition: state.selectorPosition
}))