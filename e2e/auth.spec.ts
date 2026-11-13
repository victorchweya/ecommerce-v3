import { signOut, expectIndependentShopping } from './fixtures/ui'
import { expect, test, type Page, type Route } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

interface MockState {
  parent: boolean
  status: string
  userStatus: string
  profileStatus: number
  branchesStatus: number
  logoutStatus: number
  loginStatus: number
  companyStatus: number
  branches: { id: number; name: string }[]
  requests: {
    method: string
    path: string
    branch: string | null
    body: Record<string, unknown> | null
    authorization: string | undefined
  }[]
  holdWest?: Promise<void>
}
async function mockApi(page: Page, overrides: Partial<MockState> = {}) {
  const state: MockState = {
    parent: false,
    status: 'active',
    userStatus: 'active',
    profileStatus: 200,
    branchesStatus: 200,
    logoutStatus: 200,
    loginStatus: 200,
    companyStatus: 200,
    branches: [
      { id: 11, name: 'West branch' },
      { id: 22, name: 'East branch' },
    ],
    requests: [],
    ...overrides,
  }
  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  await page.route('**/*', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    if (!['fetch', 'xhr'].includes(req.resourceType())) {
      if (url.origin === 'http://127.0.0.1:4175') return route.continue()
      return route.abort()
    }
    const match = url.pathname.match(/(?:^|\/)((?:auth|ecommerce)\/.*)$/)
    const path = match?.[1] ?? url.pathname
    const body = req.postData() ? (req.postDataJSON() as Record<string, unknown>) : null
    state.requests.push({
      method: req.method(),
      path,
      branch: url.searchParams.get('branch_company_id'),
      body,
      authorization: req.headers().authorization,
    })
    if (path === 'auth/login' || path === 'auth/customer/login-otp')
      return json(
        route,
        state.loginStatus,
        state.loginStatus === 200
          ? { data: { token: 'test-customer-token', user: { id: 1, user_type: 'customer' } } }
          : {
              message: 'Sign-in rejected by server.',
              errors: { email: ['Check your sign-in details.'] },
            },
      )
    if (path === 'auth/customer/request-otp')
      return json(route, 200, { otp_token: 'test-otp-token', channel: 'sms' })
    if (path === 'auth/forgot-password' || path === 'auth/reset-password')
      return json(route, 200, { message: 'Success' })
    if (path === 'auth/logout')
      return json(route, state.logoutStatus, { message: 'Sign-out response' })
    if (path === 'ecommerce/profile')
      return json(
        route,
        state.profileStatus,
        state.profileStatus === 200
          ? {
              id: 1,
              name: 'Customer',
              email: 'customer@example.test',
              user_type: 'customer',
              status: state.userStatus,
              customer: {
                company: {
                  id: 10,
                  name: 'Home company',
                  status: state.status,
                  organisation_structure: state.parent
                    ? 'parent_organisation'
                    : 'independent_customer',
                },
              },
            }
          : { message: state.profileStatus === 401 ? 'Unauthenticated.' : 'Profile unavailable.' },
      )
    if (path === 'ecommerce/company/branches')
      return json(route, state.branchesStatus, {
        data: state.branches,
        message: 'Branches unavailable.',
      })
    if (path === 'ecommerce/company') {
      const branch = url.searchParams.get('branch_company_id')
      if (state.parent && !state.branches.some((entry) => String(entry.id) === branch))
        return json(route, 422, { message: 'Select a valid branch.' })
      if (state.companyStatus !== 200)
        return json(route, state.companyStatus, { message: 'Company access denied.' })
      if (branch === '11' && state.holdWest) await state.holdWest
      return json(route, 200, {
        id: branch ? Number(branch) : 10,
        name: branch === '11' ? 'West branch' : branch === '22' ? 'East branch' : 'Home company',
        status: 'active',
      }).catch(() => {})
    }
    // Fail closed: the browser suite never sends an unmocked API request to a live service.
    return json(route, 500, { message: 'Unexpected API request in browser test.' })
  })
  return state
}
async function signIn(page: Page) {
  await page.goto('/auth/login')
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password-for-test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}
async function chooseBranch(page: Page, name: string, inMain = false) {
  const scope = inMain
    ? page.getByRole('main')
    : page.getByRole('navigation', { name: 'Main navigation' })
  await scope.getByRole('combobox', { name: 'Shopping branch' }).click()
  await page.getByRole('option', { name, exact: true }).click()
}

test('validates login, shows server field errors, and restores an independent session', async ({
  page,
}) => {
  const state = await mockApi(page, { loginStatus: 422 })
  await page.goto('/auth/login')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Enter your password.', { exact: true })).toBeVisible()
  expect(state.requests).toHaveLength(0)
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password-for-test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Check your sign-in details.')).toBeVisible()
  state.loginStatus = 200
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expectIndependentShopping(page)
  expect(state.requests.find((req) => req.path === 'ecommerce/company')?.branch).toBeNull()
  expect(state.requests.find((req) => req.path === 'ecommerce/profile')?.authorization).toBe(
    'Bearer test-customer-token',
  )
  await page.reload()
  await expectIndependentShopping(page)
})

test('requires a branch, restores only valid membership, and sends selected context', async ({
  page,
}) => {
  const state = await mockApi(page, { parent: true })
  await page.goto('/parent-account')
  await expect(page).toHaveURL(/\/auth\/login/)
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Choose a branch' })).toBeVisible()
  expect(state.requests.some((req) => req.path === 'ecommerce/company')).toBe(false)
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
  await chooseBranch(page, 'West branch', true)
  await expect(page.getByText('Shopping for')).toContainText('West branch')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL('/')
  await chooseBranch(page, 'East branch')
  await expect(page.getByText('Shopping for')).toContainText('East branch')
  await page.reload()
  await expect(page.getByText('Shopping for')).toContainText('East branch')
  expect(
    state.requests
      .filter((req) => req.path === 'ecommerce/company')
      .every((req) => ['11', '22'].includes(req.branch ?? '')),
  ).toBe(true)
  state.branches = [{ id: 11, name: 'West branch' }]
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Choose a branch' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
  await expect(page.getByText('Shopping for')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
})

test('late responses from a previous branch cannot replace the selected company', async ({
  page,
}) => {
  let release!: () => void
  const holdWest = new Promise<void>((resolve) => {
    release = resolve
  })
  const state = await mockApi(page, { parent: true, holdWest })
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Choose a branch' })).toBeVisible()
  await chooseBranch(page, 'West branch', true)
  await expect.poll(() => state.requests.some((req) => req.branch === '11')).toBe(true)
  await chooseBranch(page, 'East branch', true)
  await expect(page.getByText('Shopping for')).toContainText('East branch')
  release()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Shopping for')).toContainText('East branch')
  await expect(page.getByText('Shopping for')).not.toContainText('West branch')
})

test('approval is separate from permission denial and can be refreshed', async ({ page }) => {
  const state = await mockApi(page, { status: 'pending' })
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Account awaiting approval' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Open cart/ })).toHaveCount(0)
  state.status = 'active'
  await page.getByRole('button', { name: 'Check approval status' }).click()
  await expectIndependentShopping(page)
  state.userStatus = 'suspended'
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible()
})

test('a 403 login stays a sign-in error, without inventing an approval state', async ({ page }) => {
  const state = await mockApi(page, { loginStatus: 403 })
  await signIn(page)
  await expect(page.getByText('Sign-in rejected by server.')).toBeVisible()
  await expect(page).toHaveURL('/auth/login')
  expect(state.requests.some((req) => req.path === 'ecommerce/profile')).toBe(false)
})

test('expired sessions return to login and clear selected context', async ({ page }) => {
  const state = await mockApi(page, { parent: true })
  await signIn(page)
  await chooseBranch(page, 'West branch', true)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL('/')
  state.profileStatus = 401
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByText('Your session expired. Please sign in again.')).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:branch'))).toBeNull()
  await expect(page.getByText('Shopping for')).toHaveCount(0)
})

