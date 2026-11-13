import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient, useIsMutating } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { favouritesQuery } from '@/queries/catalog'
import { setFavourite } from '@/api/catalog'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'
import { replaceSession } from '@/composables/auth/session'
import { safeReturnTo } from '@/utils/auth'

export function useFavourites(ready: () => boolean) {
  const auth = useAuthStore()
  const client = useQueryClient()
  const route = useRoute()
  const router = useRouter()
  const pending = useIsMutating({ mutationKey: ['catalog', 'favourite'] })
  const busy = computed(() => pending.value > 0)
  const query = useQuery(
    computed(() => ({ ...favouritesQuery(auth.token, auth.revision), enabled: ready() })),
  )
  const ids = computed(() => new Set(query.data.value?.map((item) => item.product_id) ?? []))
  const mutation = useMutation({
    mutationKey: ['catalog', 'favourite'],
    mutationFn: (action: { productId: number; saved: boolean; token: string; revision: number }) =>
      setFavourite(action.token, action.productId, action.saved),
    async onSuccess(_result, action) {
      if (auth.revision !== action.revision || !auth.token) return
      await client.invalidateQueries({
        queryKey: favouritesQuery(action.token, action.revision).queryKey,
      })
    },
    onError(error, action) {
      if (
        auth.revision !== action.revision ||
        !auth.token ||
        !(error instanceof ApiError) ||
        error.status !== 401
      )
        return
      const returnTo = safeReturnTo(route.fullPath)
      replaceSession('')
      auth.notice = 'Your session expired. Please sign in again.'
      if (!route.meta.passwordRecovery) void router.replace({ name: 'login', query: { returnTo } })
    },
  })
  function toggle(productId: number) {
    if (
      !ready() ||
      busy.value ||
      mutation.isPending.value ||
      !query.isSuccess.value ||
      query.isError.value
    )
      return
    mutation.mutate({
      productId,
      saved: !ids.value.has(productId),
      token: auth.token,
      revision: auth.revision,
    })
  }
  return { query, ids, mutation, busy, toggle }
}
