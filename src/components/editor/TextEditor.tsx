'use client'

import * as React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { parseMotionLanguage, validateMotionSyntax, motionExamples } from '@/lib/utils/motion-parser'
import { cn } from '@/lib/utils'

interface TextEditorProps {
  className?: string
}

export function TextEditor({ className }: TextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  
  // Store state and actions
  const {
    textContent,
    updateText,
    setCursorPosition
  } = useTypographerStore()

  // Handle text changes with motion language parsing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    
    // Parse motion language and update store
    const { words } = parseMotionLanguage(newText)
    
    // Update store with parsed text and words
    updateText(newText)
  }

  // Handle cursor position changes
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart
      setCursorPosition(position)
    }
  }

  // Handle key presses for motion language assistance
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Auto-complete motion language syntax
    if (e.key === '>') {
      const position = textareaRef.current?.selectionStart || 0
      const textBeforeCursor = textContent.substring(0, position)
      
      // Find if we're closing a motion tag
      const lastOpenBracket = textBeforeCursor.lastIndexOf('<')
      if (lastOpenBracket !== -1) {
        const motionTag = textBeforeCursor.substring(lastOpenBracket)
        const validation = validateMotionSyntax(motionTag + '>')
        
        if (!validation.isValid) {
          // Show error feedback (could add toast notification here)
          console.warn('Invalid motion syntax:', validation.error)
        }
      }
    }
  }

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      // Set height to scrollHeight to fit content
      textarea.style.height = `${Math.max(160, textarea.scrollHeight)}px`
    }
  }, [textContent])

  // Focus management
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Textarea
        ref={textareaRef}
        value={textContent}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        placeholder="Start typing your animated text here..."
        className={cn(
          "min-h-[160px] max-h-[400px] resize-none",
          "bg-background/50 border-input",
          "text-base leading-relaxed",
          "focus:ring-2 focus:ring-primary/20",
          "transition-all duration-200"
        )}
      />
    </div>
  )
}

// Real-time character and word count - compact inline version
export function TextStats() {
  const { textContent, words } = useTypographerStore()
  
  const charCount = textContent.length
  const wordCount = words.length
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{charCount} characters</span>
      <span>•</span>
      <span>{wordCount} words</span>
      {wordCount > 0 && (
        <>
          <span>•</span>
          <span>{Math.ceil(wordCount / 3)}s estimated</span>
        </>
      )}
    </div>
  )
}