test('branch permission errors keep the session and allow another selection', async ({ page }) => {
  const state = await mockApi(page, { parent: true, companyStatus: 403 })
  await signIn(page)
  await chooseBranch(page, 'West branch', true)
  await expect(page.getByText('Company access denied.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
  state.companyStatus = 200
  await chooseBranch(page, 'East branch', true)
  await expect(page.getByText('Shopping for')).toContainText('East branch')
})

test('sign-out clears local session even if the server request fails', async ({ page }) => {
  const state = await mockApi(page, { parent: true, logoutStatus: 503 })
  await signIn(page)
  await chooseBranch(page, 'West branch', true)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await signOut(page)
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByText('You are signed out here.', { exact: false })).toBeVisible()
  expect(state.requests.filter((req) => req.path === 'auth/logout')).toMatchObject([
    { method: 'GET', authorization: 'Bearer test-customer-token' },
  ])
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:branch'))).toBeNull()
  state.parent = false
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password-for-test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expectIndependentShopping(page)
})

test('supports existing OTP sign-in contracts without replaying requests', async ({ page }) => {
  const state = await mockApi(page)
  await page.goto('/auth/login')
  await page.getByRole('button', { name: 'Sign in with a code' }).click()
  await page.getByLabel('Email or phone number').fill('0712345678')
  await page.getByRole('button', { name: 'Send code' }).click()
  await page.getByLabel('Verification code').fill('123456')
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expectIndependentShopping(page)
  expect(state.requests.filter((req) => req.path === 'auth/customer/request-otp')).toMatchObject([
    { method: 'POST', body: { phone: '0712345678', intent: 'login', channel: 'auto' } },
  ])
  expect(state.requests.filter((req) => req.path === 'auth/customer/login-otp')).toMatchObject([
    {
      method: 'POST',
      body: { phone: '0712345678', otp_token: 'test-otp-token', otp_code: '123456' },
    },
  ])
})

test('supports recovery links, validates confirmation, and submits reset once', async ({
  page,
}) => {
  const state = await mockApi(page)
  await page.goto('/auth/login')
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await expect(page.getByRole('heading', { name: 'Forgot password', exact: true })).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  await page.goto('/auth/password-reset')
  await expect(page.getByText('This reset link is incomplete.', { exact: false })).toBeVisible()
  await page.goto('/auth/password-reset?token=test-reset-token&email=customer%40example.test')
  await page.getByLabel('New password', { exact: true }).fill('new-password')
  await page.getByLabel('Confirm password', { exact: true }).fill('different-password')
  await page.getByRole('button', { name: 'Reset password', exact: true }).click()
  await expect(page.getByText('Passwords must match.')).toBeVisible()
  expect(state.requests.filter((req) => req.path === 'auth/reset-password')).toHaveLength(0)
  await page.getByLabel('Confirm password', { exact: true }).fill('new-password')
  await page.getByRole('button', { name: 'Reset password', exact: true }).click()
  await expect(page.getByText('Your password has been reset.', { exact: false })).toBeVisible()
  expect(state.requests.filter((req) => req.path === 'auth/reset-password')).toMatchObject([
    {
      method: 'POST',
      body: {
        email: 'customer@example.test',
        token: 'test-reset-token',
        password: 'new-password',
        password_confirmation: 'new-password',
      },
    },
  ])
})

test('branch failures and empty lists have recovery states', async ({ page }) => {
  const state = await mockApi(page, { parent: true, branchesStatus: 503 })
  await signIn(page)
  await expect(page.getByRole('heading', { name: 'Choose a branch' })).toBeVisible()
  await expect(page.getByText('Branches unavailable.')).toBeVisible()
  state.branchesStatus = 200
  state.branches = []
  await page.getByRole('button', { name: 'Retry branches' }).click()
  await expect(
    page.getByText('No branches are available for this account.', { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled()
})

test('temporary profile errors retain the token and provide recovery', async ({ page }) => {
  const state = await mockApi(page)
  await signIn(page)
  await expectIndependentShopping(page)
  state.profileStatus = 503
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible()
  state.profileStatus = 200
  await page.getByRole('button', { name: 'Retry session' }).click()
  await expect(page.getByRole('button', { name: 'Retry session' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Return home' }).click()
  await expectIndependentShopping(page)
})

test('branch selection returns home after signing in from the branch page', async ({ page }) => {
  await mockApi(page, { parent: true })
  await page.goto('/parent-account')
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password-for-test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await chooseBranch(page, 'West branch', true)
  await expect(page.getByText('Shopping for')).toContainText('West branch')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page).toHaveURL('/')
})
