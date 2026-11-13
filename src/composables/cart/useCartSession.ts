import { watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useCartStore } from '@/stores/cart'
import { useSession } from '@/composables/auth/useSession'
import { profileQuery } from '@/queries/auth'
import { queryClient } from '@/lib/query-client'
import { cartStorageKey } from '@/utils/cart/persistence'

export function useCartSession() {
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  const cart = useCartStore()
  const { profile } = useSession()
  watch(
    [() => auth.token, () => auth.revision, profile.data, profile.isSuccess],
    () => {
      const current = auth.token
        ? queryClient.getQueryData(profileQuery(auth.token, auth.revision).queryKey)
        : null
      cart.setOwner(
        current && profile.isSuccess.value && current.id === profile.data.value?.id
          ? current.id
          : null,
      )
    },
    { immediate: true, flush: 'sync' },
  )
  watch(
    () => organization.selectedBranchId,
    () => cart.selectVoucher(null),
    { flush: 'sync' },
  )
  useEventListener(window, 'storage', (event) => {
    if (cart.ownerId && (event.key === cartStorageKey(cart.ownerId) || event.key === null)) {
      cart.reload()
      if (!cart.needsRecovery)
        cart.notice = 'Cart updated in another tab. Review it before continuing.'
    }
  })
}
