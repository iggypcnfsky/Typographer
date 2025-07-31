// Animation presets and configurations

import { AnimationType, AnimationPreset } from '@/types/typographer'
import { AnimationDefinition, EasingCurve } from './types'

// Easing curves
export const easingCurves: Record<string, EasingCurve> = {
  easeInOut: {
    name: 'easeInOut',
    curve: [0.4, 0, 0.2, 1],
    description: 'Smooth start and end'
  },
  easeOut: {
    name: 'easeOut',
    curve: [0, 0, 0.2, 1],
    description: 'Fast start, slow end'
  },
  easeIn: {
    name: 'easeIn',
    curve: [0.4, 0, 1, 1],
    description: 'Slow start, fast end'
  },
  
  // Enhanced cubic easing curves for professional feel
  easeOutCubic: {
    name: 'easeOutCubic',
    curve: [0.25, 0.46, 0.45, 0.94],
    description: 'Natural entry movement'
  },
  easeInCubic: {
    name: 'easeInCubic',
    curve: [0.55, 0.085, 0.68, 0.53],
    description: 'Natural exit movement'
  },
  easeInOutCubic: {
    name: 'easeInOutCubic',
    curve: [0.645, 0.045, 0.355, 1],
    description: 'Smooth cubic transition'
  },
  
  // Sophisticated motion curves
  easeOutQuart: {
    name: 'easeOutQuart',
    curve: [0.25, 1, 0.5, 1],
    description: 'Strong deceleration for dramatic entry'
  },
  easeInQuart: {
    name: 'easeInQuart',
    curve: [0.5, 0, 0.75, 0],
    description: 'Strong acceleration for dramatic exit'
  },
  
  // Subtle spring effects
  subtleSpring: {
    name: 'subtleSpring',
    curve: [0.68, -0.35, 0.265, 1.35],
    description: 'Gentle spring without overshoot'
  },
  
  bounce: {
    name: 'bounce',
    curve: [0.68, -0.55, 0.265, 1.55],
    description: 'Bouncy effect'
  },
  elastic: {
    name: 'elastic',
    curve: [0.175, 0.885, 0.32, 1.275],
    description: 'Elastic spring effect'
  }
}

// Animation definitions with Framer Motion variants
export const animationDefinitions: Record<AnimationType, AnimationDefinition> = {
  [AnimationType.FADE_IN]: {
    type: AnimationType.FADE_IN,
    variants: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    defaultDuration: 0.6,
    defaultEasing: 'easeOut',
    description: 'Gentle fade in from transparent to visible',
    properties: ['opacity']
  },
  
  [AnimationType.SLIDE_UP]: {
    type: AnimationType.SLIDE_UP,
    variants: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 }
    },
    defaultDuration: 0.8,
    defaultEasing: 'easeOut',
    description: 'Slide in from bottom with fade',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.SLIDE_DOWN]: {
    type: AnimationType.SLIDE_DOWN,
    variants: {
      initial: { y: -50, opacity: 0 },
      animate: { y: 0, opacity: 1 }
    },
    defaultDuration: 0.8,
    defaultEasing: 'easeOut',
    description: 'Slide in from top with fade',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.SLIDE_LEFT]: {
    type: AnimationType.SLIDE_LEFT,
    variants: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 }
    },
    defaultDuration: 0.8,
    defaultEasing: 'easeOut',
    description: 'Slide in from right with fade',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.SLIDE_RIGHT]: {
    type: AnimationType.SLIDE_RIGHT,
    variants: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 }
    },
    defaultDuration: 0.8,
    defaultEasing: 'easeOut',
    description: 'Slide in from left with fade',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.BOUNCE]: {
    type: AnimationType.BOUNCE,
    variants: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 }
    },
    defaultDuration: 1.0,
    defaultEasing: 'bounce',
    description: 'Bouncy scale animation',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.ROTATE]: {
    type: AnimationType.ROTATE,
    variants: {
      initial: { rotate: -180, scale: 0, opacity: 0 },
      animate: { rotate: 0, scale: 1, opacity: 1 }
    },
    defaultDuration: 1.2,
    defaultEasing: 'easeOut',
    description: 'Rotate in with scale and fade',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.SCALE]: {
    type: AnimationType.SCALE,
    variants: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 }
    },
    defaultDuration: 0.6,
    defaultEasing: 'easeOut',
    description: 'Scale up from center',
    properties: ['transform', 'opacity']
  },
  
  [AnimationType.TYPEWRITER]: {
    type: AnimationType.TYPEWRITER,
    variants: {
      initial: { width: 0, opacity: 1 },
      animate: { width: 'auto', opacity: 1 }
    },
    defaultDuration: 0.8,
    defaultEasing: 'easeInOut',
    description: 'Typewriter effect with expanding width',
    properties: ['width', 'opacity']
  },
  
  [AnimationType.GLOW]: {
    type: AnimationType.GLOW,
    variants: {
      initial: { 
        opacity: 0,
        textShadow: '0 0 0px rgba(255, 255, 255, 0)'
      },
      animate: { 
        opacity: 1,
        textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)'
      }
    },
    defaultDuration: 1.0,
    defaultEasing: 'easeInOut',
    description: 'Glowing text effect',
    properties: ['opacity', 'text-shadow']
  },

  [AnimationType.MOTION_LANGUAGE]: {
    type: AnimationType.MOTION_LANGUAGE,
    variants: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 }
    },
    defaultDuration: 2.0,
    defaultEasing: 'easeOut',
    description: 'Motion language controlled animation',
    properties: ['opacity', 'transform']
  }
}

