import { signOut, openVoucher, expectIndependentShopping } from './fixtures/ui'
import { expect, test, type Page } from '@playwright/test'
import { mockCatalogApi } from './fixtures/catalog-api'
import type { ProductSelection } from '../src/types/catalog'
import { readFile } from 'node:fs/promises'
const selection = (overrides: Partial<ProductSelection> = {}): ProductSelection => ({
  productId: 1,
  productUnitVariantId: 100,
  processingTypeId: null,
  quantity: 3,
  ripeness: null,
  size: null,
  washed: null,
  ...overrides,
})
async function seed(page: Page, items = [selection()], corrupt = false) {
  await page.addInitScript(
    ({ items, corrupt }) =>
      localStorage.setItem(
        'ftf:v3:cart:1',
        corrupt ? '{corrupt' : JSON.stringify({ version: 1, items }),
      ),
    { items, corrupt },
  )
}
const cartItems = (page: Page) => page.getByRole('main').getByRole('list', { name: 'Cart items' })
async function choose(page: Page, name: string, option: string) {
  await page.getByRole('combobox', { name, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}
async function quantity(page: Page, value: string) {
  const input = page.getByRole('spinbutton', { name: 'Quantity', exact: true })
  await input.fill(value)
  await input.press('Tab')
}
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

test('adds configured products, merges matching lines, persists refresh and opens a usable cart drawer', async ({
  page,
}, testInfo) => {
  const state = await mockCatalogApi(page)
  await page.goto('/catalog/products/1')
  await expect(page.getByRole('button', { name: 'Add to cart', exact: true })).toBeEnabled()
  await quantity(page, '2.5')
  await choose(page, 'Processing', 'Chopped (+Ksh 10.00 per unit)')
  await choose(page, 'Ripeness (optional)', 'ripe')
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.getByText('Added to cart.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open cart (1)', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.getByRole('main').getByRole('link', { name: 'View cart', exact: true }).click()
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true }),
  ).toHaveValue('5')
  await expect(page.getByText('Estimated products total')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Cart summary' })).toContainText('530.00')
  await expect(
    cartItems(page)
      .locator('p')
      .filter({ hasText: /Price per unit:/ }),
  ).toContainText('Ksh 90.00–Ksh 110.00 / KG')
  await page.reload()
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true }),
  ).toHaveValue('5')
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!))
  expect(Object.keys(saved.items[0]).sort()).toEqual(
    [
      'productId',
      'productUnitVariantId',
      'processingTypeId',
      'quantity',
      'ripeness',
      'size',
      'washed',
    ].sort(),
  )
  await page.screenshot({ path: testInfo.outputPath('cart.png'), fullPage: true })
  await page.getByRole('button', { name: /^Open cart/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Your cart' })
  await expect(dialog.getByRole('article')).toHaveCount(1)
  await expect(dialog).toBeVisible()
  expect(
    await page
      .locator('[id]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
      ),
  ).toEqual([])
  await expect(dialog.getByRole('link', { name: 'View full cart', exact: true })).toBeVisible()
  await dialog.getByRole('link', { name: 'Tomatoes', exact: true }).click()
  await expect(page).toHaveURL(/catalog\/products\/1/)
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: /^Open cart/ }).click()
  await dialog.getByRole('link', { name: 'View full cart', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  expect(state.requests.some((r) => r.path.startsWith('ecommerce/cart'))).toBe(false)
  expect(state.requests.some((r) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(r.method))).toBe(
    false,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('splits and merges specifications atomically, retains invalid drafts, and cancels edits', async ({
  page,
}) => {
  await mockCatalogApi(page)
  await seed(page)
  await page.goto('/cart')
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await cartItems(page).getByRole('button', { name: 'Split item', exact: true }).click()
  await quantity(page, '1')
  await page.getByRole('button', { name: 'Save split', exact: true }).click()
  await expect(
    page.getByText('Choose different processing or specifications for the split.'),
  ).toBeVisible()
  await choose(page, 'Ripeness (optional)', 'ripe')
  await quantity(page, '2.9')
  await page.getByRole('button', { name: 'Save split', exact: true }).click()
  await expect(
    page.getByText('Both parts must meet the minimum quantity and allowed decimal places.'),
  ).toBeVisible()
  await expect(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toHaveValue('2.9')
  await quantity(page, '1')
  await page.getByRole('button', { name: 'Save split', exact: true }).click()
  await expect(cartItems(page).getByRole('article')).toHaveCount(2)
  await expect(page.getByRole('region', { name: 'Cart summary' })).toContainText('280.00')
  const ripe = cartItems(page)
    .getByRole('article')
    .filter({ has: page.getByText('ripe', { exact: true }) })
  await ripe.getByRole('button', { name: 'Edit options', exact: true }).click()
  await choose(page, 'Ripeness (optional)', 'unripe')
  await page.getByRole('button', { name: 'Cancel edit', exact: true }).click()
  await expect(cartItems(page).getByText('ripe', { exact: true })).toBeVisible()
  await ripe.getByRole('button', { name: 'Edit options', exact: true }).click()
  await choose(page, 'Ripeness (optional)', 'No preference')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true }),
  ).toHaveValue('3')
})

test('repairs new minimums and retains unavailable or failed-read selections for removal/retry', async ({
  page,
}) => {
  const state = await mockCatalogApi(page)
  await seed(page, [selection({ quantity: 0.5 })])
  state.products[0]!.variations[0]!.unit_variants[0]!.minimum_order_quantity = '2'
  await page.goto('/cart')
  await expect(
    page.getByText('Check the minimum quantity and allowed decimal places.'),
  ).toBeVisible()
  const rowQuantity = cartItems(page).getByRole('spinbutton', {
    name: 'Quantity for Tomatoes',
    exact: true,
  })
  await rowQuantity.fill('2')
  await rowQuantity.press('Tab')
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true }),
  ).toHaveValue('2')
  state.products[0]!.published = false
  await page.reload()
  await expect(page.getByText('This product is currently unavailable.')).toBeVisible()
  await expect(
    cartItems(page).getByRole('button', { name: 'Edit options', exact: true }),
  ).toBeDisabled()
  state.productStatus = 500
  await page.reload()
  await expect(page.getByText(/Your saved selections are retained/)).toBeVisible()
  state.productStatus = 200
  state.products[0]!.published = true
  await page.getByRole('button', { name: 'Retry cart products', exact: true }).click()
  await expect(
    cartItems(page).getByRole('button', { name: 'Edit options', exact: true }),
  ).toBeEnabled()
  await cartItems(page).getByRole('button', { name: 'Remove item', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
})

