import { apiClient, tokenStorage } from './client'
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const data = await apiClient<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: payload,
    })
    tokenStorage.setTokens(data.access, data.refresh)
    return data
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    return apiClient<User>('/auth/register/', {
      method: 'POST',
      body: payload,
    })
  },

  getMe: async (): Promise<User> => {
    return apiClient<User>('/auth/me/', {
      method: 'GET',
    })
  },

  logout: async (): Promise<void> => {
    const refresh = tokenStorage.getRefresh()
    try {
      if (refresh) {
        await apiClient('/auth/logout/', {
          method: 'POST',
          body: { refresh },
        })
      }
    } finally {
      tokenStorage.clear()
    }
  },
}
