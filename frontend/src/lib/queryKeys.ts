export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },

  projects: {
    all: ['projects'] as const,
    list: () => ['projects', 'list'] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
  },

  tasks: {
    all: ['tasks'] as const,
    allList: (params?: { assigned_to_me?: boolean }) => ['tasks', 'all', params] as const,
    projectList: (projectId: number) => ['tasks', 'project', projectId] as const,
    detail: (id: number) => ['tasks', 'detail', id] as const,
    // Infinite scroll query keys
    infiniteAll: (params?: { assigned_to_me?: boolean }) =>
      ['tasks', 'infinite', 'all', params] as const,
    infiniteProject: (projectId: number) =>
      ['tasks', 'infinite', 'project', projectId] as const,
  },

  comments: {
    all: ['comments'] as const,
    byTask: (taskId: number) => ['comments', 'task', taskId] as const,
    list: (taskId: number) => ['comments', 'task', taskId] as const,
  },

  activity: {
    all: ['activity'] as const,
    byTask: (taskId: number) => ['activity', 'task', taskId] as const,
    list: (taskId: number) => ['activity', 'task', taskId] as const,
  },
}