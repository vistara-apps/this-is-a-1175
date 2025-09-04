import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import VideoGenerator from './components/VideoGenerator'
import BrandKit from './components/BrandKit'
import Analytics from './components/Analytics'
import MediaLibrary from './components/MediaLibrary'
import { AppProvider } from './context/AppContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'create':
        return <VideoGenerator />
      case 'brandkit':
        return <BrandKit />
      case 'analytics':
        return <Analytics />
      case 'library':
        return <MediaLibrary />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <div className="flex">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
          <main className="flex-1 p-6 ml-64">
            <div className="max-w-6xl mx-auto">
              {renderCurrentView()}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  )
}

export default App