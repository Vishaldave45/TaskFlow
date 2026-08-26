export interface ApiErrorDetail {
  [key: string]: string[] | string
}

export interface ApiError {
  error: {
    code: string
    message: string | ApiErrorDetail
    details?: ApiErrorDetail
  }
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
