import { defineStore } from 'pinia'
import { shallowRef, computed } from 'vue'
import type { Product, ProductSelection } from '@/types/catalog'
import { cartSelectionSchema, resolveSelection } from '@/validation/cart'
import { lineIdentity, normalizeSelection } from '@/utils/cart/line-identity'
import { readCart, writeCart } from '@/utils/cart/persistence'

export const useCartStore = defineStore('cart', () => {
  const ownerId = shallowRef<number | null>(null)
  const items = shallowRef<ProductSelection[]>([])
  const revision = shallowRef(0)
  const voucherCode = shallowRef<string | null>(null)
  const error = shallowRef('')
  const notice = shallowRef('')
  const needsRecovery = shallowRef(false)
  const savedRaw = shallowRef<string | null>(null)
  const count = computed(() => items.value.length)
  function reload() {
    if (!ownerId.value) return
    try {
      const saved = readCart(ownerId.value)
      const merged = new Map<string, ProductSelection>()
      for (const raw of saved.items) {
        const item = normalizeSelection(raw)
        const key = lineIdentity(item)
        const previous = merged.get(key)
        merged.set(key, { ...item, quantity: (previous?.quantity ?? 0) + item.quantity })
      }
      const parsed = [...merged.values()].map((item) => cartSelectionSchema.parse(item))
      items.value = parsed
      if (!parsed.length) voucherCode.value = null
      savedRaw.value = saved.raw
      needsRecovery.value = false
      error.value = ''
      notice.value = ''
      revision.value++
    } catch {
      needsRecovery.value = true
      error.value =
        'The saved cart could not be read. Retry loading it or explicitly reset the saved cart.'
    }
  }
  function setOwner(id: number | null) {
    if (id === ownerId.value) return
    ownerId.value = id
    items.value = []
    voucherCode.value = null
    error.value = ''
    notice.value = ''
    needsRecovery.value = false
    savedRaw.value = null
    revision.value++
    if (id !== null) reload()
  }
  function commit(next: ProductSelection[], message: string, force = false) {
    if (!ownerId.value || (needsRecovery.value && !force)) return false
    try {
      const raw = writeCart(ownerId.value, next, savedRaw.value, force)
      items.value = next
      savedRaw.value = raw
      error.value = ''
      needsRecovery.value = false
      notice.value = message
      revision.value++
      if (!next.length) voucherCode.value = null
      return true
    } catch (cause) {
      error.value =
        cause instanceof Error && cause.message.startsWith('Cart changed')
          ? cause.message
          : 'The cart could not be saved on this device. Your previous cart and draft are unchanged.'
      notice.value = ''
      return false
    }
  }
  function apply(
    input: ProductSelection,
    product: Product,
    options?: { key: string; revision: number; split: boolean },
  ) {
    if (needsRecovery.value) return false
    error.value = ''
    notice.value = ''
    if (!ownerId.value) {
      error.value = 'Sign in before changing the cart.'
      return false
    }
    const parsed = cartSelectionSchema.safeParse(input)
    if (!parsed.success) {
      error.value = 'Check the selected options and quantity.'
      return false
    }
    const selection = normalizeSelection(parsed.data)
    const issue = resolveSelection(selection, product).issue
    if (issue) {
      error.value = issue
      return false
    }
    const next = items.value.map((item) => ({ ...item }))
    if (options) {
      const index = next.findIndex((item) => lineIdentity(item) === options.key)
      const original = next[index]
      if (options.revision !== revision.value || !original) {
        error.value = 'The cart changed. Reopen the item before saving.'
        return false
      }
      if (
        original.productUnitVariantId !== selection.productUnitVariantId ||
        original.productId !== selection.productId
      ) {
        error.value = 'Remove and re-add the product to change its grade or unit.'
        return false
      }
      if (options.split) {
        const remaining = Math.round((original.quantity - selection.quantity) * 100) / 100
        if (lineIdentity(selection) === options.key) {
          error.value = 'Choose different processing or specifications for the split.'
          return false
        }
        const remainingIssue = resolveSelection({ ...original, quantity: remaining }, product).issue
        if (remaining <= 0 || remainingIssue) {
          error.value = 'Both parts must meet the minimum quantity and allowed decimal places.'
          return false
        }
        next[index] = { ...original, quantity: remaining }
      } else if (lineIdentity(selection) === options.key) {
        next[index] = selection
        return commit(next, 'Cart updated.')
      } else next.splice(index, 1)
    }
    const existing = next.findIndex((item) => lineIdentity(item) === lineIdentity(selection))
    if (existing >= 0) {
      const combined = {
        ...selection,
        quantity: Math.round((next[existing]!.quantity + selection.quantity) * 100) / 100,
      }
      if (
        !cartSelectionSchema.safeParse(combined).success ||
        resolveSelection(combined, product).issue
      ) {
        error.value = 'The combined quantity is invalid.'
        return false
      }
      next[existing] = combined
    } else next.push(selection)
    return commit(
      next,
      options?.split ? 'Item split.' : options ? 'Cart updated.' : 'Added to cart.',
    )
  }
  function appendSelections(selections: ProductSelection[], products: Product[]) {
    if (!ownerId.value || needsRecovery.value || !selections.length) return false
    const next = items.value.map((item) => ({ ...item }))
    for (const input of selections) {
      const parsed = cartSelectionSchema.safeParse(input)
      const product = products.find((product) => product.id === input.productId)
      if (!parsed.success || resolveSelection(input, product).issue) {
        error.value = 'Review the available product options before reordering.'
        return false
      }
      const item = normalizeSelection(parsed.data)
      const index = next.findIndex((previous) => lineIdentity(previous) === lineIdentity(item))
      const combined = {
        ...item,
        quantity:
          Math.round((item.quantity + (index >= 0 ? next[index]!.quantity : 0)) * 100) / 100,
      }
      if (
        !cartSelectionSchema.safeParse(combined).success ||
        resolveSelection(combined, product).issue
      ) {
        error.value = 'The combined quantity is invalid.'
        return false
      }
      if (index >= 0) next[index] = combined
      else next.push(combined)
    }
    return commit(next, 'Order selections added to cart. Review current prices before checkout.')
  }
  function remove(key: string) {
    return commit(
      items.value.filter((item) => lineIdentity(item) !== key),
      'Item removed.',
    )
  }
  function clear() {
    return commit([], 'Cart cleared.')
  }
  function resetSaved() {
    return commit([], 'Saved cart reset.', true)
  }
  function selectVoucher(code: string | null) {
    voucherCode.value = code
    if (!needsRecovery.value) error.value = ''
    notice.value = ''
  }
  return {
    ownerId,
    items,
    revision,
    voucherCode,
    error,
    notice,
    needsRecovery,
    savedRaw,
    count,
    setOwner,
    reload,
    apply,
    appendSelections,
    remove,
    clear,
    resetSaved,
    selectVoucher,
  }
})
