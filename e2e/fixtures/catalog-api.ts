import type { Page, Route } from '@playwright/test'
import { catalogProduct } from '../../src/types/__tests__/catalog.fixture'

export async function mockCatalogApi(
  page: Page,
  options: { parent?: boolean; loggedIn?: boolean } = {},
) {
  const state = {
    userId: 1,
    minimumBasket: '0',
    availableVoucher: null as {
      code: string
      discount_type: string
      discount_value: string
      status: string
      expiry_date: string | null
    } | null,
    voucherStatus: 200,
    holdVoucher: null as Promise<void> | null,
    products: [catalogProduct(), catalogProduct(2, 'Carrots')],
    categories: [
      { id: 3, name: 'Vegetables', slug: 'vegetables' },
      { id: 4, name: 'Fruit', slug: 'fruit' },
    ],
    saved: [] as number[],
    requests: [] as { path: string; method: string; query: string }[],
    productStatus: 200,
    categoriesStatus: 200,
    recommendationsStatus: 200,
    favouritesStatus: 200,
    writeStatus: 200,
    detailStatus: 200,
    companyStatus: 200,
    companyMarkup: '0',
    holdProducts: null as Promise<void> | null,
    holdCompany: null as Promise<void> | null,
    holdWrite: null as Promise<void> | null,
  }
  if (options.loggedIn !== false)
    await page.addInitScript(() => sessionStorage.setItem('ftf:v3:token', 'catalog-test-token'))
  const json = (route: Route, body: unknown, status = 200) =>
    route
      .fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      .catch(() => {})
  await page.route('**/*', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    if (!['fetch', 'xhr'].includes(req.resourceType())) {
      if (url.origin === 'http://127.0.0.1:4175') return route.continue()
      return route.abort()
    }
    const path = url.pathname.match(/(?:^|\/)((?:auth|ecommerce)\/.*)$/)?.[1] ?? url.pathname
    state.requests.push({ path, method: req.method(), query: url.search })
    if (path === 'auth/login')
      return json(route, {
        data: { token: 'catalog-test-token', user: { id: state.userId, user_type: 'customer' } },
      })
    if (path === 'auth/logout') return json(route, { message: 'Signed out' })
    if (path === 'ecommerce/profile')
      return json(route, {
        id: state.userId,
        name: 'Customer',
        email: 'customer@example.test',
        user_type: 'customer',
        status: 'active',
        customer: {
          company: {
            id: 10,
            name: 'Home company',
            status: 'active',
            organisation_structure: options.parent ? 'parent_organisation' : 'independent_customer',
          },
        },
      })
    if (path === 'ecommerce/company/branches')
      return json(route, {
        data: [
          { id: 11, name: 'West branch' },
          { id: 22, name: 'East branch' },
        ],
      })
    if (path === 'ecommerce/company') {
      if (state.holdCompany) await state.holdCompany
      return json(
        route,
        {
          id: options.parent ? Number(url.searchParams.get('branch_company_id')) : 10,
          name: options.parent ? 'Selected branch' : 'Home company',
          status: 'active',
          customer_group: {
            options: {
              group_pricing: state.companyMarkup,
              minimum_basket_size: state.minimumBasket,
            },
          },
        },
        state.companyStatus,
      )
    }
    if (path === 'ecommerce/products') {
      if (state.holdProducts) await state.holdProducts
      return json(
        route,
        state.productStatus === 200 ? state.products : { message: 'Catalog unavailable.' },
        state.productStatus,
      )
    }
    if (path.startsWith('ecommerce/products/')) {
      const product = state.products.find((p) => String(p.id) === path.split('/').pop())
      return json(
        route,
        product && state.detailStatus === 200 ? product : { message: 'Product unavailable.' },
        product ? state.detailStatus : 404,
      )
    }
    if (path === 'ecommerce/config/categories')
      return json(route, state.categories, state.categoriesStatus)
    if (path === 'ecommerce/recommendations')
      return json(
        route,
        {
          items: [
            { product_id: 1, selling_price: 1 },
            { product_id: 999, product_name: 'Restricted product' },
            { product_id: 1 },
          ],
        },
        state.recommendationsStatus,
      )
    if (path === 'ecommerce/vouchers' || path.startsWith('ecommerce/vouchers/')) {
      const voucher = state.availableVoucher
      const code =
        path === 'ecommerce/vouchers' ? null : decodeURIComponent(path.split('/').pop() ?? '')
      if (code && state.holdVoucher) await state.holdVoucher
      if (state.voucherStatus !== 200)
        return json(route, { message: 'Voucher check failed.' }, state.voucherStatus)
      if (code && (!voucher || voucher.code.toLowerCase() !== code.toLowerCase()))
        return json(route, { message: 'Invalid or expired voucher code.' }, 400)
      return json(route, voucher ?? { message: 'No valid voucher found.' })
    }
    if (path === 'ecommerce/wishlist')
      return json(
        route,
        state.saved.map((id) => ({
          product_id: id,
          product: {
            name:
              id === 999
                ? 'Old product'
                : (state.products.find((p) => p.id === id)?.name ?? 'Removed product'),
          },
        })),
        state.favouritesStatus,
      )
    if (/ecommerce\/wishlist\/\d+\/(add|delete)$/.test(path)) {
      if (state.holdWrite) await state.holdWrite
      if (state.writeStatus !== 200)
        return json(route, { message: 'Could not save favourite.' }, state.writeStatus)
      const id = Number(path.split('/')[2])
      state.saved = path.endsWith('/add')
        ? [...new Set([...state.saved, id])]
        : state.saved.filter((saved) => saved !== id)
      return json(route, { message: 'Saved', data: { product_id: id } })
    }
    return json(route, { message: 'Unexpected API request in catalog test.' }, 500)
  })
  return state
}