// User-facing animation presets for the selector
export const animationPresets: AnimationPreset[] = [
  {
    name: 'fadeIn',
    type: AnimationType.FADE_IN,
    displayName: 'Fade In',
    description: 'Simple fade in effect',
    icon: '✨',
    duration: 0.6,
    easing: 'easeOut',
    preview: 'opacity: 0 → 1'
  },
  {
    name: 'slideUp',
    type: AnimationType.SLIDE_UP,
    displayName: 'Slide Up',
    description: 'Slide in from bottom',
    icon: '⬆️',
    duration: 0.8,
    easing: 'easeOut',
    preview: 'y: 50px → 0'
  },
  {
    name: 'slideDown',
    type: AnimationType.SLIDE_DOWN,
    displayName: 'Slide Down',
    description: 'Slide in from top',
    icon: '⬇️',
    duration: 0.8,
    easing: 'easeOut',
    preview: 'y: -50px → 0'
  },
  {
    name: 'slideLeft',
    type: AnimationType.SLIDE_LEFT,
    displayName: 'Slide Left',
    description: 'Slide in from right',
    icon: '⬅️',
    duration: 0.8,
    easing: 'easeOut',
    preview: 'x: 100px → 0'
  },
  {
    name: 'slideRight',
    type: AnimationType.SLIDE_RIGHT,
    displayName: 'Slide Right',
    description: 'Slide in from left',
    icon: '➡️',
    duration: 0.8,
    easing: 'easeOut',
    preview: 'x: -100px → 0'
  },
  {
    name: 'bounce',
    type: AnimationType.BOUNCE,
    displayName: 'Bounce',
    description: 'Bouncy entrance',
    icon: '🎾',
    duration: 1.0,
    easing: 'bounce',
    preview: 'scale: 0 → 1 (bouncy)'
  },
  {
    name: 'rotate',
    type: AnimationType.ROTATE,
    displayName: 'Rotate In',
    description: 'Spinning entrance',
    icon: '🌀',
    duration: 1.2,
    easing: 'easeOut',
    preview: 'rotate: -180° → 0°'
  },
  {
    name: 'scale',
    type: AnimationType.SCALE,
    displayName: 'Scale Up',
    description: 'Scale from center',
    icon: '🔍',
    duration: 0.6,
    easing: 'easeOut',
    preview: 'scale: 0 → 1'
  },
  {
    name: 'typewriter',
    type: AnimationType.TYPEWRITER,
    displayName: 'Typewriter',
    description: 'Typing effect',
    icon: '⌨️',
    duration: 0.8,
    easing: 'easeInOut',
    preview: 'width: 0 → auto'
  },
  {
    name: 'glow',
    type: AnimationType.GLOW,
    displayName: 'Glow',
    description: 'Glowing text effect',
    icon: '💫',
    duration: 1.0,
    easing: 'easeInOut',
    preview: 'text-shadow glow'
  }
]

// Default animation for new words
export const defaultAnimation = AnimationType.FADE_IN

// Animation timing configuration
export const timingConfig = {
  wordsPerMinute: 180, // Average reading speed
  minWordDelay: 0.1, // Minimum delay between words (seconds)
  maxWordDelay: 0.8, // Maximum delay between words (seconds)
  animationOverlap: 0.3 // 30% overlap between animations
}