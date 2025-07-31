# Typographer - Animated Typography Tool

## Overview
Typographer is an interactive tool that combines text input with real-time animation preview. Users type text at the bottom of the screen and see animated typography at the top, with the ability to assign specific animations to individual words.

## Core Concept
- **Top Panel**: Animation preview canvas showing clean typography (without motion tags)
- **Bottom Panel**: Text input area with motion language editor
- **Interaction**: Type text with motion language tags → See live preview with animated words
- **Motion Language**: Custom syntax `<[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>` for defining animations

## Tech Stack

### Frontend Framework
- **Next.js 14+** with App Router
- **React 18+** with TypeScript
- **Tailwind CSS** for styling

### UI Components
- **shadcn/ui** component library
- **Resizable panels** for split-screen layout
- **Dark theme** as default

### State Management
- **Zustand** for local state management
- Simple, lightweight state container for:
  - Text content and cursor position
  - Animation assignments per word
  - Timeline state
  - UI preferences

### Animation Engine
- **Framer Motion** for smooth animations and transitions
- **CSS transforms** for performance-optimized animations
- **Web Animations API** as fallback for complex sequences

### Additional Libraries
- **React Hook Form** for text input management
- **Radix UI** (via shadcn/ui) for accessible components
- **Lucide React** for icons

## Architecture Components

### 1. Layout Structure
```
┌──┬─────────────────────────────────────┬──┐
│L │           Animation Preview         │R │
│e │              (Top Panel)            │i │
│f ├─────────────────────────────────────┤g │
│t │      Resizable Divider              │h │
│  ├─────────────────────────────────────┤t │
│S │           Text Input Area           │  │
│i │             (Bottom Panel)          │S │
│d │  [Text Input] [Animation Selector]  │i │
│e │                                     │d │
│b │                                     │e │
│a │                                     │b │
│r │                                     │a │
│  │                                     │r │
└──┴─────────────────────────────────────┴──┘
```

**Left Sidebar**: Project Management
- Project browser with thumbnails
- Create/Save/Load projects
- Recent projects list
- Project templates
- Export options

**Right Sidebar**: Typography & Motion Settings
- **Typography Tab**: Font family selection, size controls, letter spacing, line height, text colors, background options, typography presets
- **Motion Tab**: Interactive easing curve editor, unlimited global position controls, animation speed multipliers, motion presets, real-time settings application

### 2. Core Modules

#### State Management (Zustand Store)
```typescript
interface TypographerState {
  // Text and Animation Data
  textContent: string
  words: WordData[]
  currentWordIndex: number
  
  // Animation Control
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  
  // Project Management
  currentProject: ProjectData | null
  projects: ProjectData[]
  showProjectSidebar: boolean
  
  // Typography Settings
  typography: TypographySettings
  showTypographySidebar: boolean
  
  // Motion Settings
  motion: MotionSettings
  customEasingCurves: EasingCurve[]
  
  // UI State
  showAnimationSelector: boolean
  selectedWord: string | null
  
  // Actions
  updateText: (text: string) => void
  assignAnimation: (wordIndex: number, animation: AnimationType) => void
  playAnimation: () => void
  pauseAnimation: () => void
  seekTo: (time: number) => void
  
  // Project Actions
  createProject: (name: string) => void
  saveProject: () => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  
  // Typography Actions
  updateTypography: (settings: Partial<TypographySettings>) => void
  
  // Motion Actions
  updateMotion: (settings: Partial<MotionSettings>) => void
  createEasingCurve: (curve: EasingCurve) => void
  updateEasingCurve: (id: string, curve: Partial<EasingCurve>) => void
  deleteEasingCurve: (id: string) => void
}
```

#### Motion Language System
```typescript
enum AnimationType {
  MOTION_LANGUAGE = 'motionLanguage',
  FADE_IN = 'fadeIn', // fallback for non-motion words
}

enum MotionDirection {
  LEFT = 'L',
  RIGHT = 'R',
  FRONT = 'F', // toward viewer (scale up)
  BACK = 'B'   // away from viewer (scale down)
}

enum ZoomType {
  ZOOM_IN = 'ZI',
  ZOOM_OUT = 'ZO'
}

interface MotionConfig {
  entryDirection: MotionDirection
  speed: number // 0-99
  displayDuration: number // seconds (1-9)
  zoomType: ZoomType
  exitDirection: MotionDirection
}
```

#### Word Data Structure
```typescript
interface WordData {
  id: string
  text: string
  animation: AnimationType
  motionConfig?: MotionConfig // For motion language animations
  startTime: number
  duration: number
  easing: string
  position: { x: number; y: number }
  index: number
}
```

