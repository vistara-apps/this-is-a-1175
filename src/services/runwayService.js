/**
 * Runway AI Service
 * Handles video generation using Runway AI API
 */

import config from '../config/env.js'

class RunwayService {
  constructor() {
    this.apiKey = config.RUNWAY_API_KEY
    this.baseUrl = config.RUNWAY_API_URL
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Generate video from text prompt
   * @param {Object} params - Video generation parameters
   * @param {string} params.prompt - Text description for video
   * @param {string} params.style - Video style (modern, minimal, cinematic, etc.)
   * @param {number} params.duration - Video duration in seconds
   * @param {string} params.aspectRatio - Video aspect ratio (16:9, 9:16, 1:1)
   * @param {Object} params.brandKit - Brand customization options
   * @returns {Promise<Object>} Generation job details
   */
  async generateVideo(params) {
    try {
      const {
        prompt,
        style = 'modern',
        duration = 30,
        aspectRatio = '16:9',
        brandKit = {}
      } = params

      // Enhance prompt with style and branding information
      const enhancedPrompt = this.enhancePrompt(prompt, style, brandKit)

      const requestBody = {
        prompt: enhancedPrompt,
        duration,
        aspect_ratio: aspectRatio,
        quality: 'hd',
        fps: 24,
        seed: Math.floor(Math.random() * 1000000),
        // Additional Runway-specific parameters
        model: 'gen2',
        interpolate: true,
        upscale: true
      }

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        jobId: result.id,
        status: 'processing',
        estimatedTime: duration * 2, // Rough estimate: 2 seconds processing per 1 second of video
        prompt: enhancedPrompt,
        parameters: requestBody
      }
    } catch (error) {
      console.error('Error generating video:', error)
      throw new Error(`Video generation failed: ${error.message}`)
    }
  }

  /**
   * Check the status of a video generation job
   * @param {string} jobId - The job ID returned from generateVideo
   * @returns {Promise<Object>} Job status and results
   */
  async checkJobStatus(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Runway API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        jobId,
        status: result.status, // 'processing', 'completed', 'failed'
        progress: result.progress || 0,
        videoUrl: result.output?.video_url,
        thumbnailUrl: result.output?.thumbnail_url,
        error: result.error,
        completedAt: result.completed_at
      }
    } catch (error) {
      console.error('Error checking job status:', error)
      throw new Error(`Status check failed: ${error.message}`)
    }
  }

  /**
   * Cancel a video generation job
   * @param {string} jobId - The job ID to cancel
   * @returns {Promise<boolean>} Success status
   */
  async cancelJob(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: this.headers
      })

      return response.ok
    } catch (error) {
      console.error('Error canceling job:', error)
      return false
    }
  }

  /**
   * Get available video styles and templates
   * @returns {Promise<Array>} List of available styles
   */
  async getAvailableStyles() {
    try {
      // This would typically come from the API, but for now we'll return predefined styles
      return [
        {
          id: 'modern',
          name: 'Modern',
          description: 'Clean, contemporary aesthetic with smooth transitions',
          thumbnail: '/styles/modern.jpg'
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Simple, elegant design with focus on content',
          thumbnail: '/styles/minimal.jpg'
        },
        {
          id: 'cinematic',
          name: 'Cinematic',
          description: 'Movie-like quality with dramatic lighting and effects',
          thumbnail: '/styles/cinematic.jpg'
        },
        {
          id: 'corporate',
          name: 'Corporate',
          description: 'Professional business presentation style',
          thumbnail: '/styles/corporate.jpg'
        },
        {
          id: 'creative',
          name: 'Creative',
          description: 'Artistic and experimental visual approach',
          thumbnail: '/styles/creative.jpg'
        }
      ]
    } catch (error) {
      console.error('Error fetching styles:', error)
      return []
    }
  }

  /**
   * Enhance the user prompt with style and branding information
   * @private
   */
  enhancePrompt(prompt, style, brandKit) {
    let enhancedPrompt = prompt

    // Add style-specific enhancements
    const styleEnhancements = {
      modern: 'with clean, contemporary design, smooth transitions, and modern aesthetics',
      minimal: 'with simple, elegant design, minimal elements, and focus on content',
      cinematic: 'with dramatic lighting, movie-like quality, and cinematic effects',
      corporate: 'with professional business presentation style, clean graphics',
      creative: 'with artistic flair, experimental visuals, and creative effects'
    }

    if (styleEnhancements[style]) {
      enhancedPrompt += ` ${styleEnhancements[style]}`
    }

    // Add brand-specific enhancements
    if (brandKit.primaryColor) {
      enhancedPrompt += `, incorporating ${brandKit.primaryColor} as the primary color`
    }

    if (brandKit.font) {
      enhancedPrompt += `, using ${brandKit.font} typography style`
    }

    return enhancedPrompt
  }

  /**
   * Estimate video generation cost
   * @param {number} duration - Video duration in seconds
   * @param {string} quality - Video quality (sd, hd, 4k)
   * @returns {number} Estimated cost in credits
   */
  estimateCost(duration, quality = 'hd') {
    const baseCostPerSecond = {
      sd: 1,
      hd: 2,
      '4k': 4
    }

    return Math.ceil(duration * (baseCostPerSecond[quality] || 2))
  }
}

export default new RunwayService()
