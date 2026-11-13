import { expect, type Page, type Locator } from '@playwright/test'

export async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
}
export async function navigate(page: Page, label: 'Catalog' | 'Orders' | 'Account') {
  if (label !== 'Catalog') {
    await page.getByRole('button', { name: 'Account menu', exact: true }).click()
    await page.getByRole('menuitem', { name: label, exact: true }).click()
    return
  }
  const desktop = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'All products', exact: true })
  if (await desktop.isVisible()) return desktop.click()
  const mobile = page.getByRole('button', { name: 'Open navigation', exact: true })
  if (await mobile.isVisible()) {
    await mobile.click()
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'All products', exact: true })
      .click()
  } else {
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Storefront', exact: true })
      .click()
    await page.getByRole('link', { name: 'Browse catalog', exact: true }).click()
  }
}
export async function openProductFilters(page: Page) {
  const trigger = page.getByRole('button', { name: 'Filter products', exact: true })
  if (await trigger.isVisible()) await trigger.click()
}
export async function closeProductFilters(page: Page) {
  const close = page.getByRole('button', { name: 'Show products', exact: true })
  if (await close.isVisible()) await close.click()
}
export async function clearProductFilters(page: Page) {
  await openProductFilters(page)
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await closeProductFilters(page)
}
export async function openVoucher(scope: Page | Locator) {
  const input = scope.getByLabel('Voucher code', { exact: true })
  if (!(await input.isVisible())) await scope.getByText('Have a voucher?', { exact: true }).click()
  await expect(input).toBeVisible()
}

export async function navigateAccount(page: Page, label: string) {
  const trigger = page.getByRole('button', { name: 'Account sections', exact: true })
  if (await trigger.isVisible()) {
    await trigger.click()
    await page
      .getByRole('dialog', { name: 'Account sections', exact: true })
      .getByRole('link', { name: label, exact: true })
      .click()
  } else {
    await page
      .getByRole('navigation', { name: 'Account navigation', exact: true })
      .getByRole('link', { name: label, exact: true })
      .click()
  }
}

export async function expectIndependentShopping(page: Page) {
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: /^Open cart/ })).toBeEnabled()
  await expect(page.getByText('Shopping for')).toHaveCount(0)
}
