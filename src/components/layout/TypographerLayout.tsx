'use client'

import * as React from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { TextEditor } from '@/components/editor/TextEditor'
import { Controls } from '@/components/editor/Controls'
import { MotionPreview } from '@/components/animation/MotionPreview'
import { Timeline } from '@/components/animation/Timeline'
import { LeftSidebar } from '@/components/sidebar/LeftSidebar'
import { RightSidebar } from '@/components/sidebar/RightSidebar'

interface TypographerLayoutProps {
  children?: React.ReactNode
}

export function TypographerLayout({ children }: TypographerLayoutProps) {
  return (
    <div className="h-screen w-full bg-background text-foreground font-sans flex">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-center px-8">
            {/* Centered Media Controls */}
            <Controls className="border-0 bg-transparent p-0" />
          </div>
        </div>

        {/* Content Panels */}
        <div className="flex-1">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Animation Preview Panel */}
            <ResizablePanel defaultSize={65} minSize={30} maxSize={80}>
              <div className="h-full bg-background p-8 flex flex-col gap-4">
                {/* Animation Canvas - Clean preview area */}
                <div className="flex-1 bg-transparent">
                  <MotionPreview />
                </div>
                
                {/* Timeline */}
                <div className="h-32 rounded-xl border border-border bg-card shadow-lg">
                  <Timeline />
                </div>
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle 
              withHandle 
              className="bg-border hover:bg-border/80 transition-colors duration-200"
            />

            {/* Text Input Panel */}
            <ResizablePanel defaultSize={35} minSize={20} maxSize={70}>
              <div className="h-full bg-muted/20 p-6">
                <div className="h-full rounded-xl border border-border bg-card shadow-lg">
                  <div className="h-full p-6 flex flex-col">
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Text Editor</h2>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Motion Format:</span>
                          <span className="ml-1">&lt;Speed&gt;&lt;Dir&gt;&lt;Duration&gt;&lt;Dir&gt;&lt;Speed&gt;</span>
                          <span className="ml-2 text-primary">0.3F1.2R0.9</span>
                          <span className="ml-1">- example</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      {/* Text Editor */}
                      <div className="flex-1">
                        <TextEditor />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}