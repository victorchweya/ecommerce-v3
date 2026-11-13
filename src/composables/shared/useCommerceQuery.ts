import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { commerceQuery, type CommerceTarget } from '@/queries/context'
import { useCommerceContext } from './useCommerceContext'
export function useCommerceQuery<T>(
  key: () => readonly unknown[],
  fetcher: (target: CommerceTarget, signal: AbortSignal) => Promise<T>,
  enabled: () => boolean = () => true,
  home = false,
) {
  const context = useCommerceContext()
  const query = useQuery(
    computed(() => ({
      ...commerceQuery(context.target(), key(), fetcher, home),
      enabled: context.ready.value && enabled(),
    })),
  )
  return { ...context, query }
}
