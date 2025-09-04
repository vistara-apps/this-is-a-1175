/**
 * Subscription Hook
 * Manages subscription state and billing operations
 */

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import stripeService from '../services/stripeService'
import config from '../config/env'

export function useSubscription() {
  const { state, dispatch } = useApp()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load subscription data
   */
  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const subscriptionData = await stripeService.getSubscription(
        state.user.subscriptionId || 'mock'
      )
      
      setSubscription(subscriptionData)
      
      // Update user context if subscription plan changed
      if (subscriptionData.plan !== state.user.subscriptionPlan) {
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            subscriptionPlan: subscriptionData.plan
          }
        })
      }
      
    } catch (err) {
      console.error('Failed to load subscription:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [state.user.subscriptionId, state.user.subscriptionPlan, dispatch])

  /**
   * Create or upgrade subscription
   */
  const createSubscription = useCallback(async (planId, userInfo) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await stripeService.createSubscription(planId, userInfo)
      
      if (result.success && !result.redirected) {
        // Update local state
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            subscriptionPlan: planId
          }
        })
        
        // Reload subscription data
        await loadSubscription()
      }
      
      return result
      
    } catch (err) {
      console.error('Failed to create subscription:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [dispatch, loadSubscription])

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(async () => {
    if (!subscription?.id) {
      throw new Error('No active subscription to cancel')
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await stripeService.cancelSubscription(subscription.id)
      
      if (result.success) {
        await loadSubscription()
      }
      
      return result
      
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [subscription?.id, loadSubscription])

  /**
   * Update subscription plan
   */
  const updateSubscription = useCallback(async (newPlanId) => {
    if (!subscription?.id) {
      throw new Error('No active subscription to update')
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const result = await stripeService.updateSubscription(subscription.id, newPlanId)
      
      if (result.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            subscriptionPlan: newPlanId
          }
        })
        
        await loadSubscription()
      }
      
      return result
      
    } catch (err) {
      console.error('Failed to update subscription:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [subscription?.id, dispatch, loadSubscription])

  /**
   * Get billing history
   */
  const getBillingHistory = useCallback(async () => {
    try {
      const history = await stripeService.getBillingHistory(
        state.user.customerId || 'mock'
      )
      return history
    } catch (err) {
      console.error('Failed to get billing history:', err)
      return []
    }
  }, [state.user.customerId])

  /**
   * Open billing portal
   */
  const openBillingPortal = useCallback(async () => {
    if (!subscription?.customer?.id) {
      throw new Error('No customer ID available')
    }
    
    try {
      const portalUrl = await stripeService.createPortalSession(subscription.customer.id)
      window.open(portalUrl, '_blank')
      return true
    } catch (err) {
      console.error('Failed to open billing portal:', err)
      setError(err.message)
      return false
    }
  }, [subscription?.customer?.id])

  /**
   * Check if user has reached video generation limit
   */
  const hasReachedLimit = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Count videos generated this month
    const thisMonthVideos = state.videos.filter(video => {
      const videoDate = new Date(video.createdAt)
      return videoDate.getMonth() === currentMonth && 
             videoDate.getFullYear() === currentYear &&
             video.generationStatus === 'completed'
    }).length

    const userPlan = subscription?.plan || state.user.subscriptionPlan || 'free'
    
    return stripeService.hasReachedLimit({ plan: userPlan }, thisMonthVideos)
  }, [subscription?.plan, state.user.subscriptionPlan, state.videos])

  /**
   * Get remaining video credits
   */
  const getRemainingCredits = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Count videos generated this month
    const thisMonthVideos = state.videos.filter(video => {
      const videoDate = new Date(video.createdAt)
      return videoDate.getMonth() === currentMonth && 
             videoDate.getFullYear() === currentYear &&
             video.generationStatus === 'completed'
    }).length

    const userPlan = subscription?.plan || state.user.subscriptionPlan || 'free'
    
    return stripeService.getRemainingCredits({ plan: userPlan }, thisMonthVideos)
  }, [subscription?.plan, state.user.subscriptionPlan, state.videos])

  /**
   * Get current plan details
   */
  const getCurrentPlan = useCallback(() => {
    const planId = subscription?.plan || state.user.subscriptionPlan || 'free'
    return config.SUBSCRIPTION_PLANS[planId.toUpperCase()] || config.SUBSCRIPTION_PLANS.FREE
  }, [subscription?.plan, state.user.subscriptionPlan])

  /**
   * Check if user can access a feature
   */
  const canAccessFeature = useCallback((feature) => {
    const currentPlan = getCurrentPlan()
    
    const featureAccess = {
      'ai_video_generation': true, // All plans
      'brand_customization': currentPlan.id !== 'free',
      'analytics': currentPlan.id !== 'free',
      'premium_templates': currentPlan.id !== 'free',
      'hd_quality': currentPlan.id !== 'free',
      'unlimited_videos': currentPlan.id === 'business',
      'priority_support': currentPlan.id === 'business',
      'api_access': currentPlan.id === 'business'
    }
    
    return featureAccess[feature] || false
  }, [getCurrentPlan])

  /**
   * Get usage statistics
   */
  const getUsageStats = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthVideos = state.videos.filter(video => {
      const videoDate = new Date(video.createdAt)
      return videoDate.getMonth() === currentMonth && 
             videoDate.getFullYear() === currentYear &&
             video.generationStatus === 'completed'
    }).length

    const currentPlan = getCurrentPlan()
    const limit = currentPlan.videoLimit
    
    return {
      used: thisMonthVideos,
      limit: limit === -1 ? 'Unlimited' : limit,
      remaining: limit === -1 ? 'Unlimited' : Math.max(0, limit - thisMonthVideos),
      percentage: limit === -1 ? 0 : Math.min(100, (thisMonthVideos / limit) * 100)
    }
  }, [state.videos, getCurrentPlan])

  // Load subscription on mount
  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  return {
    // State
    subscription,
    loading,
    error,
    
    // Actions
    loadSubscription,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    getBillingHistory,
    openBillingPortal,
    
    // Utilities
    hasReachedLimit,
    getRemainingCredits,
    getCurrentPlan,
    canAccessFeature,
    getUsageStats
  }
}
