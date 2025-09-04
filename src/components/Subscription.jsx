/**
 * Subscription Management Component
 * Displays current subscription status and allows plan changes
 */

import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { CreditCard, Check, Zap, Crown, Star, Calendar, DollarSign } from 'lucide-react'
import stripeService from '../services/stripeService'
import config from '../config/env'

function Subscription() {
  const { state, dispatch } = useApp()
  const [subscription, setSubscription] = useState(null)
  const [billingHistory, setBillingHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      
      // Load current subscription
      const subData = await stripeService.getSubscription(state.user.subscriptionId || 'mock')
      setSubscription(subData)
      
      // Load billing history
      const history = await stripeService.getBillingHistory(state.user.customerId || 'mock')
      setBillingHistory(history)
      
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId) => {
    try {
      setUpgrading(true)
      setSelectedPlan(planId)
      
      const result = await stripeService.createSubscription(planId, {
        email: state.user.email,
        name: state.user.name
      })
      
      if (result.success && !result.redirected) {
        // Update local state
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            subscriptionPlan: planId
          }
        })
        
        // Reload subscription data
        await loadSubscriptionData()
      }
      
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('Failed to upgrade subscription. Please try again.')
    } finally {
      setUpgrading(false)
      setSelectedPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }
    
    try {
      await stripeService.cancelSubscription(subscription.id)
      await loadSubscriptionData()
    } catch (error) {
      console.error('Cancellation failed:', error)
      alert('Failed to cancel subscription. Please try again.')
    }
  }

  const handleManageBilling = async () => {
    try {
      const portalUrl = await stripeService.createPortalSession(subscription.customer.id)
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Failed to open billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return <Star className="w-6 h-6" />
      case 'pro': return <Zap className="w-6 h-6" />
      case 'business': return <Crown className="w-6 h-6" />
      default: return <Star className="w-6 h-6" />
    }
  }

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free': return 'text-gray-400'
      case 'pro': return 'text-blue-400'
      case 'business': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-dark-text">Subscription</h1>
        </div>
        <div className="card">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-border rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-dark-border rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-dark-border rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = config.SUBSCRIPTION_PLANS[subscription?.plan?.toUpperCase() || 'FREE']

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Subscription</h1>
          <p className="text-dark-text-muted mt-1">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-dark-bg ${getPlanColor(currentPlan.id)}`}>
              {getPlanIcon(currentPlan.id)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-dark-text">{currentPlan.name} Plan</h2>
              <p className="text-dark-text-muted">
                {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/month`}
              </p>
            </div>
          </div>
          
          {subscription?.status && (
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                subscription.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {subscription.status === 'active' ? 'Active' : 'Inactive'}
              </div>
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-dark-text-muted mt-1">
                  {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-dark-bg rounded-lg">
            <div className="text-2xl font-bold text-dark-text">
              {currentPlan.videoLimit === -1 ? '∞' : currentPlan.videoLimit}
            </div>
            <div className="text-sm text-dark-text-muted">Videos per month</div>
          </div>
          <div className="text-center p-4 bg-dark-bg rounded-lg">
            <div className="text-2xl font-bold text-dark-text">
              {state.videos.filter(v => v.generationStatus === 'completed').length}
            </div>
            <div className="text-sm text-dark-text-muted">Videos created</div>
          </div>
          <div className="text-center p-4 bg-dark-bg rounded-lg">
            <div className="text-2xl font-bold text-dark-text">
              {currentPlan.features.length}
            </div>
            <div className="text-sm text-dark-text-muted">Features included</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-dark-text mb-3">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm text-dark-text-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {subscription?.plan !== 'business' && (
          <div className="flex space-x-3">
            <button
              onClick={handleManageBilling}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Manage Billing</span>
            </button>
            
            {subscription?.status === 'active' && subscription?.plan !== 'free' && (
              <button
                onClick={handleCancelSubscription}
                className="btn-secondary text-red-400 hover:text-red-300"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {/* Available Plans */}
      {subscription?.plan !== 'business' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-text mb-6">Upgrade Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(config.SUBSCRIPTION_PLANS).map((plan) => {
              const isCurrentPlan = plan.id === subscription?.plan
              const isUpgrading = upgrading && selectedPlan === plan.id
              
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    isCurrentPlan
                      ? 'border-primary bg-primary/5'
                      : 'border-dark-border bg-dark-bg hover:border-primary/50'
                  }`}
                >
                  {plan.id === 'pro' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${getPlanColor(plan.id)}`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-lg font-semibold text-dark-text">{plan.name}</h3>
                    <div className="text-3xl font-bold text-dark-text mt-2">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      {plan.price > 0 && <span className="text-sm text-dark-text-muted">/month</span>}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-dark-text-muted">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || isUpgrading}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-dark-border text-dark-text-muted cursor-not-allowed'
                        : isUpgrading
                        ? 'bg-primary/50 text-white cursor-not-allowed'
                        : 'bg-primary hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : isUpgrading
                      ? 'Processing...'
                      : plan.price === 0
                      ? 'Downgrade to Free'
                      : 'Upgrade Now'
                    }
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-dark-text mb-6">Billing History</h2>
          
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-dark-surface rounded-lg">
                    <Calendar className="w-4 h-4 text-dark-text-muted" />
                  </div>
                  <div>
                    <div className="font-medium text-dark-text">
                      {stripeService.formatAmount(invoice.amount, invoice.currency)}
                    </div>
                    <div className="text-sm text-dark-text-muted">
                      {new Date(invoice.created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'paid'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {invoice.status}
                  </span>
                  
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-400 text-sm"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscription
