import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Eye, Users, Play, ThumbsUp } from 'lucide-react'
import AnalyticsChart from './AnalyticsChart'

const viewsData = [
  { name: 'Jan', views: 4000, engagement: 2400 },
  { name: 'Feb', views: 3000, engagement: 1398 },
  { name: 'Mar', views: 9000, engagement: 9800 },
  { name: 'Apr', views: 2780, engagement: 3908 },
  { name: 'May', views: 1890, engagement: 4800 },
  { name: 'Jun', views: 2390, engagement: 3800 },
]

const topVideos = [
  { title: 'Product Launch Video', views: 15420, engagement: '8.2%' },
  { title: 'Tutorial Series Ep 1', views: 12890, engagement: '7.1%' },
  { title: 'Behind the Scenes', views: 9650, engagement: '6.8%' },
  { title: 'Customer Testimonials', views: 8340, engagement: '5.9%' },
]

function Analytics() {
  const stats = [
    { label: 'Total Views', value: '45.2K', change: '+12%', icon: Eye, color: 'text-blue-400' },
    { label: 'Subscribers', value: '2.8K', change: '+8%', icon: Users, color: 'text-green-400' },
    { label: 'Watch Time', value: '892h', change: '+15%', icon: Play, color: 'text-purple-400' },
    { label: 'Engagement Rate', value: '7.3%', change: '+3%', icon: ThumbsUp, color: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Analytics</h1>
          <p className="text-dark-text-muted mt-1">Track your video performance and audience engagement</p>
        </div>
        <div className="flex space-x-2">
          <select className="px-3 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text text-sm">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
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
                  <p className="text-xs text-green-400 mt-1">{stat.change} from last month</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Views Over Time</h2>
          <AnalyticsChart variant="line" data={viewsData} />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Engagement Rate</h2>
          <AnalyticsChart variant="bar" data={viewsData} />
        </div>
      </div>

      {/* Top Performing Videos */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Top Performing Videos</h2>
        <div className="space-y-4">
          {topVideos.map((video, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-12 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-dark-text">{video.title}</h3>
                  <p className="text-sm text-dark-text-muted">{video.views.toLocaleString()} views</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-dark-text">{video.engagement}</p>
                <p className="text-xs text-dark-text-muted">Engagement</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-dark-text">AI Insights</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-medium text-dark-text mb-2">💡 Optimization Tip</h3>
            <p className="text-sm text-dark-text-muted">
              Your videos perform 40% better when uploaded on Tuesday mornings. Consider scheduling your next video for optimal engagement.
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h3 className="font-medium text-dark-text mb-2">📈 Growth Opportunity</h3>
            <p className="text-sm text-dark-text-muted">
              Tutorial-style content shows 65% higher engagement. Consider creating more educational videos to boost subscriber growth.
            </p>
          </div>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <h3 className="font-medium text-dark-text mb-2">🎯 Audience Insight</h3>
            <p className="text-sm text-dark-text-muted">
              Your audience is most active between 2-4 PM EST. Timing your releases during this window could increase initial view velocity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics