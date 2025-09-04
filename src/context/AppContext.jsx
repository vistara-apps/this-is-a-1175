import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  user: {
    userId: 'user-123',
    email: 'user@example.com',
    subscriptionPlan: 'pro',
    createdAt: new Date()
  },
  projects: [
    {
      projectId: 'proj-1',
      userId: 'user-123',
      projectName: 'Marketing Campaign',
      videoConfig: { style: 'modern', duration: 30 },
      createdAt: new Date('2024-01-15')
    },
    {
      projectId: 'proj-2',
      userId: 'user-123',
      projectName: 'Product Demo',
      videoConfig: { style: 'minimal', duration: 60 },
      createdAt: new Date('2024-01-10')
    }
  ],
  videos: [
    {
      videoId: 'vid-1',
      projectId: 'proj-1',
      generationStatus: 'completed',
      videoUrl: '/sample-video.mp4',
      thumbnailUrl: '/sample-thumb.jpg',
      createdAt: new Date('2024-01-15')
    },
    {
      videoId: 'vid-2',
      projectId: 'proj-2',
      generationStatus: 'processing',
      videoUrl: null,
      thumbnailUrl: null,
      createdAt: new Date('2024-01-16')
    }
  ],
  brandKit: {
    brandKitId: 'brand-1',
    userId: 'user-123',
    logoUrl: '/logo.png',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    font: 'Inter'
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      }
    case 'ADD_VIDEO':
      return {
        ...state,
        videos: [...state.videos, action.payload]
      }
    case 'UPDATE_VIDEO_STATUS':
      return {
        ...state,
        videos: state.videos.map(video =>
          video.videoId === action.payload.videoId
            ? { ...video, ...action.payload }
            : video
        )
      }
    case 'UPDATE_BRAND_KIT':
      return {
        ...state,
        brandKit: { ...state.brandKit, ...action.payload }
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}