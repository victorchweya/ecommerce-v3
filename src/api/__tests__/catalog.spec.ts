import { beforeEach, expect, it, vi } from 'vitest'
import {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  fetchRecommendations,
  fetchFavourites,
  setFavourite,
} from '../catalog'
import { catalogProduct } from '@/types/__tests__/catalog.fixture'
const fetchMock = vi.fn()
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })
beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.example.test/api')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
it('uses full catalog/details with bearer auth and no invented branch, search or page parameters', async () => {
  fetchMock
    .mockResolvedValueOnce(response([catalogProduct()]))
    .mockResolvedValueOnce(response(catalogProduct()))
  expect(await fetchProducts('test-token', new AbortController().signal)).toHaveLength(1)
  expect((await fetchProduct('test-token', 1, new AbortController().signal)).id).toBe(1)
  expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
    'https://api.example.test/api/ecommerce/products',
    'https://api.example.test/api/ecommerce/products/1',
  ])
  expect(new Headers(fetchMock.mock.calls[0]![1].headers).get('Authorization')).toBe(
    'Bearer test-token',
  )
})
it('rejects malformed catalog, wrong detail identity and published detail 404 without retry', async () => {
  fetchMock
    .mockResolvedValueOnce(response({ data: [] }))
    .mockResolvedValueOnce(response(catalogProduct(2)))
    .mockResolvedValueOnce(response({ message: 'Unavailable' }, 404))
  await expect(fetchProducts('token', new AbortController().signal)).rejects.toThrow()
  await expect(fetchProduct('token', 1, new AbortController().signal)).rejects.toThrow(
    'Unexpected product',
  )
  await expect(fetchProduct('token', 1, new AbortController().signal)).rejects.toMatchObject({
    status: 404,
  })
  expect(fetchMock).toHaveBeenCalledTimes(3)
})
it('reads categories, wishlist IDs and recommendation IDs without trusting their product prices', async () => {
  fetchMock
    .mockResolvedValueOnce(response([{ id: 3, name: 'Vegetables', slug: 'vegetables' }]))
    .mockResolvedValueOnce(response([{ product_id: 1, product: null }]))
    .mockResolvedValueOnce(response({ items: [{ product_id: '1', selling_price: '0' }] }))
  expect(await fetchCategories('token', new AbortController().signal)).toHaveLength(1)
  expect(await fetchFavourites('token', new AbortController().signal)).toEqual([
    { product_id: 1, product: null },
  ])
  expect(await fetchRecommendations('token', new AbortController().signal)).toEqual([
    { product_id: 1 },
  ])
})
it('performs the legacy GET add as an explicit write, DELETE removal and validates identity', async () => {
  fetchMock
    .mockResolvedValueOnce(response({ data: { product_id: 1 } }))
    .mockResolvedValueOnce(response({ message: 'Removed' }))
    .mockResolvedValueOnce(response({ data: { product_id: 2 } }))
  await setFavourite('token', 1, true)
  await setFavourite('token', 1, false)
  await expect(setFavourite('token', 1, true)).rejects.toThrow('Unexpected product')
  expect(fetchMock.mock.calls[0]![1].method).toBe('GET')
  expect(String(fetchMock.mock.calls[0]![0])).toContain('/wishlist/1/add')
  expect(fetchMock.mock.calls[1]![1].method).toBe('DELETE')
})
