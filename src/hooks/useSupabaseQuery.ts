import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Enhanced hook for Supabase queries with better error handling and caching
export function useSupabaseQuery<T = any>(
  queryKey: (string | number)[],
  queryFn: () => Promise<{ data: T; error: any }>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    retry?: boolean | number
    retryDelay?: number
    refetchOnWindowFocus?: boolean
    requireAuth?: boolean
  }
) {
  const { user } = useAuth()

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (options?.requireAuth && !user) {
        throw new Error('Authentication required')
      }

      const result = await queryFn()
      
      if (result.error) {
        console.error('Supabase query error:', result.error)
        throw result.error
      }

      return result.data
    },
    enabled: options?.requireAuth ? !!user && (options.enabled ?? true) : (options.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes default
    retry: options?.retry ?? 3,
    retryDelay: options?.retryDelay,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })
}

// Enhanced hook for Supabase mutations with optimistic updates
export function useSupabaseMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<{ data: TData; error: any }>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: any, variables: TVariables) => void
    invalidateQueries?: (string | number)[][]
    optimisticUpdate?: {
      queryKey: (string | number)[]
      updater: (oldData: any, variables: TVariables) => any
    }
    requireAuth?: boolean
  }
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (options?.requireAuth && !user) {
        throw new Error('Authentication required')
      }

      const result = await mutationFn(variables)

      if (result.error) {
        console.error('Supabase mutation error:', result.error)
        throw result.error
      }

      return result.data
    },
    onMutate: async (variables) => {
      // Optimistic update
      if (options?.optimisticUpdate) {
        await queryClient.cancelQueries({ queryKey: options.optimisticUpdate.queryKey })
        
        const previousData = queryClient.getQueryData(options.optimisticUpdate.queryKey)
        
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          options.optimisticUpdate.updater(previousData, variables)
        )

        return { previousData }
      }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (options?.optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(options.optimisticUpdate.queryKey, context.previousData)
      }
      
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey })
        })
      }

      options?.onSuccess?.(data, variables)
    },
  })
}

// Hook for paginated Supabase queries
export function useSupabasePaginatedQuery<T = any>(
  baseQueryKey: (string | number)[],
  queryFn: (page: number, pageSize: number) => Promise<{ data: T[]; error: any; count?: number }>,
  options?: {
    pageSize?: number
    enabled?: boolean
    requireAuth?: boolean
  }
) {
  const { user } = useAuth()
  const pageSize = options?.pageSize ?? 20

  return useQuery({
    queryKey: [...baseQueryKey, 'paginated'],
    queryFn: async () => {
      if (options?.requireAuth && !user) {
        throw new Error('Authentication required')
      }

      let allData: T[] = []
      let page = 0
      let hasMore = true
      let totalCount = 0

      while (hasMore) {
        const result = await queryFn(page, pageSize)
        
        if (result.error) {
          console.error('Supabase paginated query error:', result.error)
          throw result.error
        }

        allData = [...allData, ...result.data]
        
        if (result.count !== undefined) {
          totalCount = result.count
        }

        hasMore = result.data.length === pageSize
        page++
      }

      return {
        data: allData,
        totalCount,
        pageCount: Math.ceil(totalCount / pageSize)
      }
    },
    enabled: options?.requireAuth ? !!user && (options.enabled ?? true) : (options.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Real-time subscription hook for Supabase
export function useSupabaseSubscription<T = any>(
  table: string,
  options?: {
    filter?: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    enabled?: boolean
    requireAuth?: boolean
    onData?: (payload: T) => void
    onError?: (error: any) => void
  }
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['subscription', table, options?.filter, options?.event],
    queryFn: () => {
      return new Promise((resolve, reject) => {
        if (options?.requireAuth && !user) {
          reject(new Error('Authentication required'))
          return
        }

        const channel = supabase
          .channel(`${table}_changes`)
          .on(
            'postgres_changes' as any,
            {
              event: options?.event ?? '*',
              schema: 'public',
              table,
              filter: options?.filter
            },
            (payload) => {
              console.log('Real-time update:', payload)
              
              if (options?.onData) {
                options.onData((payload as any).new as T)
              }

              // Invalidate related queries
              queryClient.invalidateQueries({ queryKey: [table] })
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve(channel)
            } else if (status === 'CHANNEL_ERROR') {
              const error = new Error('Subscription failed')
              if (options?.onError) {
                options.onError(error)
              }
              reject(error)
            }
          })

        return () => {
          supabase.removeChannel(channel)
        }
      })
    },
    enabled: options?.requireAuth ? !!user && (options?.enabled ?? true) : (options?.enabled ?? true),
    staleTime: Infinity, // Subscriptions don't go stale
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}