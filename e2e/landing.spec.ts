import { expect, test } from '@playwright/test'
import { mockCatalogApi } from './fixtures/catalog-api'
import { catalogProduct } from '../src/types/__tests__/catalog.fixture'

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('Unhandled view error:'))
      throw new Error(message.text())
  })
})

test('shows a product-led B2B storefront with working shopping routes', async ({ page }, info) => {
  const state = await mockCatalogApi(page)
  state.categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Leafy Greens',
    'Roots and Tubers',
    'Processed Products and Prepared Vegetables',
    'Dairy Eggs',
    'Spices',
  ].map((name, i) => ({ id: i + 3, name, slug: `category-${i}` }))
  const images = ['broccoli', 'avocado', 'butternut']
  state.products = Array.from({ length: 12 }, (_, i) => {
    const product = catalogProduct(i + 1, `${['Broccoli', 'Avocado', 'Butternut'][i % 3]} ${i + 1}`)
    product.category = state.categories[i % state.categories.length]!
    product.variations[0]!.media = [
      { original_url: `http://127.0.0.1:4175/__catalog-images/${images[i % 3]}.png` },
    ]
    product.published = i !== 10
    product.status = i === 11 ? 'inactive' : 'active'
    return product
  })
  await page.route('**/__catalog-images/*.png', (route) =>
    route.fulfill({
      path: `e2e/fixtures/catalog-images/${new URL(route.request().url()).pathname.split('/').pop()}`,
    }),
  )
  await page.route('**/ecommerce/recommendations', (route) =>
    route.fulfill({
      json: { items: [1, 2, 3, 4, 999, 11, 12, 1].map((product_id) => ({ product_id })) },
    }),
  )
  await page.goto('/')
  const main = page.getByRole('main')
  await expect(
    main.getByRole('heading', { name: 'Fresh produce for your business', exact: true }),
  ).toBeVisible()
  const categories = main.getByRole('list', { name: 'Product categories', exact: true })
  await expect(categories.getByRole('link')).toHaveCount(6)
  const products = main.getByRole('list', { name: 'Recommended products', exact: true })
  await expect(products.getByRole('article')).toHaveCount(4)
  await expect(main.getByRole('link', { name: 'Shopping help', exact: true })).toHaveCount(0)
  await expect(main.getByRole('link', { name: 'Manage your account', exact: true })).toHaveCount(0)
  await expect(main.getByRole('link', { name: 'Account setup', exact: true })).toHaveCount(0)
  await expect(main.getByRole('link', { name: 'Browse catalog', exact: true })).toHaveClass(
    /p-button/,
  )
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true)
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await page.screenshot({
        path: info.outputPath(`landing-${width}-${colorScheme}.png`),
        fullPage: true,
        animations: 'disabled',
      })
      if (width === 1280 && colorScheme === 'dark')
        await page.screenshot({
          path: info.outputPath('landing-preview.png'),
          animations: 'disabled',
        })
    }
  }
  await categories.getByRole('link', { name: 'Vegetables', exact: true }).click()
  await expect(page).toHaveURL(/catalog\/category\/3$/)
  await page.goto('/')
  await main
    .getByRole('list', { name: 'Recommended products', exact: true })
    .getByRole('link', { name: 'Broccoli 1', exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/catalog\/products\/1$/)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('shows usable catalog fallbacks and retries failed reads', async ({ page }) => {
  const state = await mockCatalogApi(page)
  state.recommendationsStatus = 500
  state.products.push(catalogProduct(3, 'Hidden product'))
  state.products[2]!.published = false
  await page.goto('/')
  await expect(
    page.getByRole('list', { name: 'Featured products', exact: true }).getByRole('article'),
  ).toHaveCount(2)
  state.productStatus = 500
  state.categoriesStatus = 500
  await page.reload()
  await expect(page.getByRole('button', { name: 'Retry products', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Retry categories', exact: true })).toBeVisible()
  state.productStatus = 200
  state.categoriesStatus = 200
  await page.getByRole('button', { name: 'Retry categories', exact: true }).click()
  await page.getByRole('button', { name: 'Retry products', exact: true }).click()
  await expect(
    page.getByRole('list', { name: 'Featured products', exact: true }).getByRole('article'),
  ).toHaveCount(2)
  state.products = []
  await page.reload()
  await expect(
    page.getByText(
      'No products are available right now. Please check back later or contact our team.',
      { exact: true },
    ),
  ).toBeVisible()
})

test('gives guests a focused introduction without protected catalog requests', async ({
  page,
}, info) => {
  const state = await mockCatalogApi(page, { loggedIn: false })
  await page.goto('/')
  const main = page.getByRole('main')
  await expect(
    main.getByRole('heading', { name: 'Fresh produce for your business', exact: true }),
  ).toBeVisible()
  await expect(
    main.getByRole('heading', { name: 'Start ordering for your business', exact: true }),
  ).toBeVisible()
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true)
    await page.screenshot({
      path: info.outputPath(`guest-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    })
  }
  expect(state.requests).toHaveLength(0)
  await main.getByRole('link', { name: 'Request an account', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Register your business', exact: true }),
  ).toBeVisible()
})
