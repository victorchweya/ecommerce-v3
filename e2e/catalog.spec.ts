import {
  signOut,
  expectIndependentShopping,
  navigate,
  openProductFilters,
  closeProductFilters,
  clearProductFilters,
} from './fixtures/ui'
import { expect, test, type Page } from '@playwright/test'
import { mockCatalogApi as mockApi } from './fixtures/catalog-api'
import { catalogProduct } from '../src/types/__tests__/catalog.fixture'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})
async function select(page: Page, name: string, option: string) {
  const filter = ['Category', 'Grade'].includes(name)
  if (filter) await openProductFilters(page)
  await page.getByRole('combobox', { name, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
  if (filter) await closeProductFilters(page)
}
const products = (page: Page) => page.getByRole('list', { name: 'Products', exact: true })

test('adds from product cards without leaving the listing and keeps image/name links for details', async ({
  page,
}, info) => {
  const state = await mockApi(page)
  await page.goto('/catalog')
  const card = products(page).getByRole('article', { name: 'Tomatoes', exact: true })
  const trigger = card.getByRole('button', { name: 'Add to cart', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Tomatoes', exact: true })
  await trigger.click()
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page).toHaveURL(/\/catalog$/)
  const quantity = dialog.getByRole('spinbutton', { name: 'Quantity', exact: true })
  await quantity.fill('')
  await quantity.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Add to cart', exact: true })).toBeDisabled()
  await quantity.fill('2.5')
  await quantity.press('Tab')
  await dialog.getByRole('combobox', { name: 'Processing', exact: true }).click()
  await page.getByRole('option', { name: 'Chopped (+Ksh 10.00 per unit)', exact: true }).click()
  await dialog.getByRole('combobox', { name: 'Size (optional)', exact: true }).click()
  await page.getByRole('option', { name: 'large', exact: true }).click()
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await dialog.getByRole('combobox', { name: 'Grade', exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath('quick-add.png'), animations: 'disabled' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.screenshot({ path: info.outputPath('quick-add-dark.png'), animations: 'disabled' })
  await page.emulateMedia({ colorScheme: 'light' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await dialog.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(
    page.getByRole('status').filter({ hasText: 'Tomatoes added to cart.' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open cart (1)', exact: true })).toBeVisible()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!))
  expect(saved.items).toEqual([
    {
      productId: 1,
      productUnitVariantId: 100,
      quantity: 2.5,
      processingTypeId: 9,
      size: 'large',
      ripeness: null,
      washed: null,
    },
  ])
  expect(state.requests.some((r) => r.path === 'ecommerce/products/1')).toBe(false)
  const recommendation = page.getByRole('list', { name: 'Recommended products', exact: true })
  await recommendation.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await card.getByRole('link', { name: 'View Tomatoes', exact: true }).click()
  await expect(page).toHaveURL(/catalog\/products\/1$/)
  await page.goBack()
  await card.getByRole('link', { name: 'Tomatoes', exact: true }).click()
  await expect(page).toHaveURL(/catalog\/products\/1$/)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('retains quick-add drafts after a storage conflict and supports adding from favourites', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.saved = [1]
  await page.goto('/favourites')
  await products(page).getByRole('button', { name: 'Add to cart', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Tomatoes', exact: true })
  const quantity = dialog.getByRole('spinbutton', { name: 'Quantity', exact: true })
  await quantity.fill('3.5')
  await quantity.press('Tab')
  await page.evaluate(() =>
    localStorage.setItem('ftf:v3:cart:1', JSON.stringify({ version: 1, items: [] })),
  )
  await dialog.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(dialog.getByText(/Cart changed/)).toBeVisible()
  await expect(quantity).toHaveValue('3.5')
  await expect(page.getByRole('button', { name: 'Open cart (0)', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.reload()
  await products(page).getByRole('button', { name: 'Add to cart', exact: true }).click()
  await dialog.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/\/favourites$/)
  await expect(page.getByRole('button', { name: 'Open cart (1)', exact: true })).toBeVisible()
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('browses/searches/filter/sorts with bookmarkable URLs and safe recommendations', async ({
  page,
}, testInfo) => {
  const state = await mockApi(page)
  state.products.push({ ...catalogProduct(3, 'Hidden product'), published: false })
  state.products[1]!.variations[0]!.grade = { id: 2, name: 'Grade 2' }
  await page.goto('/catalog?unit=999&express=1')
  await expect(page).toHaveURL(/\/catalog$/)
  await expect(products(page).getByRole('article')).toHaveCount(2)
  await page.screenshot({ path: testInfo.outputPath('catalog.png'), fullPage: true })
  await expect(
    page.getByRole('list', { name: 'Recommended products' }).getByRole('article'),
  ).toHaveCount(1)
  await expect(page.getByText('Restricted product')).toHaveCount(0)
  await page.getByLabel('Search products').fill('tom veget')
  await expect(products(page).getByRole('article')).toHaveCount(1)
  await expect(page).toHaveURL(/q=tom/)
  await page.reload()
  await expect(page.getByLabel('Search products')).toHaveValue('tom veget')
  await clearProductFilters(page)
  await select(page, 'Sort products', 'Name: Z–A')
  await expect(products(page).getByRole('heading').first()).toHaveText('Tomatoes')
  await openProductFilters(page)
  await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toContainText(
    'All categories',
  )
  await closeProductFilters(page)
  await select(page, 'Grade', 'Grade 1')
  await expect(products(page).getByRole('article')).toHaveCount(1)
  await select(page, 'Category', 'Fruit')
  await expect(page).toHaveURL(/catalog\/category\/4/)
  await expect(page.getByRole('heading', { name: 'Fruit', exact: true })).toBeVisible()
  await expect(
    page.getByText('No products match your selection. Try clearing the filters.'),
  ).toBeVisible()
  await select(page, 'Category', 'All categories')
  await expect(page).toHaveURL(/grade=1/)
  await expect(products(page).getByRole('article')).toHaveCount(1)
  await page.reload()
  await expect(products(page).getByRole('article')).toHaveCount(1)
  await select(page, 'Grade', 'Grade 2')
  await expect(products(page).getByRole('heading').first()).toHaveText('Carrots')
  await expect(page.getByRole('button', { name: 'Next Page', exact: true })).toHaveCount(0)
  await clearProductFilters(page)
  await expect(page).toHaveURL(/\/catalog$/)
  expect(
    state.requests.filter((r) => r.path === 'ecommerce/products').every((r) => r.query === ''),
  ).toBe(true)
  expect(state.requests.some((r) => r.path === 'ecommerce/products/list')).toBe(false)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('paginates full arrays and clamps invalid/out-of-range page links', async ({ page }) => {
  const state = await mockApi(page)
  state.products = Array.from({ length: 15 }, (_, i) =>
    catalogProduct(i + 1, `Product ${String(i + 1).padStart(2, '0')}`),
  )
  await page.goto('/catalog?page=999')
  await expect(products(page).getByRole('article')).toHaveCount(3)
  await page.getByRole('button', { name: 'Previous Page' }).click()
  await expect(products(page).getByRole('article')).toHaveCount(12)
  await page.getByLabel('Search products').fill('Product 15')
  await expect(products(page).getByRole('article')).toHaveCount(1)
  expect(new URL(page.url()).searchParams.has('page')).toBe(false)
})

test('shows loading, request retry, category failure, empty results and non-blocking recommendations failure', async ({
  page,
}) => {
  const state = await mockApi(page)
  let release!: () => void
  state.holdProducts = new Promise((resolve) => {
    release = resolve
  })
  state.productStatus = 500
  state.categoriesStatus = 500
  state.recommendationsStatus = 500
  await page.goto('/catalog')
  await expect(page.getByText('Loading products…')).toBeVisible()
  release()
  await expect(page.getByText('Catalog unavailable.', { exact: true })).toBeVisible()
  await expect(page.getByText('Categories could not be loaded.')).toBeVisible()
  state.productStatus = 200
  state.products = []
  state.categoriesStatus = 200
  await page.getByRole('button', { name: 'Retry products', exact: true }).click()
  await page.getByRole('button', { name: 'Retry categories', exact: true }).click()
  await expect(
    page.getByText('No products match your selection. Try clearing the filters.'),
  ).toBeVisible()
  await expect(
    page.getByText('Recommendations are unavailable. You can still browse the catalog.'),
  ).toBeVisible()
  state.recommendationsStatus = 200
  await page.getByRole('button', { name: 'Retry recommendations', exact: true }).click()
  await expect(page.getByText('No recommendations yet.')).toBeVisible()
})

test('configures returned variants, fractional quantity, processing and sale/regular price portions', async ({
  page,
}) => {
  const state = await mockApi(page)
  const p = state.products[0]!
  p.variations.push({
    ...p.variations[0]!,
    id: 11,
    status: 'back_in_stock_soon',
    is_default: false,
    grade: { id: 2, name: 'Grade 2' },
  })
  await page.goto('/catalog/products/1')
  await expect(page.getByRole('heading', { name: 'Tomatoes', exact: true })).toBeVisible()
  await expect(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toHaveValue('0.25')
  await select(page, 'Processing', 'Chopped (+Ksh 10.00 per unit)')
  await page.getByRole('spinbutton', { name: 'Quantity', exact: true }).fill('2.5')
  await page.getByRole('spinbutton', { name: 'Quantity', exact: true }).press('Tab')
  await expect(page.getByText(/Estimated product total:/)).toContainText('255.00')
  await expect(page.getByText(/Sale: 1 ×/)).toContainText('90.00')
  await expect(page.getByText(/Regular: 1.5 ×/)).toContainText('110.00')
  await select(page, 'Ripeness (optional)', 'ripe')
  await select(page, 'Size (optional)', 'large')
  await select(page, 'Washing (optional)', 'washed')
  await select(page, 'Grade', 'Grade 2 — back in stock soon')
  await expect(page.getByText('This grade will be back in stock soon.')).toBeVisible()
  await expect(page.getByRole('spinbutton', { name: 'Quantity' })).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Product estimate' })).toHaveCount(0)
  expect(state.requests.some((r) => r.path === 'ecommerce/products')).toBe(false)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('handles missing/invalid/unpublished and transient failed product details', async ({
  page,
}) => {
  const state = await mockApi(page)
  await page.goto('/catalog/products/invalid')
  await expect(page.getByRole('heading', { name: 'Product unavailable' })).toBeVisible()
  expect(state.requests.some((r) => r.path.includes('/products/'))).toBe(false)
  await page.goto('/catalog/products/999')
  await expect(page.getByRole('heading', { name: 'Product unavailable' })).toBeVisible()
  state.detailStatus = 500
  await page.goto('/catalog/products/1')
  await expect(page.getByRole('button', { name: 'Retry product', exact: true })).toBeVisible()
  state.detailStatus = 200
  await page.getByRole('button', { name: 'Retry product', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tomatoes', exact: true })).toBeVisible()
  state.products[0]!.published = false
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Product unavailable' })).toBeVisible()
  await page.goto('/catalog/category/999')
  await expect(page.getByRole('heading', { name: 'Category not found' })).toBeVisible()
})

test('saves/removes favourites only after explicit writes, prevents duplicate writes and retains state on failure', async ({
  page,
}, info) => {
  const state = await mockApi(page)
  await page.goto('/catalog')
  const save = products(page).getByRole('button', {
    name: 'Save Tomatoes to favourites',
    exact: true,
  })
  await expect(save).toBeEnabled()
  await expect(save).toHaveAttribute('aria-pressed', 'false')
  expect(state.requests.filter((r) => /wishlist\/.*\/add/.test(r.path))).toHaveLength(0)
  let release!: () => void
  state.holdWrite = new Promise((resolve) => {
    release = resolve
  })
  await save.click()
  await expect(save).toBeDisabled()
  expect(state.requests.filter((r) => r.path === 'ecommerce/wishlist/1/add')).toHaveLength(1)
  release()
  state.holdWrite = null
  await expect(
    products(page).getByRole('button', { name: 'Remove Tomatoes from favourites', exact: true }),
  ).toBeEnabled()
  await expect(
    products(page).getByRole('button', { name: 'Remove Tomatoes from favourites', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await page.screenshot({
      path: info.outputPath(`favourites-${colorScheme}.png`),
      animations: 'disabled',
    })
  }
  await page.getByRole('link', { name: 'View favourites', exact: true }).click()
  await expect(products(page).getByRole('article')).toHaveCount(1)
  state.writeStatus = 500
  await page.getByRole('button', { name: 'Remove Tomatoes from favourites', exact: true }).click()
  await expect(page.getByText('Could not save favourite.', { exact: true })).toBeVisible()
  await expect(products(page).getByRole('article')).toHaveCount(1)
  expect(state.requests.filter((r) => r.path === 'ecommerce/wishlist/1/delete')).toHaveLength(1)
  await expect(
    page.getByRole('button', { name: 'Remove Tomatoes from favourites', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  state.writeStatus = 200
  await page.getByRole('button', { name: 'Remove Tomatoes from favourites', exact: true }).click()
  await expect(
    page.getByText('No available favourites yet. Save products from the catalog.'),
  ).toBeVisible()
})

test('supports wishlist-read retry and removal of unavailable saved products without using stale wishlist prices', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.saved = [1, 999]
  state.favouritesStatus = 500
  await page.goto('/favourites')
  await expect(page.getByText('Favourites could not be loaded.')).toBeVisible()
  state.favouritesStatus = 200
  await page.getByRole('button', { name: 'Retry favourites', exact: true }).click()
  await expect(products(page).getByRole('article')).toHaveCount(1)
  await expect(page.getByText('Old product is currently unavailable.')).toBeVisible()
  await page.getByRole('button', { name: 'Remove Old product from favourites' }).click()
  await expect(page.getByText('Old product is currently unavailable.')).toHaveCount(0)
})

test('waits for parent branch/company resolution and never sends branch IDs to home-company catalog reads', async ({
  page,
}) => {
  const state = await mockApi(page, { parent: true })
  let release!: () => void
  state.holdCompany = new Promise((resolve) => {
    release = resolve
  })
  state.companyMarkup = '50'
  await page.goto('/catalog')
  await expect(page).toHaveURL(/parent-account/)
  expect(state.requests.some((r) => r.path === 'ecommerce/products')).toBe(false)
  await page.getByRole('main').getByRole('combobox', { name: 'Shopping branch' }).click()
  await page.getByRole('option', { name: 'West branch', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
  await navigate(page, 'Catalog')
  await expect(page).toHaveURL(/\/catalog$/)
  expect(state.requests.some((r) => r.path === 'ecommerce/products')).toBe(false)
  release()
  state.holdCompany = null
  await expect(products(page).getByRole('article')).toHaveCount(2)
  const catalogReads = state.requests.filter((r) =>
    /products|config\/categories|wishlist|recommendations/.test(r.path),
  )
  expect(catalogReads.every((r) => r.query === '')).toBe(true)
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('combobox', { name: 'Shopping branch' })
    .click()
  await page.getByRole('option', { name: 'East branch', exact: true }).click()
  await expect(products(page).getByRole('article')).toHaveCount(2)
  await products(page).getByRole('link', { name: 'Tomatoes', exact: true }).click()
  await expect(page.getByText(/Estimated product total:/)).toContainText('20.00')
})

test('redirects anonymous detail links through login and expires a session on catalog 401', async ({
  page,
}) => {
  const state = await mockApi(page, { loggedIn: false })
  await page.goto('/catalog/products/1')
  await expect(page).toHaveURL(/auth\/login/)
  expect(state.requests).toHaveLength(0)
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/catalog\/products\/1/)
  state.productStatus = 401
  await page
    .getByRole('main')
    .getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { name: 'Catalog', exact: true })
    .click()
  await expect(page).toHaveURL(/auth\/login/)
  await expect(page.getByText('Your session expired. Please sign in again.')).toBeVisible()
})

test('isolates a late favourite 401 from a replacement sign-in session', async ({ page }) => {
  const state = await mockApi(page)
  await page.goto('/catalog')
  const save = products(page).getByRole('button', {
    name: 'Save Tomatoes to favourites',
    exact: true,
  })
  await expect(save).toBeEnabled()
  let release!: () => void
  state.holdWrite = new Promise((resolve) => {
    release = resolve
  })
  state.writeStatus = 401
  await save.click()
  await expect(save).toBeDisabled()
  await signOut(page)
  await expect(page).toHaveURL(/auth\/login/)
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expectIndependentShopping(page)
  release()
  await navigate(page, 'Catalog')
  await expect(products(page).getByRole('article')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
  await expect(page.getByText('Your session expired. Please sign in again.')).toHaveCount(0)
})

test('does not show late catalog reads after signing out', async ({ page }) => {
  const state = await mockApi(page)
  let release!: () => void
  state.holdProducts = new Promise((resolve) => {
    release = resolve
  })
  await page.goto('/catalog')
  await expect(page.getByText('Loading products…')).toBeVisible()
  await signOut(page)
  await expect(page).toHaveURL(/auth\/login/)
  release()
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:token'))).toBe('')
  await expect(products(page)).toHaveCount(0)
})
