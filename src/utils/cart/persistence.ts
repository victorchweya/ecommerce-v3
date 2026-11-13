import { savedCartSchema } from '@/validation/cart'
import type { CartSelection } from '@/types/cart'
export const cartStorageKey = (ownerId: number) => `ftf:v3:cart:${ownerId}`
export function readCart(ownerId: number) {
  const raw = localStorage.getItem(cartStorageKey(ownerId))
  return { raw, items: raw === null ? [] : savedCartSchema.parse(JSON.parse(raw)).items }
}
export function writeCart(
  ownerId: number,
  items: CartSelection[],
  previous: string | null,
  force = false,
) {
  if (!force && localStorage.getItem(cartStorageKey(ownerId)) !== previous)
    throw new Error('Cart changed in another tab. Reload the saved cart before trying again.')
  const raw = JSON.stringify(savedCartSchema.parse({ version: 1, items }))
  localStorage.setItem(cartStorageKey(ownerId), raw)
  return raw
}