test('checks/removes existing vouchers, calculates estimates, and keeps failures beside the field', async ({
  page,
}) => {
  const state = await mockCatalogApi(page)
  await seed(page)
  state.availableVoucher = {
    code: 'SAVE10',
    discount_type: 'Percentage',
    discount_value: '10',
    status: 'Active',
    expiry_date: '2099-01-01T00:00:00Z',
  }
  state.products[0]!.tax = { id: 1, name: 'VAT', rate: '16' }
  state.minimumBasket = '300'
  await page.goto('/cart')
  await openVoucher(page)
  await page.getByRole('button', { name: 'Use SAVE10', exact: true }).click()
  await expect(page.getByText('Selected voucher: SAVE10')).toBeVisible()
  const summary = page.getByRole('region', { name: 'Cart summary' })
  await expect(summary).toContainText('252.00')
  await expect(summary).toContainText('38.62')
  await expect(summary).toContainText('48.00')
  await page.getByRole('button', { name: 'Remove voucher', exact: true }).click()
  await expect(summary).toContainText('280.00')
  await openVoucher(page)
  await page.getByLabel('Voucher code', { exact: true }).fill('INVALID')
  await page.getByRole('button', { name: 'Check voucher', exact: true }).click()
  await expect(page.getByText('Invalid or expired voucher code.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Voucher code', { exact: true })).toHaveValue('INVALID')
  expect(state.requests.filter((r) => r.path.includes('/vouchers/INVALID'))).toHaveLength(1)
  expect(
    state.requests
      .filter((r) => r.path.includes('/vouchers'))
      .every((r) => r.method === 'GET' && r.query === ''),
  ).toBe(true)
})

