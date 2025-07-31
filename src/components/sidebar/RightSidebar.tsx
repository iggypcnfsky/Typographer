'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings, Palette, Type } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';
import { FontSelector } from '@/components/typography/FontSelector';
import { SizeControls } from '@/components/typography/SizeControls';
import { SpacingControls } from '@/components/typography/SpacingControls';
import { ColorPicker } from '@/components/typography/ColorPicker';
import { TextStyleOptions } from '@/components/typography/TextStyleOptions';
import { TypographyPresets } from '@/components/typography/TypographyPresets';

type TabType = 'controls' | 'presets';

export function RightSidebar() {
  const { showRightSidebar, toggleRightSidebar, viewMode, setViewMode } = useTypographyStore();
  const [activeTab, setActiveTab] = useState<TabType>('controls');

  if (!showRightSidebar) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed right-2 top-1/2 z-50 h-10 w-10 transform -translate-y-1/2 bg-background border-border hover:bg-accent"
        onClick={toggleRightSidebar}
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Typography</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRightSidebar}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-md">
          <Button
            variant={activeTab === 'controls' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('controls')}
            className="flex-1 h-8"
          >
            <Settings className="h-3 w-3 mr-1" />
            Controls
          </Button>
          <Button
            variant={activeTab === 'presets' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('presets')}
            className="flex-1 h-8"
          >
            <Palette className="h-3 w-3 mr-1" />
            Presets
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'controls' ? (
          <div className="space-y-6">
            {/* Font Selection */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Font</h3>
              <FontSelector />
            </div>

            {/* Size Controls */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Size</h3>
              <SizeControls />
            </div>

            {/* Spacing Controls */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Spacing</h3>
              <SpacingControls />
            </div>

            {/* Text Style Options */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Style</h3>
              <TextStyleOptions />
            </div>

            {/* Color Controls */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Colors</h3>
              <ColorPicker />
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => useTypographyStore.getState().resetTypography()}
                className="w-full"
              >
                Reset to Default
              </Button>
            </div>
          </div>
        ) : (
          <TypographyPresets />
        )}
      </div>
    </div>
  );
}

// Toggle button for when sidebar is closed
export function RightSidebarToggle() {
  const { showRightSidebar, toggleRightSidebar } = useTypographyStore();

  if (showRightSidebar) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed right-2 top-1/2 z-50 h-10 w-10 transform -translate-y-1/2 bg-background border-border hover:bg-accent"
      onClick={toggleRightSidebar}
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
}