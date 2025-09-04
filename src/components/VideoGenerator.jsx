import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Play, Wand2, Clock, Download } from 'lucide-react'
import VideoGeneratorForm from './VideoGeneratorForm'
import TemplateSelector from './TemplateSelector'

function VideoGenerator() {
  const { state, dispatch } = useApp()
  const [currentStep, setCurrentStep] = useState('prompt')
  const [videoConfig, setVideoConfig] = useState({
    prompt: '',
    style: '',
    duration: 30,
    template: null
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate video generation
    const newProject = {
      projectId: `proj-${Date.now()}`,
      userId: state.user.userId,
      projectName: videoConfig.prompt.slice(0, 30) + '...',
      videoConfig,
      createdAt: new Date()
    }
    
    const newVideo = {
      videoId: `vid-${Date.now()}`,
      projectId: newProject.projectId,
      generationStatus: 'processing',
      videoUrl: null,
      thumbnailUrl: null,
      createdAt: new Date()
    }
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject })
    dispatch({ type: 'ADD_VIDEO', payload: newVideo })
    
    // Simulate generation time
    setTimeout(() => {
      const completedVideo = {
        ...newVideo,
        generationStatus: 'completed',
        videoUrl: '/sample-video.mp4',
        thumbnailUrl: '/sample-thumb.jpg'
      }
      dispatch({ type: 'UPDATE_VIDEO_STATUS', payload: completedVideo })
      setGeneratedVideo(completedVideo)
      setIsGenerating(false)
    }, 3000)
  }

  const steps = [
    { id: 'prompt', title: 'Describe Your Video', component: VideoGeneratorForm },
    { id: 'template', title: 'Choose Template', component: TemplateSelector },
    { id: 'generate', title: 'Generate Video', component: null },
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Create Video</h1>
          <p className="text-dark-text-muted mt-1">Generate professional videos with AI in minutes</p>
        </div>
      </div>

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
                    className="btn-primary inline-flex items-center space-x-2"
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
                    <span>Generating your video...</span>
                  </div>
                  <div className="w-full bg-dark-bg rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
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