test('keeps one local cart across branches and ignores a late voucher response after switching', async ({
  page,
}) => {
  const state = await mockCatalogApi(page, { parent: true })
  await seed(page)
  await page.addInitScript(() => sessionStorage.setItem('ftf:v3:branch', '11'))
  state.availableVoucher = {
    code: 'WEST',
    discount_type: 'Flat',
    discount_value: '50',
    status: 'Active',
    expiry_date: null,
  }
  let release!: () => void
  state.holdVoucher = new Promise((resolve) => {
    release = resolve
  })
  await page.goto('/cart')
  await openVoucher(page)
  await page.getByRole('button', { name: 'Use WEST', exact: true }).click()
  await expect(page.getByText('Checking voucher eligibility: WEST')).toBeVisible()
  await page.getByRole('navigation').getByRole('combobox', { name: 'Shopping branch' }).click()
  await page.getByRole('option', { name: 'East branch', exact: true }).click()
  release()
  state.holdVoucher = null
  state.availableVoucher = null
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await expect(page.getByText('Selected voucher: WEST')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Cart summary' })).toContainText('280.00')
  expect(state.requests.find((r) => r.path.endsWith('/vouchers/WEST'))?.query).toBe(
    '?branch_company_id=11',
  )
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith('ftf:v3:cart:')),
    ),
  ).toEqual(['ftf:v3:cart:1'])
})

