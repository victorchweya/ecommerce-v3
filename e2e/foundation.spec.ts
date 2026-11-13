import { expect, test } from '@playwright/test'

test('an unknown deep link renders a styled fallback and returns home', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/unknown/deep/link')
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  const home = page.getByRole('link', { name: 'Return home' })
  await expect(home).toBeVisible()
  await expect(home).toHaveClass(/p-button/)
  await expect(home).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await home.click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('heading', { name: 'Fresh produce for your business', exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('permission and error pages remain separate and render on narrow screens', async ({
  page,
}) => {
  await page.goto('/access-denied')
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await page.goto('/error')
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
})
