import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TypographyStore, TypographySettings, TypographyPreset, DEFAULT_TYPOGRAPHY, TYPOGRAPHY_PRESETS } from '@/types/typography';

// Web font loading utility
const loadWebFont = async (fontFamily: string): Promise<void> => {
  // Extract font name from family string
  const fontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  
  // Check if font is already loaded
  if (document.fonts.check(`16px "${fontName}"`)) {
    return;
  }

  try {
    // All fonts in our collection are Google Fonts
    const googleFonts = [
      'Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Nunito', 'Work Sans',
      'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Cormorant Garamond',
      'JetBrains Mono', 'Fira Code', 'Source Code Pro',
      'Bebas Neue', 'Oswald', 'Anton', 'Archivo Black',
      'Dancing Script', 'Pacifico', 'Caveat', 'Kaushan Script'
    ];
    
    if (googleFonts.includes(fontName)) {
      // Create link element for Google Fonts with all available weights
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      link.rel = 'stylesheet';
      
      // Add to document head if not already present
      if (!document.querySelector(`link[href*="${fontName.replace(/\s+/g, '+')}"]`)) {
        document.head.appendChild(link);
      }
      
      // Wait for font to load
      await document.fonts.load(`16px "${fontName}"`);
    }
  } catch (error) {
    console.warn(`Failed to load font: ${fontName}`, error);
  }
};

export const useTypographyStore = create<TypographyStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_TYPOGRAPHY,
      presets: TYPOGRAPHY_PRESETS,
      customPresets: [],
      isLoading: false,
      error: null,
      viewMode: 'controls',
      showRightSidebar: true,

      updateTypography: (updates: Partial<TypographySettings>) => {
        const newSettings = { ...get().settings, ...updates };
        
        // Load web font if font family changed
        if (updates.fontFamily && updates.fontFamily !== get().settings.fontFamily) {
          loadWebFont(updates.fontFamily).catch(console.warn);
        }
        
        set({ settings: newSettings });
      },

      resetTypography: () => {
        set({ settings: DEFAULT_TYPOGRAPHY });
      },

      applyPreset: (presetId: string) => {
        const { presets, customPresets } = get();
        const allPresets = [...presets, ...customPresets];
        const preset = allPresets.find(p => p.id === presetId);
        
        if (preset) {
          // Load web font if needed
          loadWebFont(preset.settings.fontFamily).catch(console.warn);
          set({ settings: preset.settings });
        }
      },

      saveAsPreset: (name: string, description?: string) => {
        const { settings, customPresets } = get();
        const newPreset: TypographyPreset = {
          id: `custom-${Date.now()}`,
          name,
          description,
          settings: { ...settings },
        };
        
        set({ customPresets: [...customPresets, newPreset] });
      },

      deletePreset: (presetId: string) => {
        const { customPresets } = get();
        set({ 
          customPresets: customPresets.filter(p => p.id !== presetId) 
        });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      toggleRightSidebar: () => {
        set(state => ({ showRightSidebar: !state.showRightSidebar }));
      },

      loadWebFont: async (fontFamily: string) => {
        set({ isLoading: true, error: null });
        try {
          await loadWebFont(fontFamily);
        } catch (error) {
          set({ error: `Failed to load font: ${fontFamily}` });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'typographer-typography',
      partialize: (state) => ({
        settings: state.settings,
        customPresets: state.customPresets,
        viewMode: state.viewMode,
        showRightSidebar: state.showRightSidebar,
      }),
    }
  )
);