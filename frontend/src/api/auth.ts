import { apiClient, clearTokens, setTokens } from './client'
import { TokenResponse, User } from '@/types/auth'

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/auth/login/', credentials)
    setTokens(data.access, data.refresh)
    return data
  },

  register: async (payload: { email: string; username: string; password: string }): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/register/', payload)
    return data
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/', { refresh: refreshToken })
    } finally {
      clearTokens()
    }
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me/')
    return data
  },
}