test('isolates account carts through sign-out and a replacement customer session', async ({
  page,
}) => {
  const state = await mockCatalogApi(page)
  await seed(page)
  await page.goto('/cart')
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await signOut(page)
  await expect(page).toHaveURL(/auth\/login/)
  state.userId = 2
  await page.getByLabel('Email', { exact: true }).fill('other@example.test')
  await page.getByLabel('Password', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expectIndependentShopping(page)
  await page.getByRole('button', { name: 'Open cart (0)', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Your cart' })
    .getByRole('link', { name: 'View full cart', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items[0].quantity),
  ).toBe(3)
})

test('retains the product draft after storage failure and allows a retry without duplicate selections', async ({
  page,
}) => {
  await mockCatalogApi(page)
  await page.goto('/catalog/products/1')
  await quantity(page, '2.5')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('ftf:v3:cart:'))
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return original.call(this, key, value)
    }
    ;(window as unknown as { restoreStorage: () => void }).restoreStorage = () => {
      Storage.prototype.setItem = original
    }
  })
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(
    page.getByText(
      'The cart could not be saved on this device. Your previous cart and draft are unchanged.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('spinbutton', { name: 'Quantity', exact: true })).toHaveValue('2.5')
  await expect(page.getByRole('button', { name: 'Open cart (0)', exact: true })).toBeVisible()
  await page.evaluate(() => (window as unknown as { restoreStorage: () => void }).restoreStorage())
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Open cart (1)', exact: true })).toBeVisible()
})

test('retains unreadable stored data until explicit reset and confirms normal clear-cart intent', async ({
  page,
}) => {
  await mockCatalogApi(page)
  await seed(page, [], true)
  await page.goto('/cart')
  await expect(page.getByText(/The saved cart could not be read/)).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))).toBe('{corrupt')
  await page.getByRole('button', { name: 'Reset saved cart', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
  await page.getByRole('link', { name: 'Continue shopping', exact: true }).click()
  await page
    .getByRole('list', { name: 'Products', exact: true })
    .getByRole('link', { name: 'Tomatoes', exact: true })
    .click()
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click()
  await page.getByRole('main').getByRole('link', { name: 'View cart', exact: true }).click()
  await page.getByRole('button', { name: 'Clear cart', exact: true }).click()
  await page.getByRole('button', { name: 'Keep cart', exact: true }).click()
  await expect(cartItems(page).getByRole('article')).toHaveCount(1)
  await page.getByRole('button', { name: 'Clear cart', exact: true }).click()
  await page.getByRole('button', { name: 'Yes, clear cart', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible()
})

test('edits quantities and removes image-backed items in the compact cart drawer', async ({
  page,
}, info) => {
  const state = await mockCatalogApi(page)
  const names = ['Broccoli', 'Butternut — peeled and diced for catering']
  const images = ['broccoli', 'butternut']
  for (const [index, product] of state.products.entries()) {
    product.name = names[index]!
    product.variations[0]!.media = [
      { original_url: `http://127.0.0.1:4175/__cart-images/${images[index]}.png` },
    ]
    product.variations[0]!.unit_variants[0]!.flash_sale.status = 'inactive'
  }
  state.products[1]!.variations[0]!.unit_variants[0]!.selling_price = '170'
  await page.route('**/__cart-images/*.png', async (route) => {
    const file = new URL(route.request().url()).pathname.split('/').pop()!
    if (!images.some((name) => file === `${name}.png`)) return route.abort()
    await route.fulfill({
      contentType: 'image/png',
      body: await readFile(new URL(`./fixtures/catalog-images/${file}`, import.meta.url)),
    })
  })
  await seed(page, [
    selection(),
    selection({ productId: 2, productUnitVariantId: 200, quantity: 246 }),
  ])
  await page.goto('/catalog')
  await page.getByRole('button', { name: 'Open cart (2)', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Your cart', exact: true })
  const rows = drawer.getByRole('article')
  await expect(rows).toHaveCount(2)
  await expect(rows.first().getByRole('img', { name: 'Broccoli', exact: true })).toBeVisible()
  await expect(rows.first()).toContainText('Broccoli · Grade 1')
  await expect(
    rows
      .first()
      .locator('p')
      .filter({ hasText: /Price per unit:/ }),
  ).toContainText('Ksh 100.00 / KG')
  await expect(drawer.getByRole('spinbutton')).toHaveCount(2)
  await expect(drawer.getByRole('button', { name: 'Edit options', exact: true })).toHaveCount(0)
  const input = rows.first().getByRole('spinbutton', { name: 'Quantity for Broccoli', exact: true })
  await input.fill('4.25')
  await input.press('Tab')
  await expect(input).toHaveValue('4.25')
  await expect(rows.first()).toContainText('Ksh 425.00')
  await expect(drawer).toContainText('Ksh 42,245.00')
  const saved = await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))
  expect(JSON.parse(saved!).items[0].quantity).toBe(4.25)
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await expect
        .poll(() => drawer.evaluate((element) => element.scrollWidth <= element.clientWidth))
        .toBe(true)
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true)
      await page.screenshot({
        path: info.outputPath(`cart-drawer-${width}-${colorScheme}.png`),
        animations: 'disabled',
      })
    }
  }
  await input.fill('0')
  await input.press('Tab')
  await expect(input).toHaveValue('4.25')
  await expect(
    drawer.getByText('Check the selected options and quantity.', { exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))).toBe(saved)
  await drawer.getByRole('link', { name: 'View full cart', exact: true }).click()
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Broccoli', exact: true }),
  ).toHaveValue('4.25')
  await page.getByRole('button', { name: 'Open cart (2)', exact: true }).click()
  await drawer
    .getByRole('article', { name: names[1]!, exact: true })
    .getByRole('button', { name: 'Remove item', exact: true })
    .click()
  await expect(rows).toHaveCount(1)
  await rows.first().getByRole('button', { name: 'Remove item', exact: true }).click()
  await expect(drawer.getByText('Your cart is empty.', { exact: false })).toBeVisible()
  await expect(drawer.getByRole('spinbutton')).toHaveCount(0)
  await expect(drawer.getByText('Loading…', { exact: true })).toHaveCount(0)
  expect(
    JSON.parse((await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1')))!).items,
  ).toEqual([])
  expect(state.requests.some((request) => request.method !== 'GET')).toBe(false)
})

