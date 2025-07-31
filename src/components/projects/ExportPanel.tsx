'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useProjectStore, useCurrentProject } from '@/lib/store/project-store'
import { useTypographerStore } from '@/lib/store/typographer-store'
import { useTypographyStore } from '@/lib/store/typography-store'
import { useMotionStore } from '@/lib/store/motion-store'
import { lottieConverter, type AspectRatio, type ExportOptions } from '@/lib/export/lottie-converter'
import { videoRecorder, screenRecorder, downloadFile } from '@/lib/export/video-recorder'
import { 
  Download, 
  FileText, 
  Code, 
  Video, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react'

export function ExportPanel() {
  const currentProject = useCurrentProject()
  const { exportProject } = useProjectStore()
  const { words, textContent, totalDuration } = useTypographerStore()
  const { settings: typography } = useTypographyStore()
  const { settings: motionSettings, easingCurves, customEasingCurves } = useMotionStore()
  const [isExporting, setIsExporting] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [exportProgress, setExportProgress] = React.useState<string>('')
  const [selectedAspectRatio, setSelectedAspectRatio] = React.useState<AspectRatio>('16:9')
  const [customDimensions, setCustomDimensions] = React.useState({ width: 1920, height: 1080 })



  const handleAdvancedExport = async (format: 'lottie' | 'gif' | 'mp4') => {
    if (!currentProject) return



    if (!words?.length) {
      setError('No text content to export. Please add some text first.')
      return
    }

    setIsExporting(format)
    setError(null)
    setExportProgress('')

    try {
      if (format === 'lottie') {
        setExportProgress('Converting animation to Lottie format...')
        
        // Ensure we have valid words array
        if (!Array.isArray(words) || words.length === 0) {
          throw new Error('No animation data available. Please create some animated text first.')
        }
        
        // Convert to Lottie JSON
        const exportOptions: ExportOptions = {
          aspectRatio: selectedAspectRatio,
          duration: Math.max(totalDuration, 1), // Use actual animation duration with minimum of 1 second
          framerate: 30
        }
        
        if (selectedAspectRatio === 'custom') {
          exportOptions.width = customDimensions.width
          exportOptions.height = customDimensions.height
        }
        
        console.log('Exporting Lottie with:', { words, typography, motionSettings, exportOptions })
        
        const lottieJson = lottieConverter.exportLottieJson(
          words,
          typography,
          motionSettings,
          exportOptions
        )
        
        console.log('Generated Lottie JSON length:', lottieJson.length)
        
        // Download Lottie JSON
        const blob = new Blob([lottieJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentProject.name}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
      } else if (format === 'gif') {
        setExportProgress('Preparing GIF recording...')
        
        // Find the animation preview element
        const previewElement = document.querySelector('[data-animation-preview]') as HTMLElement
        if (!previewElement) {
          throw new Error('Animation preview not found. Please ensure the animation is visible.')
        }
        
        console.log('Found preview element:', previewElement)
        console.log('Preview element dimensions:', previewElement.getBoundingClientRect())
        
        // Get dimensions based on aspect ratio
        const { width: exportWidth, height: exportHeight } = lottieConverter.calculateDimensions({ 
          aspectRatio: selectedAspectRatio, 
          width: selectedAspectRatio === 'custom' ? customDimensions.width : undefined,
          height: selectedAspectRatio === 'custom' ? customDimensions.height : undefined
        })
        
        const finalWidth = Math.min(exportWidth, 1200) // Cap at reasonable size for GIF
        const finalHeight = Math.min(exportHeight, 1200)
        const duration = Math.max(totalDuration, 1) // Use actual animation duration with minimum of 1 second
        
        console.log(`GIF export settings: ${finalWidth}x${finalHeight}, ${duration}s duration`)
        
        setExportProgress(`Recording GIF ${finalWidth}x${finalHeight} for ${duration}s... You may be prompted to share your screen for best quality.`)
        
        // Record GIF
        const result = await videoRecorder.recordGIF(previewElement, {
          width: finalWidth,
          height: finalHeight,
          framerate: 30,
          duration: duration,
          quality: 10,
          backgroundColor: typography.backgroundColor === 'transparent' ? null : typography.backgroundColor
        })
        
        console.log('GIF export completed:', result)
        downloadFile(result)
        
      } else if (format === 'mp4') {
        setExportProgress('Preparing video recording...')
        
        // Find the animation preview element
        const previewElement = document.querySelector('[data-animation-preview]') as HTMLElement
        if (!previewElement) {
          throw new Error('Animation preview not found. Please ensure the animation is visible.')
        }
        
        setExportProgress('Recording video... This may take a moment.')
        
        // Get dimensions based on aspect ratio
        const { width: exportWidth, height: exportHeight } = lottieConverter.calculateDimensions({ 
          aspectRatio: selectedAspectRatio, 
          width: selectedAspectRatio === 'custom' ? customDimensions.width : undefined,
          height: selectedAspectRatio === 'custom' ? customDimensions.height : undefined
        })
        
        // Record MP4 using canvas recording
        const result = await videoRecorder.recordVideo(previewElement, {
          width: exportWidth,
          height: exportHeight,
          framerate: 30,
          duration: Math.max(totalDuration, 1) // Use actual animation duration with minimum of 1 second
        })
        
        downloadFile(result)
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : `${format.toUpperCase()} export failed`)
    } finally {
      setIsExporting(null)
      setExportProgress('')
    }
  }

  const exportOptions = [
    {
      id: 'lottie',
      title: 'Lottie Animation',
      description: 'Export as Lottie JSON for web and mobile',
      icon: Play,
      format: 'lottie' as const,
      available: true,
      category: 'advanced'
    },
    {
      id: 'gif',
      title: 'Animated GIF',
      description: 'Export as animated GIF with proper timing and aspect ratio',
      icon: ImageIcon,
      format: 'gif' as const,
      available: true,
      category: 'advanced'
    },
    {
      id: 'mp4',
      title: 'Video Animation',
      description: 'Export as MP4 video with animation duration',
      icon: Video,
      format: 'mp4' as const,
      available: true,
      category: 'advanced'
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

      {exportProgress && (
        <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
          <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin" />
          <div>{exportProgress}</div>
        </div>
      )}

      <div className="space-y-4">

        {/* Export Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Export Settings</h4>
          
          {/* Aspect Ratio Selection */}
          <div className="border rounded-lg p-3 space-y-3">
            <div className="font-medium text-sm">Aspect Ratio</div>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
                <Button
                  key={ratio}
                  variant={selectedAspectRatio === ratio ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAspectRatio(ratio)}
                  className="text-xs"
                >
                  {ratio}
                </Button>
              ))}
            </div>
            <Button
              variant={selectedAspectRatio === 'custom' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAspectRatio('custom')}
              className="w-full text-xs"
            >
              Custom
            </Button>
            
            {selectedAspectRatio === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground">Width</label>
                  <input
                    type="number"
                    value={customDimensions.width}
                    onChange={(e) => setCustomDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 1920 }))}
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Height</label>
                  <input
                    type="number"
                    value={customDimensions.height}
                    onChange={(e) => setCustomDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 1080 }))}
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {selectedAspectRatio === '16:9' && 'Landscape format (1920×1080) - ideal for YouTube, presentations'}
              {selectedAspectRatio === '9:16' && 'Portrait format (1080×1920) - ideal for TikTok, Instagram Stories'}
              {selectedAspectRatio === '1:1' && 'Square format (1080×1080) - ideal for Instagram posts'}
              {selectedAspectRatio === 'custom' && `Custom format (${customDimensions.width}×${customDimensions.height})`}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Export</h4>
          <div className="text-xs text-muted-foreground mb-3">
            These formats require an active animation preview. Make sure your animation is playing or visible.
          </div>
          
          {exportOptions.filter(option => option.category === 'advanced').map(option => {
            const Icon = option.icon
            const isLoading = isExporting === option.format
            const hasWords = words.length > 0
            
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
                    {!hasWords && (
                      <div className="text-xs text-amber-600 mt-1">
                        Add animated text to enable this export
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdvancedExport(option.format)}
                    disabled={!hasWords || isLoading}
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
                        {hasWords ? 'Export' : 'Add Animation First'}
                      </>
                    )}
                  </Button>
                  
                  {/* Debug button for GIF testing */}
                  {option.format === 'gif' && hasWords && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const previewElement = document.querySelector('[data-animation-preview]') as HTMLElement
                        if (previewElement) {
                          await videoRecorder.debugCapture(previewElement)
                        }
                      }}
                      className="w-full text-xs"
                    >
                      Debug Capture
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
        <p>
          <strong>Lottie:</strong> Use the JSON file with Lottie players for web, mobile, or After Effects.
        </p>
        <p>
          <strong>Video/GIF:</strong> Recording captures the full animation duration ({totalDuration.toFixed(1)}s). Position the preview prominently for best results.
        </p>
      </div>
    </div>
  )
}