export * from './auth'
export * from './project'
export * from './task'
export * from './comment'
export * from './activity'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
