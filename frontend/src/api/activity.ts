import { apiClient } from './client'
import { ActivityLog } from '@/types/activity'
import { PaginatedResponse } from '@/types/api'

export const activityApi = {
  listForTask: async (taskId: number): Promise<PaginatedResponse<ActivityLog> | ActivityLog[]> => {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog> | ActivityLog[]>(
      `/tasks/${taskId}/activity/`
    )
    return data
  },
}
