# Typographer - Animated Typography Tool

<div align="center">
  <img src="public/window.svg" alt="Typographer Logo" width="120" height="120" />
  
  **Create stunning animated typography with ease**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11+-pink?style=flat-square&logo=framer)](https://www.framer.com/motion/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3+-teal?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

## ✨ Features

### 🎬 **Motion Language System**
- **Custom Syntax**: Use `<0.3F1.2R0.9>` format to define precise animations
- **Smart Text Grouping**: Consecutive words without motion tags are grouped as single text layers
- **Real-time Preview**: See animations instantly as you type
- **Dynamic Duration**: Exports match actual animation length, not fixed timing

### 🎨 **Typography Controls**
- **26 Professional Fonts**: Curated Google Fonts across all categories
- **Complete Style Control**: Size, weight, spacing, alignment, decoration
- **Color System**: Text and background colors with transparency support
- **Live Preview**: All changes apply instantly to the animation canvas

### ⚡ **Advanced Motion Settings**
- **Interactive Easing Editor**: Visual Bezier curve editor with real-time preview
- **Global Position Controls**: Unlimited positioning for all animation directions
- **Speed Multipliers**: Control overall animation speed (0.1x - 5.0x)
- **Motion Presets**: Built-in profiles (Subtle, Dynamic, Dramatic)
- **Custom Curves**: Create and manage unlimited custom easing curves

### 📁 **Project Management**
- **Complete CRUD**: Create, save, load, and delete projects
- **Local Storage**: Projects persist between sessions
- **Project Templates**: Built-in templates for quick starts
- **Grid/List Views**: Flexible project browsing
- **Search & Filter**: Find projects quickly

### 📤 **Professional Export**
- **Lottie JSON**: Web and mobile-ready animations with proper duration
- **High-Quality GIFs**: Real GIF files with correct aspect ratios and transformations
- **MP4 Video**: Canvas-based recording with actual animation timing
- **Multiple Formats**: 16:9, 9:16, 1:1, and custom dimensions
- **Screen Capture**: Advanced capture method for perfect quality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/typographer.git
cd typographer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### First Animation

1. **Start typing** in the bottom text editor
2. **Add motion language**: `Hello <0.3F1.2R0.9> World <0.5L1.8F0.4>`
3. **See live preview** in the top canvas
4. **Customize typography** in the right sidebar
5. **Export your animation** from the left sidebar

## 📖 Motion Language Guide

### Syntax Format
```
<[EntrySpeed][EntryDirection][DisplayDuration][ExitDirection][ExitSpeed]>
```

### Parameters
- **EntrySpeed**: `0.1-10.0` seconds for entry animation
- **EntryDirection**: `L/R/F/B` (Left, Right, Front/scale up, Back/scale down)
- **DisplayDuration**: `0.1-30.0` seconds displayed on screen
- **ExitDirection**: `L/R/F/B` (Left, Right, Front, Back)
- **ExitSpeed**: `0.1-10.0` seconds for exit animation

### Examples

```
Hello Beautiful <0.3F1.2R0.9> Beautiful <0.5L1.8F0.4> World <0.8R2.0B1.2>
```

This creates:
1. **"Hello Beautiful"** - enters from front (scale) in 0.3s, displays 1.2s, exits right in 0.9s
2. **"Beautiful"** - enters from left in 0.5s, displays 1.8s, exits front in 0.4s  
3. **"World"** - enters from right in 0.8s, displays 2.0s, exits back in 1.2s

### Text Grouping
- Words **without motion tags** are grouped together as single text layers
- Motion tags **split text** into separate animated elements
- Perfect for creating **natural phrase animations**

## 🎛️ Interface Overview

### Layout
```
┌──┬─────────────────────────────────────┬──┐
│L │           Animation Preview         │R │
│e │              (Top Panel)            │i │
│f ├─────────────────────────────────────┤g │
│t │      Resizable Divider              │h │
│  ├─────────────────────────────────────┤t │
│S │           Text Input Area           │  │
│i │             (Bottom Panel)          │S │
│d │                                     │i │
│e │                                     │d │
│b │                                     │e │
│a │                                     │b │
│r │                                     │a │
│  │                                     │r │
└──┴─────────────────────────────────────┴──┘
```

### Left Sidebar - Project Management
- **Project Browser**: Grid/list view with thumbnails
- **Create Projects**: New project wizard
- **Templates**: Built-in animation templates
- **Export Panel**: Lottie, GIF, and video export
- **Recent Projects**: Quick access to recent work

### Right Sidebar - Typography & Motion
- **Typography Tab**: 
  - Font selection (26 professional fonts)
  - Size, weight, spacing controls
  - Color and background settings
  - Text alignment and decoration
  - Typography presets

- **Motion Tab**:
  - Interactive easing curve editor
  - Global position controls
  - Speed multiplier settings
  - Motion presets
  - Custom curve management

### Center Canvas
- **Clean Preview**: Animation display without UI clutter
- **Real-time Updates**: Instant feedback on all changes
- **Centered Display**: Professional presentation view
- **Transparent Background**: Clean export-ready preview

## 🛠️ Technical Architecture

### Frontend Stack
- **Next.js 14+**: App Router with TypeScript
- **React 18+**: Modern React with hooks
- **Framer Motion**: Smooth, performant animations
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library

### State Management
- **Zustand**: Lightweight state management
- **Stores**: Separate stores for typography, motion, projects
- **Persistence**: Local storage integration
- **Real-time Sync**: Cross-store data synchronization

### Animation System
- **Precise Timing**: Individual entry/exit speeds
- **Sequential Animation**: Words animate one after another
- **Gap Control**: Positive and negative timing gaps
- **Complete Exits**: Words fully disappear after display time
- **Perfect Centering**: Consistent positioning throughout animation
- **Professional Easing**: Phase-specific cubic and quartic curves

### Export System
- **Lottie Converter**: JSON export for web/mobile
- **GIF Encoder**: Real GIF files with proper encoding
- **Video Recorder**: Canvas-based MP4 recording
- **Screen Capture**: WebRTC-based high-quality capture
- **Multi-format**: Flexible aspect ratios and dimensions

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles and theme
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── animation/         # Animation preview components
│   │   ├── MotionPreview.tsx
│   │   ├── LottiePreview.tsx
│   │   └── Timeline.tsx
│   ├── editor/            # Text editing components
│   │   ├── TextEditor.tsx
│   │   ├── AnimationSelector.tsx
│   │   └── Controls.tsx
│   ├── projects/          # Project management
│   │   ├── ProjectBrowser.tsx
│   │   ├── ProjectCreator.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── RecentProjects.tsx
│   │   └── ExportPanel.tsx
│   ├── typography/        # Typography controls
│   │   ├── FontSelector.tsx
│   │   ├── SizeControls.tsx
│   │   ├── SpacingControls.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── TextStyleOptions.tsx
│   │   └── TypographyPresets.tsx
│   ├── motion/            # Motion controls
│   │   ├── EasingCurveEditor.tsx
│   │   ├── GlobalPositionControls.tsx
│   │   └── MotionPresets.tsx
│   ├── sidebar/           # Layout sidebars
│   │   ├── LeftSidebar.tsx
│   │   └── RightSidebar.tsx
│   └── layout/
│       └── TypographerLayout.tsx
├── lib/
│   ├── store/             # Zustand stores
│   │   ├── typographer-store.ts
│   │   ├── project-store.ts
│   │   ├── typography-store.ts
│   │   └── motion-store.ts
│   ├── animations/        # Animation engine
│   │   ├── types.ts
│   │   ├── presets.ts
│   │   └── engine.ts
│   ├── export/            # Export functionality
│   │   ├── lottie-converter.ts
│   │   └── video-recorder.ts
│   ├── projects/          # Project management
│   │   └── storage.ts
│   └── utils/             # Utilities
│       ├── motion-parser.ts
│       ├── timing-calculator.ts
│       ├── typography-utils.ts
│       └── motion-utils.ts
└── types/                 # TypeScript definitions
    ├── typographer.ts
    ├── project.ts
    ├── typography.ts
    └── motion.ts
```

## 🎯 Usage Examples

### Basic Animation
```
Welcome to Typographer
```
*Single text layer with default fade-in animation*

### Sequential Words
```
Hello <0.5F1.0R0.5> World <0.3L1.5F0.8>
```
*"Hello" and "World" animate separately with custom timing*

### Grouped Text
```
Hello Beautiful <0.3F1.2R0.9> Amazing <0.5L1.8F0.4> World
```
*"Hello Beautiful" and "World" as grouped layers, "Amazing" separate*

### Complex Sequence
```
Welcome <0.2F0.8R0.3> to the <0.4L1.5F0.6> Future <0.6R2.0B0.8> of Design <0.3F1.0L0.5>
```
*Multi-layered animation with varied timing and directions*

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Environment Variables
```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Custom domain
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style
- Add TypeScript types for new features
- Test animations across different browsers
- Update documentation for new motion language features
- Ensure exports work correctly

## 📋 Roadmap

### Phase 7 - Advanced Features
- [ ] **Keyframe Editor**: Visual timeline with drag-and-drop keyframes
- [ ] **Animation Templates**: Pre-built animation sequences
- [ ] **Voice-to-Text**: Audio input for text content
- [ ] **Collaborative Editing**: Real-time collaboration features
- [ ] **Advanced Timeline**: Scrubbing and precise timing controls

### Phase 8 - Integration
- [ ] **API Integration**: RESTful API for headless usage
- [ ] **Plugin System**: Extensible architecture for custom animations
- [ ] **Cloud Sync**: Cross-device project synchronization
- [ ] **Team Workspaces**: Shared project management
- [ ] **Version Control**: Project history and versioning

### Phase 9 - Enterprise
- [ ] **Brand Kits**: Corporate color and font management
- [ ] **Batch Export**: Multiple project export automation
- [ ] **Analytics**: Usage tracking and optimization insights
- [ ] **Custom Domains**: White-label deployment options
- [ ] **Enterprise SSO**: Authentication integration

## 🐛 Known Issues

- **html2canvas limitations**: Some CSS transforms may not capture perfectly in GIF fallback mode
- **Large exports**: Very long animations may take time to process
- **Font loading**: Custom fonts may need time to load before export

## 💡 Tips & Tricks

### Performance
- **Shorter animations** export faster than longer ones
- **Fewer words** in motion language result in smoother playback
- **Simple easing curves** perform better than complex custom curves

### Quality
- **Use screen capture** for highest quality GIF exports (accept browser permission)
- **16:9 aspect ratio** works best for most social media platforms
- **Transparent backgrounds** work well for overlay animations

### Workflow
- **Start with templates** for common animation patterns
- **Use typography presets** for consistent styling
- **Save variations** as separate projects for A/B testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** for smooth animation capabilities
- **shadcn/ui** for beautiful, accessible components
- **Google Fonts** for the typography collection
- **gif.js** for GIF encoding functionality
- **html2canvas** for DOM capture capabilities

## 📞 Support

- **Documentation**: Check this README and inline help
- **Issues**: [GitHub Issues](https://github.com/yourusername/typographer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/typographer/discussions)
- **Email**: support@typographer.app

---

<div align="center">
  <p>Made with ❤️ for creators who love animated typography</p>
  <p>
    <a href="#typographer---animated-typography-tool">Back to Top</a>
  </p>
</div>