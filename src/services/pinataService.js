/**
 * Pinata Service
 * Handles IPFS file storage using Pinata API
 */

import config from '../config/env.js'

class PinataService {
  constructor() {
    this.apiKey = config.PINATA_API_KEY
    this.secretKey = config.PINATA_SECRET_KEY
    this.baseUrl = config.PINATA_API_URL
    this.headers = {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param {File} file - File to upload
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} Upload result with IPFS hash
   */
  async uploadFile(file, metadata = {}) {
    try {
      // Validate file size
      if (file.size > config.LIMITS.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds limit of ${config.LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`)
      }

      const formData = new FormData()
      formData.append('file', file)

      // Add metadata if provided
      if (metadata.name || metadata.description) {
        const pinataMetadata = {
          name: metadata.name || file.name,
          keyvalues: {
            description: metadata.description || '',
            uploadedBy: 'VidSynth Automator',
            uploadDate: new Date().toISOString(),
            fileType: file.type,
            fileSize: file.size.toString(),
            ...metadata.keyvalues
          }
        }
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
      }

      // Add pinning options
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false,
        ...metadata.options
      }
      formData.append('pinataOptions', JSON.stringify(pinataOptions))

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.headers,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Pinata API error: ${response.status} ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        gatewayUrl: `https://${result.IpfsHash}.ipfs.dweb.link/`,
        metadata: {
          name: metadata.name || file.name,
          type: file.type,
          size: file.size
        }
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error)
      throw new Error(`File upload failed: ${error.message}`)
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param {Object} data - JSON data to upload
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} Upload result with IPFS hash
   */
  async uploadJSON(data, metadata = {}) {
    try {
      const jsonData = {
        ...data,
        _metadata: {
          uploadedBy: 'VidSynth Automator',
          uploadDate: new Date().toISOString(),
          version: '1.0'
        }
      }

      const requestBody = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name || 'VidSynth Data',
          keyvalues: {
            type: 'json',
            description: metadata.description || '',
            ...metadata.keyvalues
          }
        },
        pinataOptions: {
          cidVersion: 1,
          ...metadata.options
        }
      }

      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Pinata API error: ${response.status} ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        gatewayUrl: `https://${result.IpfsHash}.ipfs.dweb.link/`
      }
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error)
      throw new Error(`JSON upload failed: ${error.message}`)
    }
  }

  /**
   * Get list of pinned files
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of pinned files
   */
  async getPinnedFiles(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.pageLimit) queryParams.append('pageLimit', filters.pageLimit.toString())
      if (filters.pageOffset) queryParams.append('pageOffset', filters.pageOffset.toString())
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          queryParams.append(`metadata[keyvalues][${key}]`, value)
        })
      }

      const response = await fetch(`${this.baseUrl}/data/pinList?${queryParams}`, {
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return result.rows.map(item => ({
        ipfsHash: item.ipfs_pin_hash,
        size: item.size,
        timestamp: item.date_pinned,
        name: item.metadata?.name || 'Unnamed',
        keyvalues: item.metadata?.keyvalues || {},
        url: `https://gateway.pinata.cloud/ipfs/${item.ipfs_pin_hash}`,
        gatewayUrl: `https://${item.ipfs_pin_hash}.ipfs.dweb.link/`
      }))
    } catch (error) {
      console.error('Error fetching pinned files:', error)
      throw new Error(`Failed to fetch files: ${error.message}`)
    }
  }

  /**
   * Unpin a file from IPFS
   * @param {string} ipfsHash - IPFS hash to unpin
   * @returns {Promise<boolean>} Success status
   */
  async unpinFile(ipfsHash) {
    try {
      const response = await fetch(`${this.baseUrl}/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers: this.headers
      })

      return response.ok
    } catch (error) {
      console.error('Error unpinning file:', error)
      return false
    }
  }

  /**
   * Update metadata for a pinned file
   * @param {string} ipfsHash - IPFS hash
   * @param {Object} metadata - New metadata
   * @returns {Promise<boolean>} Success status
   */
  async updateMetadata(ipfsHash, metadata) {
    try {
      const requestBody = {
        ipfsPinHash: ipfsHash,
        name: metadata.name,
        keyvalues: metadata.keyvalues || {}
      }

      const response = await fetch(`${this.baseUrl}/pinning/hashMetadata`, {
        method: 'PUT',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      return response.ok
    } catch (error) {
      console.error('Error updating metadata:', error)
      return false
    }
  }

  /**
   * Upload brand assets (logo, images)
   * @param {File} file - Brand asset file
   * @param {string} assetType - Type of asset (logo, background, etc.)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadBrandAsset(file, assetType, userId) {
    try {
      const metadata = {
        name: `${assetType}_${userId}_${Date.now()}`,
        description: `Brand ${assetType} for user ${userId}`,
        keyvalues: {
          assetType,
          userId,
          category: 'brand-asset'
        }
      }

      return await this.uploadFile(file, metadata)
    } catch (error) {
      console.error('Error uploading brand asset:', error)
      throw error
    }
  }

  /**
   * Upload generated video
   * @param {File} videoFile - Video file
   * @param {File} thumbnailFile - Thumbnail file
   * @param {Object} videoMetadata - Video metadata
   * @returns {Promise<Object>} Upload results for both files
   */
  async uploadGeneratedVideo(videoFile, thumbnailFile, videoMetadata) {
    try {
      const videoUpload = await this.uploadFile(videoFile, {
        name: `video_${videoMetadata.projectId}_${Date.now()}`,
        description: `Generated video: ${videoMetadata.prompt}`,
        keyvalues: {
          type: 'generated-video',
          projectId: videoMetadata.projectId,
          userId: videoMetadata.userId,
          prompt: videoMetadata.prompt,
          style: videoMetadata.style,
          duration: videoMetadata.duration?.toString()
        }
      })

      const thumbnailUpload = await this.uploadFile(thumbnailFile, {
        name: `thumbnail_${videoMetadata.projectId}_${Date.now()}`,
        description: `Thumbnail for video: ${videoMetadata.prompt}`,
        keyvalues: {
          type: 'video-thumbnail',
          projectId: videoMetadata.projectId,
          userId: videoMetadata.userId,
          videoHash: videoUpload.ipfsHash
        }
      })

      return {
        video: videoUpload,
        thumbnail: thumbnailUpload
      }
    } catch (error) {
      console.error('Error uploading generated video:', error)
      throw error
    }
  }

  /**
   * Get user's brand assets
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's brand assets
   */
  async getUserBrandAssets(userId) {
    try {
      return await this.getPinnedFiles({
        metadata: {
          userId,
          category: 'brand-asset'
        },
        pageLimit: 100
      })
    } catch (error) {
      console.error('Error fetching user brand assets:', error)
      return []
    }
  }

  /**
   * Get user's generated videos
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User's generated videos
   */
  async getUserVideos(userId) {
    try {
      return await this.getPinnedFiles({
        metadata: {
          userId,
          type: 'generated-video'
        },
        pageLimit: 100
      })
    } catch (error) {
      console.error('Error fetching user videos:', error)
      return []
    }
  }

  /**
   * Test Pinata connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
        method: 'GET',
        headers: this.headers
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Pinata connection test:', result.message)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Pinata connection test failed:', error)
      return false
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Storage usage stats
   */
  async getUsageStats() {
    try {
      const response = await fetch(`${this.baseUrl}/data/userPinnedDataTotal`, {
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        pinCount: result.pin_count,
        pinSizeTotal: result.pin_size_total,
        pinSizeWithReplicationsTotal: result.pin_size_with_replications_total
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return {
        pinCount: 0,
        pinSizeTotal: 0,
        pinSizeWithReplicationsTotal: 0
      }
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Generate a shareable link for an IPFS file
   * @param {string} ipfsHash - IPFS hash
   * @param {string} gateway - Gateway to use (default: pinata)
   * @returns {string} Shareable URL
   */
  generateShareableLink(ipfsHash, gateway = 'pinata') {
    const gateways = {
      pinata: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      ipfs: `https://ipfs.io/ipfs/${ipfsHash}`,
      dweb: `https://${ipfsHash}.ipfs.dweb.link/`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`
    }
    
    return gateways[gateway] || gateways.pinata
  }
}

export default new PinataService()
