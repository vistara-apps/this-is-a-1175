import React from 'react'
import { useApp } from '../context/AppContext'
import { Play, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import FeatureCard from './FeatureCard'

function Dashboard() {
  const { state } = useApp()
  
  const completedVideos = state.videos.filter(v => v.generationStatus === 'completed').length
  const processingVideos = state.videos.filter(v => v.generationStatus === 'processing').length
  
  const stats = [
    { label: 'Total Projects', value: state.projects.length, icon: Play, color: 'text-blue-400' },
    { label: 'Videos Generated', value: completedVideos, icon: CheckCircle, color: 'text-green-400' },
    { label: 'In Progress', value: processingVideos, icon: Clock, color: 'text-yellow-400' },
    { label: 'Engagement Rate', value: '84%', icon: TrendingUp, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
          <p className="text-dark-text-muted mt-1">Welcome back! Here's what's happening with your videos.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-text mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {state.projects.slice(0, 3).map((project) => (
              <div key={project.projectId} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-dark-text">{project.projectName}</h3>
                    <p className="text-xs text-dark-text-muted">{project.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-dark-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              title="Create Video"
              description="Generate new video with AI"
              icon={Play}
              variant="default"
              onClick={() => {}}
            />
            <FeatureCard
              title="Upload Assets"
              description="Add to media library"
              icon={Play}
              variant="default"
              onClick={() => {}}
            />
            <FeatureCard
              title="View Analytics"
              description="Check performance"
              icon={TrendingUp}
              variant="default"
              onClick={() => {}}
            />
            <FeatureCard
              title="Brand Kit"
              description="Customize branding"
              icon={Palette}
              variant="default"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Featured Video */}
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Featured Creation</h2>
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-purple-500/20 to-cyan-400/20 p-8">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-dark-text mb-2">AI-Generated Marketing Video</h3>
            <p className="text-dark-text-muted mb-4">Created with advanced AI styling and custom branding elements</p>
            <div className="flex items-center space-x-4">
              <button className="bg-white text-dark-bg px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Watch Video
              </button>
              <button className="text-dark-text border border-dark-border px-4 py-2 rounded-lg hover:bg-dark-border transition-colors">
                View Project
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg opacity-20"></div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard