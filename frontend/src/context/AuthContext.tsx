import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { getAccessToken } from '@/api/client'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken()
      if (token) {
        try {
          const userData = await authApi.getMe()
          setUser(userData)
        } catch {
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    await authApi.login(credentials)
    const userData = await authApi.getMe()
    setUser(userData)
  }

  const register = async (credentials: RegisterCredentials) => {
    await authApi.register(credentials)
    const userData = await authApi.getMe()
    setUser(userData)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
