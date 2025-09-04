/**
 * Video Generation Hook
 * Manages the video generation process with Runway AI
 */

import { useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import runwayService from '../services/runwayService'
import openaiService from '../services/openaiService'
import pinataService from '../services/pinataService'

export function useVideoGeneration() {
  const { state, dispatch } = useApp()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [error, setError] = useState(null)

  /**
   * Generate a video with AI
   * @param {Object} config - Video configuration
   * @returns {Promise<Object>} Generated video result
   */
  const generateVideo = useCallback(async (config) => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: Optimize the prompt with OpenAI
      setCurrentStep('Optimizing prompt...')
      setProgress(10)
      
      const optimizedPrompt = await openaiService.optimizePrompt(
        config.prompt,
        config.style
      )

      // Step 2: Create project record
      setCurrentStep('Creating project...')
      setProgress(20)
      
      const newProject = {
        projectId: `proj-${Date.now()}`,
        userId: state.user.userId,
        projectName: config.prompt.slice(0, 30) + '...',
        videoConfig: {
          ...config,
          optimizedPrompt
        },
        createdAt: new Date()
      }
      
      dispatch({ type: 'ADD_PROJECT', payload: newProject })

      // Step 3: Start video generation with Runway AI
      setCurrentStep('Starting video generation...')
      setProgress(30)
      
      const generationParams = {
        prompt: optimizedPrompt,
        style: config.style,
        duration: config.duration,
        aspectRatio: config.aspectRatio || '16:9',
        brandKit: state.brandKit
      }

      const generationJob = await runwayService.generateVideo(generationParams)
      
      // Step 4: Create video record
      const newVideo = {
        videoId: `vid-${Date.now()}`,
        projectId: newProject.projectId,
        generationStatus: 'processing',
        jobId: generationJob.jobId,
        videoUrl: null,
        thumbnailUrl: null,
        createdAt: new Date(),
        estimatedTime: generationJob.estimatedTime
      }
      
      dispatch({ type: 'ADD_VIDEO', payload: newVideo })

      // Step 5: Poll for completion
      setCurrentStep('Generating video...')
      const completedVideo = await pollVideoGeneration(
        generationJob.jobId,
        newVideo,
        newProject
      )

      setCurrentStep('Video generated successfully!')
      setProgress(100)
      
      return {
        success: true,
        video: completedVideo,
        project: newProject
      }

    } catch (err) {
      console.error('Video generation failed:', err)
      setError(err.message)
      
      return {
        success: false,
        error: err.message
      }
    } finally {
      setIsGenerating(false)
    }
  }, [state, dispatch])

  /**
   * Poll Runway AI for video generation completion
   * @private
   */
  const pollVideoGeneration = useCallback(async (jobId, videoRecord, projectRecord) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          attempts++
          
          const jobStatus = await runwayService.checkJobStatus(jobId)
          
          // Update progress based on job status
          const baseProgress = 40
          const progressIncrement = (60 - baseProgress) * (jobStatus.progress / 100)
          setProgress(baseProgress + progressIncrement)

          if (jobStatus.status === 'completed') {
            clearInterval(pollInterval)
            
            // Step 6: Upload to IPFS
            setCurrentStep('Uploading to IPFS...')
            setProgress(80)
            
            try {
              // Download the generated video and thumbnail
              const videoBlob = await fetch(jobStatus.videoUrl).then(r => r.blob())
              const thumbnailBlob = await fetch(jobStatus.thumbnailUrl).then(r => r.blob())
              
              // Convert to File objects
              const videoFile = new File([videoBlob], `video_${videoRecord.videoId}.mp4`, { type: 'video/mp4' })
              const thumbnailFile = new File([thumbnailBlob], `thumb_${videoRecord.videoId}.jpg`, { type: 'image/jpeg' })
              
              // Upload to IPFS
              const uploadResult = await pinataService.uploadGeneratedVideo(
                videoFile,
                thumbnailFile,
                {
                  projectId: projectRecord.projectId,
                  userId: projectRecord.userId,
                  prompt: projectRecord.videoConfig.prompt,
                  style: projectRecord.videoConfig.style,
                  duration: projectRecord.videoConfig.duration
                }
              )

              // Update video record with IPFS URLs
              const completedVideo = {
                ...videoRecord,
                generationStatus: 'completed',
                videoUrl: uploadResult.video.url,
                thumbnailUrl: uploadResult.thumbnail.url,
                ipfsHash: uploadResult.video.ipfsHash,
                thumbnailHash: uploadResult.thumbnail.ipfsHash,
                completedAt: new Date()
              }

              dispatch({ type: 'UPDATE_VIDEO_STATUS', payload: completedVideo })
              setProgress(100)
              resolve(completedVideo)

            } catch (uploadError) {
              console.error('IPFS upload failed:', uploadError)
              
              // Fallback to direct URLs if IPFS upload fails
              const completedVideo = {
                ...videoRecord,
                generationStatus: 'completed',
                videoUrl: jobStatus.videoUrl,
                thumbnailUrl: jobStatus.thumbnailUrl,
                completedAt: new Date()
              }

              dispatch({ type: 'UPDATE_VIDEO_STATUS', payload: completedVideo })
              resolve(completedVideo)
            }

          } else if (jobStatus.status === 'failed') {
            clearInterval(pollInterval)
            
            const failedVideo = {
              ...videoRecord,
              generationStatus: 'failed',
              error: jobStatus.error || 'Video generation failed'
            }
            
            dispatch({ type: 'UPDATE_VIDEO_STATUS', payload: failedVideo })
            reject(new Error(jobStatus.error || 'Video generation failed'))

          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            
            const timeoutVideo = {
              ...videoRecord,
              generationStatus: 'failed',
              error: 'Generation timeout'
            }
            
            dispatch({ type: 'UPDATE_VIDEO_STATUS', payload: timeoutVideo })
            reject(new Error('Video generation timed out'))
          }

        } catch (pollError) {
          console.error('Error polling job status:', pollError)
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            reject(new Error('Failed to check generation status'))
          }
        }
      }, 5000) // Poll every 5 seconds
    })
  }, [dispatch])

  /**
   * Cancel video generation
   */
  const cancelGeneration = useCallback(async (jobId) => {
    try {
      await runwayService.cancelJob(jobId)
      setIsGenerating(false)
      setProgress(0)
      setCurrentStep('')
      return true
    } catch (err) {
      console.error('Failed to cancel generation:', err)
      return false
    }
  }, [])

  /**
   * Get available video styles
   */
  const getAvailableStyles = useCallback(async () => {
    try {
      return await runwayService.getAvailableStyles()
    } catch (err) {
      console.error('Failed to fetch styles:', err)
      return []
    }
  }, [])

  /**
   * Estimate generation cost
   */
  const estimateCost = useCallback((duration, quality = 'hd') => {
    return runwayService.estimateCost(duration, quality)
  }, [])

  /**
   * Check if user can generate videos (subscription limits)
   */
  const canGenerateVideo = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Count videos generated this month
    const thisMonthVideos = state.videos.filter(video => {
      const videoDate = new Date(video.createdAt)
      return videoDate.getMonth() === currentMonth && 
             videoDate.getFullYear() === currentYear &&
             video.generationStatus === 'completed'
    }).length

    // Check subscription limits
    const userPlan = state.user.subscriptionPlan || 'free'
    const limits = {
      free: 3,
      pro: 50,
      business: -1 // unlimited
    }

    const limit = limits[userPlan]
    if (limit === -1) return { canGenerate: true, remaining: -1 }
    
    return {
      canGenerate: thisMonthVideos < limit,
      remaining: Math.max(0, limit - thisMonthVideos),
      used: thisMonthVideos,
      limit
    }
  }, [state.videos, state.user.subscriptionPlan])

  return {
    // State
    isGenerating,
    progress,
    currentStep,
    error,
    
    // Actions
    generateVideo,
    cancelGeneration,
    getAvailableStyles,
    estimateCost,
    canGenerateVideo
  }
}
