'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ProjectCard } from './ProjectCard'
import { useProjects, useProjectViewMode } from '@/lib/store/project-store'
import { Clock, Calendar } from 'lucide-react'

export function RecentProjects() {
  const projects = useProjects()
  const viewMode = useProjectViewMode()

  // Get recent projects (last 10, sorted by updatedAt)
  const recentProjects = React.useMemo(() => {
    return [...projects]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
  }, [projects])

  // Group projects by time periods
  const groupedProjects = React.useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      today: recentProjects.filter(p => p.updatedAt >= today),
      yesterday: recentProjects.filter(p => p.updatedAt >= yesterday && p.updatedAt < today),
      thisWeek: recentProjects.filter(p => p.updatedAt >= lastWeek && p.updatedAt < yesterday),
      older: recentProjects.filter(p => p.updatedAt < lastWeek)
    }

    return groups
  }, [recentProjects])

  if (recentProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-sm mb-2">No recent projects</h3>
        <p className="text-xs text-muted-foreground">
          Projects you work on will appear here for quick access
        </p>
      </div>
    )
  }

  const renderGroup = (title: string, projects: typeof recentProjects, icon: React.ReactNode) => {
    if (projects.length === 0) return null

    return (
      <div key={title} className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          {icon}
          <h3 className="text-sm font-medium text-muted-foreground">
            {title} ({projects.length})
          </h3>
        </div>
        <div className={cn(
          viewMode.type === 'grid' 
            ? "grid grid-cols-1 xl:grid-cols-2 gap-3"
            : "space-y-2"
        )}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode.type}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {renderGroup('Today', groupedProjects.today, <Clock className="h-4 w-4 text-primary" />)}
      {renderGroup('Yesterday', groupedProjects.yesterday, <Calendar className="h-4 w-4 text-muted-foreground" />)}
      {renderGroup('This Week', groupedProjects.thisWeek, <Calendar className="h-4 w-4 text-muted-foreground" />)}
      {renderGroup('Older', groupedProjects.older, <Calendar className="h-4 w-4 text-muted-foreground" />)}
    </div>
  )
}