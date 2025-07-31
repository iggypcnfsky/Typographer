'use client';

import { useMotionStore } from '@/lib/store/motion-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Info
} from 'lucide-react';

export function GlobalPositionControls() {
  const { settings, updateMotion, resetMotion } = useMotionStore();

  const handlePositionChange = (
    direction: 'left' | 'right' | 'front' | 'back',
    value: number
  ) => {
    // For left entry, ensure only negative values
    if (direction === 'left' && value > 0) {
      value = -Math.abs(value);
    }
    
    updateMotion({
      globalInitialPosition: {
        ...settings.globalInitialPosition,
        [direction]: value
      }
    });
  };

  const handleSpeedMultiplierChange = (value: number) => {
    updateMotion({ speedMultiplier: value });
  };

  const handleGapChange = (value: number) => {
    updateMotion({ gapBetweenWords: value });
  };

  return (
    <div className="space-y-6">
      {/* Position Controls */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-medium text-foreground">Initial Positions</h3>
          <div className="group relative">
            <Info className="h-3 w-3 text-muted-foreground" />
            <div className="absolute left-0 top-6 hidden group-hover:block z-10 bg-popover border border-border rounded-md p-2 text-xs text-muted-foreground shadow-md w-48">
              Set starting positions for L/R (pixels from center) and F/B (scale factors)
            </div>
          </div>
        </div>

        {/* Position Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-3 w-3 text-blue-500" />
              <Label className="text-xs">Left Entry (negative values only)</Label>
            </div>
            <Input
              type="number"
              value={settings.globalInitialPosition.left}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  return; // Allow partial input
                }
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  handlePositionChange('left', numVal);
                }
              }}
              placeholder="Enter negative value"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {settings.globalInitialPosition.left}px
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-green-500" />
              <Label className="text-xs">Right Entry</Label>
            </div>
            <Input
              type="number"
              value={settings.globalInitialPosition.right}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  return; // Allow partial input
                }
                handlePositionChange('right', parseFloat(val) || 0);
              }}
              placeholder="Enter any value"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {settings.globalInitialPosition.right}px
            </p>
          </div>
        </div>

        {/* Scale Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-3 w-3 text-purple-500" />
              <Label className="text-xs">Front Entry</Label>
            </div>
            <Input
              type="number"
              value={settings.globalInitialPosition.front}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  return; // Allow partial input
                }
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  handlePositionChange('front', numVal);
                }
              }}
              placeholder="Enter scale factor"
              step="0.1"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {settings.globalInitialPosition.front}x
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomIn className="h-3 w-3 text-orange-500" />
              <Label className="text-xs">Back Entry</Label>
            </div>
            <Input
              type="number"
              value={settings.globalInitialPosition.back}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  return; // Allow partial input
                }
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  handlePositionChange('back', numVal);
                }
              }}
              placeholder="Enter scale factor"
              step="0.1"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Current: {settings.globalInitialPosition.back}x
            </p>
          </div>
        </div>
      </div>

      {/* Speed Multiplier */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Animation Speed Multiplier
        </Label>
        <Input
          type="number"
          value={settings.speedMultiplier}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              return; // Allow empty input
            }
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
              handleSpeedMultiplierChange(numVal);
            }
          }}
          placeholder="Enter speed multiplier"
          step="0.1"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current: {settings.speedMultiplier}x (higher = faster)
        </p>
      </div>

      {/* Word Gap */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Word Gap (seconds)
        </Label>
        <Input
          type="number"
          value={settings.gapBetweenWords}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || val === '-') {
              return; // Allow partial input
            }
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
              handleGapChange(numVal);
            }
          }}
          placeholder="Enter gap in seconds"
          step="0.1"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Current: {settings.gapBetweenWords}s (negative = overlap, positive = delay)
        </p>
      </div>



      {/* Reset Button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={resetMotion}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Motion Settings
        </Button>
      </div>
    </div>
  );
}