'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Minus, Plus } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';

export function SizeControls() {
  const { settings, updateTypography } = useTypographyStore();
  const [inputValue, setInputValue] = useState(settings.fontSize.toString());

  const handleSliderChange = (value: number[]) => {
    const newSize = value[0];
    updateTypography({ fontSize: newSize });
    setInputValue(newSize.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.5 && numValue <= 12) {
      updateTypography({ fontSize: numValue });
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0.5 || numValue > 12) {
      setInputValue(settings.fontSize.toString());
    }
  };

  const adjustSize = (delta: number) => {
    const newSize = Math.max(0.5, Math.min(12, settings.fontSize + delta));
    updateTypography({ fontSize: newSize });
    setInputValue(newSize.toString());
  };

  const presetSizes = [
    { label: 'XS', value: 1 },
    { label: 'S', value: 2 },
    { label: 'M', value: 3 },
    { label: 'L', value: 4 },
    { label: 'XL', value: 6 },
    { label: 'XXL', value: 8 },
  ];

  return (
    <div className="space-y-4">
      {/* Size Input and Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustSize(-0.25)}
          disabled={settings.fontSize <= 0.5}
          className="h-8 w-8 shrink-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min="0.5"
            max="12"
            step="0.25"
            className="h-8 text-center"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">rem</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustSize(0.25)}
          disabled={settings.fontSize >= 12}
          className="h-8 w-8 shrink-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Size Slider */}
      <div className="px-1">
        <Slider
          value={[settings.fontSize]}
          onValueChange={handleSliderChange}
          min={0.5}
          max={12}
          step={0.25}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0.5rem</span>
          <span>12rem</span>
        </div>
      </div>

      {/* Preset Sizes */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Quick sizes</div>
        <div className="grid grid-cols-3 gap-1">
          {presetSizes.map((preset) => (
            <Button
              key={preset.label}
              variant={settings.fontSize === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                updateTypography({ fontSize: preset.value });
                setInputValue(preset.value.toString());
              }}
              className="h-8 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>


    </div>
  );
}