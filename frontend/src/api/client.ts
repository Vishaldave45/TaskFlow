/**
 * TaskFlow API Client
 * Zero-dependency Fetch Client with JWT Auto-Refresh and Error Normalization
 */

const BASE_URL = '/api/v1'

export interface ApiErrorResponse {
  message: string
  status: number
  errors?: Record<string, string[] | string>
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[] | string>

  constructor(status: number, message: string, errors?: Record<string, string[] | string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Token storage helpers
export const tokenStorage = {
  getAccess: () => localStorage.getItem('taskflow_access_token'),
  getRefresh: () => localStorage.getItem('taskflow_refresh_token'),
  setTokens: (access: string, refresh?: string) => {
    localStorage.setItem('taskflow_access_token', access)
    if (refresh) {
      localStorage.setItem('taskflow_refresh_token', refresh)
    }
  },
  clear: () => {
    localStorage.removeItem('taskflow_access_token')
    localStorage.removeItem('taskflow_refresh_token')
  },
}

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      tokenStorage.clear()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      return null
    }

    const data = await res.json()
    tokenStorage.setTokens(data.access, data.refresh)
    return data.access
  } catch {
    tokenStorage.clear()
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    return null
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers = {}, ...rest } = options

  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString
    }
  }

  const token = tokenStorage.getAccess()
  const reqHeaders = new Headers(headers)

  if (!reqHeaders.has('Content-Type') && !(body instanceof FormData)) {
    reqHeaders.set('Content-Type', 'application/json')
  }

  if (token && !reqHeaders.has('Authorization')) {
    reqHeaders.set('Authorization', `Bearer ${token}`)
  }

  const config: RequestInit = {
    ...rest,
    headers: reqHeaders,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  }

  let response = await fetch(url, config)

  // Handle 401 and Token Refresh
  if (response.status === 401 && !endpoint.includes('/auth/login/') && !endpoint.includes('/auth/register/')) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await refreshAccessToken()
      isRefreshing = false

      if (newToken) {
        onRefreshed(newToken)
      }
    }

    const retryPromise = new Promise<T>((resolve, reject) => {
      addRefreshSubscriber(async (newToken: string) => {
        try {
          reqHeaders.set('Authorization', `Bearer ${newToken}`)
          const retryRes = await fetch(url, { ...config, headers: reqHeaders })
          if (!retryRes.ok) {
            const errData = await parseErrorBody(retryRes)
            return reject(new ApiError(retryRes.status, errData.message, errData.errors))
          }
          if (retryRes.status === 204) return resolve({} as T)
          resolve(await retryRes.json())
        } catch (err) {
          reject(err)
        }
      })
    })

    return retryPromise
  }

  if (!response.ok) {
    const errData = await parseErrorBody(response)
    throw new ApiError(response.status, errData.message, errData.errors)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

async function parseErrorBody(res: Response): Promise<{ message: string; errors?: Record<string, string[] | string> }> {
  try {
    const data = await res.json()
    if (typeof data === 'string') return { message: data }
    if (data.detail) return { message: data.detail }
    if (data.message) return { message: data.message }

    // If DRF returned field-level errors (e.g. { "email": ["..."], "password": ["..."] })
    if (typeof data === 'object' && data !== null) {
      const messages: string[] = []
      for (const [key, val] of Object.entries(data)) {
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
        if (Array.isArray(val)) {
          messages.push(`${fieldName}: ${val.join(' ')}`)
        } else if (typeof val === 'string') {
          messages.push(`${fieldName}: ${val}`)
        }
      }
      if (messages.length > 0) {
        return { message: messages.join(' | '), errors: data }
      }
    }

    return { message: 'An API error occurred.', errors: data }
  } catch {
    return { message: res.statusText || 'Network request failed.' }
  }
}
