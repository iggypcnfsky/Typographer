// Project management store using Zustand

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { 
  ProjectData, 
  ProjectStore, 
  ProjectFilter, 
  ProjectViewMode,
  defaultProjectFilter,
  defaultViewMode,
  defaultTypographySettings
} from '@/types/project'
import { ProjectStorage } from '@/lib/projects/storage'

export const useProjectStore = create<ProjectStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      projects: [],
      currentProject: null,
      templates: [],
      isLoading: false,
      error: null,
      filter: defaultProjectFilter,
      viewMode: defaultViewMode,
      showLeftSidebar: true, // Open by default

      // Project CRUD operations
      createProject: async (name: string, description?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const newProject: ProjectData = {
            id: ProjectStorage.generateId(),
            name: name.trim(),
            description: description?.trim(),
            textContent: '',
            typography: { ...defaultTypographySettings },
            wordGap: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            thumbnail: ''
          }

          const state = get()
          const updatedProjects = [...state.projects, newProject]
          
          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)
          ProjectStorage.saveCurrentProjectId(newProject.id)

          set({
            projects: updatedProjects,
            currentProject: newProject,
            isLoading: false
          })

          return newProject
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      saveProject: async (project?: ProjectData) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const projectToSave = project || state.currentProject
          
          if (!projectToSave) {
            throw new Error('No project to save')
          }

          const updatedProject = {
            ...projectToSave,
            updatedAt: new Date()
          }

          const updatedProjects = state.projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          )

          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)

          set({
            projects: updatedProjects,
            currentProject: updatedProject,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      loadProject: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const project = state.projects.find(p => p.id === id)
          
          if (!project) {
            throw new Error('Project not found')
          }

          ProjectStorage.saveCurrentProjectId(id)
          
          set({
            currentProject: project,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const updatedProjects = state.projects.filter(p => p.id !== id)
          
          // If deleting current project, clear it
          const updatedCurrentProject = state.currentProject?.id === id 
            ? null 
            : state.currentProject

          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)
          if (updatedCurrentProject?.id !== state.currentProject?.id) {
            ProjectStorage.saveCurrentProjectId(updatedCurrentProject?.id || null)
          }

          set({
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      duplicateProject: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const originalProject = state.projects.find(p => p.id === id)
          
          if (!originalProject) {
            throw new Error('Project not found')
          }

          const duplicatedProject: ProjectData = {
            ...originalProject,
            id: ProjectStorage.generateId(),
            name: `${originalProject.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date()
          }

          const updatedProjects = [...state.projects, duplicatedProject]
          
          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)

          set({
            projects: updatedProjects,
            isLoading: false
          })

          return duplicatedProject
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      updateProject: async (id: string, updates: Partial<ProjectData>) => {
        set({ isLoading: true, error: null })
        
        try {
          const state = get()
          const projectIndex = state.projects.findIndex(p => p.id === id)
          
          if (projectIndex === -1) {
            throw new Error('Project not found')
          }

          const updatedProject = {
            ...state.projects[projectIndex],
            ...updates,
            updatedAt: new Date()
          }

          const updatedProjects = [...state.projects]
          updatedProjects[projectIndex] = updatedProject

          // Update current project if it's the one being updated
          const updatedCurrentProject = state.currentProject?.id === id 
            ? updatedProject 
            : state.currentProject

          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)

          set({
            projects: updatedProjects,
            currentProject: updatedCurrentProject,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      generateThumbnail: async (project: ProjectData) => {
        // TODO: Implement thumbnail generation from animation canvas
        // For now, return a placeholder
        return `data:image/svg+xml,${encodeURIComponent(`
          <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f1f5f9"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                  font-family="Arial" font-size="14" fill="#64748b">
              ${project.name}
            </text>
          </svg>
        `)}`
      },

      // UI state management
      setFilter: (filter: Partial<ProjectFilter>) => {
        const state = get()
        set({ filter: { ...state.filter, ...filter } })
      },

      setViewMode: (viewMode: Partial<ProjectViewMode>) => {
        const state = get()
        set({ viewMode: { ...state.viewMode, ...viewMode } })
      },

      toggleLeftSidebar: () => {
        const state = get()
        set({ showLeftSidebar: !state.showLeftSidebar })
      },

      // Storage operations
      loadProjects: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const projects = ProjectStorage.loadProjects()
          const templates = ProjectStorage.loadTemplates()
          const currentProjectId = ProjectStorage.loadCurrentProjectId()
          
          const currentProject = currentProjectId 
            ? projects.find(p => p.id === currentProjectId) || null
            : null

          set({
            projects,
            templates,
            currentProject,
            isLoading: false
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load projects'
          set({ error: errorMessage, isLoading: false })
        }
      },

      exportProject: async (id: string, format: 'json' | 'text' | 'lottie' | 'gif' | 'mp4') => {
        const state = get()
        const project = state.projects.find(p => p.id === id)
        
        if (!project) {
          throw new Error('Project not found')
        }

        if (format === 'json') {
          return ProjectStorage.exportProject(project)
        } else if (format === 'text') {
          // Export as plain text with motion language
          return project.textContent
        } else {
          // For video formats, return the project data for processing by ExportPanel
          return JSON.stringify({
            project,
            format,
            timestamp: Date.now()
          })
        }
      },

      importProject: async (data: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const importedProject = ProjectStorage.importProject(data)
          const state = get()
          const updatedProjects = [...state.projects, importedProject]
          
          // Save to storage
          ProjectStorage.saveProjects(updatedProjects)

          set({
            projects: updatedProjects,
            isLoading: false
          })

          return importedProject
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to import project'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      }
    })),
    {
      name: 'project-store'
    }
  )
)

// Selectors for easier access
export const useProjects = () => useProjectStore(state => state.projects)
export const useCurrentProject = () => useProjectStore(state => state.currentProject)
export const useProjectTemplates = () => useProjectStore(state => state.templates)
export const useProjectLoading = () => useProjectStore(state => state.isLoading)
export const useProjectError = () => useProjectStore(state => state.error)
export const useProjectFilter = () => useProjectStore(state => state.filter)
export const useProjectViewMode = () => useProjectStore(state => state.viewMode)
export const useLeftSidebar = () => useProjectStore(state => state.showLeftSidebar)