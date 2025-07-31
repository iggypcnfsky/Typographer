'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProjectStore } from '@/lib/store/project-store'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProjectCreatorProps {
  open: boolean
  onClose: () => void
}

export function ProjectCreator({ open, onClose }: ProjectCreatorProps) {
  const { createProject } = useProjectStore()
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      setError('Project name is required')
      return
    }

    if (trimmedName.length > 50) {
      setError('Project name must be 50 characters or less')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createProject(trimmedName, description.trim() || undefined)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Start a new animated typography project. You can always change these details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              Project Name *
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="My Awesome Animation"
              maxLength={50}
              disabled={isLoading}
              autoFocus
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Give your project a memorable name</span>
              <span>{name.length}/50</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="project-description" className="text-sm font-medium">
              Description
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="A brief description of what this animation is for..."
              rows={3}
              maxLength={200}
              disabled={isLoading}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Optional description for reference</span>
              <span>{description.length}/200</span>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <div className="text-xs text-muted-foreground border-t pt-3">
          <p>
            <strong>Tip:</strong> Use Cmd/Ctrl + Enter to quickly create the project
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}