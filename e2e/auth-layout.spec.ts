import { expect, test, type Page } from '@playwright/test'
import { mockCatalogApi } from './fixtures/catalog-api'
import { mockCommerceApi } from './fixtures/commerce-api'

async function fits(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
}

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().startsWith('Unhandled view error:'))
      throw new Error(message.text())
  })
})

test('uses v2 split auth and centred status layouts with the current theme', async ({
  page,
}, testInfo) => {
  const state = await mockCatalogApi(page, { loggedIn: false })
  const routes = [
    ['/auth/login', 'Sign in'],
    ['/auth/register', 'Register your business'],
    ['/auth/forgot-password', 'Forgot password'],
    ['/auth/password-reset?email=customer@example.test&token=layout-test', 'Reset password'],
    ['/auth/accept-invitation?email=customer@example.test&token=layout-test', 'Accept invitation'],
    ['/auth/password-reset-check-email', 'Check your email'],
  ] as const
  for (const [path, title] of routes) {
    await page.goto(path)
    const heading = page.getByRole('heading', { name: title, exact: true })
    await expect(heading).toBeVisible()
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Sign in', exact: true }),
    ).toHaveCount(0)
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await fits(page)
      await expect(heading).toHaveCSS('font-size', '24px')
      const main = page.getByRole('main')
      if (width >= 768 && title !== 'Check your email') {
        expect((await main.boundingBox())!.x).toBe(width / 2)
        await expect(page.getByRole('complementary', { name: 'Farm to Feed' })).toBeVisible()
      } else if (title === 'Check your email') {
        await expect(page.getByRole('complementary')).toHaveCount(0)
      }
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme })
        if (width >= 768 && title !== 'Check your email') {
          const pageBackground = await page
            .locator('body')
            .evaluate((element) => getComputedStyle(element).backgroundColor)
          await expect(main).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
          await expect(main).not.toHaveCSS('background-color', pageBackground)
        } else {
          await expect(main).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        }
        await page.screenshot({
          path: testInfo.outputPath(`${title.replaceAll(' ', '-')}-${width}-${colorScheme}.png`),
          fullPage: true,
          animations: 'disabled',
        })
      }
    }
  }
  expect(state.requests).toHaveLength(0)
})

test('keeps setup navigation accessible in both layouts and centres approval', async ({
  page,
}, testInfo) => {
  const state = await mockCommerceApi(page, { cart: false })
  for (const [path, title] of [
    ['/auth/contact-person', 'Contact person'],
    ['/auth/billing-details', 'Billing details'],
    ['/auth/delivery-address', 'Delivery address'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await fits(page)
      const navigation = page.getByRole('navigation', { name: 'Account setup', exact: true })
      await expect(navigation).toHaveCount(1)
      await expect(navigation.locator('[aria-current="step"]')).toHaveCount(1)
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme })
        await page.screenshot({
          path: testInfo.outputPath(`${title.replaceAll(' ', '-')}-${width}-${colorScheme}.png`),
          fullPage: true,
          animations: 'disabled',
        })
      }
    }
  }
  await page.route('**/ecommerce/profile', (route) =>
    route.fulfill({
      json: {
        id: 1,
        name: 'Customer',
        email: 'customer@example.test',
        user_type: 'customer',
        status: 'active',
        customer: {
          company: {
            id: 10,
            name: 'Home company',
            status: 'pending',
            organisation_structure: 'independent_customer',
          },
        },
      },
    }),
  )
  await page.goto('/auth/awaiting-approval')
  await expect(
    page.getByRole('heading', { name: 'Account awaiting approval', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary')).toHaveCount(0)
  await fits(page)
  await page.screenshot({
    path: testInfo.outputPath('approval-1280.png'),
    fullPage: true,
    animations: 'disabled',
  })
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
})