test('closes a stale editor after a saved-cart update from another tab', async ({ page }) => {
  await mockCatalogApi(page)
  await seed(page)
  await page.goto('/cart')
  await cartItems(page).getByRole('button', { name: 'Edit options', exact: true }).click()
  await choose(page, 'Size (optional)', 'large')
  await page.evaluate(
    (item) => {
      const key = 'ftf:v3:cart:1'
      const newValue = JSON.stringify({ version: 1, items: [item] })
      localStorage.setItem(key, newValue)
      window.dispatchEvent(
        new StorageEvent('storage', { key, newValue, storageArea: localStorage }),
      )
    },
    selection({ quantity: 5 }),
  )
  await expect(page.getByRole('region', { name: 'Edit item options' })).toHaveCount(0)
  await expect(
    page.getByText('Cart updated in another tab. Review it before continuing.'),
  ).toBeVisible()
  await expect(
    cartItems(page).getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true }),
  ).toHaveValue('5')
})

test('retries voucher discovery and stops applying an expired voucher without changing the stored cart', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-15T10:00:00Z') })
  const state = await mockCatalogApi(page)
  await seed(page)
  state.voucherStatus = 500
  state.availableVoucher = {
    code: 'SHORT',
    discount_type: 'Flat',
    discount_value: '50',
    status: 'Active',
    expiry_date: '2026-10-15T10:10:00Z',
  }
  await page.goto('/cart')
  await openVoucher(page)
  await expect(
    page.getByText('Available vouchers could not be loaded. You can still enter a code.'),
  ).toBeVisible()
  state.voucherStatus = 200
  await page.getByRole('button', { name: 'Retry available vouchers', exact: true }).click()
  await openVoucher(page)
  await page.getByRole('button', { name: 'Use SHORT', exact: true }).click()
  await expect(page.getByText('Selected voucher: SHORT')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Cart summary' })).toContainText('230.00')
  await page.clock.fastForward(601000)
  await expect(page.getByText('This voucher has expired or is no longer available.')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Cart summary' })).toContainText('280.00')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items[0].quantity),
  ).toBe(3)
})

test('saves inline quantities in place and restores invalid or unsaved quantities', async ({
  page,
}) => {
  const state = await mockCatalogApi(page)
  await seed(page, [selection(), selection({ productId: 2, productUnitVariantId: 200 })])
  await page.goto('/cart')
  const rows = cartItems(page).getByRole('article')
  const input = rows.first().getByRole('spinbutton', { name: 'Quantity for Tomatoes', exact: true })
  await expect(rows).toHaveCount(2)
  await expect(rows.first()).toContainText('Tomatoes · Grade 1')
  await expect(page.getByText('Price breakdown', { exact: true })).toHaveCount(0)
  await input.fill('2.5')
  await input.press('Tab')
  await expect(input).toHaveValue('2.5')
  await expect(rows.first()).toHaveAttribute('aria-label', 'Tomatoes')
  const saved = await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))
  expect(JSON.parse(saved!).items[0].quantity).toBe(2.5)
  await input.fill('0')
  await input.press('Tab')
  await expect(input).toHaveValue('2.5')
  await expect(
    page.getByText('Check the selected options and quantity.', { exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))).toBe(saved)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable')
    }
  })
  await input.fill('4')
  await input.press('Tab')
  await expect(input).toHaveValue('2.5')
  expect(await page.evaluate(() => localStorage.getItem('ftf:v3:cart:1'))).toBe(saved)
  expect(state.requests.some((request) => request.method !== 'GET')).toBe(false)
})

