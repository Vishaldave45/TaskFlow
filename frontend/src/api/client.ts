const API_BASE = '/api/v1'

export class ApiError extends Error {
  status: number
  details: Record<string, unknown> | null

  constructor(message: string, status: number, details: Record<string, unknown> | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      clearTokens()
      return null
    }

    const data = await res.json()
    localStorage.setItem('access_token', data.access)
    return data.access
  } catch {
    clearTokens()
    return null
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(url, { ...options, headers })

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(url, { ...options, headers })
    } else {
      clearTokens()
      window.location.href = '/login'
      throw new ApiError('Session expired. Please log in again.', 401)
    }
  }

  if (!res.ok) {
    let errorMessage = 'An error occurred'
    let errorDetails: Record<string, unknown> | null = null

    try {
      const errorData = await res.json()
      if (errorData.error) {
        errorMessage = errorData.error.message || errorMessage
        errorDetails = errorData.error.details || null
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      } else {
        const firstKey = Object.keys(errorData)[0]
        if (firstKey) {
          const val = errorData[firstKey]
          errorMessage = Array.isArray(val) ? val[0] : String(val)
        }
      }
    } catch {
      // Non-JSON response
    }

    throw new ApiError(errorMessage, res.status, errorDetails)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken }
