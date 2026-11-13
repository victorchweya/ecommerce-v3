import { computed, shallowRef } from 'vue'
import { z } from 'zod'
import { useQuery } from '@tanstack/vue-query'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useOrganization } from '@/composables/organization/useOrganization'
import { useSession } from '@/composables/auth/useSession'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { productsQuery } from '@/queries/catalog'
import { voucherQuery } from '@/queries/checkout'
import { decimalSchema, type Product, type ProductSelection } from '@/types/catalog'
import { calculateCart, cartSummary, voucherAvailable } from '@/utils/cart/calculations'
import { additionIssue } from '@/validation/cart'
import type { CartLine } from '@/types/cart'

export function useCart(loadProducts = true) {
  const cart = useCartStore()
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  const { profile } = useSession()
  const { company, isParent } = useOrganization()
  const catalog = useCatalog(false)
  const ready = computed(() => catalog.ready.value && cart.ownerId === profile.data.value?.id)
  const products = useQuery(
    computed(() => ({
      ...productsQuery(auth.token, auth.revision),
      enabled: loadProducts && ready.value && cart.count > 0,
      refetchOnMount: 'always' as const,
    })),
  )
  const branchId = computed(() => (isParent.value ? organization.selectedBranchId : null))
  const availableVoucher = useQuery(
    computed(() => ({
      ...voucherQuery(auth.token, auth.revision, branchId.value),
      enabled: loadProducts && ready.value && cart.count > 0,
    })),
  )
  const selectedVoucher = useQuery(
    computed(() => ({
      ...voucherQuery(auth.token, auth.revision, branchId.value, cart.voucherCode ?? undefined),
      enabled: loadProducts && ready.value && cart.count > 0 && Boolean(cart.voucherCode),
    })),
  )
  const voucher = computed(() =>
    cart.voucherCode &&
    selectedVoucher.isSuccess.value &&
    !selectedVoucher.isFetching.value &&
    !selectedVoucher.isError.value &&
    voucherAvailable(selectedVoucher.data.value, catalog.now.value.getTime())
      ? (selectedVoucher.data.value ?? null)
      : null,
  )
  const minimum = computed(() => {
    const result = z
      .object({
        options: z
          .object({ minimum_basket_size: decimalSchema.pipe(z.number().nonnegative()) })
          .nullish(),
      })
      .safeParse(company.data.value?.customer_group)
    return result.success ? (result.data.options?.minimum_basket_size ?? 5000) : 5000
  })
  const lines = computed(() =>
    calculateCart(
      cart.items,
      products.data.value ?? [],
      catalog.pricing.value,
      catalog.now.value.getTime(),
    ),
  )
  const summary = computed(() =>
    cartSummary(lines.value, minimum.value, voucher.value, catalog.now.value.getTime()),
  )
  const scopeKey = computed(() => `${auth.revision}:${branchId.value}`)
  const contextKey = computed(() => `${scopeKey.value}:${cart.revision}`)
  const disabled = computed(() => !ready.value || cart.needsRecovery)
  const editingDisabled = computed(
    () => disabled.value || products.isFetching.value || products.isError.value,
  )
  const quantityReset = shallowRef(0)
  function saveQuantity(
    line: CartLine,
    quantity: number | null,
    context: { scope: string; revision: number },
  ) {
    if (quantity === line.selection.quantity) return
    if (
      editingDisabled.value ||
      context.scope !== scopeKey.value ||
      context.revision !== cart.revision
    ) {
      cart.error = 'The cart or shopping branch changed. Review the quantity and try again.'
      quantityReset.value++
      return
    }
    if (quantity === null || !line.product) {
      cart.error = 'Enter a valid quantity. The saved quantity has not changed.'
      quantityReset.value++
      return
    }
    if (
      !cart.apply({ ...line.selection, quantity }, line.product, {
        key: line.key,
        revision: context.revision,
        split: false,
      })
    )
      quantityReset.value++
  }
  function add(selection: ProductSelection, product: Product) {
    if (!ready.value) return false
    const issue = additionIssue(product, catalog.now.value.getTime())
    if (issue) {
      cart.error = issue
      return false
    }
    return cart.apply(selection, product)
  }
  function applyVoucher(code: string) {
    const value = code.trim()
    if (!ready.value || !value || value.length > 255) return
    if (cart.voucherCode === value) void selectedVoucher.refetch()
    else cart.selectVoucher(value)
  }
  return {
    cart,
    ready,
    products,
    availableVoucher,
    selectedVoucher,
    voucher,
    lines,
    summary,
    contextKey,
    scopeKey,
    disabled,
    editingDisabled,
    quantityReset,
    saveQuantity,
    add,
    applyVoucher,
    pricing: catalog.pricing,
    now: catalog.now,
  }
}