test('shows only changeable cart options and unit prices beneath product headings', async ({
  page,
}, info) => {
  const state = await mockCatalogApi(page)
  for (const product of state.products) {
    product.ripeness = ''
    product.washed = 'none'
    product.variations[0]!.unit_variants[0]!.processing_variants = []
    product.variations[0]!.unit_variants[0]!.flash_sale.status = 'inactive'
  }
  state.products[1]!.sizes = ''
  state.products[1]!.variations[0]!.unit_variants[0]!.selling_price = '0'
  await seed(page, [selection(), selection({ productId: 2, productUnitVariantId: 200 })])
  await page.goto('/cart')
  const rows = cartItems(page).getByRole('article')
  await expect(
    rows
      .first()
      .locator('p')
      .filter({ hasText: /Price per unit:/ }),
  ).toContainText('Ksh 100.00 / KG')
  await expect(
    rows
      .nth(1)
      .locator('p')
      .filter({ hasText: /Price per unit:/ }),
  ).toContainText('Ksh 0.00 / KG')
  await expect(rows.nth(1).getByRole('button', { name: 'Edit options', exact: true })).toHaveCount(
    0,
  )
  await expect(rows.nth(1).getByRole('button', { name: 'Split item', exact: true })).toHaveCount(0)
  await rows.first().getByRole('button', { name: 'Edit options', exact: true }).click()
  const editor = page.getByRole('region', { name: 'Edit item options', exact: true })
  await expect(editor.getByRole('combobox')).toHaveCount(1)
  await expect(editor.getByRole('combobox', { name: 'Size (optional)', exact: true })).toBeVisible()
  await expect(editor.getByRole('spinbutton')).toHaveCount(0)
  await expect(editor.getByText('Fresh produce', { exact: true })).toHaveCount(0)
  await expect(editor.getByRole('heading', { name: 'Product estimate', exact: true })).toHaveCount(
    0,
  )
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: info.outputPath(`cart-options-${width}.png`), fullPage: true })
  }
  await choose(page, 'Size (optional)', 'large')
  await editor.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(editor).toHaveCount(0)
  const updated = cartItems(page).getByRole('article', { name: 'Tomatoes', exact: true })
  await expect(updated.getByText('large', { exact: true })).toBeVisible()
  await expect(updated.getByRole('spinbutton')).toHaveValue('3')
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items.find(
        (item: { productId: number }) => item.productId === 1,
      ),
    ),
  ).toMatchObject({ size: 'large', quantity: 3, productUnitVariantId: 100 })
  expect(state.requests.some((request) => request.method !== 'GET')).toBe(false)
})

test('allows clearing a saved option that is no longer offered', async ({ page }) => {
  const state = await mockCatalogApi(page)
  state.products[0]!.ripeness = ''
  state.products[0]!.sizes = ''
  state.products[0]!.washed = ''
  state.products[0]!.variations[0]!.unit_variants[0]!.processing_variants = []
  await seed(page, [selection({ washed: 'washed' })])
  await page.goto('/cart')
  await expect(
    page.getByText('A selected specification is no longer available.', { exact: true }),
  ).toBeVisible()
  await cartItems(page).getByRole('button', { name: 'Edit options', exact: true }).click()
  await choose(page, 'Washing (optional)', 'No preference')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(
    page.getByText('A selected specification is no longer available.', { exact: true }),
  ).toHaveCount(0)
  await expect(
    cartItems(page).getByRole('button', { name: 'Edit options', exact: true }),
  ).toHaveCount(0)
  await expect(cartItems(page).getByRole('spinbutton')).toHaveValue('3')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items[0].washed),
  ).toBeNull()
})
