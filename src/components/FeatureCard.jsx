import React from 'react'

function FeatureCard({ title, description, icon: Icon, variant = 'default', onClick }) {
  const baseClasses = "p-4 rounded-lg border transition-all duration-200 cursor-pointer"
  const variants = {
    default: "bg-dark-surface border-dark-border hover:border-primary/50 hover:bg-dark-bg",
    large: "p-6 bg-dark-surface border-dark-border hover:border-primary/50 hover:bg-dark-bg"
  }

  return (
    <div className={`${baseClasses} ${variants[variant]}`} onClick={onClick}>
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-dark-text">{title}</h3>
          <p className="text-xs text-dark-text-muted mt-1">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard