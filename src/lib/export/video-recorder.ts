// Video and GIF Recording Utilities for Typographer animations
import GIF from 'gif.js'
import html2canvas from 'html2canvas'

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
   * Record animation as GIF using WebRTC screen capture for better quality
   */
  async recordGIF(
    animationElement: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    try {
      // First try the advanced capture method
      return await this.recordGIFWithScreenCapture(animationElement, options)
    } catch (error) {
      console.warn('Screen capture failed, falling back to html2canvas:', error)
      // Fallback to html2canvas method
      return await this.recordGIFWithCanvas(animationElement, options)
    }
  }

  /**
   * Record GIF using screen capture API for perfect quality
   */
  private async recordGIFWithScreenCapture(
    animationElement: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const width = options.width || 1920
        const height = options.height || 1080
        const framerate = options.framerate || 30
        const duration = options.duration || 5

        console.log(`Starting GIF recording with screen capture: ${width}x${height}, ${duration}s`)

        // Get the animation element's position and size
        const rect = animationElement.getBoundingClientRect()
        const scrollX = window.scrollX
        const scrollY = window.scrollY

        // Request screen share focusing on the animation area
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen',
            width: { ideal: rect.width },
            height: { ideal: rect.height },
            frameRate: { ideal: framerate }
          },
          audio: false
        })

        // Create video element to display the stream
        const video = document.createElement('video')
        video.srcObject = stream
        video.play()

        // Wait for video to be ready
        await new Promise(resolve => {
          video.onloadedmetadata = resolve
        })

        // Initialize GIF encoder
        const gif = new GIF({
          workers: 2,
          quality: options.quality || 10,
          width: width,
          height: height,
          workerScript: '/gif.worker.js'
        })

        let currentFrame = 0
        const totalFrames = Math.ceil(framerate * duration)
        const frameInterval = 1000 / framerate

        // Get store reference
        const typographerStore = (window as any).__typographerStore
        
        // Force animation to restart and play
        if (typographerStore) {
          console.log('Restarting animation for GIF capture')
          typographerStore.getState().seekTo(0)
          typographerStore.getState().playAnimation()
        }

        // Wait for animation to start
        await new Promise(resolve => setTimeout(resolve, 200))

        const captureFrame = async () => {
          if (currentFrame >= totalFrames) {
            // Stop the stream
            stream.getTracks().forEach(track => track.stop())
            
            // Render GIF
            gif.on('finished', function(blob) {
              console.log('GIF rendering complete, blob size:', blob.size)
              const url = URL.createObjectURL(blob)
              const filename = `typographer-animation-${Date.now()}.gif`
              resolve({ blob, url, filename })
            })

            gif.render()
            return
          }

          try {
            // Sync animation time to current frame
            const currentTime = (currentFrame / framerate)
            if (typographerStore) {
              typographerStore.getState().seekTo(currentTime)
            }

            // Give animation time to update
            await new Promise(resolve => setTimeout(resolve, 50))

            // Create canvas and capture video frame
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (ctx) {
              canvas.width = width
              canvas.height = height
              
              // Draw the video frame to canvas
              ctx.drawImage(video, 0, 0, width, height)
              
              // Add frame to GIF
              gif.addFrame(canvas, { delay: 1000 / framerate })
            }

            console.log(`Captured frame ${currentFrame + 1}/${totalFrames} at time ${currentTime.toFixed(2)}s`)

          } catch (error) {
            console.warn('Error capturing frame:', error)
          }

          currentFrame++
          setTimeout(captureFrame, frameInterval)
        }

        // Handle GIF errors
        gif.on('error', function(error) {
          stream.getTracks().forEach(track => track.stop())
          reject(new Error(`GIF encoding failed: ${error}`))
        })

        // Start capturing frames
        setTimeout(captureFrame, frameInterval)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Fallback GIF recording using html2canvas
   */
  private async recordGIFWithCanvas(
    animationElement: HTMLElement,
    options: RecordingOptions = {}
  ): Promise<VideoExportResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const width = options.width || 1920
        const height = options.height || 1080
        const framerate = options.framerate || 30
        const duration = options.duration || 5
        const totalFrames = Math.ceil(framerate * duration)
        const frameInterval = 1000 / framerate

        console.log(`Starting GIF recording with canvas: ${width}x${height}, ${totalFrames} frames, ${duration}s`)

        // Initialize GIF encoder
        const gif = new GIF({
          workers: 2,
          quality: options.quality || 10,
          width: width,
          height: height,
          workerScript: '/gif.worker.js'
        })

        let currentFrame = 0
        let capturedFrames = 0

        // Get store reference
        const typographerStore = (window as any).__typographerStore
        
        // Force animation to restart and play
        if (typographerStore) {
          console.log('Restarting animation for GIF capture')
          typographerStore.getState().seekTo(0)
          typographerStore.getState().playAnimation()
        }

        // Wait for animation to start
        await new Promise(resolve => setTimeout(resolve, 100))

        const captureFrame = async () => {
          if (currentFrame >= totalFrames) {
            console.log(`Captured ${capturedFrames} frames, rendering GIF...`)
            
            gif.on('finished', function(blob) {
              console.log('GIF rendering complete, blob size:', blob.size)
              const url = URL.createObjectURL(blob)
              const filename = `typographer-animation-${Date.now()}.gif`
              resolve({ blob, url, filename })
            })

            gif.render()
            return
          }

          try {
            // Sync animation time to current frame
            const currentTime = (currentFrame / framerate)
            if (typographerStore) {
              typographerStore.getState().seekTo(currentTime)
            }

            // Give animation time to update
            await new Promise(resolve => setTimeout(resolve, 100))

            // Get the actual rendered dimensions
            const rect = animationElement.getBoundingClientRect()
            
            // Capture with better settings for transforms
            const canvas = await html2canvas(animationElement, {
              backgroundColor: options.backgroundColor || null,
              scale: 1,
              logging: false,
              useCORS: true,
              allowTaint: true,
              foreignObjectRendering: false,
              imageTimeout: 0,
              removeContainer: true,
              x: 0,
              y: 0,
              width: rect.width,
              height: rect.height,
              scrollX: 0,
              scrollY: 0
            })

            // Resize to target dimensions
            const resizedCanvas = document.createElement('canvas')
            const ctx = resizedCanvas.getContext('2d')
            if (ctx) {
              resizedCanvas.width = width
              resizedCanvas.height = height
              
              // Fill background if specified
              if (options.backgroundColor && options.backgroundColor !== 'transparent') {
                ctx.fillStyle = options.backgroundColor
                ctx.fillRect(0, 0, width, height)
              }
              
              // Draw the captured content centered
              const scale = Math.min(width / canvas.width, height / canvas.height)
              const scaledWidth = canvas.width * scale
              const scaledHeight = canvas.height * scale
              const x = (width - scaledWidth) / 2
              const y = (height - scaledHeight) / 2
              
              ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight)
              gif.addFrame(resizedCanvas, { delay: 1000 / framerate })
            }

            capturedFrames++
            console.log(`Captured frame ${currentFrame + 1}/${totalFrames} at time ${currentTime.toFixed(2)}s`)

          } catch (error) {
            console.warn('Error capturing frame:', error)
          }

          currentFrame++
          setTimeout(captureFrame, frameInterval)
        }

        gif.on('error', function(error) {
          console.error('GIF encoding error:', error)
          reject(new Error(`GIF encoding failed: ${error}`))
        })

        setTimeout(captureFrame, frameInterval)

      } catch (error) {
        console.error('GIF recording failed:', error)
        reject(new Error(`GIF recording failed: ${error}`))
      }
    })
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
   * Capture DOM element to canvas (legacy method)
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
    style: CSSStyleDeclaration,
    ctx?: CanvasRenderingContext2D
  ): void {
    const context = ctx || this.context
    if (!context) return

    context.save()
    
    // Apply text styling
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    context.fillStyle = style.color
    context.textAlign = 'center' // Always center for GIF
    context.textBaseline = 'middle' // Center vertically
    context.globalAlpha = parseFloat(style.opacity) || 1
    
    // Apply transform if needed
    const transform = style.transform
    if (transform && transform !== 'none') {
      // Parse and apply transform
      this.applyTransformToContext(transform, context)
    }
    
    context.fillText(text, x, y)
    context.restore()
  }

  /**
   * Apply CSS transform to canvas context
   */
  private applyTransform(transform: string): void {
    if (!this.context) return
    this.applyTransformToContext(transform, this.context)
  }

  /**
   * Apply CSS transform to specific canvas context
   */
  private applyTransformToContext(transform: string, context: CanvasRenderingContext2D): void {
    // Parse translate, scale, rotate transforms
    const translateMatch = transform.match(/translate\(([^)]+)\)/)
    const scaleMatch = transform.match(/scale\(([^)]+)\)/)
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/)

    if (translateMatch) {
      const values = translateMatch[1].split(',').map(v => parseFloat(v.trim()))
      context.translate(values[0] || 0, values[1] || 0)
    }

    if (scaleMatch) {
      const values = scaleMatch[1].split(',').map(v => parseFloat(v.trim()))
      context.scale(values[0] || 1, values[1] || values[0] || 1)
    }

    if (rotateMatch) {
      const angle = parseFloat(rotateMatch[1])
      context.rotate((angle * Math.PI) / 180)
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
   * Debug method to test html2canvas capture
   */
  async debugCapture(element: HTMLElement): Promise<void> {
    try {
      console.log('Testing html2canvas capture...')
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1,
        logging: true,
        useCORS: true,
        allowTaint: true
      })
      
      console.log('Captured canvas:', canvas.width, 'x', canvas.height)
      
      // Convert to blob and create download link for testing
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'debug-capture.png'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          console.log('Debug capture saved as debug-capture.png')
        }
      })
    } catch (error) {
      console.error('Debug capture failed:', error)
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