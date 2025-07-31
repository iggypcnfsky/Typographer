'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';

export function SpacingControls() {
  const { settings, updateTypography } = useTypographyStore();
  const [letterSpacingInput, setLetterSpacingInput] = useState(settings.letterSpacing.toString());
  const [lineHeightInput, setLineHeightInput] = useState(settings.lineHeight.toString());

  const handleLetterSpacingSliderChange = (value: number[]) => {
    const newSpacing = value[0];
    updateTypography({ letterSpacing: newSpacing });
    setLetterSpacingInput(newSpacing.toString());
  };

  const handleLineHeightSliderChange = (value: number[]) => {
    const newHeight = value[0];
    updateTypography({ lineHeight: newHeight });
    setLineHeightInput(newHeight.toString());
  };

  const handleLetterSpacingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLetterSpacingInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= -0.2 && numValue <= 0.5) {
      updateTypography({ letterSpacing: numValue });
    }
  };

  const handleLineHeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLineHeightInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.8 && numValue <= 3) {
      updateTypography({ lineHeight: numValue });
    }
  };

  const handleLetterSpacingInputBlur = () => {
    const numValue = parseFloat(letterSpacingInput);
    if (isNaN(numValue) || numValue < -0.2 || numValue > 0.5) {
      setLetterSpacingInput(settings.letterSpacing.toString());
    }
  };

  const handleLineHeightInputBlur = () => {
    const numValue = parseFloat(lineHeightInput);
    if (isNaN(numValue) || numValue < 0.8 || numValue > 3) {
      setLineHeightInput(settings.lineHeight.toString());
    }
  };

  const adjustLetterSpacing = (delta: number) => {
    const newSpacing = Math.max(-0.2, Math.min(0.5, settings.letterSpacing + delta));
    updateTypography({ letterSpacing: newSpacing });
    setLetterSpacingInput(newSpacing.toString());
  };

  const adjustLineHeight = (delta: number) => {
    const newHeight = Math.max(0.8, Math.min(3, settings.lineHeight + delta));
    updateTypography({ lineHeight: newHeight });
    setLineHeightInput(newHeight.toString());
  };

  const letterSpacingPresets = [
    { label: 'Tight', value: -0.05 },
    { label: 'Normal', value: 0 },
    { label: 'Wide', value: 0.1 },
  ];

  const lineHeightPresets = [
    { label: 'Tight', value: 1 },
    { label: 'Normal', value: 1.2 },
    { label: 'Loose', value: 1.6 },
  ];

  return (
    <div className="space-y-6">
      {/* Letter Spacing */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Letter Spacing</Label>
        
        {/* Input and Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustLetterSpacing(-0.01)}
            disabled={settings.letterSpacing <= -0.2}
            className="h-8 w-8 shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="number"
              value={letterSpacingInput}
              onChange={handleLetterSpacingInputChange}
              onBlur={handleLetterSpacingInputBlur}
              min="-0.2"
              max="0.5"
              step="0.01"
              className="h-8 text-center"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">em</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustLetterSpacing(0.01)}
            disabled={settings.letterSpacing >= 0.5}
            className="h-8 w-8 shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Slider */}
        <div className="px-1">
          <Slider
            value={[settings.letterSpacing]}
            onValueChange={handleLetterSpacingSliderChange}
            min={-0.2}
            max={0.5}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>-0.2em</span>
            <span>0.5em</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-1">
          {letterSpacingPresets.map((preset) => (
            <Button
              key={preset.label}
              variant={settings.letterSpacing === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                updateTypography({ letterSpacing: preset.value });
                setLetterSpacingInput(preset.value.toString());
              }}
              className="h-7 text-xs flex-1"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Line Height</Label>
        
        {/* Input and Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustLineHeight(-0.1)}
            disabled={settings.lineHeight <= 0.8}
            className="h-8 w-8 shrink-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="number"
              value={lineHeightInput}
              onChange={handleLineHeightInputChange}
              onBlur={handleLineHeightInputBlur}
              min="0.8"
              max="3"
              step="0.1"
              className="h-8 text-center"
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustLineHeight(0.1)}
            disabled={settings.lineHeight >= 3}
            className="h-8 w-8 shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Slider */}
        <div className="px-1">
          <Slider
            value={[settings.lineHeight]}
            onValueChange={handleLineHeightSliderChange}
            min={0.8}
            max={3}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.8</span>
            <span>3.0</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex gap-1">
          {lineHeightPresets.map((preset) => (
            <Button
              key={preset.label}
              variant={settings.lineHeight === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                updateTypography({ lineHeight: preset.value });
                setLineHeightInput(preset.value.toString());
              }}
              className="h-7 text-xs flex-1"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>


    </div>
  );
}