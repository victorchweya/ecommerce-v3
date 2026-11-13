import { watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
export function useCheckoutSession() {
  const cart = useCartStore()
  const checkout = useCheckoutStore()
  watch(
    () => cart.ownerId,
    (id) => checkout.bind(id),
    { immediate: true, flush: 'sync' },
  )
}
