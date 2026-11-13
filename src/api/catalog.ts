import { z } from 'zod'
import { request } from '@/lib/api'
import {
  categorySchema,
  favouriteSchema,
  productSchema,
  recommendationsSchema,
} from '@/types/catalog'

const readOptions = (token: string, signal: AbortSignal) => ({
  token,
  signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
})
export async function fetchProducts(token: string, signal: AbortSignal) {
  return z
    .array(productSchema)
    .parse(await request('ecommerce/products', readOptions(token, signal)))
}
export async function fetchCategories(token: string, signal: AbortSignal) {
  return z
    .array(categorySchema)
    .parse(await request('ecommerce/config/categories', readOptions(token, signal)))
}
export async function fetchProduct(token: string, productId: number, signal: AbortSignal) {
  const product = productSchema.parse(
    await request(`ecommerce/products/${productId}`, readOptions(token, signal)),
  )
  if (product.id !== productId) throw new Error('Unexpected product in detail response.')
  return product
}
export async function fetchFavourites(token: string, signal: AbortSignal) {
  return z
    .array(favouriteSchema)
    .parse(await request('ecommerce/wishlist', readOptions(token, signal)))
}
export async function fetchRecommendations(token: string, signal: AbortSignal) {
  return recommendationsSchema.parse(
    await request('ecommerce/recommendations', readOptions(token, signal)),
  ).items
}
export async function setFavourite(token: string, productId: number, saved: boolean) {
  const response = await request(`ecommerce/wishlist/${productId}/${saved ? 'add' : 'delete'}`, {
    token,
    method: saved ? 'GET' : 'DELETE',
    signal: AbortSignal.timeout(15_000),
  })
  if (saved) {
    const result = z
      .object({ data: z.object({ product_id: z.number().int().positive() }) })
      .parse(response)
    if (result.data.product_id !== productId)
      throw new Error('Unexpected product in favourite response.')
  } else z.object({ message: z.string() }).parse(response)
}
