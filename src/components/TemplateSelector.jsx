import React from 'react'
import { Play } from 'lucide-react'

const templates = [
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Perfect for Instagram and TikTok',
    preview: '/template-social.jpg'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Professional marketing videos',
    preview: '/template-marketing.jpg'
  },
  {
    id: 'tutorial',
    name: 'Tutorial',
    description: 'Educational and how-to videos',
    preview: '/template-tutorial.jpg'
  },
  {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Showcase your products',
    preview: '/template-product.jpg'
  }
]

function TemplateSelector({ config, onChange, onNext, onBack, variant = 'grid' }) {
  const handleTemplateSelect = (templateId) => {
    onChange({ ...config, template: templateId })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-dark-text mb-4">Choose a Template</h2>
        <p className="text-dark-text-muted mb-6">Select a template that best fits your video style</p>
        
        <div className={variant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                config.template === template.id
                  ? 'border-primary bg-primary/10'
                  : 'border-dark-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-dark-text">{template.name}</h3>
                  <p className="text-sm text-dark-text-muted mt-1">{template.description}</p>
                </div>
                {config.template === template.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button
          onClick={onNext}
          className="btn-primary"
          disabled={!config.template}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default TemplateSelector