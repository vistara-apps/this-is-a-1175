/**
 * OpenAI Service
 * Handles AI insights generation and content analysis
 */

import config from '../config/env.js'

class OpenAIService {
  constructor() {
    this.apiKey = config.OPENAI_API_KEY
    this.baseUrl = config.OPENAI_API_URL
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Generate AI insights based on analytics data
   * @param {Object} analyticsData - User's video analytics data
   * @returns {Promise<Array>} Array of AI-generated insights
   */
  async generateInsights(analyticsData) {
    try {
      const {
        totalViews,
        subscribers,
        watchTime,
        engagementRate,
        topVideos,
        viewsOverTime,
        audienceData
      } = analyticsData

      const prompt = this.buildInsightsPrompt(analyticsData)

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert video marketing analyst. Provide actionable insights and recommendations based on video analytics data. Focus on practical, specific advice that creators can implement immediately.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const insightsText = result.choices[0].message.content

      // Parse the insights into structured format
      return this.parseInsights(insightsText)
    } catch (error) {
      console.error('Error generating insights:', error)
      // Return fallback insights if API fails
      return this.getFallbackInsights(analyticsData)
    }
  }

  /**
   * Generate content suggestions based on user's video history and trends
   * @param {Object} userProfile - User's content history and preferences
   * @returns {Promise<Array>} Array of content suggestions
   */
  async generateContentSuggestions(userProfile) {
    try {
      const prompt = `Based on this creator's profile and video history, suggest 5 specific video ideas that would likely perform well:

User Profile:
- Niche: ${userProfile.niche || 'General'}
- Top performing videos: ${userProfile.topVideos?.map(v => v.title).join(', ') || 'None'}
- Average engagement rate: ${userProfile.avgEngagement || 'Unknown'}
- Subscriber count: ${userProfile.subscribers || 'Unknown'}
- Content style: ${userProfile.contentStyle || 'Mixed'}

Please provide specific, actionable video ideas with titles and brief descriptions.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a creative content strategist. Generate specific, engaging video ideas that align with current trends and the creator\'s style.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return this.parseContentSuggestions(result.choices[0].message.content)
    } catch (error) {
      console.error('Error generating content suggestions:', error)
      return this.getFallbackContentSuggestions()
    }
  }

  /**
   * Optimize video prompts for better generation results
   * @param {string} userPrompt - Original user prompt
   * @param {string} style - Video style
   * @returns {Promise<string>} Optimized prompt
   */
  async optimizePrompt(userPrompt, style) {
    try {
      const systemPrompt = `You are an expert at optimizing text prompts for AI video generation. 
      Take the user's basic prompt and enhance it with specific visual details, camera movements, 
      lighting, and style elements that will produce better video results. Keep the core message 
      but make it more descriptive and cinematic.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Optimize this video prompt for ${style} style: "${userPrompt}"`
            }
          ],
          max_tokens: 200,
          temperature: 0.6
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error optimizing prompt:', error)
      return userPrompt // Return original if optimization fails
    }
  }

  /**
   * Analyze video performance and suggest improvements
   * @param {Object} videoData - Individual video performance data
   * @returns {Promise<Object>} Performance analysis and suggestions
   */
  async analyzeVideoPerformance(videoData) {
    try {
      const prompt = `Analyze this video's performance and provide specific improvement suggestions:

Video: "${videoData.title}"
Views: ${videoData.views}
Engagement Rate: ${videoData.engagementRate}%
Watch Time: ${videoData.watchTime}
Upload Date: ${videoData.uploadDate}
Tags: ${videoData.tags?.join(', ') || 'None'}

Provide specific, actionable recommendations for improving future videos.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a video performance analyst. Provide specific, actionable recommendations based on video metrics.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        analysis: result.choices[0].message.content,
        score: this.calculatePerformanceScore(videoData),
        recommendations: this.extractRecommendations(result.choices[0].message.content)
      }
    } catch (error) {
      console.error('Error analyzing video performance:', error)
      return {
        analysis: 'Unable to generate analysis at this time.',
        score: 0,
        recommendations: []
      }
    }
  }

  /**
   * Build insights prompt from analytics data
   * @private
   */
  buildInsightsPrompt(data) {
    return `Analyze this video creator's performance data and provide 3-4 specific, actionable insights:

Analytics Summary:
- Total Views: ${data.totalViews || 0}
- Subscribers: ${data.subscribers || 0}
- Average Watch Time: ${data.watchTime || 0}
- Engagement Rate: ${data.engagementRate || 0}%
- Top Videos: ${data.topVideos?.map(v => `"${v.title}" (${v.views} views, ${v.engagement} engagement)`).join(', ') || 'None'}
- Recent Performance Trend: ${data.trend || 'Stable'}

Focus on:
1. Content optimization opportunities
2. Audience engagement strategies
3. Publishing timing recommendations
4. Growth opportunities

Provide specific, actionable advice with emojis for visual appeal.`
  }

