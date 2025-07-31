'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useProjectStore, useCurrentProject } from '@/lib/store/project-store'
import { ProjectData } from '@/types/project'
import { 
  MoreVertical, 
  Play, 
  Copy, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectCardProps {
  project: ProjectData
  viewMode: 'grid' | 'list'
}

export function ProjectCard({ project, viewMode }: ProjectCardProps) {
  const currentProject = useCurrentProject()
  const { loadProject, deleteProject, duplicateProject } = useProjectStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const isActive = currentProject?.id === project.id

  const handleLoad = async () => {
    if (isLoading || isActive) return
    
    setIsLoading(true)
    try {
      await loadProject(project.id)
    } catch (error) {
      console.error('Failed to load project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await duplicateProject(project.id)
    } catch (error) {
      console.error('Failed to duplicate project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      await deleteProject(project.id)
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getWordCount = () => {
    // Remove motion language tags and count words
    const cleanText = project.textContent.replace(/<[^>]*>/g, '')
    return cleanText.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          "group flex items-center gap-3 p-3 rounded-lg border cursor-pointer",
          "hover:border-primary/50 hover:bg-accent/50 transition-all duration-200",
          isActive && "border-primary bg-primary/5",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onClick={handleLoad}
      >
        {/* Thumbnail */}
        <div className="w-12 h-9 bg-muted rounded border flex-shrink-0 flex items-center justify-center">
          {project.thumbnail ? (
            <img 
              src={project.thumbnail} 
              alt={project.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-medium text-sm truncate",
              isActive && "text-primary"
            )}>
              {project.name}
            </h3>
            {isActive && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {getWordCount()} words
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(project.updatedAt)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleLoad} disabled={isActive}>
              <Play className="h-4 w-4 mr-2" />
              {isActive ? 'Current' : 'Open'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border cursor-pointer overflow-hidden",
        "hover:border-primary/50 hover:shadow-md transition-all duration-200",
        isActive && "border-primary shadow-md ring-1 ring-primary/20",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onClick={handleLoad}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
        {project.thumbnail ? (
          <img 
            src={project.thumbnail} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-xs text-muted-foreground px-2">
              {project.textContent ? 
                project.textContent.replace(/<[^>]*>/g, '').substring(0, 30) + '...' :
                'Empty Project'
              }
            </div>
          </div>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full shadow-sm" />
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={handleLoad}
            disabled={isActive}
          >
            <Play className="h-3 w-3 mr-1" />
            {isActive ? 'Current' : 'Open'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "font-medium text-sm truncate",
            isActive && "text-primary"
          )}>
            {project.name}
          </h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleLoad} disabled={isActive}>
                <Play className="h-4 w-4 mr-2" />
                {isActive ? 'Current' : 'Open'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {getWordCount()} words
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}