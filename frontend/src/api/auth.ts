import { apiClient, setTokens, clearTokens } from './client'
import type { User, LoginCredentials, RegisterCredentials, AuthTokens } from '@/types'

export const authApi = {
  async register(data: RegisterCredentials): Promise<AuthTokens> {
    const response = await apiClient<AuthTokens>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setTokens(response.access, response.refresh)
    return response
  },

  async login(data: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setTokens(response.access, response.refresh)
    return response
  },

  async getMe(): Promise<User> {
    return apiClient<User>('/auth/me/')
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await apiClient('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      })
    } catch {
      // Ignore errors on logout
    }
    clearTokens()
  },
}
