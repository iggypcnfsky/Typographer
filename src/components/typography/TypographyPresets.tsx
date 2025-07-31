'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Palette, Download, Upload } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';
import { TypographyPreset } from '@/types/typography';

export function TypographyPresets() {
  const { 
    presets, 
    customPresets, 
    settings,
    applyPreset, 
    saveAsPreset, 
    deletePreset 
  } = useTypographyStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  const allPresets = [...presets, ...customPresets];

  const handleCreatePreset = () => {
    if (presetName.trim()) {
      saveAsPreset(presetName.trim(), presetDescription.trim() || undefined);
      setPresetName('');
      setPresetDescription('');
      setShowCreateDialog(false);
    }
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(customPresets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'typography-presets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedPresets)) {
          // Add imported presets to custom presets
          importedPresets.forEach((preset: TypographyPreset) => {
            if (preset.name && preset.settings) {
              saveAsPreset(
                `${preset.name} (Imported)`,
                preset.description
              );
            }
          });
        }
      } catch (error) {
        console.error('Failed to import presets:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const PresetCard = ({ preset, isCustom = false }: { preset: TypographyPreset; isCustom?: boolean }) => {
    const isActive = JSON.stringify(settings) === JSON.stringify(preset.settings);

    return (
      <div className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground/50'
      }`}>
        <div onClick={() => applyPreset(preset.id)} className="space-y-2">
          {/* Preset Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{preset.name}</h4>
              {preset.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {preset.description}
                </p>
              )}
            </div>
            {isCustom && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePreset(preset.id);
                }}
                className="h-6 w-6 ml-2 shrink-0 opacity-60 hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Typography Preview */}
          <div 
            className="bg-muted rounded p-2 text-center text-sm border"
            style={{
              fontFamily: preset.settings.fontFamily,
              fontWeight: preset.settings.fontWeight,
              fontSize: '0.875rem',
              letterSpacing: `${preset.settings.letterSpacing}em`,
              textDecoration: preset.settings.textDecoration,
              textTransform: preset.settings.textTransform,
              color: preset.settings.textColor,
              backgroundColor: preset.settings.backgroundColor === 'transparent' 
                ? 'transparent' 
                : preset.settings.backgroundColor,
            }}
          >
            Typography
          </div>

          {/* Typography Details */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Font:</span>
              <span className="font-mono truncate ml-2">
                {preset.settings.fontFamily.split(',')[0].replace(/['"]/g, '')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-mono">{preset.settings.fontSize}rem</span>
            </div>
            <div className="flex justify-between">
              <span>Weight:</span>
              <span className="font-mono">{preset.settings.fontWeight}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Plus className="h-3 w-3 mr-1" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Typography Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="My Custom Style"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-description">Description (Optional)</Label>
                <Textarea
                  id="preset-description"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Describe this typography style..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreatePreset} disabled={!presetName.trim()} className="flex-1">
                  Save Preset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={handleExportPresets} disabled={customPresets.length === 0}>
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-3 w-3" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportPresets}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Built-in Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Built-in Presets</h3>
        <div className="grid gap-3">
          {presets.map((preset) => (
            <PresetCard key={preset.id} preset={preset} />
          ))}
        </div>
      </div>

      {/* Custom Presets */}
      {customPresets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Custom Presets</h3>
          <div className="grid gap-3">
            {customPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} isCustom />
            ))}
          </div>
        </div>
      )}

      {customPresets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No custom presets yet</p>
          <p className="text-xs mt-1">Save your current typography settings as a preset</p>
        </div>
      )}
    </div>
  );
}