#### Project Data Structure
```typescript
interface ProjectData {
  id: string
  name: string
  description?: string
  textContent: string
  typography: TypographySettings
  wordGap: number
  createdAt: Date
  updatedAt: Date
  thumbnail?: string // Base64 or URL to preview image
}
```

#### Typography Settings
```typescript
interface TypographySettings {
  fontFamily: string
  fontSize: number // in rem
  fontWeight: number
  letterSpacing: number // in em
  lineHeight: number
  textColor: string
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right'
  textDecoration: 'none' | 'underline' | 'line-through'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
}
```

#### Motion Settings
```typescript
interface MotionSettings {
  globalInitialPosition: {
    left: number    // pixels from center for L direction
    right: number   // pixels from center for R direction
    front: number   // scale factor for F direction
    back: number    // scale factor for B direction
  }
  speedMultiplier: number // global speed multiplier (0.1 - 5.0)
  defaultEasing: string   // default easing curve ID
  gapBetweenWords: number // default gap in seconds
}

interface EasingCurve {
  id: string
  name: string
  description?: string
  type: 'built-in' | 'custom'
  cubicBezier: [number, number, number, number] // CSS cubic-bezier values
  preview?: string // SVG path for visual preview
}
```

## User Flow

### 1. Immediate Demo Experience
1. Application loads with demo text: `Hello <0.3F1.2R0.9> Beautiful <0.5L1.8F0.4> World <0.8R2.0B1.2>`
2. Animation starts automatically with loop enabled
3. Words appear sequentially in center of screen, each fully disappearing before next
4. Clean, professional preview without backgrounds or UI clutter

### 2. Motion Language Text Entry
1. User clicks in text input area
2. User types text with motion language syntax: `Hello <0.3F1.2R0.9> World <0.5L1.8F0.4>`
3. Preview shows clean text "Hello World" with motion indicators
4. Timeline automatically calculates timing based on motion parameters
5. Animation auto-starts when new content is added

### 3. Motion Language Syntax
**Format:** `<[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>`
- **EntrySpeed**: 0.1-10.0 (seconds for entry animation)
- **EntryDirection**: L/R/F/B (Left, Right, Front, Back entry)
- **DisplayDuration**: 0.1-30.0 (seconds displayed on screen)
- **ExitDirection**: L/R/F/B (Left, Right, Front, Back exit)
- **ExitSpeed**: 0.1-10.0 (seconds for exit animation)

**Examples:**
- `<0.3F1.2R0.9>` = Front entry (0.3s), display 1.2s, exit right (0.9s)
- `<0.5L1.8F0.4>` = Left entry (0.5s), display 1.8s, exit front (0.4s)

### 4. Real-time Preview
1. Clean text appears in preview (motion tags invisible)
2. Words with motion language get highlighted with indicators
3. Hover over words to see motion parameters
4. Timeline updates automatically with calculated timing

## Technical Implementation

### 1. Component Structure
```
App
├── TypographerLayout
│   ├── Header (with Controls)
│   ├── LeftSidebar (Project Management)
│   │   ├── ProjectBrowser
│   │   ├── ProjectCreator
│   │   ├── RecentProjects
│   │   └── ExportPanel
│   ├── MainContent
│   │   └── ResizablePanels
│   │       ├── AnimationPreview
│   │       │   ├── MotionPreview
│   │       │   └── Timeline (with hover gap control)
│   │       └── TextInputPanel
│   │           └── TextEditor (with inline instructions)
│   └── RightSidebar (Typography & Motion Settings)
│       ├── TypographyTab
│       │   ├── FontSelector
│       │   ├── SizeControls
│       │   ├── SpacingControls
│       │   ├── ColorPicker
│       │   └── TextStyleOptions
│       └── MotionTab
│           ├── EasingCurveEditor
│           ├── GlobalPositionControls
│           ├── SpeedMultiplierControl
│           └── DefaultGapControl
```

### 2. Animation System
- **Precise timing**: Individual entry and exit speeds for each word
- **Sequential timing**: Words animate one after another with configurable gaps
- **Gap control**: Support for negative gaps (overlapping) and positive gaps (delays)
- **Complete exit animations**: Words fully disappear after their display time
- **Perfect centering**: Words are precisely centered during all animation phases
- **Advanced easing curves**: Phase-specific cubic and quartic easing for professional feel
- **Pause state preservation**: Words remain visible at current animation state when paused
- **Optimized travel distance**: Reduced movement range for subtle, refined animations
- **Customizable motion parameters**: Global initial position controls and custom easing curves
- **Visual easing editor**: Interactive curve editor for creating professional animation feels
- **Auto-loop**: Continuous playback with seamless restart
- **Clean preview**: Transparent background with centered word positioning

