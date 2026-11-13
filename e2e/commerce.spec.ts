import { signOut, navigate, navigateAccount } from './fixtures/ui'
import { expect, test, type Page } from '@playwright/test'
import { mockCommerceApi, selection } from './fixtures/commerce-api'
async function choose(page: Page, name: string, option: string) {
  if (
    name === 'Payment method' &&
    (await page.getByRole('main').getByRole('radio', { name: option, exact: true }).count())
  ) {
    await page.getByRole('main').getByRole('radio', { name: option, exact: true }).check()
    return
  }
  await page.getByRole('main').getByRole('combobox', { name, exact: true }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}
async function delivery(page: Page) {
  await choose(page, 'Delivery or pickup address', 'Office — Market Road')
  await page.getByLabel('Delivery date', { exact: true }).fill('2030-01-03')
}
test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})
test('checks out a local cart once and clears it only after confirmed order creation', async ({
  page,
}, info) => {
  const state = await mockCommerceApi(page)
  await page.goto('/cart')
  await page.getByRole('link', { name: 'Proceed to checkout' }).click()
  await delivery(page)
  await page.screenshot({ path: info.outputPath('checkout.png'), fullPage: true })
  await page.getByRole('button', { name: 'Place order', exact: true }).dblclick()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(
    state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST'),
  ).toHaveLength(1)
  const request = state.requests.find(
    (req) => req.path === 'ecommerce/orders' && req.method === 'POST',
  )!
  expect(request.body).toMatchObject({
    delivery_address_id: 1,
    payment_type: 'credit',
    products: [
      {
        product_unit_variant_id: 100,
        order_quantity: 3,
        processing_type_id: null,
        specifications: null,
      },
    ],
  })
  expect(request.body).not.toHaveProperty('mpesa_number')
  expect(request.body).not.toHaveProperty('shipping_cost')
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items),
  ).toEqual([])
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:checkout:1'))).toBeNull()
})
test('normalizes multiple created orders and preserves each confirmation', async ({ page }) => {
  const state = await mockCommerceApi(page)
  state.split = true
  await page.goto('/checkout')
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByRole('link', { name: 'ORD-40', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'ORD-41', exact: true })).toBeVisible()
})
test('keeps validation failures editable without losing delivery input', async ({ page }) => {
  const state = await mockCommerceApi(page)
  state.orderStatus = 422
  await page.goto('/checkout')
  await delivery(page)
  await page.getByLabel('Delivery notes (optional)').fill('Reception please')
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByText('Order could not be saved', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Place order', exact: true })).toBeEnabled()
  await expect(page.getByLabel('Delivery notes (optional)')).toHaveValue('Reception please')
  expect(
    state.requests.filter((req) => req.method === 'POST' && req.path === 'ecommerce/orders'),
  ).toHaveLength(1)
})
test('keeps uncertain order writes blocked across refresh and never replays them', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  state.orderStatus = 500
  await page.goto('/checkout')
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByText('The result is uncertain.', { exact: false })).toBeVisible()
  await page.reload()
  await expect(page.getByText('The result is uncertain.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Place order', exact: true })).toBeDisabled()
  expect(
    state.requests.filter((req) => req.method === 'POST' && req.path === 'ecommerce/orders'),
  ).toHaveLength(1)
})
test('confirms M-Pesa status before an explicit paid-order submission', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  await choose(page, 'Payment method', 'M-Pesa')
  await page.getByLabel('M-Pesa phone number', { exact: true }).fill('0712345678')
  await page.getByRole('button', { name: 'Request M-Pesa payment' }).click()
  await expect(page.getByText('Payment reference: 7')).toBeVisible()
  expect(
    state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST'),
  ).toHaveLength(0)
  const saved = await page.evaluate(() => sessionStorage.getItem('ftf:v3:checkout:1'))
  expect(saved).not.toContain('0712345678')
  expect(saved).not.toContain('products')
  state.paymentStatus = 'success'
  await page.getByRole('button', { name: 'Check payment status' }).click()
  await page.getByRole('button', { name: 'Confirm paid order' }).dblclick()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(state.requests.filter((req) => req.path.includes('init-mpesa'))).toHaveLength(1)
  expect(
    state.requests.find((req) => req.path === 'ecommerce/orders' && req.method === 'POST')?.body,
  ).toMatchObject({ payment_type: 'mpesa', payment_collection_id: 7 })
})
test('retains failed and unknown payment outcomes without a second charge', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  await choose(page, 'Payment method', 'M-Pesa')
  await page.getByLabel('M-Pesa phone number', { exact: true }).fill('0712345678')
  await page.getByRole('button', { name: 'Request M-Pesa payment' }).click()
  await expect(page.getByText('Payment reference: 7')).toBeVisible()
  state.paymentStatus = 'failed'
  await page.getByRole('button', { name: 'Check payment status' }).click()
  await expect(page.getByText('Payment failed.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Review and try again' }).click()
  await expect(page.getByRole('button', { name: 'Request M-Pesa payment' })).toBeEnabled()
  expect(state.requests.filter((req) => req.path.includes('init-mpesa'))).toHaveLength(1)
})
test('does not interpret an unknown collection status as successful payment', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  await choose(page, 'Payment method', 'M-Pesa')
  await page.getByLabel('M-Pesa phone number', { exact: true }).fill('0712345678')
  await page.getByRole('button', { name: 'Request M-Pesa payment' }).click()
  await expect(page.getByText('Payment reference: 7')).toBeVisible()
  state.paymentStatus = 'completed'
  await page.getByRole('button', { name: 'Check payment status' }).click()
  await expect(page.getByRole('button', { name: 'Confirm paid order' })).toHaveCount(0)
  expect(
    state.requests.filter((req) => req.method === 'POST' && req.path === 'ecommerce/orders'),
  ).toHaveLength(0)
})
test('preserves a newer cart when an earlier order completes late', async ({ page }) => {
  const state = await mockCommerceApi(page)
  let release!: () => void
  state.holdOrder = new Promise((resolve) => {
    release = resolve
  })
  await page.goto('/checkout')
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect
    .poll(
      () =>
        state.requests.filter((req) => req.method === 'POST' && req.path === 'ecommerce/orders')
          .length,
    )
    .toBe(1)
  await page.evaluate((item) => {
    const key = 'ftf:v3:cart:1'
    const value = JSON.stringify({ version: 1, items: [{ ...item, quantity: 8 }] })
    localStorage.setItem(key, value)
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))
  }, selection)
  release()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items[0].quantity),
  ).toBe(8)
})
test('uses the selected branch for checkout writes and omits it from home catalog requests', async ({
  page,
}) => {
  const state = await mockCommerceApi(page, { parent: true })
  await page.goto('/checkout')
  await choose(page, 'Shopping branch', 'West branch')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(
    state.requests.find((req) => req.method === 'POST' && req.path === 'ecommerce/orders')?.body
      ?.branch_company_id,
  ).toBe(11)
  expect(
    state.catalog.requests
      .filter((req) => req.path === 'ecommerce/products')
      .every((req) => !req.query.includes('branch_company_id')),
  ).toBe(true)
})
test('blocks checkout when no company payment methods are configured', async ({ page }) => {
  const state = await mockCommerceApi(page)
  state.payments = ''
  await page.goto('/checkout')
  await expect(page.getByText('No payment methods are configured', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Place order', exact: true })).toBeDisabled()
  expect(state.requests.filter((req) => req.method === 'POST')).toHaveLength(0)
})
test('submits distinct recurring delivery dates through the existing order fields', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  await page.getByText('Repeat this order (optional)', { exact: true }).click()
  await page.getByRole('button', { name: 'Add another delivery date' }).click()
  await page.getByLabel('Additional delivery date 1', { exact: true }).fill('2030-01-04')
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(
    state.requests.find((req) => req.method === 'POST' && req.path === 'ecommerce/orders')?.body,
  ).toMatchObject({ is_recurring: true, recurring_dates: ['2030-01-04'] })
})
test('browses orders, edits an eligible order, cancels it and offers safe reorder', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.goto('/orders')
  await page.getByRole('link', { name: 'ORD-40', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Order details' })).toBeVisible()
  await page.getByRole('link', { name: 'Edit order', exact: true }).click()
  await page.getByLabel('Delivery notes', { exact: true }).fill('Updated reception')
  await page.getByRole('button', { name: 'Save order changes' }).click()
  await expect(page.getByText('Notes: Updated reception')).toBeVisible()
  await page.getByRole('button', { name: 'Reorder', exact: true }).click()
  await page.getByRole('button', { name: 'Add available items to cart' }).click()
  await expect(page.getByText('Order selections added to cart.', { exact: false })).toBeVisible()
  await page.getByText('Cancel this order', { exact: true }).click()
  await page.getByLabel('Cancellation reason', { exact: true }).fill('No longer needed')
  await page.getByRole('button', { name: 'Confirm cancellation' }).click()
  await expect(page.getByText('Order cancelled.', { exact: true })).toBeVisible()
  expect(
    state.requests.filter((req) => req.path === 'ecommerce/orders/40' && req.method === 'PUT'),
  ).toHaveLength(1)
})
test('submits feedback only on explicit confirmation', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/orders/40')
  await page.getByText('Leave order feedback', { exact: true }).click()
  await page.getByLabel('Your feedback', { exact: true }).fill('Thank you')
  await page.getByRole('button', { name: 'Send feedback' }).click()
  await expect(page.getByText('comment: Thank you')).toBeVisible()
  expect(state.requests.filter((req) => req.path === 'ecommerce/feedback/40')).toHaveLength(1)
})
test('edits saved coordinates including zero and deletes a delivery address', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/account/addresses')
  await page.getByRole('button', { name: 'Edit address', exact: true }).click()
  await page.getByLabel('Location name', { exact: true }).fill('Main office')
  await page.getByRole('button', { name: 'Save delivery address', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Main office (Default)' })).toBeVisible()
  expect(
    state.requests.find((req) => req.path === 'ecommerce/addresses/1' && req.method === 'PUT')
      ?.body,
  ).toMatchObject({ latitude: 0, longitude: 36.8, name: 'Main office' })
  await page.getByRole('button', { name: 'Delete address', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm delete', exact: true }).click()
  await expect(page.getByText('You have no saved delivery addresses.')).toBeVisible()
})
test('saves profile and sends/cancels home-company staff invitations through explicit mutations', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.goto('/account')
  await page.getByRole('tab', { name: 'Profile', exact: true }).click()
  await page.getByLabel('Your name', { exact: true }).fill('Updated customer')
  await page.getByRole('button', { name: 'Save profile', exact: true }).click()
  await expect(page.getByText('Profile saved.', { exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Team', exact: true }).click()
  await page.getByRole('button', { name: 'Invite member', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Invite member', exact: true })
    .getByLabel('Email address', { exact: true })
    .fill('colleague@example.test')
  await page.getByRole('button', { name: 'Send invitation', exact: true }).click()
  await expect(page.getByText('Invitation sent.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel invitation for colleague@example.test' }).click()
  await expect(page.getByText('Invitation cancelled.', { exact: true })).toBeVisible()
  expect(state.requests.filter((req) => req.path === 'ecommerce/staff/invite')).toHaveLength(1)
  expect(state.requests.filter((req) => req.path.includes('/invitations/1/cancel'))).toHaveLength(1)
})
test('renders account reports, zero impact values and private credit notes', async ({
  page,
}, info) => {
  await mockCommerceApi(page)
  await page.goto('/account/insights')
  await expect(page.getByRole('table', { name: 'Top ordered products' })).toContainText('Tomatoes')
  await page.getByText('View price history table', { exact: true }).click()
  await expect(page.getByRole('table', { name: 'Tomatoes price history' })).toContainText(
    '02-10-2026',
  )
  await navigateAccount(page, 'Impact dashboard')
  await expect(page.getByText('0 tonnes', { exact: true })).toBeVisible()
  await navigateAccount(page, 'Credit notes')
  await page.getByRole('link', { name: 'CN-2', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'CN-2', exact: true })).toBeVisible()
  await expect(page.getByRole('table', { name: 'Credit note items' })).toContainText('Tomatoes')
  await page.screenshot({ path: info.outputPath('credit-note.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
test('retains public signed invoice links, QR rendering and private-session separation', async ({
  page,
}, info) => {
  const state = await mockCommerceApi(page, { loggedIn: false })
  state.order.status = 'Completed'
  state.order.invoice_issue_date = '2026-10-15'
  await page.goto('/order/invoice/40?signature=' + 'a'.repeat(64))
  await expect(page.getByRole('heading', { name: 'Invoice ORD-40', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'QR code for the issued invoice' })).toBeVisible()
  expect(
    state.requests.find((req) => req.path === 'ecommerce/orders/invoice/40')?.authorization,
  ).toBeUndefined()
  await page.screenshot({ path: info.outputPath('invoice.png'), fullPage: true })
  await page.goto('/credit-note/2?signature=' + 'b'.repeat(64))
  await expect(page.getByRole('heading', { name: 'CN-2', exact: true })).toBeVisible()
  expect(state.requests.some((req) => req.path === 'ecommerce/profile')).toBe(false)
})
test('serves every agreed information page publicly without commerce writes', async ({ page }) => {
  const state = await mockCommerceApi(page, { loggedIn: false, cart: false })
  for (const [path, title] of [
    ['/help', 'Help'],
    ['/contact', 'Contact'],
    ['/delivery-information', 'Delivery information'],
    ['/returns-and-refunds', 'Returns and refunds'],
    ['/privacy-policy', 'Privacy policy'],
    ['/terms-and-conditions', 'Terms and conditions'],
  ]) {
    await page.goto(path!)
    await expect(page.getByRole('heading', { name: title!, exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  expect(state.requests.filter((req) => req.method !== 'GET')).toHaveLength(0)
})

test('rechecks catalog pricing before a write and leaves changed estimates for review', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  state.catalog.products[0]!.variations[0]!.unit_variants[0]!.selling_price = '200.00'
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(
    page.getByText('Prices changed. Return to the cart and review the new estimate.'),
  ).toBeVisible()
  expect(
    state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST'),
  ).toHaveLength(0)
})
test('keeps an uncertain M-Pesa initiation blocked without an automatic second request', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  state.initStatus = 500
  await page.goto('/checkout')
  await delivery(page)
  await choose(page, 'Payment method', 'M-Pesa')
  await page.getByLabel('M-Pesa phone number', { exact: true }).fill('0712345678')
  await page.getByRole('button', { name: 'Request M-Pesa payment' }).click()
  await expect(page.getByText('The result is uncertain.', { exact: false })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Request M-Pesa payment' })).toHaveCount(0)
  expect(state.requests.filter((req) => req.path.includes('init-mpesa'))).toHaveLength(1)
})
test('keeps a paid attempt recoverable after refresh without reconstructing or replaying its payload', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  await page.goto('/checkout')
  await delivery(page)
  await choose(page, 'Payment method', 'M-Pesa')
  await page.getByLabel('M-Pesa phone number', { exact: true }).fill('0712345678')
  await page.getByRole('button', { name: 'Request M-Pesa payment' }).click()
  await expect(page.getByText('Payment reference: 7')).toBeVisible()
  await page.reload()
  state.paymentStatus = 'success'
  await page.getByRole('button', { name: 'Check payment status' }).click()
  await expect(
    page.getByText('The saved order submission is no longer in this tab.', { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm paid order' })).toHaveCount(0)
  expect(
    state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST'),
  ).toHaveLength(0)
})
test('sends a separate delivery date for a mixed basket of regular and partner products', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  Object.assign(state.catalog.products[1]!, { product_type: 'partner_product', partner_id: 4 })
  await page.addInitScript(
    (item) =>
      localStorage.setItem(
        'ftf:v3:cart:1',
        JSON.stringify({
          version: 1,
          items: [item, { ...item, productId: 2, productUnitVariantId: 200 }],
        }),
      ),
    selection,
  )
  await page.goto('/checkout')
  await delivery(page)
  await page
    .getByLabel('Partner delivery date (optional; otherwise same date)', { exact: true })
    .fill('2030-01-04')
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toBeVisible()
  expect(
    state.requests.find((req) => req.path === 'ecommerce/orders' && req.method === 'POST')?.body
      ?.partner_products_delivery_date,
  ).toBe('2030-01-04')
})
test('saves contact and billing preferences as distinct requests', async ({ page }) => {
  const state = await mockCommerceApi(page)
  await page.goto('/account')
  await page.getByRole('tab', { name: 'Preferences', exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Email', exact: true })).toBeChecked()
  await page.getByRole('radio', { name: 'Phone', exact: true }).check()
  await expect(page.getByRole('radio', { name: 'Email', exact: true })).not.toBeChecked()
  await page.getByRole('button', { name: 'Save contact preference', exact: true }).click()
  await expect(page.getByText('Preferences saved.', { exact: true })).toBeVisible()
  const first = state.requests.filter(
    (req) => req.path === 'ecommerce/profile' && req.method === 'PUT',
  )
  expect(first).toHaveLength(1)
  expect(first[0]?.body).toEqual({ communication_preference: 'phone' })
  await page.getByRole('button', { name: 'Save billing notifications', exact: true }).click()
  await expect
    .poll(
      () =>
        state.requests.filter((req) => req.path === 'ecommerce/profile' && req.method === 'PUT')
          .length,
    )
    .toBe(2)
  const last = state.requests
    .filter((req) => req.path === 'ecommerce/profile' && req.method === 'PUT')
    .at(-1)!
  expect(Object.keys(last.body!)).toEqual(['notification_preferences'])
})
test('shows invalid document and order IDs as not found without making an unsafe lookup', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  for (const path of [
    '/orders/0',
    '/orders/999999999999999999999',
    '/account/invoices/0?signature=' + 'a'.repeat(64),
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible()
  }
  expect(state.requests.some((req) => /orders\/(?:0|999999999999999999999)/.test(req.path))).toBe(
    false,
  )
})

test('clears only the original unchanged cart after checkout navigation without forcing a redirect', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  let release!: () => void
  state.holdOrder = new Promise((resolve) => {
    release = resolve
  })
  await page.goto('/checkout')
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect
    .poll(
      () =>
        state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST')
          .length,
    )
    .toBe(1)
  await navigate(page, 'Catalog')
  release()
  await expect(
    page.getByText('Your order was confirmed. Check your orders before placing another order.', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/catalog$/)
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items),
  ).toEqual([])
})
test('does not apply an old order response after signing back in as the same customer', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  let release!: () => void
  state.holdOrder = new Promise((resolve) => {
    release = resolve
  })
  await page.goto('/checkout')
  await delivery(page)
  await page.getByRole('button', { name: 'Place order', exact: true }).click()
  await expect
    .poll(
      () =>
        state.requests.filter((req) => req.path === 'ecommerce/orders' && req.method === 'POST')
          .length,
    )
    .toBe(1)
  await signOut(page)
  await expect(page).toHaveURL(/\/auth\/login/)
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
  release()
  await page.waitForTimeout(150)
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ftf:v3:cart:1')!).items[0].quantity),
  ).toBe(3)
  expect(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('ftf:v3:checkout:1')!).stage),
  ).toBe('placing')
  await expect(page.getByRole('heading', { name: 'Order confirmed', exact: true })).toHaveCount(0)
})

test('refreshes a completed cancellation after navigating away without changing the new page', async ({
  page,
}) => {
  const state = await mockCommerceApi(page)
  let release!: () => void
  const held = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/ecommerce/orders/40/cancel', async (route) => {
    await held
    await route.fallback()
  })
  await page.goto('/orders/40')
  await page.getByText('Cancel this order', { exact: true }).click()
  await page.getByLabel('Cancellation reason', { exact: true }).fill('No longer needed')
  await page.getByRole('button', { name: 'Confirm cancellation' }).click()
  await navigate(page, 'Catalog')
  await expect(page).toHaveURL(/\/catalog$/)
  release()
  await expect.poll(() => state.order.status).toBe('Cancelled')
  await navigate(page, 'Orders')
  await page.getByRole('link', { name: 'ORD-40', exact: true }).click()
  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible()
  await expect(page.getByText('pending', { exact: true })).toBeVisible()
  await expect(page.getByText('Cancel this order', { exact: true })).toHaveCount(0)
})

test('returns expired private invoice sessions to sign-in while retaining public document errors', async ({
  page,
}) => {
  await mockCommerceApi(page)
  await page.route('**/ecommerce/orders/40', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Session expired' }),
    }),
  )
  await page.goto('/account/invoices/40')
  await expect(page).toHaveURL(/\/auth\/login/)
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:token'))).toBe('')
  await page.route('**/ecommerce/orders/invoice/40?*', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid document signature' }),
    }),
  )
  await page.goto('/order/invoice/40?signature=' + 'a'.repeat(64))
  await expect(page.getByText('Invalid document signature', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(/signature=/)
})
