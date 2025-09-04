/**
 * Environment Configuration
 * Centralized configuration for all environment variables and API keys
 */

const config = {
  // API Keys
  RUNWAY_API_KEY: import.meta.env.VITE_RUNWAY_API_KEY,
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY,
  PINATA_SECRET_KEY: import.meta.env.VITE_PINATA_SECRET_KEY,
  
  // API Endpoints
  RUNWAY_API_URL: 'https://api.runwayml.com/v1',
  OPENAI_API_URL: 'https://api.openai.com/v1',
  STRIPE_API_URL: 'https://api.stripe.com/v1',
  PINATA_API_URL: 'https://api.pinata.cloud',
  
  // App Configuration
  APP_NAME: 'VidSynth Automator',
  APP_VERSION: '1.0.0',
  NODE_ENV: import.meta.env.MODE,
  
  // Feature Flags
  FEATURES: {
    AI_VIDEO_GENERATION: true,
    CROSS_PROMOTION: true,
    AI_INSIGHTS: true,
    SUBSCRIPTION_BILLING: true,
    MEDIA_LIBRARY: true
  },
  
  // Limits and Quotas
  LIMITS: {
    FREE_VIDEOS_PER_MONTH: 3,
    PRO_VIDEOS_PER_MONTH: 50,
    BUSINESS_VIDEOS_PER_MONTH: -1, // Unlimited
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_VIDEO_DURATION: 300, // 5 minutes
  },
  
  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    FREE: {
      id: 'free',
      name: 'Free',
      price: 0,
      videoLimit: 3,
      features: ['Basic templates', 'Standard quality']
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      price: 29,
      videoLimit: 50,
      features: ['Premium templates', 'HD quality', 'Brand customization', 'Analytics']
    },
    BUSINESS: {
      id: 'business',
      name: 'Business',
      price: 99,
      videoLimit: -1,
      features: ['All Pro features', 'Unlimited videos', 'Priority support', 'API access']
    }
  }
}

// Validation function to check if required environment variables are set
export const validateConfig = () => {
  const requiredKeys = [
    'RUNWAY_API_KEY',
    'OPENAI_API_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'PINATA_API_KEY',
    'PINATA_SECRET_KEY'
  ]
  
  const missingKeys = requiredKeys.filter(key => !config[key])
  
  if (missingKeys.length > 0) {
    console.warn('Missing environment variables:', missingKeys)
    if (config.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`)
    }
  }
  
  return config
}

export default config
