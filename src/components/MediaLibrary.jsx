import React, { useState } from 'react'
import { Upload, Search, Filter, Grid, List, Play, Image, Music } from 'lucide-react'

const mediaItems = [
  { id: 1, name: 'Corporate Background', type: 'video', duration: '0:30', size: '25MB', tags: ['corporate', 'business'] },
  { id: 2, name: 'Modern Transition', type: 'video', duration: '0:05', size: '8MB', tags: ['transition', 'modern'] },
  { id: 3, name: 'Logo Animation', type: 'video', duration: '0:03', size: '5MB', tags: ['logo', 'animation'] },
  { id: 4, name: 'City Skyline', type: 'image', size: '2MB', tags: ['city', 'urban'] },
  { id: 5, name: 'Abstract Pattern', type: 'image', size: '1.5MB', tags: ['abstract', 'pattern'] },
  { id: 6, name: 'Upbeat Music', type: 'audio', duration: '2:15', size: '12MB', tags: ['upbeat', 'corporate'] },
]

function MediaLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'all' || item.type === selectedType
    return matchesSearch && matchesType
  })

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="w-6 h-6" />
      case 'image': return <Image className="w-6 h-6" />
      case 'audio': return <Music className="w-6 h-6" />
      default: return <Play className="w-6 h-6" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Media Library</h1>
          <p className="text-dark-text-muted mt-1">Manage your royalty-free media assets</p>
        </div>
        <button className="btn-primary inline-flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search media..."
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-muted focus:outline-none focus:border-primary"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-dark-text-muted hover:text-dark-text'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary text-white' : 'text-dark-text-muted hover:text-dark-text'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-text">
            Media Assets ({filteredItems.length})
          </h2>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="group bg-dark-bg rounded-lg p-4 hover:bg-dark-border/50 transition-colors cursor-pointer">
                <div className="w-full h-32 bg-gradient-to-r from-purple-500/20 to-cyan-400/20 rounded-lg flex items-center justify-center mb-3">
                  {getIcon(item.type)}
                </div>
                <h3 className="font-medium text-dark-text text-sm mb-1 truncate">{item.name}</h3>
                <div className="flex items-center justify-between text-xs text-dark-text-muted">
                  <span className="capitalize">{item.type}</span>
                  <span>{item.size}</span>
                </div>
                {item.duration && (
                  <div className="text-xs text-dark-text-muted mt-1">{item.duration}</div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-dark-surface rounded-full text-dark-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg hover:bg-dark-border/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-cyan-400/20 rounded-lg flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-text">{item.name}</h3>
                    <div className="flex items-center space-x-4 text-xs text-dark-text-muted">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.size}</span>
                      {item.duration && <span>{item.duration}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-dark-surface rounded-full text-dark-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-dark-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-text mb-2">Upload New Media</h3>
          <p className="text-dark-text-muted mb-4">
            Drag and drop files here, or click to browse
          </p>
          <button className="btn-primary">
            Choose Files
          </button>
          <p className="text-xs text-dark-text-muted mt-4">
            Supported formats: MP4, MOV, JPG, PNG, MP3, WAV (Max 100MB)
          </p>
        </div>
      </div>
    </div>
  )
}

export default MediaLibrary