import { expect, test, type Page } from '@playwright/test'
import { mockCatalogApi } from './fixtures/catalog-api'
import { catalogProduct } from '../src/types/__tests__/catalog.fixture'
import { mockCommerceApi } from './fixtures/commerce-api'
import { readFile } from 'node:fs/promises'

async function noOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    overflow: [...document.querySelectorAll('body *')]
      .filter((node) => {
        const box = node.getBoundingClientRect()
        return box.width && box.right > innerWidth + 1
      })
      .slice(0, 15)
      .map((node) => ({
        tag: node.tagName,
        class: node.getAttribute('class'),
        text: node.textContent?.slice(0, 65),
        right: node.getBoundingClientRect().right,
      })),
  }))
  expect(metrics.width <= metrics.viewport, JSON.stringify(metrics)).toBe(true)
}

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

test('searches from home and keeps a single labelled cart control', async ({ page }) => {
  const state = await mockCatalogApi(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible()
  await page.getByLabel('Search products', { exact: true }).fill('Tomatoes')
  await page.getByLabel('Search products', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/catalog\?q=Tomatoes/)
  const products = page.getByRole('list', { name: 'Products', exact: true })
  await expect(products.getByRole('article')).toHaveCount(1)
  const header = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(header.getByRole('button', { name: /^Open cart/ })).toHaveCount(1)
  await expect(header.getByRole('link', { name: /^Cart/ })).toHaveCount(0)
  await products.getByRole('link', { name: 'Tomatoes', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toBeVisible()
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('opens and escapes the account menu using the keyboard', async ({ page }) => {
  await mockCatalogApi(page)
  await page.goto('/catalog')
  const trigger = page.getByRole('button', { name: 'Account menu', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menuitem', { name: 'Orders', exact: true })).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('uses the mobile shopping drawer and restores focus after Escape', async ({ page }) => {
  await mockCatalogApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Shopping navigation', exact: true })
  await expect(drawer.getByRole('link', { name: 'Vegetables', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await drawer.getByRole('link', { name: 'Favourites', exact: true }).click()
  await expect(page).toHaveURL(/\/favourites$/)
  await expect(drawer).toHaveCount(0)
  await noOverflow(page)
})

test('keeps catalog filters and search when switching between drawer and toolbar', async ({
  page,
}, testInfo) => {
  await mockCatalogApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog?q=tom')
  await page.getByRole('button', { name: 'Filter products', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Product filters', exact: true })
  await drawer.getByRole('combobox', { name: 'Grade', exact: true }).click()
  await page.getByRole('option', { name: 'Grade 1', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('filters-mobile.png'), fullPage: true })
  await drawer.getByRole('button', { name: 'Show products', exact: true }).click()
  await expect(page).toHaveURL(/grade=1/)
  await expect(page.getByLabel('Search products', { exact: true })).toHaveValue('tom')
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.getByRole('region', { name: 'Product filters', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Grade', exact: true })).toContainText('Grade 1')
  await page.screenshot({ path: testInfo.outputPath('filters-desktop.png'), fullPage: true })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.screenshot({ path: testInfo.outputPath('filters-desktop-dark.png'), fullPage: true })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Filter products', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Grade', exact: true })).toContainText('Grade 1')
  await page.getByRole('combobox', { name: 'Grade', exact: true }).click()
  await page.getByRole('option', { name: 'All grades', exact: true }).click()
  await expect(page).not.toHaveURL(/grade=/)
  await noOverflow(page)
})

test('lays out a populated catalog across desktop, tablet and mobile', async ({ page }, info) => {
  const state = await mockCatalogApi(page)
  state.categories.push({
    id: 5,
    name: 'Processed Products and Prepared Vegetables',
    slug: 'processed',
  })
  const images = ['broccoli', 'avocado', 'butternut']
  state.products = Array.from({ length: 16 }, (_, index) => {
    const name = [
      'Broccoli',
      'Avocado — large, ready to ripen',
      'Butternut — peeled and diced for catering',
    ][index % 3]!
    const product = catalogProduct(index + 1, name)
    product.category = state.categories[index % 3]!
    product.variations[0]!.unit_variants[0]!.flash_sale.status =
      index % 3 === 0 ? 'active' : 'inactive'
    if (index !== 3)
      product.variations[0]!.media = [
        { original_url: `http://127.0.0.1:4175/__catalog-images/${images[index % 3]}.png` },
      ]
    return product
  })
  await page.route('**/__catalog-images/*.png', async (route) => {
    const file = new URL(route.request().url()).pathname.split('/').pop()!
    if (!images.some((name) => file === `${name}.png`)) return route.abort()
    await route.fulfill({
      contentType: 'image/png',
      body: await readFile(new URL(`./fixtures/catalog-images/${file}`, import.meta.url)),
    })
  })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/catalog')
  const grid = page.getByRole('list', { name: 'Products', exact: true })
  await expect(grid.getByRole('article')).toHaveCount(12)
  await expect(page.getByRole('status').filter({ hasText: '16 products' })).toContainText(
    'Showing 1–12',
  )
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await noOverflow(page)
    const columns = await grid.evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
    )
    expect(columns).toBe(width === 1280 ? 4 : width === 768 ? 3 : 2)
    await page.screenshot({
      path: info.outputPath(`catalog-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    })
    if (width === 1280 || width === 390)
      await page.screenshot({
        path: info.outputPath(`catalog-${width}-viewport.png`),
        animations: 'disabled',
      })
    if (width === 1280 || width === 390) {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.screenshot({
        path: info.outputPath(`catalog-${width}-dark.png`),
        fullPage: true,
        animations: 'disabled',
      })
      await page.emulateMedia({ colorScheme: 'light' })
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('combobox', { name: 'Category', exact: true }).click()
  await page
    .getByRole('option', { name: 'Processed Products and Prepared Vegetables', exact: true })
    .click()
  await expect(page).toHaveURL(/catalog\/category\/5/)
  await noOverflow(page)
  await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toContainText(
    'Processed Products and Prepared Vegetables',
  )
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('navigates account sections through the mobile drawer', async ({ page }) => {
  await mockCommerceApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/account')
  await page.getByRole('button', { name: 'Account sections', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Account sections', exact: true })
  await drawer.getByRole('link', { name: 'Delivery addresses', exact: true }).click()
  await expect(page).toHaveURL(/account\/addresses$/)
  await expect(drawer).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Add delivery address', exact: true }),
  ).toBeVisible()
  await noOverflow(page)
})

test('reviews checkout before submitting on mobile and retains the draft through resizing', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/checkout')
  await page.getByLabel('Delivery notes (optional)').fill('Keep this draft')
  await expect(
    page.getByRole('complementary', { name: 'Order summary', exact: true }),
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel('Delivery notes (optional)')).toHaveValue('Keep this draft')
  const items = page.getByRole('region', { name: 'Order items', exact: true })
  await expect(items).toContainText('Tomatoes')
  const submit = page.getByRole('button', { name: 'Place order', exact: true })
  expect(
    await items.evaluate(
      (element, button) =>
        Boolean(element.compareDocumentPosition(button!) & Node.DOCUMENT_POSITION_FOLLOWING),
      await submit.elementHandle(),
    ),
  ).toBe(true)
  await expect(page.getByRole('region', { name: 'Order summary', exact: true })).toHaveCount(1)
  await noOverflow(page)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

for (const width of [320, 768, 1280]) {
  test(`page families reflow without horizontal page scrolling at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width, height: 900 })
    const state = await mockCommerceApi(page)
    state.order.invoice_issue_date = '2026-10-15'
    for (const path of [
      '/',
      '/catalog',
      '/catalog/category/3',
      '/catalog/products/1',
      '/favourites',
      '/cart',
      '/checkout',
      '/checkout/success',
      '/orders',
      '/orders/40',
      '/orders/40/edit',
      '/account',
      '/account/addresses',
      '/account/invoices',
      '/account/invoices/40',
      '/account/credit-notes',
      '/account/credit-notes/2',
      '/account/insights',
      '/account/impact',
      '/auth/contact-person',
      '/auth/billing-details',
      '/auth/delivery-address',
      '/help',
      '/contact',
      '/delivery-information',
      '/returns-and-refunds',
      '/privacy-policy',
      '/terms-and-conditions',
      '/access-denied',
      '/error',
      '/unknown-page',
    ]) {
      await test.step(path, async () => {
        await page.goto(path)
        await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
        await noOverflow(page)
        const duplicateIds = await page
          .locator('[id]')
          .evaluateAll((nodes) =>
            nodes.map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
          )
        expect(duplicateIds).toEqual([])
        if (width === 1280 && ['/account', '/orders'].includes(path))
          await page.screenshot({ path: info.outputPath(path.slice(1) + '.png'), fullPage: true })
      })
    }
    expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
  })
}

test('handles a 35-item B2B basket with compact preview and checkout review', async ({
  page,
}, info) => {
  const state = await mockCommerceApi(page, { cart: false })
  state.catalog.products = Array.from({ length: 35 }, (_, index) =>
    catalogProduct(index + 1, `Product ${String(index + 1).padStart(2, '0')}`),
  )
  const items = state.catalog.products.map((product) => ({
    productId: product.id,
    productUnitVariantId: product.id * 100,
    processingTypeId: null,
    quantity: 3,
    ripeness: null,
    size: null,
    washed: null,
  }))
  await page.addInitScript(
    (items) => localStorage.setItem('ftf:v3:cart:1', JSON.stringify({ version: 1, items })),
    items,
  )
  await page.goto('/cart')
  await expect(
    page.getByRole('list', { name: 'Cart items', exact: true }).getByRole('article'),
  ).toHaveCount(35)
  const firstRow = page
    .getByRole('list', { name: 'Cart items', exact: true })
    .getByRole('article')
    .first()
  await firstRow
    .getByRole('spinbutton', { name: 'Quantity for Product 01', exact: true })
    .fill('4.25')
  await firstRow
    .getByRole('spinbutton', { name: 'Quantity for Product 01', exact: true })
    .press('Tab')
  await expect(firstRow).toHaveAttribute('aria-label', 'Product 01')
  await expect(firstRow.getByRole('spinbutton')).toHaveValue('4.25')
  const checkout = page.getByRole('link', { name: 'Proceed to checkout', exact: true })
  await expect(checkout).toBeInViewport()
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await noOverflow(page)
    await expect(checkout).toBeInViewport()
    await page.screenshot({ path: info.outputPath(`b2b-cart-${width}.png`) })
  }
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.screenshot({ path: info.outputPath('b2b-cart-dark.png') })
  await page.emulateMedia({ colorScheme: 'light' })
  const trigger = page.getByRole('button', { name: 'Open cart (35)', exact: true })
  await trigger.click()
  const preview = page.getByRole('dialog', { name: 'Your cart', exact: true })
  await expect(preview.getByRole('article')).toHaveCount(5)
  await expect(preview.getByText('30 more items in your full cart.', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(preview).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await checkout.click()
  const review = page.getByRole('region', { name: 'Order items', exact: true })
  await expect(review.locator('details')).not.toHaveAttribute('open', '')
  await expect(review.getByText('Review 35 items', { exact: true })).toBeVisible()
  await review.getByText('Review 35 items', { exact: true }).click()
  const list = page.getByRole('list', { name: 'Order item list', exact: true })
  await expect(list.getByRole('listitem')).toHaveCount(35)
  expect((await list.boundingBox())!.height).toBeLessThanOrEqual(321)
  await list.getByText('Product 35 · Grade 1', { exact: true }).scrollIntoViewIfNeeded()
  await expect(list.getByText('Product 35 · Grade 1', { exact: true })).toBeVisible()
  await review.getByText('Review 35 items', { exact: true }).click()
  await page.getByRole('combobox', { name: 'Delivery or pickup address', exact: true }).click()
  await page.getByRole('option', { name: 'Office — Market Road', exact: true }).click()
  await page.getByLabel('Delivery date', { exact: true }).fill('2030-01-03')
  await noOverflow(page)
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await noOverflow(page)
    await expect(page.getByLabel('Delivery date', { exact: true })).toHaveValue('2030-01-03')
    await page.screenshot({ path: info.outputPath(`b2b-checkout-${width}.png`), fullPage: true })
  }
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.screenshot({ path: info.outputPath('b2b-checkout-dark.png'), fullPage: true })
  await page.emulateMedia({ colorScheme: 'light' })
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  const writes = state.requests.filter(
    (request) => request.path === 'ecommerce/orders' && request.method === 'POST',
  )
  expect(writes).toHaveLength(1)
  expect(writes[0]!.body!.products).toHaveLength(35)
  expect((writes[0]!.body!.products as { order_quantity: number }[])[0]!.order_quantity).toBe(4.25)
})
