import { apiClient } from './client'
import type { ActivityLog } from '@/types'

export const activityApi = {
  listByTask: async (taskId: number): Promise<ActivityLog[]> => {
    return apiClient<ActivityLog[]>(`/tasks/${taskId}/activity/`, {
      method: 'GET',
    })
  },
}
