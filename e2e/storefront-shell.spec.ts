import { expect, test, type Page } from '@playwright/test'
import { mockCatalogApi } from './fixtures/catalog-api'

const categoryNames = [
  'Vegetables',
  'Fruits',
  'Herbs',
  'Leafy Greens',
  'Roots or Tubers',
  'Eggs',
  'Cereals, Grains and Pulses',
  'Processed Products',
  'Coffee',
  'Chicken Poultry',
  'Sea Food',
  'Lamb',
  'Processed Meat',
  'Beef',
  'Spices',
  'Tea and Coffee',
  'Dairy Eggs',
]
test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

async function fits(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
}

test('keeps categories scrollable, uses consistent icon actions and links to existing pages', async ({
  page,
}, testInfo) => {
  const state = await mockCatalogApi(page)
  state.categories = categoryNames.map((name, i) => ({ id: i + 3, name, slug: name.toLowerCase() }))
  state.saved = [1, 2]
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/catalog/category/3')
  const header = page.getByRole('banner')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { name: 'Vegetables', exact: true })).toBeVisible()
  await expect(header.getByRole('link', { name: 'Vegetables', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(header.getByRole('link', { name: 'All products', exact: true })).not.toHaveAttribute(
    'aria-current',
    'page',
  )
  const favourite = header.getByRole('link', { name: 'Favourites', exact: true })
  await expect(favourite.locator('.p-badge')).toHaveCount(0)
  const favouriteIcon = favourite.locator('svg')
  const iconColor = await favouriteIcon.evaluate((el) => getComputedStyle(el).color)
  for (const name of ['Account menu', 'Open cart (0)']) {
    const action = header.getByRole('button', { name, exact: true })
    await expect(action).toHaveText('')
    await expect(action.locator('svg')).toHaveCSS('width', '20px')
    await expect(action.locator('svg')).toHaveCSS('height', '20px')
    await expect(action.locator('svg')).toHaveCSS('color', iconColor)
  }
  const first = header.getByRole('link', { name: 'All products', exact: true })
  const last = header.getByRole('link', { name: 'Dairy Eggs', exact: true })
  expect((await first.boundingBox())!.y).toBe((await last.boundingBox())!.y)
  const scroller = first.locator('..')
  await header.getByRole('button', { name: 'Scroll categories right', exact: true }).click()
  await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await header.getByRole('button', { name: 'Scroll categories left', exact: true }).click()
  await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBe(0)
  await last.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/catalog\/category\/19$/)
  await expect(last).toHaveAttribute('aria-current', 'page')
  await header.getByRole('link', { name: 'All products', exact: true }).click()
  await expect(page).toHaveURL(/\/catalog$/)
  await fits(page)
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.getByRole('contentinfo')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await header.screenshot({
      path: testInfo.outputPath(`header-1280-${colorScheme}.png`),
      animations: 'disabled',
    })
    await page.getByRole('contentinfo').screenshot({
      path: testInfo.outputPath(`footer-1280-${colorScheme}.png`),
      animations: 'disabled',
    })
  }
  const footer = page.getByRole('contentinfo')
  await expect(
    footer.getByText('Order before 22:00 for next-day delivery', { exact: true }),
  ).toBeVisible()
  const destinations = await footer
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  expect(destinations).toEqual([
    '/',
    '/catalog',
    '/favourites',
    '/cart',
    '/account',
    '/orders',
    '/account/addresses',
    '/account/invoices',
    '/help',
    '/delivery-information',
    '/returns-and-refunds',
    '/contact',
    '/terms-and-conditions',
    '/privacy-policy',
  ])
  await footer.getByRole('link', { name: 'Contact us', exact: true }).click()
  await expect(main.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible()
})

test('adapts the shell to narrow screens without losing navigation or search', async ({
  page,
}, testInfo) => {
  const state = await mockCatalogApi(page)
  state.categories = categoryNames.map((name, i) => ({ id: i + 3, name, slug: name.toLowerCase() }))
  await page.goto('/catalog')
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const header = page.getByRole('banner')
    await expect(header.getByRole('link', { name: 'Storefront', exact: true })).toBeVisible()
    const search = page.getByLabel('Search products', { exact: true })
    await expect(search).toBeVisible()
    await expect(header.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
    const cart = header.getByRole('button', { name: 'Open cart (0)', exact: true })
    await expect(cart).toBeVisible()
    if (width < 1024) {
      const logoBox = (await header
        .getByRole('link', { name: 'Storefront', exact: true })
        .boundingBox())!
      const cartBox = (await cart.boundingBox())!
      expect(
        Math.abs(logoBox.y + logoBox.height / 2 - cartBox.y - cartBox.height / 2),
      ).toBeLessThan(1)
      await header.getByRole('button', { name: 'Open navigation', exact: true }).click()
      const drawer = page.getByRole('dialog', { name: 'Shopping navigation', exact: true })
      await expect(
        drawer.getByRole('link', { name: 'Cereals, Grains and Pulses', exact: true }),
      ).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(drawer).toHaveCount(0)
    }
    await fits(page)
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await header.screenshot({
        path: testInfo.outputPath(`header-${width}-${colorScheme}.png`),
        animations: 'disabled',
      })
      await page.getByRole('contentinfo').screenshot({
        path: testInfo.outputPath(`footer-${width}-${colorScheme}.png`),
        animations: 'disabled',
      })
    }
  }
  await page.getByLabel('Search products', { exact: true }).fill('Tomatoes')
  await page.getByLabel('Search products', { exact: true }).press('Enter')
  await expect(page).toHaveURL(/q=Tomatoes/)
  expect(state.requests.filter((req) => req.method !== 'GET')).toHaveLength(0)
})

test('keeps public help and legal links available to guests without account requests', async ({
  page,
}) => {
  const state = await mockCatalogApi(page, { loggedIn: false })
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/help')
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible()
  const footer = page.getByRole('contentinfo')
  await footer.getByRole('link', { name: 'Terms', exact: true }).click()
  await expect(
    page.getByRole('main').getByRole('heading', { name: 'Terms and conditions', exact: true }),
  ).toBeVisible()
  await fits(page)
  expect(state.requests).toHaveLength(0)
})
