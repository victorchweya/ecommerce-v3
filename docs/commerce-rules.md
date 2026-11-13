# Existing commerce rules used in phase 1

These are frontend rules and current endpoint behavior. They are not new backend
contracts. Backend changes remain in [phase 2](rebuild-plan.md).

## Catalog and local cart

- Catalog/categories/recommendations use the home-company/customer scope exposed
  by their existing routes. They receive no invented branch parameter.
- Hide unpublished/inactive products and validate grade/unit/processing membership.
  Quantities obey returned minimums and the supported fractional/whole-unit rule.
- Resolve current custom/group/base pricing and sale portions. Selling prices
  include applicable VAT; derive included VAT with `amount * rate / (100 + rate)`.
- Cart identity consists of product, unit variant, processing and normalized
  specifications. Historical flash/regular portions combine before validating a
  reorder quantity. Cart edits/splits/reorders save atomically.
- The phase 1 cart is local, account-owned and shared across branch selection.
  Switching branches refreshes context and clears the selected voucher.
- Dairy additions/submission retain the 3 pm Nairobi cutoff. Minimum basket size
  comes from company options, including an explicit zero; otherwise use 5,000.

## Checkout

- Refresh products, addresses, company configuration and a selected voucher before
  sending an order or requesting payment. A changed products estimate requires
  another review. Never send client price, tax or delivery-fee calculations as
  authoritative product prices.
- Only company-configured payment methods are available. Pickup requires a returned
  pickup address because the current controller still resolves an address for it.
- Dates, allowed days and advance cutoffs use Nairobi time and company settings.
  Regular windows retain existing next-day restrictions; configured groups and
  pickup use their existing fixed window; partner orders use 12:00–14:00.
- Recurring dates are distinct future valid dates submitted with the existing
  recurrence fields. Partner delivery uses the existing separate-date field.
  Recurring orders do not start a single M-Pesa collection for multiple deliveries.
- Delivery fees come from the selected address. Partner/recurring operations can
  create separate orders with additional charges. Voucher allocation, branch vs
  home catalog pricing, and final charged totals remain server-confirmed concerns;
  a frontend estimate is not a guaranteed checkout quote.
- M-Pesa `success` is the accepted collection status. `pending`, `failed`, unknown
  values and uncertain writes remain separate. A successful status read never
  automatically sends an order. The customer explicitly confirms the saved paid
  submission. A result that may already have created an order stays blocked from
  automatic replay, even when a later payment status is successful.
- Persist only owner/company/branch IDs, collection reference, amount and stage in
  tab storage. No payment phone, token, address or full order payload is persisted.
  A reload can recover the reference but may require support to finish reconciliation.

## Orders and account

- History/filtering/pagination use the orders endpoint. An issued invoice is derived
  only from eligible returned orders; invoice filtering applies to each results
  page because the existing API provides no dedicated invoice list/filter.
- Edit only eligible new, non-M-Pesa orders before the existing edit cutoff. Preserve
  payment/delivery type and use available addresses/windows and current selections.
  Known partner/order-type boundaries constrain added product choices.
- Cancellation requires an explicit reason and a new order. Feedback uses the
  existing home-company endpoint; branch orders direct customers to support.
- Staff belongs to the home company. Invitation/cancellation are explicit writes;
  the legacy GET cancellation route is never prefetched or automatically retried.
- Profile details, contact preference and billing notifications save separately,
  preserving the endpoint's notification-preference precedence. Password changes
  require the current password and confirmation of a minimum-eight-character password.
- Invoice/credit-note amounts come from returned records. Browser print/PDF and
  safe issued-document links are available. QR generation stays on the device.
- Top-product reports use the selected month/year. The returned savings value is
  all-time, and available price history can extend beyond that month. Missing impact
  data is unavailable, while an explicit zero remains zero.
- Help and policy content is local. The full existing privacy/terms text was copied
  with a word-for-word conversion check; no new policy was authored.
