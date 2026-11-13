import { expect, test } from '@playwright/test'
import { mockCommerceApi } from './fixtures/commerce-api'

for (const parent of [false, true]) {
  test(`shows shopping context across pages only for a parent with a selected branch: ${parent}`, async ({
    page,
  }) => {
    await mockCommerceApi(page, { parent })
    if (parent) await page.addInitScript(() => sessionStorage.setItem('ftf:v3:branch', '11'))
    page.on('pageerror', (error) => {
      throw error
    })
    for (const path of [
      '/',
      '/catalog',
      '/catalog/products/1',
      '/cart',
      '/checkout',
      '/orders',
      '/orders/40',
      '/account',
      '/account/addresses',
      '/account/invoices',
      '/account/invoices/40',
      '/account/credit-notes',
      '/account/credit-notes/70',
      '/account/insights',
      '/account/impact',
    ]) {
      await page.goto(path)
      await expect(page.getByRole('main').locator('h1')).toHaveCount(1)
      await expect(page.getByText('Loading company details…', { exact: true })).toHaveCount(0)
      const context = page.getByText('Shopping for').filter({ visible: true })
      if (parent) {
        await expect(context).toHaveCount(1)
        await expect(context).toContainText('Selected branch')
      } else {
        await expect(page.getByText('Shopping for')).toHaveCount(0)
      }
    }
  })
}
