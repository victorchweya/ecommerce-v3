import { expect, test } from '@playwright/test'
import { mockCommerceApi } from './fixtures/commerce-api'

test('keeps the team list and invite dialog usable on desktop and mobile', async ({
  page,
}, info) => {
  const state = await mockCommerceApi(page)
  const email = `${'long-address-'.repeat(6)}@example.test`
  state.invitations.push({ id: 7, email, expires_at: '2030-01-03' })
  page.on('pageerror', (error) => {
    throw error
  })
  await page.goto('/account')
  await page.getByRole('tab', { name: 'Team', exact: true }).click()
  await expect(page.getByRole('list', { name: 'Company members', exact: true })).toContainText(
    'customer@example.test',
  )
  await expect(page.getByRole('list', { name: 'Pending invitations', exact: true })).toContainText(
    email,
  )
  const trigger = page.getByRole('button', { name: 'Invite member', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Invite member', exact: true })
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true)
      await page.screenshot({
        path: info.outputPath(`team-${width}-${colorScheme}.png`),
        fullPage: true,
        animations: 'disabled',
      })
      await trigger.click()
      await expect(dialog.getByLabel('Email address', { exact: true })).toBeFocused()
      await expect(dialog).toBeInViewport()
      await page.screenshot({
        path: info.outputPath(`invite-${width}-${colorScheme}.png`),
        animations: 'disabled',
      })
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    }
  }
  await trigger.click()
  await dialog.getByLabel('Email address', { exact: true }).fill('invalid')
  await dialog.getByRole('button', { name: 'Send invitation', exact: true }).click()
  await expect(dialog.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
  expect(state.requests.filter((request) => request.method !== 'GET')).toHaveLength(0)
  await dialog.getByLabel('Email address', { exact: true }).fill('colleague@example.test')
  await page.route('**/ecommerce/staff/invite', (route) =>
    route.fulfill({
      status: 422,
      json: { message: 'This email is already invited.' },
    }),
  )
  await dialog.getByRole('button', { name: 'Send invitation', exact: true }).click()
  await expect(dialog.getByText('This email is already invited.', { exact: true })).toBeVisible()
  await expect(dialog.getByLabel('Email address', { exact: true })).toHaveValue(
    'colleague@example.test',
  )
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(dialog.getByLabel('Email address', { exact: true })).toHaveValue('')
  await expect(dialog.getByText('This email is already invited.', { exact: true })).toHaveCount(0)
})
