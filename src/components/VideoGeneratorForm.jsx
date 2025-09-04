import React from 'react'

function VideoGeneratorForm({ config, onChange, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (config.prompt && config.style && config.duration) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">
          Video Description
        </label>
        <textarea
          value={config.prompt}
          onChange={(e) => onChange({ ...config, prompt: e.target.value })}
          placeholder="Describe the video you want to create..."
          className="w-full h-32 px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-muted focus:outline-none focus:border-primary resize-none"
          required
        />
        <p className="text-xs text-dark-text-muted mt-1">
          Be specific about what you want to see in your video
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Video Style
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value })}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:border-primary"
            required
          >
            <option value="">Choose a style...</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="cinematic">Cinematic</option>
            <option value="animated">Animated</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Duration (seconds)
          </label>
          <select
            value={config.duration}
            onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:border-primary"
          >
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={!config.prompt || !config.style}
        >
          Continue
        </button>
      </div>
    </form>
  )
}

export default VideoGeneratorForm