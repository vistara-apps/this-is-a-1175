import React from 'react'
import { Upload, Image } from 'lucide-react'

function BrandKitUploader({ variant, currentValue, onChange, disabled }) {
  if (variant === 'logo') {
    return (
      <div className="space-y-4">
        <div className="w-full h-32 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-bg">
          {currentValue ? (
            <div className="text-center">
              <Image className="w-8 h-8 text-dark-text-muted mx-auto mb-2" />
              <span className="text-sm text-dark-text">Logo uploaded</span>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 text-dark-text-muted mx-auto mb-2" />
              <span className="text-sm text-dark-text-muted">
                {disabled ? 'No logo uploaded' : 'Click to upload logo'}
              </span>
            </div>
          )}
        </div>
        
        {!disabled && (
          <button className="w-full btn-secondary">
            Upload Logo
          </button>
        )}
        
        <p className="text-xs text-dark-text-muted">
          Recommended: PNG or SVG, max 2MB
        </p>
      </div>
    )
  }

  if (variant === 'colors') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-dark-border"
              style={{ backgroundColor: currentValue?.primary || '#3B82F6' }}
            ></div>
            <input
              type="color"
              value={currentValue?.primary || '#3B82F6'}
              onChange={(e) => onChange({ 
                primary: e.target.value, 
                secondary: currentValue?.secondary || '#8B5CF6' 
              })}
              disabled={disabled}
              className="w-full h-12 border border-dark-border rounded-md disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-dark-border"
              style={{ backgroundColor: currentValue?.secondary || '#8B5CF6' }}
            ></div>
            <input
              type="color"
              value={currentValue?.secondary || '#8B5CF6'}
              onChange={(e) => onChange({ 
                primary: currentValue?.primary || '#3B82F6', 
                secondary: e.target.value 
              })}
              disabled={disabled}
              className="w-full h-12 border border-dark-border rounded-md disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default BrandKitUploader