export interface TypographySettings {
  fontFamily: string;
  fontSize: number; // in rem
  fontWeight: number;
  letterSpacing: number; // in em
  lineHeight: number;
  textColor: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface FontOption {
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weights: number[];
  isWebFont?: boolean;
  fallback?: string;
}

export interface TypographyPreset {
  id: string;
  name: string;
  description?: string;
  settings: TypographySettings;
  thumbnail?: string;
}

export type TypographyViewMode = 'controls' | 'presets';

export interface TypographyStore {
  settings: TypographySettings;
  presets: TypographyPreset[];
  customPresets: TypographyPreset[];
  isLoading: boolean;
  error: string | null;
  viewMode: TypographyViewMode;
  showRightSidebar: boolean;

  updateTypography: (updates: Partial<TypographySettings>) => void;
  resetTypography: () => void;
  applyPreset: (presetId: string) => void;
  saveAsPreset: (name: string, description?: string) => void;
  deletePreset: (presetId: string) => void;
  setViewMode: (mode: TypographyViewMode) => void;
  toggleRightSidebar: () => void;
  loadWebFont: (fontFamily: string) => Promise<void>;
}

// Default typography settings
export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 4, // 4rem for large preview text
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 1.2,
  textColor: '#ffffff',
  backgroundColor: 'transparent',
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'none',
};

// Google Fonts collection
export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif fonts
  {
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Poppins',
    family: 'Poppins, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    weights: [100, 300, 400, 500, 700, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Open Sans',
    family: 'Open Sans, sans-serif',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Montserrat',
    family: 'Montserrat, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Lato',
    family: 'Lato, sans-serif',
    category: 'sans-serif',
    weights: [100, 300, 400, 700, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Nunito',
    family: 'Nunito, sans-serif',
    category: 'sans-serif',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Work Sans',
    family: 'Work Sans, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  // Serif fonts
  {
    name: 'Playfair Display',
    family: 'Playfair Display, serif',
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    isWebFont: true,
    fallback: 'serif',
  },
  {
    name: 'Merriweather',
    family: 'Merriweather, serif',
    category: 'serif',
    weights: [300, 400, 700, 900],
    isWebFont: true,
    fallback: 'serif',
  },
  {
    name: 'Lora',
    family: 'Lora, serif',
    category: 'serif',
    weights: [400, 500, 600, 700],
    isWebFont: true,
    fallback: 'serif',
  },
  {
    name: 'Crimson Text',
    family: 'Crimson Text, serif',
    category: 'serif',
    weights: [400, 600, 700],
    isWebFont: true,
    fallback: 'serif',
  },
  {
    name: 'Cormorant Garamond',
    family: 'Cormorant Garamond, serif',
    category: 'serif',
    weights: [300, 400, 500, 600, 700],
    isWebFont: true,
    fallback: 'serif',
  },
  // Monospace fonts
  {
    name: 'JetBrains Mono',
    family: 'JetBrains Mono, monospace',
    category: 'monospace',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    isWebFont: true,
    fallback: 'monospace',
  },
  {
    name: 'Fira Code',
    family: 'Fira Code, monospace',
    category: 'monospace',
    weights: [300, 400, 500, 600, 700],
    isWebFont: true,
    fallback: 'monospace',
  },
  {
    name: 'Source Code Pro',
    family: 'Source Code Pro, monospace',
    category: 'monospace',
    weights: [200, 300, 400, 500, 600, 700, 900],
    isWebFont: true,
    fallback: 'monospace',
  },
  // Display fonts
  {
    name: 'Bebas Neue',
    family: 'Bebas Neue, sans-serif',
    category: 'display',
    weights: [400],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Oswald',
    family: 'Oswald, sans-serif',
    category: 'display',
    weights: [200, 300, 400, 500, 600, 700],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Anton',
    family: 'Anton, sans-serif',
    category: 'display',
    weights: [400],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  {
    name: 'Archivo Black',
    family: 'Archivo Black, sans-serif',
    category: 'display',
    weights: [400],
    isWebFont: true,
    fallback: 'sans-serif',
  },
  // Handwriting fonts
  {
    name: 'Dancing Script',
    family: 'Dancing Script, cursive',
    category: 'handwriting',
    weights: [400, 500, 600, 700],
    isWebFont: true,
    fallback: 'cursive',
  },
  {
    name: 'Pacifico',
    family: 'Pacifico, cursive',
    category: 'handwriting',
    weights: [400],
    isWebFont: true,
    fallback: 'cursive',
  },
  {
    name: 'Caveat',
    family: 'Caveat, cursive',
    category: 'handwriting',
    weights: [400, 500, 600, 700],
    isWebFont: true,
    fallback: 'cursive',
  },
  {
    name: 'Kaushan Script',
    family: 'Kaushan Script, cursive',
    category: 'handwriting',
    weights: [400],
    isWebFont: true,
    fallback: 'cursive',
  },
];

// Built-in typography presets
export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and modern typography',
    settings: DEFAULT_TYPOGRAPHY,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated serif typography',
    settings: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: 'Playfair Display, serif',
      fontWeight: 400,
      letterSpacing: 0.02,
      lineHeight: 1.3,
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong and impactful',
    settings: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
      letterSpacing: -0.01,
      textTransform: 'uppercase',
    },
  },
  {
    id: 'display',
    name: 'Display',
    description: 'Eye-catching display font',
    settings: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: 'Bebas Neue, sans-serif',
      fontWeight: 400,
      letterSpacing: 0.05,
      textTransform: 'uppercase',
    },
  },
  {
    id: 'monospace',
    name: 'Monospace',
    description: 'Technical and precise',
    settings: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 400,
      letterSpacing: 0.01,
    },
  },
];