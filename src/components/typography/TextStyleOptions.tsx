'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type
} from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';
import { FONT_OPTIONS } from '@/types/typography';

export function TextStyleOptions() {
  const { settings, updateTypography } = useTypographyStore();

  // Get available weights for current font
  const currentFont = FONT_OPTIONS.find(font => 
    settings.fontFamily.includes(font.name) || settings.fontFamily === font.family
  );
  const availableWeights = currentFont?.weights || [400, 700];

  const fontWeightNames: { [key: number]: string } = {
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semi Bold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black',
  };

  const textAlignOptions = [
    { value: 'left' as const, label: 'Left', icon: AlignLeft },
    { value: 'center' as const, label: 'Center', icon: AlignCenter },
    { value: 'right' as const, label: 'Right', icon: AlignRight },
  ];

  const textDecorationOptions = [
    { value: 'none' as const, label: 'None' },
    { value: 'underline' as const, label: 'Underline', icon: Underline },
    { value: 'line-through' as const, label: 'Strikethrough', icon: Strikethrough },
  ];

  const textTransformOptions = [
    { value: 'none' as const, label: 'None' },
    { value: 'uppercase' as const, label: 'UPPERCASE' },
    { value: 'lowercase' as const, label: 'lowercase' },
    { value: 'capitalize' as const, label: 'Capitalize' },
  ];

  return (
    <div className="space-y-4">
      {/* Font Weight */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Font Weight</Label>
        <Select 
          value={settings.fontWeight.toString()} 
          onValueChange={(value) => updateTypography({ fontWeight: parseInt(value) })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent>
            {availableWeights.map((weight) => (
              <SelectItem key={weight} value={weight.toString()}>
                <span style={{ fontWeight: weight }}>
                  {weight} - {fontWeightNames[weight] || 'Regular'}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text Alignment</Label>
        <div className="flex gap-1">
          {textAlignOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={settings.textAlign === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTypography({ textAlign: option.value })}
                className="flex-1 h-9"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Text Decoration */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text Decoration</Label>
        <div className="grid grid-cols-3 gap-1">
          {textDecorationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={settings.textDecoration === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTypography({ textDecoration: option.value })}
                className="h-9 text-xs"
              >
                {Icon ? <Icon className="h-3 w-3" /> : option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text Transform</Label>
        <Select 
          value={settings.textTransform} 
          onValueChange={(value: any) => updateTypography({ textTransform: value })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select transform" />
          </SelectTrigger>
          <SelectContent>
            {textTransformOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Style Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Styles</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTypography({ 
              fontWeight: 700, 
              textTransform: 'uppercase',
              textDecoration: 'none'
            })}
            className="h-8 text-xs"
          >
            <Bold className="h-3 w-3 mr-1" />
            Bold Caps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTypography({ 
              fontWeight: 300, 
              textTransform: 'none',
              textDecoration: 'none'
            })}
            className="h-8 text-xs"
          >
            Light
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTypography({ 
              fontWeight: 400, 
              textTransform: 'none',
              textDecoration: 'underline'
            })}
            className="h-8 text-xs"
          >
            <Underline className="h-3 w-3 mr-1" />
            Underlined
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTypography({ 
              fontWeight: 400, 
              textTransform: 'capitalize',
              textDecoration: 'none'
            })}
            className="h-8 text-xs"
          >
            Title Case
          </Button>
        </div>
      </div>


    </div>
  );
}