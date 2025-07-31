'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette, Pipette } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';

const PRESET_COLORS = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
  '#6c757d', '#495057', '#343a40', '#212529', '#000000',
  '#ff6b6b', '#ee5a52', '#ff8787', '#ffa8a8', '#ffc9c9', '#ffe3e3',
  '#339af0', '#228be6', '#74c0fc', '#a5d8ff', '#d0ebff', '#e7f5ff',
  '#51cf66', '#40c057', '#8ce99a', '#b2f2bb', '#d3f9d8', '#ebfbee',
  '#ffd43b', '#fab005', '#ffec99', '#fff3bf', '#fff9db', '#fffbf0',
  '#9775fa', '#7950f2', '#b197fc', '#d0bfff', '#e5dbff', '#f3f0ff',
  '#ff8cc8', '#e64980', '#faa2c1', '#ffb3d9', '#fcc2d7', '#fce2db',
];

export function ColorPicker() {
  const { settings, updateTypography } = useTypographyStore();
  const [showTextPicker, setShowTextPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const handleColorChange = (color: string, type: 'text' | 'background') => {
    if (type === 'text') {
      updateTypography({ textColor: color });
    } else {
      updateTypography({ backgroundColor: color });
    }
  };

  const ColorPreview = ({ color, type }: { color: string; type: 'text' | 'background' }) => (
    <div 
      className="w-8 h-8 rounded border-2 border-border cursor-pointer flex items-center justify-center"
      style={{ backgroundColor: type === 'background' && color !== 'transparent' ? color : '#ffffff' }}
    >
      {type === 'text' && (
        <div 
          className="w-4 h-4 rounded"
          style={{ backgroundColor: color }}
        />
      )}
      {type === 'background' && color === 'transparent' && (
        <div className="w-4 h-4 bg-gradient-to-br from-red-500 via-transparent to-transparent rounded opacity-50" />
      )}
    </div>
  );

  const ColorPickerPopover = ({ 
    color, 
    type, 
    isOpen, 
    onOpenChange 
  }: { 
    color: string; 
    type: 'text' | 'background';
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="p-2 h-auto">
          <ColorPreview color={color} type={type} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          {/* Hex Input */}
          <div className="space-y-2">
            <Label className="text-xs">Hex Color</Label>
            <div className="flex gap-2">
              <Input
                value={color}
                onChange={(e) => handleColorChange(e.target.value, type)}
                placeholder="#ffffff"
                className="h-8 font-mono text-xs"
              />
              {type === 'background' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange('transparent', type)}
                  className="h-8 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-2">
            <Label className="text-xs">Preset Colors</Label>
            <div className="grid grid-cols-11 gap-1">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => handleColorChange(presetColor, type)}
                  className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Transparency option for background */}
          {type === 'background' && (
            <div className="space-y-2">
              <Label className="text-xs">Transparency</Label>
              <Button
                variant={color === 'transparent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleColorChange('transparent', type)}
                className="w-full h-8 text-xs"
              >
                Transparent Background
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      {/* Text Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text Color</Label>
        <div className="flex items-center gap-3">
          <ColorPickerPopover
            color={settings.textColor}
            type="text"
            isOpen={showTextPicker}
            onOpenChange={setShowTextPicker}
          />
          <div className="flex-1">
            <Input
              value={settings.textColor}
              onChange={(e) => handleColorChange(e.target.value, 'text')}
              placeholder="#ffffff"
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Background Color</Label>
        <div className="flex items-center gap-3">
          <ColorPickerPopover
            color={settings.backgroundColor}
            type="background"
            isOpen={showBgPicker}
            onOpenChange={setShowBgPicker}
          />
          <div className="flex-1">
            <Input
              value={settings.backgroundColor}
              onChange={(e) => handleColorChange(e.target.value, 'background')}
              placeholder="transparent"
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>




    </div>
  );
}