'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProjectCard } from './ProjectCard'
import { useProjectStore, useProjects, useProjectTemplates, useProjectFilter, useProjectViewMode } from '@/lib/store/project-store'
import { ProjectData, ProjectTemplate } from '@/types/project'
import { 
  Search, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Plus,
  Sparkles
} from 'lucide-react'

interface ProjectBrowserProps {
  onCreateNew: () => void
}

export function ProjectBrowser({ onCreateNew }: ProjectBrowserProps) {
  const projects = useProjects()
  const templates = useProjectTemplates()
  const filter = useProjectFilter()
  const viewMode = useProjectViewMode()
  const { setFilter, setViewMode } = useProjectStore()
  
  const [searchTerm, setSearchTerm] = React.useState(filter.searchTerm || '')
  const [showTemplates, setShowTemplates] = React.useState(false)

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects

    // Apply search filter
    if (filter.searchTerm) {
      const search = filter.searchTerm.toLowerCase()
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search) ||
        project.textContent.toLowerCase().includes(search)
      )
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filter.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
          break
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [projects, filter])

  // Handle search input with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ searchTerm })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, setFilter])

  const handleTemplateSelect = (template: ProjectTemplate) => {
    const { createProject } = useProjectStore.getState()
    
    createProject(template.name, template.description).then(project => {
      // Update project with template data
      useProjectStore.getState().updateProject(project.id, {
        textContent: template.textContent,
        typography: template.typography,
        wordGap: template.wordGap
      })
    })
  }

  const handleSortToggle = () => {
    setFilter({ 
      sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' 
    })
  }

  const handleViewModeToggle = () => {
    setViewMode({ 
      type: viewMode.type === 'grid' ? 'list' : 'grid' 
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Controls */}
      <div className="p-4 space-y-3 border-b border-border">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="pl-10 h-9"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewModeToggle}
              className="h-8 w-8 p-0"
              title={`Switch to ${viewMode.type === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode.type === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSortToggle}
              className="h-8 w-8 p-0"
              title={`Sort ${filter.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filter.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className={cn(
              "h-8 px-3 text-xs",
              showTemplates && "bg-accent text-accent-foreground"
            )}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Templates
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Templates Section */}
        {showTemplates && templates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Project Templates
            </h3>
            <div className={cn(
              viewMode.type === 'grid' 
                ? "grid grid-cols-1 xl:grid-cols-2 gap-3"
                : "space-y-2"
            )}>
              {templates.map(template => (
                <div
                  key={template.id}
                  className={cn(
                    "border border-border rounded-lg p-3 cursor-pointer",
                    "hover:border-primary/50 hover:bg-accent/50 transition-colors",
                    "group"
                  )}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary">
                        {template.name}
                      </h4>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Sparkles className="h-4 w-4 text-primary/60 group-hover:text-primary flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Projects ({filteredProjects.length})
            </h3>
            {filteredProjects.length === 0 && !filter.searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNew}
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create First Project
              </Button>
            )}
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length > 0 ? (
            <div className={cn(
              viewMode.type === 'grid' 
                ? "grid grid-cols-1 xl:grid-cols-2 gap-3"
                : "space-y-2"
            )}>
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode.type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {filter.searchTerm ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-sm mb-2">No projects found</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Try adjusting your search terms
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setFilter({ searchTerm: '' })
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">No projects yet</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first animated typography project
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onCreateNew}
                    className="h-8 px-4 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create Project
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}