### 3. Motion Language Processing Pipeline
1. **Parse**: Extract motion language tags and clean text using improved regex
2. **Validate**: Check motion syntax for 5-component format correctness  
3. **Generate**: Create WordData with entry/exit speeds and display duration
4. **Calculate**: Compute timing with configurable gaps (including negative)
5. **Render**: Display clean text with perfect centering and phase-based animations

## Features

### Core Features (MVP)
- [x] Split-screen resizable layout
- [x] Motion language text editor with real-time parsing
- [x] Clean text preview (motion tags invisible)
- [x] Motion language syntax validation (updated format)
- [x] Precise timing based on individual entry/exit speeds
- [x] Dark theme UI
- [x] **Sequential word animation with complete disappearing**
- [x] **Auto-loop functionality for continuous playback**
- [x] **Clean animation preview without backgrounds**
- [x] **Perfect centered word positioning with large text**
- [x] **Demo content with auto-start**
- [x] **Header-based media controls (centralized)**
- [x] **Gap control with negative values for overlapping**
- [x] **Simplified motion language format**
- [x] **Inline instruction display**
- [x] **Left sidebar project management system**
- [x] **Project creation, saving, and loading**
- [x] **Project templates and export functionality**
- [x] **Right sidebar typography system**
- [x] **Google Fonts integration with 26 professional fonts**
- [x] **Real-time typography controls and live preview**
- [x] **Smooth professional animations without scale effects**

### Advanced Features ✅ COMPLETED
- [x] **Custom easing curve editor** - Interactive Bezier curve editor with visual preview
- [x] **Global motion controls** - Unlimited initial position settings and speed multipliers
- [x] **Advanced motion settings** - Tabbed interface for typography vs motion with real-time application

### Future Features
- [ ] Export to video/GIF
- [ ] Animation templates/presets
- [ ] Collaborative editing
- [ ] Voice-to-text input
- [ ] Advanced timeline scrubbing
- [ ] Keyframe editing


### Recent Enhancements (Phase 4+ Completed)
- [x] **Words remain visible during pause** - Fixed disappearing words issue
- [x] **Reduced travel distance** - Left/Right animations now use ±100px instead of ±200px
- [x] **Enhanced easing curves** - Added professional cubic and quartic easing options
- [x] **Phase-specific easing** - Entry, display, and exit phases use optimized curves
- [x] **Compact header design** - Inline Motion Format instructions and removed stats
- [x] **Optimized text input space** - Reduced paddings for maximum input area

### Phase 5 Sidebar Implementation (Completed - January 2025)
- [x] **Left Sidebar Project Management** - Complete project browser and management system
- [x] **Project Data Architecture** - Full project storage with localStorage integration
- [x] **Project CRUD Operations** - Create, read, update, delete projects with validation
- [x] **Professional UI Components** - Grid/list views, search, filtering, templates
- [x] **Export System** - JSON and text export with future video/GIF support
- [x] **Layout Integration** - Proper flex-based layout without overlays
- [x] **App Title Relocation** - Moved Typographer title to sidebar header

### Phase 5.2 Typography System (Completed - January 2025)
- [x] **Right Sidebar Typography Controls** - Complete typography management system
- [x] **Google Fonts Integration** - 26 professional fonts across all categories
- [x] **Real-time Typography Application** - Live preview in animation canvas
- [x] **Comprehensive Font Controls** - Size, spacing, style, weight, decoration, alignment
- [x] **Advanced Color System** - Text and background colors with transparency support
- [x] **Typography Presets** - Built-in and custom presets with import/export
- [x] **Modal Font Selection** - Clean, space-efficient font picker interface
- [x] **Streamlined UI** - Removed redundant previews for focused live preview experience

### Phase 5.3 Animation Quality Improvements (Completed - January 2025)
- [x] **Removed Scale Animations** - Eliminated jarring POP effect from word animations
- [x] **Smooth Opacity Transitions** - Clean fade in/out without scaling distortion
- [x] **Pure Position Animation** - Only opacity and position changes for professional feel
- [x] **Performance Optimization** - Fewer transform properties for better animation performance

