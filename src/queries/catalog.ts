import { queryOptions } from '@tanstack/vue-query'
import {
  fetchCategories,
  fetchFavourites,
  fetchProduct,
  fetchProducts,
  fetchRecommendations,
} from '@/api/catalog'

// These existing endpoints use the home company/customer, not the acting branch.
const options = (revision: number) => ({
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  meta: { sessionRevision: revision },
})
export const productsQuery = (token: string, revision: number) =>
  queryOptions({
    ...options(revision),
    queryKey: ['session', revision, 'catalog', 'products'],
    queryFn: ({ signal }) => fetchProducts(token, signal),
  })
export const categoriesQuery = (token: string, revision: number) =>
  queryOptions({
    ...options(revision),
    queryKey: ['session', revision, 'catalog', 'categories'],
    queryFn: ({ signal }) => fetchCategories(token, signal),
  })
export const productQuery = (token: string, revision: number, productId: number) =>
  queryOptions({
    ...options(revision),
    queryKey: ['session', revision, 'catalog', 'product', productId],
    queryFn: ({ signal }) => fetchProduct(token, productId, signal),
  })
export const favouritesQuery = (token: string, revision: number) =>
  queryOptions({
    ...options(revision),
    queryKey: ['session', revision, 'catalog', 'favourites'],
    queryFn: ({ signal }) => fetchFavourites(token, signal),
  })
export const recommendationsQuery = (token: string, revision: number) =>
  queryOptions({
    ...options(revision),
    queryKey: ['session', revision, 'catalog', 'recommendations'],
    queryFn: ({ signal }) => fetchRecommendations(token, signal),
  })
