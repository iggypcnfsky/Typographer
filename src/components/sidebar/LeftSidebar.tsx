'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/lib/store/project-store'
import { ProjectBrowser } from '@/components/projects/ProjectBrowser'
import { ProjectCreator } from '@/components/projects/ProjectCreator'
import { RecentProjects } from '@/components/projects/RecentProjects'
import { ExportPanel } from '@/components/projects/ExportPanel'
import { 
  PanelLeft, 
  Plus, 
  FolderOpen, 
  Clock, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface LeftSidebarProps {
  className?: string
}

export function LeftSidebar({ className }: LeftSidebarProps) {
  const { showLeftSidebar, toggleLeftSidebar } = useProjectStore()
  const [activeTab, setActiveTab] = React.useState<'projects' | 'recent' | 'export'>('projects')
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  // Load projects on mount
  React.useEffect(() => {
    useProjectStore.getState().loadProjects()
  }, [])

  // When sidebar is hidden, don't render it at all in the flex layout
  if (!showLeftSidebar) {
    return (
      <>
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLeftSidebar}
          className={cn(
            "fixed top-20 left-2 z-50 h-8 w-8 p-0",
            "bg-card border border-border shadow-sm",
            "hover:bg-accent transition-all duration-200"
          )}
          title="Show Projects"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </>
    )
  }

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLeftSidebar}
        className={cn(
          "fixed top-20 left-[17.5rem] z-50 h-8 w-8 p-0",
          "bg-card border border-border shadow-sm",
          "hover:bg-accent transition-all duration-200"
        )}
        title="Hide Projects"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Sidebar Panel */}
      <div className={cn(
        "w-72 bg-card border-r border-border",
        "flex flex-col h-full",
        className
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border space-y-3">
          {/* App Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Typographer</h1>
          </div>
          
          {/* Projects Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PanelLeft className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-base">Projects</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-8 w-8 p-0"
              title="Create New Project"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('projects')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm",
              "border-b-2 transition-colors duration-200",
              activeTab === 'projects' 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <FolderOpen className="h-4 w-4" />
            Browse
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm",
              "border-b-2 transition-colors duration-200",
              activeTab === 'recent' 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Clock className="h-4 w-4" />
            Recent
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm",
              "border-b-2 transition-colors duration-200",
              activeTab === 'export' 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'projects' && (
            <ProjectBrowser onCreateNew={() => setShowCreateModal(true)} />
          )}
          {activeTab === 'recent' && (
            <RecentProjects />
          )}
          {activeTab === 'export' && (
            <ExportPanel />
          )}
        </div>
      </div>

      {/* Project Creator Modal */}
      <ProjectCreator
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}