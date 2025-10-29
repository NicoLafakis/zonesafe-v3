/**
 * API Service Layer for ZoneSafe Frontend
 * Communicates with Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Token management
let authToken: string | null = localStorage.getItem('zonesafe_token')

export const setAuthToken = (token: string | null) => {
  authToken = token
  if (token) {
    localStorage.setItem('zonesafe_token', token)
  } else {
    localStorage.removeItem('zonesafe_token')
  }
}

export const getAuthToken = () => authToken

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// ============================================================================
// Authentication API
// ============================================================================

export interface User {
  id: number
  email: string
  name?: string
  picture?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const authAPI = {
  /**
   * Authenticate with Google OAuth credential
   */
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    })
    setAuthToken(response.token)
    return response
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiRequest('/api/auth/logout', { method: 'POST' })
    setAuthToken(null)
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<{ user: User }> => {
    return apiRequest('/api/auth/me')
  },
}

// ============================================================================
// Plans API
// ============================================================================

export interface Plan {
  id: number
  title: string
  work_type: string
  status: string
  road_name: string
  start_address: string
  created_at: string
  updated_at: string
  confidence_score: number
}

export interface PlanDetail extends Plan {
  end_address: string
  latitude: number | null
  longitude: number | null
  speed_limit: number
  lane_count: number
  selected_lanes: number[]
  work_zone_length_feet: number
  duration_value: number
  duration_unit: string
  time_of_day: string
  days_of_week: string
  worker_count: number
  has_flagger: boolean
  flagger_count: number | null
  equipment: any[]
  mutcd_calculations: any
  data_sources: any
}

export interface CreatePlanPayload {
  title: string
  workType: string
  roadData: any
  workTiming: any
  workZoneDetails: any
  equipment: any[]
  mutcdCalculations: any
  confidenceScore?: number
  dataSources?: any
}

export const plansAPI = {
  /**
   * Get all plans for authenticated user
   */
  getAll: async (): Promise<{ plans: Plan[] }> => {
    return apiRequest('/api/plans')
  },

  /**
   * Get single plan by ID
   */
  getById: async (id: number): Promise<{ plan: PlanDetail }> => {
    return apiRequest(`/api/plans/${id}`)
  },

  /**
   * Create new plan
   */
  create: async (payload: CreatePlanPayload): Promise<{ planId: number; message: string }> => {
    return apiRequest('/api/plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Update existing plan
   */
  update: async (id: number, updates: Partial<Plan>): Promise<{ message: string }> => {
    return apiRequest(`/api/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  /**
   * Delete plan
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/api/plans/${id}`, { method: 'DELETE' })
  },

  /**
   * Export plan as PDF
   */
  export: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/api/plans/${id}/export`, { method: 'POST' })
  },
}

// ============================================================================
// Users API
// ============================================================================

export const usersAPI = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: User }> => {
    return apiRequest('/api/users/me')
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<{ totalPlans: number; mostRecent: Plan | null }> => {
    return apiRequest('/api/users/stats')
  },
}

export default {
  auth: authAPI,
  plans: plansAPI,
  users: usersAPI,
}
