import { computed, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { initiatePayment, fetchPayment } from '@/api/checkout'
import { placeOrder } from '@/api/orders'
import { fetchProducts } from '@/api/catalog'
import { fetchCompany } from '@/api/organization'
import { fetchVoucher } from '@/api/checkout'
import { companyQuery } from '@/queries/organization'
import { productsQuery } from '@/queries/catalog'
import { voucherQuery } from '@/queries/checkout'
import { replaceSession } from '@/composables/auth/session'
import { fetchAddresses } from '@/api/addresses'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
import { useCart } from '@/composables/cart/useCart'
import { useCheckoutStore, type CheckoutSubmission } from '@/stores/checkout'
import { checkoutDetailsSchema } from '@/validation/checkout'
import { checkoutIssue, orderProducts } from '@/utils/checkout/rules'
import { calculateCart, cartSummary } from '@/utils/cart/calculations'
import { additionIssue } from '@/validation/cart'
import { ApiError } from '@/lib/api'
import { errorMessage, isPublicRoute } from '@/utils/auth'
import type { OrderInput } from '@/types/orders'
import type { CheckoutDetails } from '@/types/checkout'
export function useCheckout() {
  const context = useCommerceContext()
  const cartState = useCart()
  const { cart, summary, products, pricing, voucher, now } = cartState
  const checkout = useCheckoutStore()
  const router = useRouter()
  const client = useQueryClient()
  const belongs = computed(
    () =>
      checkout.reference?.companyId === context.company.data.value?.id &&
      checkout.reference?.branchId === context.branchId.value,
  )
  const locked = computed(() => checkout.busy || Boolean(checkout.reference))
  function fail(error: unknown, revision = context.auth.revision) {
    checkout.error = [
      errorMessage(error),
      ...(error instanceof ApiError ? Object.values(error.fieldErrors).flat() : []),
    ].join(' ')
    if (context.auth.revision === revision && error instanceof ApiError && error.status === 401) {
      replaceSession('')
      context.auth.notice = 'Your session expired. Please sign in again.'
      if (
        !router.currentRoute.value.meta.passwordRecovery &&
        !isPublicRoute(router.currentRoute.value)
      )
        void router.replace({ name: 'login', query: { returnTo: '/checkout' } })
    }
  }
  function record(
    stage: NonNullable<typeof checkout.reference>['stage'],
    collectionId = checkout.reference?.collectionId ?? null,
  ) {
    if (checkout.reference) {
      const next = { ...checkout.reference, stage, collectionId }
      try {
        checkout.record(next)
      } catch {
        checkout.reference = next
        checkout.error =
          'Keep this tab open. The attempt reference could not be saved on this device.'
      }
    }
  }
  async function submit(details: CheckoutDetails) {
    if (
      locked.value ||
      !cartState.ready.value ||
      !context.company.data.value ||
      !cart.ownerId ||
      cart.needsRecovery
    )
      return
    checkout.error = ''
    checkout.notice = ''
    const parsed = checkoutDetailsSchema.safeParse(details)
    if (!parsed.success) {
      checkout.error = 'Complete the delivery and payment fields.'
      return
    }
    const target = context.target()
    const ownerId = cart.ownerId
    const cartRevision = cart.revision
    const reviewedTotal = summary.value.total
    const voucherCode = cart.voucherCode
    checkout.busy = true
    try {
      const [freshProducts, addresses, freshCompany, freshVoucher] = await Promise.all([
        fetchProducts(target.token, AbortSignal.timeout(20_000)),
        fetchAddresses(target.token, target.branchId, AbortSignal.timeout(20_000)),
        fetchCompany(target.token, target.branchId, AbortSignal.timeout(20_000)),
        voucherCode
          ? fetchVoucher(target.token, target.branchId, AbortSignal.timeout(20_000), voucherCode)
          : Promise.resolve(null),
      ])
      if (
        !context.current(target) ||
        cart.revision !== cartRevision ||
        checkout.ownerId !== ownerId
      )
        return
      if (freshCompany.id !== target.companyId || freshCompany.status !== 'active') {
        checkout.error =
          'Shopping is unavailable for this company. Refresh the account details before continuing.'
        return
      }
      client.setQueryData(
        companyQuery(target.token, target.revision, target.branchId).queryKey,
        freshCompany,
      )
      client.setQueryData(productsQuery(target.token, target.revision).queryKey, freshProducts)
      if (voucherCode)
        client.setQueryData(
          voucherQuery(target.token, target.revision, target.branchId, voucherCode).queryKey,
          freshVoucher,
        )
      const lines = calculateCart(cart.items, freshProducts, pricing.value, Date.now())
      const freshSummary = cartSummary(lines, summary.value.minimum, freshVoucher, Date.now())
      if (!lines.length || freshSummary.hasUnavailable || freshSummary.shortfall > 0) {
        checkout.error = 'Review the current cart and minimum order before checkout.'
        return
      }
      if (cart.voucherCode && !voucher.value) {
        checkout.error = 'Revalidate or remove the voucher before checkout.'
        return
      }
      const selectedProducts = lines.flatMap((line) => (line.product ? [line.product] : []))
      const issue =
        checkoutIssue(
          parsed.data,
          addresses,
          context.company.data.value,
          selectedProducts,
          Date.now(),
        ) || selectedProducts.map((product) => additionIssue(product, Date.now())).find(Boolean)
      if (issue) {
        checkout.error = issue
        return
      }
      if (Math.abs(freshSummary.total - reviewedTotal) > 0.005) {
        checkout.error = 'Prices changed. Return to the cart and review the new estimate.'
        await products.refetch()
        return
      }
      const address = addresses.find((address) => address.id === parsed.data.delivery_address_id)!
      const shipping = address.delivery_fee ?? 0
      const orderInput: OrderInput = {
        delivery_type: parsed.data.delivery_type,
        delivery_date: parsed.data.delivery_date,
        delivery_slot: parsed.data.delivery_slot,
        delivery_address_id: parsed.data.delivery_address_id,
        delivery_notes: parsed.data.delivery_notes,
        payment_type: parsed.data.payment_type,
        products: orderProducts(cart.items),
        is_recurring: parsed.data.recurring_dates.length > 0,
        recurring_dates: [...parsed.data.recurring_dates],
        ...(parsed.data.partner_products_delivery_date
          ? { partner_products_delivery_date: parsed.data.partner_products_delivery_date }
          : {}),
        ...(cart.voucherCode ? { coupon_code: cart.voucherCode } : {}),
      }
      const submission: CheckoutSubmission = {
        target,
        input: orderInput,
        cartRevision,
        ownerId,
        review: lines.map(
          (line) =>
            `${line.product?.name} · ${line.grade?.grade?.name} · ${line.selection.quantity} ${line.unit?.unit?.name}${line.selection.processingTypeId ? ' · ' + line.unit?.processing_variants.find((option) => option.processing_type_id === line.selection.processingTypeId)?.processing_type?.name : ''}${[line.selection.ripeness, line.selection.size, line.selection.washed].filter(Boolean).length ? ' · ' + [line.selection.ripeness, line.selection.size, line.selection.washed].filter(Boolean).join(', ') : ''}`,
        ),
      }
      const amount = Math.round((freshSummary.total + shipping) * 100) / 100
      if (details.payment_type === 'mpesa' && (amount < 1 || details.recurring_dates.length)) {
        checkout.error = 'M-Pesa requires a positive, single-delivery order.'
        return
      }
      checkout.submission = submission
      checkout.record({
        ownerId,
        companyId: target.companyId,
        branchId: target.branchId,
        collectionId: null,
        amount,
        stage: details.payment_type === 'mpesa' ? 'initiating' : 'placing',
      })
      if (details.payment_type === 'mpesa') {
        const collection = await initiatePayment(target, amount, details.mpesa_number.trim())
        if (checkout.ownerId !== ownerId || context.auth.revision !== target.revision) return
        record(
          collection.status === 'success'
            ? 'paid'
            : collection.status === 'failed'
              ? 'failed'
              : 'pending',
          collection.id,
        )
      } else await sendOrder(submission)
    } catch (error) {
      if (checkout.ownerId === ownerId && context.auth.revision === target.revision) {
        if (checkout.reference) {
          if (error instanceof ApiError && [401, 403, 422].includes(error.status)) {
            checkout.forget()
          } else record('unknown')
        }
        fail(error, target.revision)
      }
    } finally {
      if (checkout.ownerId === ownerId && context.auth.revision === target.revision)
        checkout.busy = false
    }
  }
  async function sendOrder(submission: CheckoutSubmission) {
    record('placing')
    const orders = await placeOrder(submission.target, submission.input)
    if (
      checkout.ownerId !== submission.ownerId ||
      context.auth.revision !== submission.target.revision
    )
      return
    checkout.orders = orders
    checkout.forget()
    await client.invalidateQueries({
      queryKey: ['branch', submission.target.revision, submission.target.branchId, 'orders'],
    })
    if (
      checkout.ownerId !== submission.ownerId ||
      context.auth.revision !== submission.target.revision
    )
      return
    const sameCompany =
      context.branchId.value === submission.target.branchId &&
      context.company.data.value?.id === submission.target.companyId
    if (
      sameCompany &&
      cart.ownerId === submission.ownerId &&
      cart.revision === submission.cartRevision
    )
      cart.clear()
    if (!context.current(submission.target)) {
      checkout.notice = 'Your order was confirmed. Check your orders before placing another order.'
      return
    }
    await router.push({ name: 'checkoutSuccess' })
  }
  async function checkPayment() {
    const reference = checkout.reference
    if (!reference?.collectionId || !belongs.value || !context.ready.value || checkout.busy) return
    const target = context.target()
    checkout.busy = true
    checkout.error = ''
    try {
      const result = await fetchPayment(target, reference.collectionId)
      if (
        checkout.ownerId !== reference.ownerId ||
        !context.current(target) ||
        checkout.reference?.collectionId !== reference.collectionId
      )
        return
      // A successful collection does not establish whether an uncertain order write succeeded.
      if (reference.stage === 'unknown' || reference.stage === 'placing') return
      record(
        result.status === 'success' ? 'paid' : result.status === 'failed' ? 'failed' : 'pending',
      )
    } catch (error) {
      if (context.current(target)) fail(error, target.revision)
    } finally {
      if (checkout.ownerId === reference.ownerId && context.auth.revision === target.revision)
        checkout.busy = false
    }
  }
  async function completePaidOrder() {
    const submission = checkout.submission
    if (
      !submission ||
      !context.ready.value ||
      submission.ownerId !== checkout.ownerId ||
      submission.target.revision !== context.auth.revision ||
      submission.target.branchId !== context.branchId.value ||
      submission.target.companyId !== context.company.data.value?.id ||
      checkout.busy ||
      checkout.reference?.stage !== 'paid' ||
      !checkout.reference.collectionId
    )
      return
    checkout.busy = true
    checkout.error = ''
    try {
      await sendOrder({
        ...submission,
        target: context.target(),
        input: { ...submission.input, payment_collection_id: checkout.reference.collectionId },
      })
    } catch (error) {
      if (
        checkout.ownerId === submission.ownerId &&
        context.auth.revision === submission.target.revision
      ) {
        record('unknown')
        fail(error, submission.target.revision)
      }
    } finally {
      if (
        checkout.ownerId === submission.ownerId &&
        context.auth.revision === submission.target.revision
      )
        checkout.busy = false
    }
  }
  let pollingStarted = 0
  const polling = useIntervalFn(
    () => {
      if (
        Date.now() - pollingStarted >= 120_000 ||
        checkout.reference?.stage !== 'pending' ||
        !belongs.value
      ) {
        polling.pause()
        return
      }
      void checkPayment()
    },
    5000,
    { immediate: false },
  )
  watch(
    () => `${checkout.reference?.collectionId}:${checkout.reference?.stage}:${belongs.value}`,
    () => {
      polling.pause()
      if (
        checkout.reference?.collectionId &&
        checkout.reference.stage === 'pending' &&
        belongs.value &&
        checkout.submission
      ) {
        pollingStarted = Date.now()
        polling.resume()
      }
    },
    { immediate: true },
  )
  return {
    ...context,
    ...cartState,
    checkout,
    belongs,
    locked,
    submit,
    checkPayment,
    completePaidOrder,
    now,
  }
}
