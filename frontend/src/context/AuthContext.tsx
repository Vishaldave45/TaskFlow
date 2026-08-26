import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'
import { authApi } from '@/api/auth'
import { clearTokens, getAccessToken, getRefreshToken } from '@/api/client'
import { User } from '@/types/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (payload: { email: string; username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getAccessToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [, startTransition] = useTransition()

  const fetchCurrentUser = async () => {
    const accessToken = getAccessToken()
    if (!accessToken) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.getMe()
      startTransition(() => {
        setUser(userData)
        setToken(accessToken)
      })
    } catch {
      clearTokens()
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()

    const handleLogoutEvent = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:logout', handleLogoutEvent)
    return () => window.removeEventListener('auth:logout', handleLogoutEvent)
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    const tokenData = await authApi.login(credentials)
    setToken(tokenData.access)
    const userData = await authApi.getMe()
    setUser(userData)
  }

  const register = async (payload: { email: string; username: string; password: string }) => {
    await authApi.register(payload)
    await login({ email: payload.email, password: payload.password })
  }

  const logout = async () => {
    const refresh = getRefreshToken()
    if (refresh) {
      try {
        await authApi.logout(refresh)
      } catch {
        // ignore logout failure on network error
      }
    }
    clearTokens()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
