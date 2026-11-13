import type { Page, Route } from '@playwright/test'
import { mockCatalogApi } from './catalog-api'
export const selection = {
  productId: 1,
  productUnitVariantId: 100,
  processingTypeId: null,
  quantity: 3,
  ripeness: null,
  size: null,
  washed: null,
}
export const address = {
  id: 1,
  company_id: 10,
  address_type: 'office',
  name: 'Office',
  address: 'Market Road',
  city: 'Nairobi',
  contact_person_name: 'Customer',
  contact_person_phone: '0712345678',
  latitude: 0,
  longitude: 36.8,
  is_default: true,
  delivery_fee: '20.00',
}
export function orderFixture(id = 40, companyId = 10) {
  return {
    id,
    company_id: companyId,
    order_number: `ORD-${id}`,
    status: 'New Order',
    payment_type: 'credit',
    payment_status: 'pending',
    delivery_type: 'Delivery',
    delivery_date: '2030-01-03',
    delivery_slot: '06:00-14:00',
    delivery_address_id: 1,
    delivery_notes: 'Leave at reception',
    total_amount: '300.00',
    sub_total: '280.00',
    shipping_cost: '20.00',
    total_tax: '0',
    invoice_issue_date: null as string | null,
    dispatched_at: null as string | null,
    invoice_url: 'https://invoice.example.test/issued/40',
    company: { id: companyId, name: 'Home company' },
    address,
    order_line_items: [
      {
        id: 1,
        product_unit_variant_id: 100,
        order_quantity: '3',
        quantity_dispatched: '3',
        selling_price: '100',
        processing_type_id: null,
        specifications: null,
        unit_variant: {
          id: 100,
          unit: { id: 1, name: 'KG' },
          grade_variant: {
            id: 10,
            grade: { id: 1, name: 'Grade 1' },
            product: { id: 1, name: 'Tomatoes' },
          },
        },
      },
    ],
    feedback: null as { id: number; type: string; customer_feedback: string } | null,
  }
}
export async function mockCommerceApi(
  page: Page,
  options: { parent?: boolean; loggedIn?: boolean; cart?: boolean } = {},
) {
  const catalog = await mockCatalogApi(page, options)
  if (options.cart !== false)
    await page.addInitScript(
      (item) =>
        localStorage.setItem('ftf:v3:cart:1', JSON.stringify({ version: 1, items: [item] })),
      selection,
    )
  const state = {
    catalog,
    payments: 'credit,cash_on_delivery,mpesa',
    order: orderFixture(),
    orderStatus: 201,
    initStatus: 200,
    paymentStatus: 'pending',
    holdOrder: null as Promise<void> | null,
    holdInit: null as Promise<void> | null,
    split: false,
    addresses: [{ ...address }],
    invitations: [] as { id: number; email: string; expires_at: string }[],
    requests: [] as {
      path: string
      method: string
      body: Record<string, unknown> | null
      query: string
      authorization: string | undefined
    }[],
  }
  const json = (route: Route, body: unknown, status = 200) =>
    route
      .fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      .catch(() => {})
  await page.route('**/*', async (route) => {
    const req = route.request()
    if (!['fetch', 'xhr'].includes(req.resourceType())) return route.fallback()
    const url = new URL(req.url())
    const path = url.pathname.match(/(?:^|\/)((?:auth|ecommerce)\/.*)$/)?.[1] ?? url.pathname
    const method = req.method()
    const body = req.postDataJSON() as Record<string, unknown> | null
    const companyId = options.parent
      ? Number(url.searchParams.get('branch_company_id') ?? body?.branch_company_id ?? 11)
      : 10
    if (
      ![
        'ecommerce/profile',
        'ecommerce/company',
        'ecommerce/addresses',
        'ecommerce/staff',
        'ecommerce/staff/invitations',
        'ecommerce/staff/invite',
        'ecommerce/orders',
        'ecommerce/insights/top-ordered-products',
        'ecommerce/insights/price-trend',
        'ecommerce/credit-notes',
      ].includes(path) &&
      !/ecommerce\/(?:orders|addresses|checkout|credit-notes|staff\/invitations)\//.test(path) &&
      !path.startsWith('ecommerce/feedback/')
    )
      return route.fallback()
    state.requests.push({
      path,
      method,
      body,
      query: url.search,
      authorization: req.headers().authorization,
    })
    const homeCompany = {
      id: 10,
      name: 'Home company',
      status: 'active',
      organisation_structure: options.parent ? 'parent_organisation' : 'independent_customer',
    }
    if (path === 'ecommerce/profile')
      return json(
        route,
        method === 'PUT'
          ? {
              data: {
                id: 1,
                name: body?.name ?? 'Customer',
                email: 'customer@example.test',
                phone: '0712345678',
                user_type: 'customer',
                status: 'active',
                customer: {
                  company: homeCompany,
                  designation: 'Buyer',
                  communication_preference: 'email',
                },
              },
            }
          : {
              id: 1,
              name: 'Customer',
              email: 'customer@example.test',
              phone: '0712345678',
              user_type: 'customer',
              status: 'active',
              customer: {
                company: homeCompany,
                designation: 'Buyer',
                communication_preference: 'email',
              },
            },
      )
    if (path === 'ecommerce/company')
      return json(route, {
        id: companyId,
        name: options.parent ? 'Selected branch' : 'Home company',
        status: 'active',
        allowed_payment_options: state.payments,
        customer_group: { options: { minimum_basket_size: 0, consolidate_invoice: false } },
        total_kgs_rescued: '120.5',
        total_co2e_tonnes_avoided: '0',
        total_income_to_farmers: '3000',
        ...(method === 'PUT' ? body : {}),
      })
    if (path === 'ecommerce/addresses') {
      if (method === 'POST') {
        const created = { ...address, ...body, id: 2, company_id: companyId }
        state.addresses.push(created as typeof address)
        return json(route, { message: 'Saved', data: created }, 201)
      }
      return json(
        route,
        state.addresses.map((item) => ({ ...item, company_id: companyId })),
      )
    }
    if (path.startsWith('ecommerce/addresses/')) {
      const id = Number(path.split('/').pop())
      if (method === 'DELETE') {
        state.addresses = state.addresses.filter((item) => item.id !== id)
        return json(route, { message: 'Deleted' })
      }
      const item = state.addresses.find((item) => item.id === id)!
      Object.assign(item, body)
      return json(route, { data: { ...item, company_id: companyId } }, 201)
    }
    if (path === 'ecommerce/checkout/init-mpesa-checkout') {
      if (state.holdInit) await state.holdInit
      return json(
        route,
        state.initStatus === 200
          ? { data: { id: 7, company_id: companyId, amount: body?.amount, status: 'pending' } }
          : { message: 'Payment service unavailable' },
        state.initStatus,
      )
    }
    if (path === 'ecommerce/checkout/collections/7')
      return json(route, { id: 7, company_id: companyId, amount: 300, status: state.paymentStatus })
    if (path === 'ecommerce/orders' && method === 'POST') {
      if (state.holdOrder) await state.holdOrder
      return json(
        route,
        state.orderStatus === 201
          ? state.split
            ? {
                orders: [
                  { ...state.order, company_id: companyId },
                  { ...state.order, id: 41, order_number: 'ORD-41', company_id: companyId },
                ],
              }
            : { order: { ...state.order, company_id: companyId } }
          : {
              message: 'Order could not be saved',
              errors: { delivery_date: ['Check your delivery date.'] },
            },
        state.orderStatus,
      )
    }
    if (path === 'ecommerce/orders')
      return json(route, {
        data: [{ ...state.order, company_id: companyId }],
        current_page: 1,
        last_page: 1,
        total: 1,
      })
    if (path.startsWith('ecommerce/orders/invoice/')) return json(route, state.order)
    if (/^ecommerce\/orders\/\d+$/.test(path)) {
      if (method === 'PUT') Object.assign(state.order, body)
      return json(
        route,
        method === 'PUT' ? { order: state.order } : { ...state.order, company_id: companyId },
        method === 'PUT' ? 201 : 200,
      )
    }
    if (path.endsWith('/cancel') && path.startsWith('ecommerce/orders/')) {
      state.order.status = 'Cancelled'
      return json(route, { message: 'Cancelled' })
    }
    if (path.startsWith('ecommerce/feedback/')) {
      state.order.feedback = {
        id: 1,
        type: String(body?.type),
        customer_feedback: String(body?.content),
      }
      return json(route, { message: 'Feedback sent', feedback: state.order.feedback }, 201)
    }
    if (path === 'ecommerce/staff')
      return json(route, [
        {
          id: 1,
          name: 'Customer',
          email: 'customer@example.test',
          customer: { designation: 'Buyer' },
        },
      ])
    if (path === 'ecommerce/staff/invite') {
      state.invitations.push({ id: 1, email: String(body?.email), expires_at: '2030-01-03' })
      return json(route, { message: 'Invitation sent' })
    }
    if (path === 'ecommerce/staff/invitations') return json(route, state.invitations)
    if (path.startsWith('ecommerce/staff/invitations/')) {
      state.invitations = []
      return json(route, { message: 'Cancelled' })
    }
    if (path === 'ecommerce/insights/top-ordered-products')
      return json(route, {
        top_products: [
          {
            product: { id: 1, name: 'Tomatoes' },
            grade: { id: 1, name: 'Rescue' },
            total_quantity: '3',
            average_selling_price: '100',
            total_sales: '300',
          },
        ],
        savings: { savings: '25' },
      })
    if (path === 'ecommerce/insights/price-trend')
      return json(route, [
        {
          product: 'Tomatoes',
          data: [
            { date: '01-10-2026', price: 80 },
            { date: '02-10-2026', price: 100 },
          ],
        },
      ])
    if (path.startsWith('ecommerce/credit-notes')) {
      const note = {
        id: 2,
        company_id: companyId,
        reference: 'CN-2',
        status: 'approved',
        amount: '100',
        total_tax: '0',
        date: '2026-10-15',
        company: { name: 'Home company' },
        order: { id: 40, order_number: 'ORD-40' },
        items: [
          {
            id: 1,
            quantity: 1,
            price: 100,
            amount: 100,
            line_item: state.order.order_line_items[0],
          },
        ],
      }
      return json(
        route,
        path === 'ecommerce/credit-notes'
          ? { data: [note], current_page: 1, last_page: 1, total: 1 }
          : note,
      )
    }
    return route.fallback()
  })
  return state
}
