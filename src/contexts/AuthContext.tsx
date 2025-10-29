import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, User, setAuthToken as setAPIToken } from '../services/api'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credential: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('zonesafe_token')
      if (token) {
        setAPIToken(token)
        const response = await authAPI.getCurrentUser()
        setUser(response.user)
      }
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('zonesafe_token')
      setAPIToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credential: string) => {
    try {
      const response = await authAPI.googleLogin(credential)
      setUser(response.user)
      setAPIToken(response.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAPIToken(null)
      localStorage.removeItem('zonesafe_token')
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      setUser(response.user)
    } catch (error) {
      console.error('Refresh user failed:', error)
      // If refresh fails, log out
      await logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
