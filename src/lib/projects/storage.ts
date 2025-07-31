// Project storage utilities for localStorage and future cloud sync

import { ProjectData, ProjectTemplate } from '@/types/project'

const STORAGE_KEYS = {
  PROJECTS: 'typographer-projects',
  CURRENT_PROJECT: 'typographer-current-project',
  TEMPLATES: 'typographer-templates'
} as const

export class ProjectStorage {
  /**
   * Save projects to localStorage
   */
  static saveProjects(projects: ProjectData[]): void {
    try {
      const serialized = JSON.stringify(projects, this.dateReplacer)
      localStorage.setItem(STORAGE_KEYS.PROJECTS, serialized)
    } catch (error) {
      console.error('Failed to save projects:', error)
      throw new Error('Failed to save projects to storage')
    }
  }

  /**
   * Load projects from localStorage
   */
  static loadProjects(): ProjectData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS)
      if (!stored) return []
      
      const projects = JSON.parse(stored, this.dateReviver) as ProjectData[]
      return this.validateProjects(projects)
    } catch (error) {
      console.error('Failed to load projects:', error)
      return []
    }
  }

  /**
   * Save current project ID to localStorage
   */
  static saveCurrentProjectId(projectId: string | null): void {
    try {
      if (projectId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId)
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT)
      }
    } catch (error) {
      console.error('Failed to save current project ID:', error)
    }
  }

  /**
   * Load current project ID from localStorage
   */
  static loadCurrentProjectId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT)
    } catch (error) {
      console.error('Failed to load current project ID:', error)
      return null
    }
  }

  /**
   * Save project templates to localStorage
   */
  static saveTemplates(templates: ProjectTemplate[]): void {
    try {
      const serialized = JSON.stringify(templates)
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, serialized)
    } catch (error) {
      console.error('Failed to save templates:', error)
    }
  }

  /**
   * Load project templates from localStorage
   */
  static loadTemplates(): ProjectTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
      if (!stored) return this.getDefaultTemplates()
      
      return JSON.parse(stored) as ProjectTemplate[]
    } catch (error) {
      console.error('Failed to load templates:', error)
      return this.getDefaultTemplates()
    }
  }

  /**
   * Clear all project data (for reset/logout)
   */
  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  /**
   * Export project data as JSON string
   */
  static exportProject(project: ProjectData): string {
    return JSON.stringify({
      ...project,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
  }

  /**
   * Import project data from JSON string
   */
  static importProject(jsonString: string): ProjectData {
    try {
      const data = JSON.parse(jsonString, this.dateReviver)
      
      // Validate required fields
      if (!data.name || !data.textContent) {
        throw new Error('Invalid project data: missing required fields')
      }

      // Generate new ID for imported project
      const project: ProjectData = {
        ...data,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      return this.validateProject(project)
    } catch (error) {
      console.error('Failed to import project:', error)
      throw new Error('Invalid project file format')
    }
  }

  /**
   * Generate unique project ID
   */
  static generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Validate project data structure
   */
  private static validateProject(project: any): ProjectData {
    const required = ['id', 'name', 'textContent', 'typography', 'wordGap']
    const missing = required.filter(field => !(field in project))
    
    if (missing.length > 0) {
      throw new Error(`Invalid project: missing fields ${missing.join(', ')}`)
    }

    return {
      ...project,
      createdAt: project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt),
      updatedAt: project.updatedAt instanceof Date ? project.updatedAt : new Date(project.updatedAt)
    }
  }

  /**
   * Validate array of projects
   */
  private static validateProjects(projects: any[]): ProjectData[] {
    return projects
      .filter(project => {
        try {
          this.validateProject(project)
          return true
        } catch {
          return false
        }
      })
      .map(project => this.validateProject(project))
  }

  /**
   * JSON replacer for Date objects
   */
  private static dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() }
    }
    return value
  }

  /**
   * JSON reviver for Date objects
   */
  private static dateReviver(key: string, value: any): any {
    if (value && value.__type === 'Date') {
      return new Date(value.value)
    }
    return value
  }

  /**
   * Get default project templates
   */
  private static getDefaultTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'template_welcome',
        name: 'Welcome Template',
        description: 'A friendly welcome message with smooth animations',
        textContent: 'Welcome <0.5F1.5R0.8> to <0.3L1.0F0.6> Typographer <0.8R2.0B1.2>',
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 4,
          fontWeight: 700,
          letterSpacing: -0.02,
          lineHeight: 1.1,
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'transparent',
          textAlign: 'center',
          textDecoration: 'none',
          textTransform: 'none'
        },
        wordGap: 0,
        thumbnail: ''
      },
      {
        id: 'template_demo',
        name: 'Demo Animation',
        description: 'Showcase of different animation directions and speeds',
        textContent: 'Hello <0.3F1.2R0.9> Beautiful <0.5L1.8F0.4> World <0.8R2.0B1.2>',
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 4,
          fontWeight: 700,
          letterSpacing: -0.02,
          lineHeight: 1.1,
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'transparent',
          textAlign: 'center',
          textDecoration: 'none',
          textTransform: 'none'
        },
        wordGap: 0,
        thumbnail: ''
      },
      {
        id: 'template_minimal',
        name: 'Minimal Style',
        description: 'Clean and simple with subtle animations',
        textContent: 'Simple <0.4F1.0F0.4> and <0.4F1.0F0.4> Clean <0.4F1.0F0.4>',
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 3.5,
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.2,
          textColor: 'hsl(var(--muted-foreground))',
          backgroundColor: 'transparent',
          textAlign: 'center',
          textDecoration: 'none',
          textTransform: 'lowercase'
        },
        wordGap: 0.5,
        thumbnail: ''
      }
    ]
  }
}