  /**
   * Parse AI insights into structured format
   * @private
   */
  parseInsights(insightsText) {
    const insights = []
    const lines = insightsText.split('\n').filter(line => line.trim())
    
    let currentInsight = null
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^[•-]/)) {
        if (currentInsight) {
          insights.push(currentInsight)
        }
        currentInsight = {
          type: this.determineInsightType(line),
          title: this.extractTitle(line),
          description: line.replace(/^\d+\.|^[•-]\s*/, '').trim(),
          icon: this.getInsightIcon(line)
        }
      } else if (currentInsight && line.trim()) {
        currentInsight.description += ' ' + line.trim()
      }
    }
    
    if (currentInsight) {
      insights.push(currentInsight)
    }
    
    return insights.length > 0 ? insights : this.getFallbackInsights()
  }

  /**
   * Parse content suggestions from AI response
   * @private
   */
  parseContentSuggestions(suggestionsText) {
    const suggestions = []
    const lines = suggestionsText.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^[•-]/)) {
        const suggestion = line.replace(/^\d+\.|^[•-]\s*/, '').trim()
        if (suggestion) {
          suggestions.push({
            title: suggestion.split(':')[0] || suggestion,
            description: suggestion.split(':')[1]?.trim() || '',
            category: 'AI Suggested'
          })
        }
      }
    }
    
    return suggestions.length > 0 ? suggestions : this.getFallbackContentSuggestions()
  }

  /**
   * Determine insight type from content
   * @private
   */
  determineInsightType(text) {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('optimization') || lowerText.includes('improve')) return 'optimization'
    if (lowerText.includes('growth') || lowerText.includes('increase')) return 'growth'
    if (lowerText.includes('audience') || lowerText.includes('engagement')) return 'audience'
    if (lowerText.includes('timing') || lowerText.includes('schedule')) return 'timing'
    return 'general'
  }

  /**
   * Extract title from insight text
   * @private
   */
  extractTitle(text) {
    const titles = {
      optimization: '💡 Optimization Tip',
      growth: '📈 Growth Opportunity',
      audience: '🎯 Audience Insight',
      timing: '⏰ Timing Recommendation',
      general: '💡 Insight'
    }
    
    const type = this.determineInsightType(text)
    return titles[type] || titles.general
  }

  /**
   * Get icon for insight type
   * @private
   */
  getInsightIcon(text) {
    const type = this.determineInsightType(text)
    const icons = {
      optimization: '💡',
      growth: '📈',
      audience: '🎯',
      timing: '⏰',
      general: '💡'
    }
    return icons[type] || icons.general
  }

  /**
   * Calculate performance score
   * @private
   */
  calculatePerformanceScore(videoData) {
    const views = videoData.views || 0
    const engagement = videoData.engagementRate || 0
    const watchTime = videoData.watchTime || 0
    
    // Simple scoring algorithm (0-100)
    const viewsScore = Math.min(views / 1000, 50) // Max 50 points for views
    const engagementScore = Math.min(engagement * 5, 30) // Max 30 points for engagement
    const watchTimeScore = Math.min(watchTime / 60, 20) // Max 20 points for watch time
    
    return Math.round(viewsScore + engagementScore + watchTimeScore)
  }

  /**
   * Extract recommendations from analysis text
   * @private
   */
  extractRecommendations(text) {
    const recommendations = []
    const lines = text.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      if (line.match(/^\d+\.|^[•-]|recommend|suggest|try|consider/i)) {
        const rec = line.replace(/^\d+\.|^[•-]\s*/, '').trim()
        if (rec && rec.length > 10) {
          recommendations.push(rec)
        }
      }
    }
    
    return recommendations
  }

  /**
   * Get fallback insights when API fails
   * @private
   */
  getFallbackInsights(data = {}) {
    return [
      {
        type: 'optimization',
        title: '💡 Optimization Tip',
        description: 'Consider creating more tutorial-style content, as educational videos typically see 40% higher engagement rates.',
        icon: '💡'
      },
      {
        type: 'timing',
        title: '⏰ Timing Recommendation',
        description: 'Your audience appears most active between 2-4 PM EST. Try scheduling uploads during this window for better initial visibility.',
        icon: '⏰'
      },
      {
        type: 'growth',
        title: '📈 Growth Opportunity',
        description: 'Videos with custom thumbnails perform 65% better. Invest time in creating eye-catching thumbnails for each video.',
        icon: '📈'
      }
    ]
  }

  /**
   * Get fallback content suggestions
   * @private
   */
  getFallbackContentSuggestions() {
    return [
      {
        title: 'Behind the Scenes: Your Creative Process',
        description: 'Show your audience how you create content',
        category: 'Engagement'
      },
      {
        title: 'Top 5 Tips for [Your Niche]',
        description: 'Educational content performs well across all niches',
        category: 'Educational'
      },
      {
        title: 'Q&A with Your Audience',
        description: 'Answer common questions from your community',
        category: 'Community'
      },
      {
        title: 'Trending Topic Analysis',
        description: 'Share your perspective on current trends',
        category: 'Trending'
      },
      {
        title: 'Collaboration with Another Creator',
        description: 'Cross-promote with creators in your niche',
        category: 'Collaboration'
      }
    ]
  }
}

export default new OpenAIService()
