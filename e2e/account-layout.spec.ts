import { expect, test, type Page } from '@playwright/test'
import { mockCommerceApi, orderFixture } from './fixtures/commerce-api'
import { catalogProduct } from '../src/types/__tests__/catalog.fixture'

async function noOverflow(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  expect(
    await page
      .locator('[id]')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
      ),
  ).toEqual([])
}
async function history(page: Page, source = orderFixture()) {
  const rows = Array.from({ length: 18 }, (_, index) => ({
    ...source,
    id: 40 + index,
    order_number: `ORD-${40 + index}`,
    status: index % 2 ? 'Completed' : 'New Order',
    payment_status: index % 2 ? 'paid' : 'pending',
  }))
  const queries: URLSearchParams[] = []
  await page.route(/\/ecommerce\/orders(?:\?|$)/, async (route) => {
    expect(route.request().method()).toBe('GET')
    const query = new URL(route.request().url()).searchParams
    queries.push(query)
    const filtered = rows.filter(
      (row) =>
        (!query.get('status') || row.status === query.get('status')) &&
        (!query.get('payment_status') || row.payment_status === query.get('payment_status')),
    )
    const current = Number(query.get('page') ?? 1)
    await route.fulfill({
      json: {
        data: filtered.slice((current - 1) * 15, current * 15),
        current_page: current,
        last_page: Math.ceil(filtered.length / 15),
        total: filtered.length,
      },
    })
  })
  return queries
}
async function choose(page: Page, name: string, option: string) {
  await page.getByRole('combobox', { name, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}
test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Unhandled view error:'))
      throw new Error(message.text())
  })
})

test('keeps account drafts across tabs and resizing, and restores drawer focus', async ({
  page,
}, info) => {
  const state = await mockCommerceApi(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/account')
  await expect(page.getByRole('tab')).toHaveText([
    'Company',
    'Team',
    'Preferences',
    'Profile',
    'Security',
  ])
  await expect(page.getByRole('tab', { name: 'Company', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.getByRole('tab', { name: 'Profile', exact: true }).click()
  await page.getByLabel('Your name', { exact: true }).fill('Unsaved buyer')
  await page.getByRole('tab', { name: 'Preferences', exact: true }).click()
  await page.getByRole('radio', { name: 'Phone', exact: true }).check()
  await page.getByRole('tab', { name: 'Company', exact: true }).click()
  await expect(page.getByLabel('Contact email', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Billing business name', { exact: true })).toBeVisible()
  await expect(page.getByText('Edit company contact', { exact: true })).toHaveCount(0)
  await page.getByLabel('Contact name', { exact: true }).fill('Unsaved company contact')
  await page.getByRole('tab', { name: 'Security', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Current password', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Team', exact: true }).click()
  await expect(page.getByRole('list', { name: 'Company members', exact: true })).toContainText(
    'Customer',
  )
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const section of ['Company', 'Team', 'Preferences', 'Profile', 'Security']) {
      await page.getByRole('tab', { name: section, exact: true }).click()
      await noOverflow(page)
      await page.screenshot({
        path: info.outputPath(`account-${section.toLowerCase()}-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      })
    }
  }
  await page.setViewportSize({ width: 320, height: 900 })
  await page.getByRole('tab', { name: 'Profile', exact: true }).click()
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Unsaved buyer')
  await noOverflow(page)
  await page.screenshot({
    path: info.outputPath('account-tabs-320.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('tab', { name: 'Preferences', exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Phone', exact: true })).toBeChecked()
  await page.getByRole('tab', { name: 'Company', exact: true }).click()
  await expect(page.getByLabel('Contact name', { exact: true })).toHaveValue(
    'Unsaved company contact',
  )
  await page.getByRole('button', { name: 'Account sections', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Account sections', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Account sections', exact: true })).toBeFocused()
  await page.goto('/account/addresses')
  const trigger = page.getByRole('button', { name: 'Edit address', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Edit delivery address', exact: true })
  await drawer.getByLabel('Location name', { exact: true }).fill('Unsaved address')
  await expect
    .poll(() => drawer.evaluate((element) => Math.round(element.getBoundingClientRect().x)))
    .toBe(0)
  await page.screenshot({
    path: info.outputPath('address-drawer-320.png'),
    fullPage: true,
    animations: 'disabled',
  })
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(drawer.getByLabel('Location name', { exact: true })).toHaveValue('Office')
  await drawer.getByRole('button', { name: 'Cancel address changes', exact: true }).click()
  await expect(drawer).toHaveCount(0)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('keeps order filters and pagination in the URL and resets the displayed filters', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  const queries = await history(page)
  await page.goto('/orders')
  await expect(page.getByRole('link', { name: 'ORD-40', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Next Page', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByRole('link', { name: 'ORD-55', exact: true })).toBeVisible()
  await choose(page, 'Order status', 'Completed')
  await choose(page, 'Payment status', 'paid')
  await page.getByLabel('Delivery from', { exact: true }).fill('2030-01-01')
  await page.getByLabel('Delivery to', { exact: true }).fill('2030-02-01')
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
  await expect(page).toHaveURL(/status=Completed/)
  await expect(page).not.toHaveURL(/page=/)
  await expect(page.getByRole('link', { name: 'ORD-41', exact: true })).toBeVisible()
  await expect.poll(() => queries.at(-1)?.get('date_from')).toBe('2030-01-01')
  expect(queries.at(-1)?.get('payment_status')).toBe('paid')
  await page.goBack()
  await expect(page.getByRole('combobox', { name: 'Order status', exact: true })).toContainText(
    'All statuses',
  )
  await expect(page.getByLabel('Delivery from', { exact: true })).toHaveValue('')
  await page.goForward()
  await expect(page.getByRole('combobox', { name: 'Order status', exact: true })).toContainText(
    'Completed',
  )
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await expect(page.getByRole('combobox', { name: 'Payment status', exact: true })).toContainText(
    'All payments',
  )
  await expect(page.getByRole('link', { name: 'ORD-40', exact: true })).toBeVisible()
  await page.goto('/account/credit-notes')
  await page.getByLabel('Credit note reference', { exact: true }).fill('CN-2')
  await page.getByRole('button', { name: 'Search credit notes', exact: true }).click()
  await expect(page).toHaveURL(/search=CN-2/)
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await expect(page.getByLabel('Credit note reference', { exact: true })).toHaveValue('')
  await noOverflow(page)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})

test('lays out every account and order page with a 35-item order at desktop, tablet and mobile widths', async ({
  page,
}, info) => {
  test.setTimeout(90_000)
  const state = await mockCommerceApi(page)
  state.catalog.products = Array.from({ length: 35 }, (_, index) =>
    catalogProduct(index + 1, `Product ${String(index + 1).padStart(2, '0')}`),
  )
  for (const product of state.catalog.products)
    product.variations[0]!.unit_variants[0]!.flash_sale.status = 'inactive'
  state.order.invoice_issue_date = '2026-10-15'
  const original = state.order.order_line_items[0]!
  state.order.order_line_items = state.catalog.products.map((product) => ({
    ...original,
    id: product.id,
    product_unit_variant_id: product.id * 100,
    unit_variant: {
      id: product.id * 100,
      unit: { id: 1, name: 'KG' },
      grade_variant: {
        id: product.id * 10,
        grade: { id: 1, name: 'Grade 1' },
        product: { id: product.id, name: product.name },
      },
    },
  }))
  state.order.sub_total = '10500'
  state.order.total_amount = '10520'
  await history(page, state.order)
  const routes = [
    '/account',
    '/account/addresses',
    '/orders',
    '/orders/40',
    '/orders/40/edit',
    '/account/invoices',
    '/account/invoices/40',
    '/account/credit-notes',
    '/account/credit-notes/2',
    '/account/insights',
    '/account/impact',
  ]
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ colorScheme: 'light' })
    for (const path of routes) {
      await page.goto(path)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
      if (path === '/account')
        await expect(page.getByLabel('Contact name', { exact: true })).toBeVisible()
      if (path === '/account/addresses')
        await expect(
          page.getByRole('heading', { name: 'Office (Default)', exact: true }),
        ).toBeVisible()
      if (path === '/orders' || path === '/account/invoices')
        await expect(page.getByRole('link', { name: 'ORD-40', exact: true })).toBeVisible()
      if (path === '/orders/40') {
        const items = page.getByRole('region', { name: 'Order items', exact: true })
        await expect(items).toContainText('Product 35')
        if (width < 1280)
          expect(
            (await page
              .getByRole('complementary', { name: 'Order totals', exact: true })
              .boundingBox())!.y,
          ).toBeLessThan((await items.boundingBox())!.y)
        await expect(
          page.getByRole('complementary', { name: 'Order totals', exact: true }),
        ).toContainText('10,520.00')
        if (width >= 1024)
          await expect(
            page
              .getByRole('navigation', { name: 'Account navigation', exact: true })
              .getByRole('link', { name: 'Orders', exact: true }),
          ).toHaveAttribute('aria-current', 'page')
      }
      if (path === '/orders/40/edit') {
        await expect(page.getByRole('button', { name: 'Configure item', exact: true })).toHaveCount(
          35,
        )
        if (width < 640) {
          const productName = page
            .getByText('Product 01', { exact: false })
            .filter({ hasText: 'Grade 1' })
            .first()
          expect((await productName.boundingBox())!.width).toBeGreaterThan(130)
        }
      }
      if (path === '/account/invoices/40')
        await expect(
          page.getByRole('img', { name: 'QR code for the issued invoice', exact: true }),
        ).toBeVisible()
      if (path === '/account/credit-notes')
        await expect(page.getByRole('link', { name: 'CN-2', exact: true })).toBeVisible()
      if (path === '/account/credit-notes/2')
        await expect(
          page.getByRole('table', { name: 'Credit note items', exact: true }),
        ).toBeVisible()
      if (path === '/account/insights')
        await expect(
          page.getByRole('table', { name: 'Top ordered products', exact: true }),
        ).toBeVisible()
      if (path === '/account/impact')
        await expect(page.getByText('0 tonnes', { exact: true })).toBeVisible()
      await noOverflow(page)
      if (width === 1280 || width === 390) {
        const name = path.slice(1).replaceAll('/', '-')
        await page.screenshot({
          path: info.outputPath(`${name}-${width}.png`),
          fullPage: !['/orders/40', '/orders/40/edit'].includes(path),
          animations: 'disabled',
        })
        if (['/account', '/orders', '/orders/40'].includes(path)) {
          await page.emulateMedia({ colorScheme: 'dark' })
          await page.screenshot({ path: info.outputPath(`${name}-${width}-dark.png`) })
          await page.emulateMedia({ colorScheme: 'light' })
        }
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/account/invoices/40')
  await expect(page.getByRole('table', { name: 'Order items', exact: true })).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(
    page.getByRole('navigation', { name: 'Account navigation', exact: true }),
  ).toBeHidden()
  expect(
    (await page.getByRole('table', { name: 'Order items', exact: true }).boundingBox())!.width,
  ).toBeGreaterThan(900)
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})
