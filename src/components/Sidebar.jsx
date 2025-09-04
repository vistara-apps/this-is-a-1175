import React from 'react'
import { Home, Video, Palette, BarChart3, Image, Settings } from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'create', label: 'Create Video', icon: Video },
  { id: 'brandkit', label: 'Brand Kit', icon: Palette },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'library', label: 'Media Library', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-dark-surface border-r border-dark-border">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-dark-text-muted hover:text-dark-text hover:bg-dark-bg'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-cyan-400/20 rounded-lg border border-purple-500/30">
          <h3 className="text-sm font-semibold text-dark-text mb-2">Upgrade to Pro</h3>
          <p className="text-xs text-dark-text-muted mb-3">Unlock unlimited video generation and premium templates.</p>
          <button className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-xs font-medium py-2 rounded-md hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar