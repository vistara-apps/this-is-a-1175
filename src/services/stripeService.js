/**
 * Stripe Service
 * Handles subscription payments and billing management
 */

import config from '../config/env.js'

class StripeService {
  constructor() {
    this.publishableKey = config.STRIPE_PUBLISHABLE_KEY
    this.stripe = null
    this.initialized = false
  }

  /**
   * Initialize Stripe
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return

    try {
      // Load Stripe.js dynamically
      if (!window.Stripe) {
        const script = document.createElement('script')
        script.src = 'https://js.stripe.com/v3/'
        document.head.appendChild(script)
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      this.stripe = window.Stripe(this.publishableKey)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      throw new Error('Payment system initialization failed')
    }
  }

  /**
   * Create a subscription checkout session
   * @param {Object} params - Checkout parameters
   * @param {string} params.priceId - Stripe price ID
   * @param {string} params.customerId - Customer ID (optional)
   * @param {string} params.successUrl - Success redirect URL
   * @param {string} params.cancelUrl - Cancel redirect URL
   * @returns {Promise<Object>} Checkout session
   */
  async createCheckoutSession(params) {
    await this.initialize()

    try {
      const {
        priceId,
        customerId,
        successUrl = `${window.location.origin}/success`,
        cancelUrl = `${window.location.origin}/pricing`
      } = params

      // In a real implementation, this would call your backend API
      // which would then call Stripe's API to create the session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
          successUrl,
          cancelUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to start checkout process')
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param {string} sessionId - Checkout session ID
   * @returns {Promise<void>}
   */
  async redirectToCheckout(sessionId) {
    await this.initialize()

    try {
      const { error } = await this.stripe.redirectToCheckout({
        sessionId
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error)
      throw new Error('Failed to redirect to payment page')
    }
  }

  /**
   * Create a subscription for a plan
   * @param {string} planId - Plan ID (free, pro, business)
   * @param {Object} userInfo - User information
   * @returns {Promise<Object>} Subscription result
   */
  async createSubscription(planId, userInfo) {
    try {
      const plan = config.SUBSCRIPTION_PLANS[planId.toUpperCase()]
      
      if (!plan) {
        throw new Error('Invalid subscription plan')
      }

      // For free plan, no payment required
      if (plan.id === 'free') {
        return {
          success: true,
          subscription: {
            id: 'free_' + Date.now(),
            plan: plan.id,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        }
      }

      // For paid plans, create checkout session
      const priceIds = {
        pro: 'price_pro_monthly', // Replace with actual Stripe price IDs
        business: 'price_business_monthly'
      }

      const session = await this.createCheckoutSession({
        priceId: priceIds[plan.id],
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`
      })

      await this.redirectToCheckout(session.id)

      return {
        success: true,
        redirected: true
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error(`Subscription creation failed: ${error.message}`)
    }
  }

  /**
   * Get subscription details
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      // In a real implementation, this would call your backend API
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const subscription = await response.json()
      return subscription
    } catch (error) {
      console.error('Error fetching subscription:', error)
      // Return mock data for development
      return this.getMockSubscription(subscriptionId)
    }
  }

  /**
   * Cancel a subscription
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }

  /**
   * Update subscription plan
   * @param {string} subscriptionId - Current subscription ID
   * @param {string} newPlanId - New plan ID
   * @returns {Promise<Object>} Update result
   */
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      const newPlan = config.SUBSCRIPTION_PLANS[newPlanId.toUpperCase()]
      
      if (!newPlan) {
        throw new Error('Invalid subscription plan')
      }

      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          planId: newPlan.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw new Error('Failed to update subscription')
    }
  }

  /**
   * Get billing history
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} Billing history
   */
  async getBillingHistory(customerId) {
    try {
      const response = await fetch(`/api/customers/${customerId}/invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch billing history')
      }

      const invoices = await response.json()
      return invoices
    } catch (error) {
      console.error('Error fetching billing history:', error)
      // Return mock data for development
      return this.getMockBillingHistory()
    }
  }

  /**
   * Create a customer portal session
   * @param {string} customerId - Customer ID
   * @returns {Promise<string>} Portal URL
   */
  async createPortalSession(customerId) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin + '/dashboard'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw new Error('Failed to access billing portal')
    }
  }

  /**
   * Check if user has reached video generation limit
   * @param {Object} subscription - User's subscription
   * @param {number} currentUsage - Current month's video count
   * @returns {boolean} Whether limit is reached
   */
  hasReachedLimit(subscription, currentUsage) {
    const plan = config.SUBSCRIPTION_PLANS[subscription.plan.toUpperCase()]
    
    if (!plan) return true
    if (plan.videoLimit === -1) return false // Unlimited
    
    return currentUsage >= plan.videoLimit
  }

  /**
   * Get remaining video credits
   * @param {Object} subscription - User's subscription
   * @param {number} currentUsage - Current month's video count
   * @returns {number} Remaining credits (-1 for unlimited)
   */
  getRemainingCredits(subscription, currentUsage) {
    const plan = config.SUBSCRIPTION_PLANS[subscription.plan.toUpperCase()]
    
    if (!plan) return 0
    if (plan.videoLimit === -1) return -1 // Unlimited
    
    return Math.max(0, plan.videoLimit - currentUsage)
  }

  /**
   * Get plan features
   * @param {string} planId - Plan ID
   * @returns {Array} Plan features
   */
  getPlanFeatures(planId) {
    const plan = config.SUBSCRIPTION_PLANS[planId.toUpperCase()]
    return plan ? plan.features : []
  }

  /**
   * Get mock subscription for development
   * @private
   */
  getMockSubscription(subscriptionId) {
    return {
      id: subscriptionId,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      customer: {
        id: 'cus_mock',
        email: 'user@example.com'
      }
    }
  }

  /**
   * Get mock billing history for development
   * @private
   */
  getMockBillingHistory() {
    return [
      {
        id: 'in_mock_1',
        amount: 2900,
        currency: 'usd',
        status: 'paid',
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        invoicePdf: '#'
      },
      {
        id: 'in_mock_2',
        amount: 2900,
        currency: 'usd',
        status: 'paid',
        created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        invoicePdf: '#'
      }
    ]
  }

  /**
   * Format currency amount
   * @param {number} amount - Amount in cents
   * @param {string} currency - Currency code
   * @returns {string} Formatted amount
   */
  formatAmount(amount, currency = 'usd') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }
}

export default new StripeService()