### Phase 6 Advanced Motion Controls (Completed - January 2025)
- [x] **Motion Settings System** - Complete motion data architecture with Zustand store integration
- [x] **Tabbed Right Sidebar** - Typography and Motion tabs with smooth state management
- [x] **Global Position Controls** - Unlimited position settings for L/R/F/B directions with intelligent validation
- [x] **Interactive Easing Curve Editor** - Visual Bezier curve editor with real-time preview and custom curve creation
- [x] **Professional Easing Library** - 8 built-in curves plus unlimited custom curve management
- [x] **Speed Multiplier System** - Global animation speed control affecting all animations simultaneously
- [x] **Motion Presets** - Built-in motion profiles (Subtle, Dynamic, Dramatic) with instant application
- [x] **Real-time Integration** - All motion settings apply instantly to animation preview with live feedback
- [x] **Unlimited Input System** - Removed all hardcoded limits for maximum creative flexibility
- [x] **Cross-store Synchronization** - Motion settings sync with typography and project stores
- [x] **Text Centering Fix** - Resolved animation centering issues with proper transform handling

## File Structure
```
src/
├── app/
│   ├── page.tsx                 # Main application page
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css             # Global styles and theme
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── animation/
│   │   ├── AnimationPreview.tsx
│   │   ├── WordRenderer.tsx
│   │   └── Timeline.tsx
│   ├── editor/
│   │   ├── TextEditor.tsx
│   │   ├── AnimationSelector.tsx
│   │   └── Controls.tsx
│   ├── projects/
│   │   ├── ProjectBrowser.tsx
│   │   ├── ProjectCreator.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── RecentProjects.tsx
│   │   └── ExportPanel.tsx
  │   ├── typography/
  │   │   ├── FontSelector.tsx
  │   │   ├── SizeControls.tsx
  │   │   ├── SpacingControls.tsx
  │   │   ├── ColorPicker.tsx
  │   │   ├── TextStyleOptions.tsx
  │   │   └── TypographyPresets.tsx
  │   ├── motion/
  │   │   ├── EasingCurveEditor.tsx
  │   │   ├── GlobalPositionControls.tsx
  │   │   ├── SpeedMultiplierControl.tsx
  │   │   └── DefaultGapControl.tsx
│   ├── sidebar/
│   │   ├── LeftSidebar.tsx
│   │   └── RightSidebar.tsx
│   └── layout/
│       └── TypographerLayout.tsx
├── lib/
│   ├── store/
│   │   ├── typographer-store.ts # Main Zustand store
│   │   ├── project-store.ts     # Project management store
│   │   ├── typography-store.ts  # Typography settings store
│   │   └── motion-store.ts      # Motion settings and easing store
│   ├── animations/
│   │   ├── types.ts
│   │   ├── presets.ts
│   │   └── engine.ts
│   ├── projects/
│   │   ├── project-manager.ts   # Project CRUD operations
│   │   ├── storage.ts          # Local storage utilities
│   │   └── export.ts           # Export functionality
│   └── utils/
│       ├── motion-parser.ts     # Motion language parser
│       ├── timing-calculator.ts
│       ├── typography-utils.ts  # Font loading, validation
│       ├── motion-utils.ts      # Easing curve utilities
│       └── cn.ts
└── types/
    ├── typographer.ts          # Animation type definitions
    ├── project.ts             # Project management types
    ├── typography.ts          # Typography settings types
    └── motion.ts              # Motion settings and easing types
```

## Development Phases

### Phase 1: Foundation (Week 1)
- Set up Next.js project with TypeScript
- Install and configure shadcn/ui, Framer Motion, Zustand
- Create basic layout with resizable panels
- Implement dark theme

### Phase 2: Core Functionality (Week 2)
- Build text input system
- Create animation selector with backslash trigger
- Implement basic animation types
- Connect state management

### Phase 3: Animation Engine (Week 3)
- Build animation preview component
- Implement auto-timing system
- Add timeline and playback controls
- Optimize performance

### Phase 4: Polish & Enhancement (Week 4)
- Refine animations and easing
- Add export functionality
- Improve UX and accessibility
- Testing and bug fixes

## Performance Considerations
- **Virtualization**: Only render visible animations
- **Throttling**: Limit animation updates during typing
- **Optimization**: Use CSS transforms for smooth 60fps animations
- **Memory**: Cleanup animation instances on text changes
- **Responsive**: Adapt to different screen sizes

## Accessibility
- Keyboard navigation for all features
- Screen reader support for animation descriptions
- High contrast mode compatibility
- Reduced motion preferences respected
- Focus management for modal interfaces