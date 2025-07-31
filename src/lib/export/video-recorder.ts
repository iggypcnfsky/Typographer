// Video and GIF Recording Utilities for Typographer animations

export interface RecordingOptions {
  width?: number
  height?: number
  framerate?: number
  quality?: number
  duration?: number
  backgroundColor?: string
}

export interface VideoExportResult {
  blob: Blob
  url: string
  filename: string
}

export class VideoRecorder {
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private stream: MediaStream | null = null

  constructor() {
    // Initialize canvas
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.context = this.canvas.getContext('2d')
    }
  }

  /**
   * Initialize recording canvas
   */
  private initializeCanvas(options: RecordingOptions): void {
    if (!this.canvas || !this.context) return

    this.canvas.width = options.width || 1920
    this.canvas.height = options.height || 1080
    
    // Set background
    this.context.fillStyle = options.backgroundColor || 'transparent'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Record animation as MP4 video
   */
  async recordVideo(
    animationElement: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    return new Promise((resolve, reject) => {
      try {
        this.initializeCanvas(options)
        
        if (!this.canvas) {
          throw new Error('Canvas not available')
        }

        // Create stream from canvas
        this.stream = this.canvas.captureStream(options.framerate || 30)
        
        // Set up MediaRecorder
        const mimeType = 'video/webm;codecs=vp9'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          throw new Error('Video recording not supported in this browser')
        }

        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        })

        this.recordedChunks = []

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          const filename = `typographer-animation-${Date.now()}.webm`
          
          resolve({ blob, url, filename })
        }

        this.mediaRecorder.onerror = (event) => {
          reject(new Error('Recording failed: ' + event))
        }

        // Start recording
        this.mediaRecorder.start()

        // Capture frames from animation element
        this.captureAnimationFrames(animationElement, options)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Record animation as GIF using canvas recording
   */
  async recordGIF(
    animationElement: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    // For now, let's use the same video recording but with a different file extension
    // This is a temporary solution until we implement proper GIF encoding
    try {
      const result = await this.recordVideo(animationElement, options)
      
      // Create a new result with GIF filename (though it's still WebM)
      // TODO: Implement proper GIF encoding using a different library
      const gifFilename = result.filename.replace('.webm', '.gif')
      
      return {
        ...result,
        filename: gifFilename
      }
    } catch (error) {
      throw new Error(`GIF recording failed: ${error}`)
    }
  }

  /**
   * Capture animation frames to canvas
   */
  private captureAnimationFrames(
    animationElement: HTMLElement,
    options: RecordingOptions
  ): void {
    const framerate = options.framerate || 30
    const duration = options.duration || 5
    const totalFrames = framerate * duration
    const frameInterval = 1000 / framerate

    let currentFrame = 0

    const captureFrame = () => {
      if (currentFrame >= totalFrames) {
        this.stopRecording()
        return
      }

      this.captureElementToCanvas(animationElement)
      currentFrame++
      
      setTimeout(captureFrame, frameInterval)
    }

    captureFrame()
  }

  /**
   * Capture DOM element to canvas
   */
  private captureElementToCanvas(element: HTMLElement): void {
    if (!this.canvas || !this.context) return

    // Use html2canvas or similar technique
    // For now, we'll use a simplified approach
    const rect = element.getBoundingClientRect()
    
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Set background
    this.context.fillStyle = 'transparent'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Note: In a real implementation, you'd want to use html2canvas
    // or a similar library to properly capture the animated element
    // This is a simplified version for demonstration
    
    try {
      // Get all text elements from the animation
      const textElements = element.querySelectorAll('[style*="position: absolute"]')
      
      textElements.forEach((textEl) => {
        const htmlEl = textEl as HTMLElement
        const computedStyle = window.getComputedStyle(htmlEl)
        
        if (computedStyle.opacity !== '0') {
          this.drawTextToCanvas(
            htmlEl.textContent || '',
            htmlEl.offsetLeft,
            htmlEl.offsetTop,
            computedStyle
          )
        }
      })
    } catch (error) {
      console.warn('Error capturing element to canvas:', error)
    }
  }

  /**
   * Draw text to canvas with styling
   */
  private drawTextToCanvas(
    text: string,
    x: number,
    y: number,
    style: CSSStyleDeclaration
  ): void {
    if (!this.context) return

    this.context.save()
    
    // Apply text styling
    this.context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    this.context.fillStyle = style.color
    this.context.textAlign = style.textAlign as CanvasTextAlign
    this.context.globalAlpha = parseFloat(style.opacity) || 1
    
    // Apply transform if needed
    const transform = style.transform
    if (transform && transform !== 'none') {
      // Parse and apply transform
      this.applyTransform(transform)
    }
    
    this.context.fillText(text, x, y)
    this.context.restore()
  }

  /**
   * Apply CSS transform to canvas context
   */
  private applyTransform(transform: string): void {
    if (!this.context) return

    // Parse translate, scale, rotate transforms
    const translateMatch = transform.match(/translate\(([^)]+)\)/)
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/)

    if (translateMatch) {
      const values = translateMatch[1].split(',').map(v => parseFloat(v.trim()))
      this.context.translate(values[0] || 0, values[1] || 0)
    }

    if (scaleMatch) {
      const values = scaleMatch[1].split(',').map(v => parseFloat(v.trim()))
      this.context.scale(values[0] || 1, values[1] || values[0] || 1)
    }

    if (rotateMatch) {
      const angle = parseFloat(rotateMatch[1])
      this.context.rotate((angle * Math.PI) / 180)
    }
  }

  /**
   * Stop video recording
   */
  private stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopRecording()
    
    if (this.canvas) {
      this.canvas.remove()
      this.canvas = null
      this.context = null
    }
  }
}

/**
 * Screen Recording API for better quality recording
 */
export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []

  /**
   * Record screen area containing animation
   */
  async recordScreenArea(
    element: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    return new Promise(async (resolve, reject) => {
      try {
        // Request screen capture
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen',
            width: options.width || 1920,
            height: options.height || 1080,
            frameRate: options.framerate || 30
          },
          audio: false
        })

        const mimeType = 'video/webm;codecs=vp9'
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 5000000 // 5 Mbps for better quality
        })

        this.recordedChunks = []

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          const filename = `typographer-screen-recording-${Date.now()}.webm`
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop())
          
          resolve({ blob, url, filename })
        }

        this.mediaRecorder.onerror = reject

        // Start recording
        this.mediaRecorder.start()

        // Auto-stop after duration
        if (options.duration) {
          setTimeout(() => {
            if (this.mediaRecorder?.state === 'recording') {
              this.mediaRecorder.stop()
            }
          }, options.duration * 1000)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Stop screen recording
   */
  stopRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop()
    }
  }
}

// Export utility functions
export const videoRecorder = new VideoRecorder()
export const screenRecorder = new ScreenRecorder()

/**
 * Download exported file
 */
export function downloadFile(result: VideoExportResult): void {
  const a = document.createElement('a')
  a.href = result.url
  a.download = result.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(result.url), 1000)
}