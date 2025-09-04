import React from 'react'
import { Bell, Search, User } from 'lucide-react'

function Navbar() {
  return (
    <nav className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-dark-text">VidSynth Automator</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-dark-bg border border-dark-border rounded-md pl-10 pr-4 py-2 text-sm text-dark-text placeholder-dark-text-muted focus:outline-none focus:border-primary"
            />
          </div>
          
          <button className="relative p-2 text-dark-text-muted hover:text-dark-text transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-dark-text">John Doe</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar