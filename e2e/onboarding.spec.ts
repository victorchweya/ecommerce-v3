import { expect, test, type Page, type Route } from '@playwright/test'
interface State {
  parent: boolean
  pending: boolean
  registerStatus: number
  brokenRegistration: boolean
  invitationStatus: number
  writeStatus: number
  addressStatus: number
  companies: Record<number, Record<string, unknown>>
  addresses: Record<string, unknown>[]
  calls: {
    method: string
    path: string
    body: Record<string, unknown> | null
    branch: string | null
  }[]
  holdWrite?: Promise<void>
}
async function api(page: Page, options: Partial<State> = {}) {
  const state: State = {
    parent: false,
    pending: false,
    registerStatus: 201,
    brokenRegistration: false,
    invitationStatus: 200,
    writeStatus: 200,
    addressStatus: 200,
    companies: Object.fromEntries(
      [10, 11, 22].map((id) => [
        id,
        {
          id,
          name: id === 10 ? 'Home company' : id === 11 ? 'West branch' : 'East branch',
          status: 'active',
          contact_person_name: 'Existing contact',
          contact_person_email: 'contact@example.test',
          contact_person_phone: '0712345678',
          contact_person_designation: '',
          billing_details: null,
        },
      ]),
    ),
    addresses: [],
    calls: [],
    ...options,
  }
  const json = (route: Route, status: number, body: unknown) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  await page.route('**/*', async (route) => {
    const request = route.request(),
      url = new URL(request.url())
    if (!['fetch', 'xhr'].includes(request.resourceType()))
      return url.origin === 'http://127.0.0.1:4175' ? route.continue() : route.abort()
    const path = url.pathname.match(/(?:^|\/)((?:auth|ecommerce)\/.*)$/)?.[1] ?? url.pathname
    const method = request.method(),
      body = request.postData() ? (request.postDataJSON() as Record<string, unknown>) : null
    state.calls.push({ method, path, body, branch: url.searchParams.get('branch_company_id') })
    if (path === 'auth/register')
      return json(
        route,
        state.registerStatus,
        state.brokenRegistration
          ? { message: 'Something went wrong', error: 'Unexpected error' }
          : state.registerStatus === 422
            ? { message: 'Check your details.', errors: { email: ['Email already registered.'] } }
            : { data: { company: { id: 50, name: 'New business', is_lead: true } } },
      )
    if (path === 'auth/accept-invitation')
      return json(route, state.invitationStatus, {
        message:
          state.invitationStatus === 200
            ? 'Invitation accepted'
            : 'Invitation has expired. Please ask for a new link.',
      })
    if (path === 'auth/login')
      return json(route, 200, {
        data: { token: 'onboarding-test-token', user: { id: 1, user_type: 'customer' } },
      })
    if (path === 'auth/logout') return json(route, 200, { message: 'Signed out' })
    if (path === 'ecommerce/profile')
      return json(route, 200, {
        id: 1,
        name: 'Customer',
        email: 'customer@example.test',
        user_type: 'customer',
        customer: {
          company: {
            ...state.companies[10],
            status: state.pending ? 'pending' : 'active',
            organisation_structure: state.parent ? 'parent_organisation' : 'independent_customer',
          },
        },
      })
    if (path === 'ecommerce/company/branches')
      return json(route, 200, {
        data: [
          { id: 11, name: 'West branch' },
          { id: 22, name: 'East branch' },
        ],
      })
    const branch =
      method === 'GET' ? url.searchParams.get('branch_company_id') : body?.branch_company_id
    const id = state.parent ? Number(branch) : 10
    if (path.startsWith('ecommerce/company') || path === 'ecommerce/addresses') {
      if (state.parent && ![11, 22].includes(id))
        return json(route, 422, { message: 'Select a branch.' })
    }
    if (path === 'ecommerce/company') {
      if (method === 'PUT') {
        if (state.holdWrite) await state.holdWrite
        if (state.writeStatus !== 200)
          return json(route, state.writeStatus, {
            message: 'Please check the company details.',
            errors: {
              contact_person_email: ['Contact email rejected.'],
              'billing_details.postal_code': ['Postal code rejected.'],
            },
          })
        state.companies[id] = { ...state.companies[id], ...body }
        return json(route, 200, { data: state.companies[id] })
      }
      return json(route, 200, {
        ...state.companies[id],
        status: state.pending ? 'pending' : 'active',
      })
    }
    if (path === 'ecommerce/addresses') {
      if (method === 'POST') {
        if (state.addressStatus !== 200)
          return json(route, state.addressStatus, {
            message: 'Delivery address rejected.',
            errors: { latitude: ['Confirm the delivery location.'] },
          })
        const created = { id: 80, company_id: id, ...body }
        state.addresses.push(created)
        return json(route, 200, { data: created })
      }
      return json(
        route,
        200,
        state.addresses.filter((address) => !address.company_id || address.company_id === id),
      )
    }
    return json(route, 500, { message: 'Unexpected test API request.' })
  })
  return state
}
async function signedIn(page: Page, path: string) {
  await page.addInitScript(() => sessionStorage.setItem('ftf:v3:token', 'onboarding-test-token'))
  await page.goto(path)
}
async function registerForm(page: Page) {
  await page.getByLabel('Business name', { exact: true }).fill('New business')
  await page.getByLabel('Your name', { exact: true }).fill('New customer')
  await page.getByLabel('Email', { exact: true }).fill('new@example.test')
  await page.getByLabel('Phone number', { exact: true }).fill('0712345678')
  await page.getByRole('combobox', { name: 'Business category' }).click()
  await page.getByRole('option', { name: 'Charity', exact: true }).click()
}
async function branch(page: Page, name: string) {
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('combobox', { name: 'Shopping branch' })
    .click()
  await page.getByRole('option', { name, exact: true }).click()
}
async function billing(page: Page) {
  await page.getByLabel('Billing address', { exact: true }).fill('Business road')
  await page.getByLabel('Postal code', { exact: true }).fill('00100')
  await page.getByLabel('Billing city', { exact: true }).fill('Nairobi')
}
async function delivery(page: Page) {
  await page.getByLabel('Location name', { exact: true }).fill('Office')
  await page.getByRole('textbox', { name: 'Delivery address', exact: true }).fill('Delivery road')
  await page.getByLabel('City', { exact: true }).fill('Nairobi')
}
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
})

test('registration submits a lead without creating a session or calling protected onboarding', async ({
  page,
}) => {
  const state = await api(page)
  await page.goto('/auth/login')
  await page.getByRole('link', { name: 'Register your business' }).click()
  await expect(page.getByRole('heading', { name: 'Register your business' })).toBeVisible()
  await registerForm(page)
  await page.getByRole('button', { name: 'Register your business', exact: true }).click()
  await expect(page.getByText('Registration request received.', { exact: false })).toBeVisible()
  expect(state.calls).toMatchObject([
    {
      path: 'auth/register',
      method: 'POST',
      body: {
        business_name: 'New business',
        category: 'Charity',
        name: 'New customer',
        email: 'new@example.test',
        phone: '0712345678',
      },
    },
  ])
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:token'))).toBeFalsy()
  await expect(
    page.getByRole('button', { name: 'Register your business', exact: true }),
  ).toHaveCount(0)
})

test('registration keeps fields after validation errors and rejects HTTP-200 failure envelopes', async ({
  page,
}) => {
  const state = await api(page, { registerStatus: 422 })
  await page.goto('/auth/register')
  await registerForm(page)
  await page.getByRole('button', { name: 'Register your business', exact: true }).click()
  await expect(page.getByText('Email already registered.')).toBeVisible()
  await expect(page.getByLabel('Business name', { exact: true })).toHaveValue('New business')
  state.registerStatus = 200
  state.brokenRegistration = true
  await page.getByRole('button', { name: 'Register your business', exact: true }).click()
  await expect(page.getByText('We could not complete the request.', { exact: false })).toBeVisible()
  await expect(page.getByText('Registration request received.', { exact: false })).toHaveCount(0)
  expect(state.calls.filter((call) => call.path === 'auth/register')).toHaveLength(2)
})

test('invitation handles incomplete and expired links, then accepts the customer contract', async ({
  page,
}) => {
  const state = await api(page, { invitationStatus: 400 })
  await page.goto('/auth/accept-invitation')
  await expect(
    page.getByText('This invitation link is incomplete.', { exact: false }),
  ).toBeVisible()
  await page.goto('/auth/accept-invitation?token=invitation-test&email=invited%40example.test')
  await page.getByLabel('Your name', { exact: true }).fill('Invited customer')
  await page.getByLabel('Phone number', { exact: true }).fill('0712345678')
  await page.getByLabel('Password', { exact: true }).fill('new-password')
  await page.getByLabel('Confirm password', { exact: true }).fill('new-password')
  await page.getByRole('button', { name: 'Accept invitation', exact: true }).click()
  await expect(page.getByText('Invitation has expired.', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Invited customer')
  state.invitationStatus = 200
  await page.getByRole('button', { name: 'Accept invitation', exact: true }).click()
  await expect(page.getByText('Invitation accepted.', { exact: false })).toBeVisible()
  expect(state.calls.filter((call) => call.path === 'auth/accept-invitation')).toHaveLength(2)
  expect(state.calls.at(-1)?.body).toEqual({
    token: 'invitation-test',
    email: 'invited@example.test',
    name: 'Invited customer',
    phone: '0712345678',
    password: 'new-password',
    password_confirmation: 'new-password',
  })
  expect(await page.evaluate(() => sessionStorage.getItem('ftf:v3:token'))).toBeFalsy()
})

test('onboarding restores contact data and saves contact, billing, certificate and delivery independently', async ({
  page,
  context,
}) => {
  const state = await api(page)
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: -1.28, longitude: 36.82 })
  await signedIn(page, '/auth/contact-person')
  await expect(page.getByLabel('Contact name', { exact: true })).toHaveValue('Existing contact')
  await page.getByLabel('Contact name', { exact: true }).fill('Updated contact')
  await page.getByRole('button', { name: 'Save contact and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Billing details', exact: true })).toBeVisible()
  await billing(page)
  await page.locator('input[type=file]').setInputFiles({
    name: 'certificate.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-test-certificate'),
  })
  await expect(page.getByText('Selected: certificate.pdf')).toBeVisible()
  await page.getByRole('button', { name: 'Save billing and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Delivery address', exact: true })).toBeVisible()
  await delivery(page)
  await page.getByRole('button', { name: 'Use my current location' }).click()
  await expect(page.getByText('Location selected.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Save delivery address and finish' }).click()
  await expect(page).toHaveURL('/')
  const writes = state.calls.filter((call) => ['POST', 'PUT'].includes(call.method))
  expect(writes).toHaveLength(3)
  expect(writes[0]?.body).toMatchObject({ contact_person_name: 'Updated contact' })
  expect(writes[0]?.body).not.toHaveProperty('billing_details')
  expect(writes[1]?.body).toEqual({
    billing_details: {
      business_name: 'Home company',
      address: 'Business road',
      postal_code: '00100',
      city: 'Nairobi',
    },
    kra_pin: null,
    kra_certificate:
      'data:application/pdf;base64,' + Buffer.from('%PDF-test-certificate').toString('base64'),
  })
  expect(writes[2]?.body).toMatchObject({
    name: 'Office',
    latitude: -1.28,
    longitude: 36.82,
    is_default: true,
    address_type: 'office',
  })
  expect(writes.every((call) => !('branch_company_id' in (call.body ?? {})))).toBe(true)
})

test('pending customers can complete setup without gaining shopping access', async ({ page }) => {
  const state = await api(page, { pending: true })
  await signedIn(page, '/')
  await expect(page.getByRole('heading', { name: 'Account awaiting approval' })).toBeVisible()
  await page.getByRole('link', { name: 'Complete account details' }).click()
  await expect(page.getByRole('heading', { name: 'Contact person' })).toBeVisible()
  await page.getByRole('button', { name: 'Save contact and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Billing details', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Set up later' }).click()
  await expect(page.getByRole('heading', { name: 'Delivery address', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Set up later' }).click()
  await expect(page.getByRole('heading', { name: 'Account awaiting approval' })).toBeVisible()
  expect(state.calls.filter((call) => call.method === 'PUT')).toHaveLength(1)
})

test('failed company saves retain edits and map nested server field errors', async ({ page }) => {
  const state = await api(page, { writeStatus: 422 })
  await signedIn(page, '/auth/billing-details')
  await billing(page)
  await page.getByRole('button', { name: 'Save billing and continue' }).click()
  await expect(page.getByText('Postal code rejected.')).toBeVisible()
  await expect(page.getByLabel('Postal code', { exact: true })).toHaveValue('00100')
  expect(state.calls.filter((call) => call.method === 'PUT')).toHaveLength(1)
  state.writeStatus = 200
  await page.getByRole('button', { name: 'Save billing and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Delivery address', exact: true })).toBeVisible()
})

test('a parent setup link requires selection and writes only the selected branch', async ({
  page,
}) => {
  const state = await api(page, { parent: true })
  await signedIn(page, '/auth/contact-person')
  await expect(page.getByRole('heading', { name: 'Choose a branch' })).toBeVisible()
  await branch(page, 'East branch')
  await expect(page.getByText('Shopping for')).toContainText('East branch')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Contact person' })).toBeVisible()
  await page.getByRole('button', { name: 'Save contact and continue' }).click()
  await expect(page.getByRole('heading', { name: 'Billing details', exact: true })).toBeVisible()
  expect(state.calls.find((call) => call.method === 'PUT')?.body?.branch_company_id).toBe(22)
})

test('delivery validates coordinates, offers permission-denied fallback, and keeps existing default', async ({
  page,
  context,
}) => {
  const state = await api(page, {
    addresses: [
      { id: 7, company_id: 10, name: 'Existing office', city: 'Nairobi' },
      { id: 8, name: 'Pickup location' },
    ],
  })
  await context.clearPermissions()
  await signedIn(page, '/auth/delivery-address')
  await expect(page.getByText('Existing office', { exact: false })).toBeVisible()
  await expect(page.getByText('Pickup location', { exact: true })).toHaveCount(0)
  await delivery(page)
  await page.getByRole('button', { name: 'Save delivery address and finish' }).click()
  await expect(page.getByText('Choose a delivery location', { exact: false })).toBeVisible()
  expect(
    state.calls.filter((call) => call.path === 'ecommerce/addresses' && call.method === 'POST'),
  ).toHaveLength(0)
  await page.getByText('Enter or review coordinates', { exact: true }).click()
  await page.getByLabel('Latitude', { exact: true }).fill('-1.28')
  await page.getByLabel('Longitude', { exact: true }).fill('36.82')
  await page.getByRole('button', { name: 'Save delivery address and finish' }).click()
  await expect(page).toHaveURL('/')
  expect(
    state.calls.find((call) => call.path === 'ecommerce/addresses' && call.method === 'POST')?.body
      ?.is_default,
  ).toBe(false)
})

test('an anonymous setup link returns to the same setup step after sign-in', async ({ page }) => {
  await api(page)
  await page.goto('/auth/billing-details')
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('customer@example.test')
  await page.getByLabel('Password', { exact: true }).fill('password-test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Billing details', exact: true })).toBeVisible()
})

test('a late save cannot advance or overwrite a new draft after switching branches and back', async ({
  page,
}) => {
  let release!: () => void
  const holdWrite = new Promise<void>((resolve) => {
    release = resolve
  })
  const state = await api(page, { parent: true, holdWrite })
  await signedIn(page, '/auth/contact-person')
  await branch(page, 'West branch')
  await expect(page.getByText('Shopping for')).toContainText('West branch')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Contact person' })).toBeVisible()
  await page.getByLabel('Contact name', { exact: true }).fill('Original submitted contact')
  await page.getByRole('button', { name: 'Save contact and continue' }).click()
  await expect.poll(() => state.calls.filter((call) => call.method === 'PUT').length).toBe(1)
  await branch(page, 'East branch')
  await expect(page.getByText('Setting up')).toContainText('East branch')
  await branch(page, 'West branch')
  await expect(page.getByText('Setting up')).toContainText('West branch')
  await page.getByLabel('Contact name', { exact: true }).fill('Keep this new draft')
  const response = page.waitForResponse((response) => response.request().method() === 'PUT')
  release()
  await (await response).finished()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
  await expect(page.getByRole('heading', { name: 'Contact person' })).toBeVisible()
  await expect(page.getByLabel('Contact name', { exact: true })).toHaveValue('Keep this new draft')
  expect(state.calls.filter((call) => call.method === 'PUT')[0]?.body?.branch_company_id).toBe(11)
})

test('a failed delivery write is shown once and retains the entered address and location', async ({
  page,
}) => {
  const state = await api(page, { addressStatus: 422 })
  await signedIn(page, '/auth/delivery-address')
  await delivery(page)
  await page.getByText('Enter or review coordinates', { exact: true }).click()
  await page.getByLabel('Latitude', { exact: true }).fill('-1.28')
  await page.getByLabel('Longitude', { exact: true }).fill('36.82')
  await page.getByRole('button', { name: 'Save delivery address and finish' }).click()
  await expect(page.getByText('Confirm the delivery location.', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Delivery address', exact: true })).toHaveValue(
    'Delivery road',
  )
  await expect(page.getByLabel('Latitude', { exact: true })).toHaveValue('-1.28')
  expect(state.calls.filter((call) => call.method === 'POST')).toHaveLength(1)
})
