import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Play, Wand2, Clock, Download, X, AlertCircle, CreditCard } from 'lucide-react'
import VideoGeneratorForm from './VideoGeneratorForm'
import TemplateSelector from './TemplateSelector'
import { useVideoGeneration } from '../hooks/useVideoGeneration'

function VideoGenerator() {
  const { state } = useApp()
  const [currentStep, setCurrentStep] = useState('prompt')
  const [videoConfig, setVideoConfig] = useState({
    prompt: '',
    style: '',
    duration: 30,
    aspectRatio: '16:9',
    template: null
  })
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  const {
    isGenerating,
    progress,
    currentStep: generationStep,
    error,
    generateVideo,
    cancelGeneration,
    canGenerateVideo,
    estimateCost
  } = useVideoGeneration()

  // Check generation limits on component mount
  useEffect(() => {
    const limits = canGenerateVideo()
    if (!limits.canGenerate && limits.remaining === 0) {
      setShowLimitWarning(true)
    }
  }, [canGenerateVideo])

  const handleGenerate = async () => {
    // Check if user can generate videos
    const limits = canGenerateVideo()
    if (!limits.canGenerate) {
      setShowLimitWarning(true)
      return
    }

    const result = await generateVideo(videoConfig)
    
    if (result.success) {
      setGeneratedVideo(result.video)
    }
  }

  const handleCancel = async () => {
    if (generatedVideo?.jobId) {
      await cancelGeneration(generatedVideo.jobId)
    }
  }

  const steps = [
    { id: 'prompt', title: 'Describe Your Video', component: VideoGeneratorForm },
    { id: 'template', title: 'Choose Template', component: TemplateSelector },
    { id: 'generate', title: 'Generate Video', component: null },
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const limits = canGenerateVideo()
  const estimatedCost = estimateCost(videoConfig.duration)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Create Video</h1>
          <p className="text-dark-text-muted mt-1">Generate professional videos with AI in minutes</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-dark-text-muted">
            {limits.remaining === -1 ? (
              <span className="text-green-400">Unlimited videos</span>
            ) : (
              <span>
                {limits.remaining} of {limits.limit} videos remaining this month
              </span>
            )}
          </div>
          <div className="text-xs text-dark-text-muted mt-1">
            Estimated cost: {estimatedCost} credits
          </div>
        </div>
      </div>

      {/* Limit Warning Modal */}
      {showLimitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-dark-text">Generation Limit Reached</h3>
              </div>
              <button
                onClick={() => setShowLimitWarning(false)}
                className="text-dark-text-muted hover:text-dark-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-dark-text-muted mb-6">
              You've reached your monthly video generation limit. Upgrade your plan to continue creating videos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLimitWarning(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLimitWarning(false)
                  // Navigate to pricing page
                  window.location.href = '/pricing'
                }}
                className="btn-primary flex-1 inline-flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="font-medium text-red-400">Generation Failed</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStepIndex
                ? 'bg-primary text-white'
                : 'bg-dark-border text-dark-text-muted'
            }`}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              index <= currentStepIndex ? 'text-dark-text' : 'text-dark-text-muted'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                index < currentStepIndex ? 'bg-primary' : 'bg-dark-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-4xl">
        {currentStep === 'prompt' && (
          <VideoGeneratorForm
            config={videoConfig}
            onChange={setVideoConfig}
            onNext={() => setCurrentStep('template')}
          />
        )}
        
        {currentStep === 'template' && (
          <TemplateSelector
            config={videoConfig}
            onChange={setVideoConfig}
            onNext={() => setCurrentStep('generate')}
            onBack={() => setCurrentStep('prompt')}
          />
        )}
        
        {currentStep === 'generate' && (
          <div className="card">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-dark-text mb-4">Ready to Generate</h2>
              <div className="bg-dark-bg rounded-lg p-6 mb-6">
                <h3 className="font-medium text-dark-text mb-2">Video Configuration</h3>
                <div className="text-sm text-dark-text-muted space-y-1">
                  <p><strong>Prompt:</strong> {videoConfig.prompt}</p>
                  <p><strong>Style:</strong> {videoConfig.style}</p>
                  <p><strong>Duration:</strong> {videoConfig.duration} seconds</p>
                  <p><strong>Template:</strong> {videoConfig.template || 'Default'}</p>
                </div>
              </div>
              
              {!isGenerating && !generatedVideo && (
                <div className="space-x-4">
                  <button
                    onClick={() => setCurrentStep('template')}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!limits.canGenerate}
                    className={`btn-primary inline-flex items-center space-x-2 ${
                      !limits.canGenerate ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Video</span>
                  </button>
                </div>
              )}
              
              {isGenerating && (
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 text-primary">
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>{generationStep || 'Generating your video...'}</span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                  <div className="text-sm text-dark-text-muted text-center">
                    {progress}% complete
                  </div>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary text-sm"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Generation
                  </button>
                </div>
              )}
              
              {generatedVideo && (
                <div className="space-y-4">
                  <div className="bg-green-500/20 text-green-400 p-4 rounded-lg">
                    Video generated successfully!
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button className="btn-primary inline-flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Preview Video</span>
                    </button>
                    <button className="btn-secondary inline-flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGenerator
