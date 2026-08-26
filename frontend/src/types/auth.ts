export interface User {
  id: number
  email: string
  username: string
  created_at?: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
