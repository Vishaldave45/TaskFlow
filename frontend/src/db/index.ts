import {
  DbClient,
  collectionOptions,
  useDbClient,
} from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/query-core'
import { projectsApi } from '@/api/projects'
import { tasksApi } from '@/api/tasks'
import type { Project, Task } from '@/types'

/**
 * Projects Collection
 *
 * Uses `collectionOptions` + `queryCollectionOptions` to bridge
 * TanStack Query (data fetching / caching) with TanStack DB (reactive local store).
 * The `queryFn` loads data via Query, which is automatically materialized into the collection.
 * Mutation handlers (`onInsert`, `onUpdate`, `onDelete`) sync optimistic local changes back to the server.
 */
export const projectCollectionOpts = collectionOptions(
  'projects',
  (client) =>
    queryCollectionOptions<Project, number>({
      id: 'projects',
      queryKey: ['projects', 'list'] as const,
      queryClient: client.requireDependency<QueryClient>('queryClient'),
      queryFn: async () => {
        return projectsApi.list()
      },
      getKey: (project) => project.id,
      onInsert: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'insert') {
            const item = mutation.modified as Partial<Project>
            await projectsApi.create({
              name: item.name || '',
              description: item.description,
            })
          }
        }
      },
      onUpdate: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'update') {
            const key = mutation.key as number
            await projectsApi.update(key, mutation.modified)
          }
        }
      },
      onDelete: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'delete') {
            const key = mutation.key as number
            await projectsApi.delete(key)
          }
        }
      },
    }),
)

/**
 * Tasks Collection
 *
 * Loads all tasks the current user can access via `tasksApi.listAll()`.
 * Used for reactive queries (filtering, sorting) on the client side.
 * Infinite scroll uses separate `useInfiniteQuery` hooks — this collection
 * is for the reactive local store powering the Kanban board and live queries.
 */
export const taskCollectionOpts = collectionOptions(
  'tasks',
  (client) =>
    queryCollectionOptions<Task, number>({
      id: 'tasks',
      queryKey: ['tasks', 'collection'] as const,
      queryClient: client.requireDependency<QueryClient>('queryClient'),
      queryFn: async () => {
        return tasksApi.listAll()
      },
      getKey: (task) => task.id,
      onInsert: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'insert') {
            const item = mutation.modified as any
            // Note: project ID must be embedded in the insert data for the API
            if (item._projectId) {
              const { _projectId, ...data } = item
              await tasksApi.create(_projectId, data)
            }
          }
        }
      },
      onUpdate: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'update') {
            const key = mutation.key as number
            await tasksApi.update(key, mutation.modified)
          }
        }
      },
      onDelete: async ({ transaction }) => {
        for (const mutation of transaction.mutations) {
          if (mutation.type === 'delete') {
            const key = mutation.key as number
            await tasksApi.delete(key)
          }
        }
      },
    }),
)

/** Hook to access the materialized Projects collection from the nearest DbClient */
export function useProjectsCollection() {
  return useDbClient().collection(projectCollectionOpts)
}

/** Hook to access the materialized Tasks collection from the nearest DbClient */
export function useTasksCollection() {
  return useDbClient().collection(taskCollectionOpts)
}
