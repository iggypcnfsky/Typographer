'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useProjectStore, useCurrentProject } from '@/lib/store/project-store'
import { 
  Download, 
  FileText, 
  Code, 
  Video, 
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react'

export function ExportPanel() {
  const currentProject = useCurrentProject()
  const { exportProject } = useProjectStore()
  const [isExporting, setIsExporting] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleExport = async (format: 'json' | 'text') => {
    if (!currentProject) return

    setIsExporting(format)
    setError(null)

    try {
      const data = await exportProject(currentProject.id, format)
      
      // Create download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentProject.name}.${format === 'json' ? 'json' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setIsExporting(null)
    }
  }

  const exportOptions = [
    {
      id: 'json',
      title: 'Project File',
      description: 'Complete project with all settings and animations',
      icon: Code,
      format: 'json' as const,
      available: true
    },
    {
      id: 'text',
      title: 'Motion Text',
      description: 'Text content with motion language tags',
      icon: FileText,
      format: 'text' as const,
      available: true
    },
    {
      id: 'video',
      title: 'Video Animation',
      description: 'Export as MP4 video file',
      icon: Video,
      format: null,
      available: false // Coming soon
    },
    {
      id: 'gif',
      title: 'Animated GIF',
      description: 'Export as animated GIF',
      icon: ImageIcon,
      format: null,
      available: false // Coming soon
    }
  ]

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Download className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-sm mb-2">No project selected</h3>
        <p className="text-xs text-muted-foreground">
          Open a project to export it in various formats
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Export Current Project</h3>
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="font-medium text-sm">{currentProject.name}</div>
          {currentProject.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {currentProject.description}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Export Options</h4>
        
        {exportOptions.map(option => {
          const Icon = option.icon
          const isLoading = isExporting === option.format
          
          return (
            <div
              key={option.id}
              className="border rounded-lg p-3 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{option.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
              
              <Button
                variant={option.available ? "outline" : "ghost"}
                size="sm"
                onClick={() => option.format && handleExport(option.format)}
                disabled={!option.available || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {option.available ? 'Export' : 'Coming Soon'}
                  </>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        <p>
          <strong>Tip:</strong> JSON exports include all project settings and can be imported back into Typographer.
        </p>
      </div>
    </div>
  )
}