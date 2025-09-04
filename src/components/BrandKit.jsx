import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Upload, Palette, Type, Save } from 'lucide-react'
import BrandKitUploader from './BrandKitUploader'

function BrandKit() {
  const { state, dispatch } = useApp()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState(state.brandKit)

  const handleSave = () => {
    dispatch({ type: 'UPDATE_BRAND_KIT', payload: formData })
    setEditMode(false)
  }

  const handleReset = () => {
    setFormData(state.brandKit)
    setEditMode(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Brand Kit</h1>
          <p className="text-dark-text-muted mt-1">Customize your brand elements for consistent video styling</p>
        </div>
        <div className="space-x-2">
          {editMode ? (
            <>
              <button onClick={handleReset} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary inline-flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="btn-primary">
              Edit Brand Kit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-dark-text">Logo</h2>
          </div>
          
          <BrandKitUploader
            variant="logo"
            currentValue={formData.logoUrl}
            onChange={(logoUrl) => setFormData({ ...formData, logoUrl })}
            disabled={!editMode}
          />
        </div>

        {/* Color Palette */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-dark-text">Colors</h2>
          </div>
          
          <BrandKitUploader
            variant="colors"
            currentValue={{ primary: formData.primaryColor, secondary: formData.secondaryColor }}
            onChange={(colors) => setFormData({ 
              ...formData, 
              primaryColor: colors.primary, 
              secondaryColor: colors.secondary 
            })}
            disabled={!editMode}
          />
        </div>

        {/* Typography */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-dark-text">Typography</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Primary Font
              </label>
              <select
                value={formData.font}
                onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
            
            <div className="p-4 bg-dark-bg rounded-lg">
              <p className="text-dark-text" style={{ fontFamily: formData.font }}>
                Sample text in {formData.font}
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Brand Preview</h2>
          
          <div className="space-y-4">
            <div className="p-6 bg-dark-bg rounded-lg border-2 border-dashed border-dark-border">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">LOGO</span>
                </div>
                <h3 className="text-lg font-semibold text-dark-text" style={{ fontFamily: formData.font }}>
                  Your Brand Name
                </h3>
                <p className="text-sm text-dark-text-muted mt-1">Video preview with your branding</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20"
                style={{ backgroundColor: formData.primaryColor }}
                title="Primary Color"
              ></div>
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20"
                style={{ backgroundColor: formData.secondaryColor }}
                title="Secondary Color"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines */}
      <div className="card">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Brand Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-dark-text mb-2">Logo Usage</h3>
            <ul className="text-sm text-dark-text-muted space-y-1">
              <li>• Maintain clear space around logo</li>
              <li>• Use on contrasting backgrounds</li>
              <li>• Don't stretch or distort</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-dark-text mb-2">Color Palette</h3>
            <ul className="text-sm text-dark-text-muted space-y-1">
              <li>• Primary for main elements</li>
              <li>• Secondary for accents</li>
              <li>• Ensure accessibility contrast</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-dark-text mb-2">Typography</h3>
            <ul className="text-sm text-dark-text-muted space-y-1">
              <li>• Consistent font hierarchy</li>
              <li>• Readable at all sizes</li>
              <li>• Matches brand personality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandKit