// Project management type definitions

export interface ProjectData {
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

export interface TypographySettings {
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

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  textContent: string
  typography: TypographySettings
  wordGap: number
  thumbnail?: string
}

export interface ProjectFilter {
  searchTerm?: string
  sortBy: 'name' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
  showTemplates?: boolean
}

export interface ProjectViewMode {
  type: 'grid' | 'list'
  thumbnailSize: 'small' | 'medium' | 'large'
}

// Project store interface
export interface ProjectStore {
  // State
  projects: ProjectData[]
  currentProject: ProjectData | null
  templates: ProjectTemplate[]
  isLoading: boolean
  error: string | null
  filter: ProjectFilter
  viewMode: ProjectViewMode
  showLeftSidebar: boolean
  
  // Actions
  createProject: (name: string, description?: string) => Promise<ProjectData>
  saveProject: (project?: ProjectData) => Promise<void>
  loadProject: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  duplicateProject: (id: string) => Promise<ProjectData>
  
  // Project management
  updateProject: (id: string, updates: Partial<ProjectData>) => Promise<void>
  generateThumbnail: (project: ProjectData) => Promise<string>
  
  // UI state
  setFilter: (filter: Partial<ProjectFilter>) => void
  setViewMode: (viewMode: Partial<ProjectViewMode>) => void
  toggleLeftSidebar: () => void
  
  // Storage
  loadProjects: () => Promise<void>
  exportProject: (id: string, format: 'json' | 'text') => Promise<string>
  importProject: (data: string) => Promise<ProjectData>
}

// Default values
export const defaultTypographySettings: TypographySettings = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 4, // 4rem for large animation text
  fontWeight: 700,
  letterSpacing: -0.02,
  lineHeight: 1.1,
  textColor: 'hsl(var(--foreground))',
  backgroundColor: 'transparent',
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'none'
}

export const defaultProjectFilter: ProjectFilter = {
  searchTerm: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  showTemplates: false
}

export const defaultViewMode: ProjectViewMode = {
  type: 'grid',
  thumbnailSize: 'medium'
}