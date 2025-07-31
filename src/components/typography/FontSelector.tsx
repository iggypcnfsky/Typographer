'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Type, ChevronDown } from 'lucide-react';
import { useTypographyStore } from '@/lib/store/typography-store';
import { FONT_OPTIONS, FontOption } from '@/types/typography';

export function FontSelector() {
  const { settings, updateTypography, loadWebFont, isLoading } = useTypographyStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFontDialog, setShowFontDialog] = useState(false);

  const categories = ['all', 'serif', 'sans-serif', 'monospace', 'display', 'handwriting'];

  const filteredFonts = FONT_OPTIONS.filter(font => {
    const matchesSearch = font.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentFont = FONT_OPTIONS.find(font => 
    settings.fontFamily.includes(font.name) || settings.fontFamily === font.family
  );

  const handleFontSelect = async (font: FontOption) => {
    if (font.isWebFont) {
      await loadWebFont(font.family);
    }
    updateTypography({ fontFamily: font.family });
    setShowFontDialog(false);
  };

  return (
    <div className="space-y-3">
      {/* Current Font Display */}
      <div className="p-3 bg-muted rounded-md">
        <div className="flex items-center gap-2 mb-1">
          <Type className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{currentFont?.name || 'Select Font'}</span>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
            {currentFont?.category || 'none'}
          </span>
        </div>
        {currentFont && (
          <div 
            className="text-sm text-muted-foreground"
            style={{ fontFamily: currentFont.family }}
          >
            The quick brown fox jumps
          </div>
        )}
      </div>

      {/* Font Selection Button */}
      <Dialog open={showFontDialog} onOpenChange={setShowFontDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Choose Font</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Select Font</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fonts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font List */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredFonts.map((font) => (
                <Button
                  key={font.name}
                  variant={currentFont?.name === font.name ? 'default' : 'ghost'}
                  onClick={() => handleFontSelect(font)}
                  disabled={isLoading}
                  className="w-full justify-start h-auto p-3 font-normal"
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-sm">{font.name}</span>
                      <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded ml-auto">
                        {font.category}
                      </span>
                    </div>
                    <div 
                      className="text-sm text-muted-foreground mt-1"
                      style={{ fontFamily: font.family }}
                    >
                      Aa Bb Cc 123
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {filteredFonts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No fonts found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}