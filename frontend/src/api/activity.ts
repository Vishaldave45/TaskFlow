import { apiClient } from './client'
import type { ActivityLog, PaginatedResponse } from '@/types'

export const activityApi = {
  async listByTask(taskId: number): Promise<ActivityLog[]> {
    const data = await apiClient<PaginatedResponse<ActivityLog> | ActivityLog[]>(`/tasks/${taskId}/activity/`)
    if (Array.isArray(data)) return data
    return data.results || []
  },
}
