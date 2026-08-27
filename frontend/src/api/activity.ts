import { apiClient } from './client'
import type { ActivityLog, PaginatedResponse } from '@/types'

export const activityApi = {
  listByTask: async (taskId: number): Promise<ActivityLog[]> => {
    const data = await apiClient<ActivityLog[] | PaginatedResponse<ActivityLog>>(`/tasks/${taskId}/activity/`, {
      method: 'GET',
    })
    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as PaginatedResponse<ActivityLog>).results)) {
      return (data as PaginatedResponse<ActivityLog>).results
    }
    return []
  },
}
