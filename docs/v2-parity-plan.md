# V2 layout and behaviour parity

Decision, 16 October 2026: V2 is the reference for the customer-facing layout and
functionality. This supersedes earlier independent layout decisions and the
phase-1 restriction to a local cart. Use the existing endpoints already used by
V2; do not change the backend.

Keep V3's plain Vue/TypeScript stack, PrimeVue/Aura colours and typography, and
the agreed separation of pages, components, composables, API, queries, stores,
types and utilities. Port behaviour into these boundaries instead of copying
V2's large page components. External analytics remains disabled.

Reference checkout: `src/views/checkout/CheckoutView.vue` in V2. Reference order
editing: `src/views/account/EditOrder.vue`. The active invoice routes both use
`src/views/account/InvoiceDetailNew.vue`, not the older InvoiceDetail component.

## Work and acceptance checks

- Catalog: sidebar category navigation, square product images, inline unit and
  quantity inputs, grade selection, current selected-unit price and Add action.
  Open optional specifications only when needed; image/name links open details.
  Preserve favourites, unavailable states, sale pricing, minimums and dairy cutoff.
- Cart: use V2's existing server-cart contract, absolute quantities, option edits,
  split/merge/removal, clear confirmation and reload recovery. Reads and saves
  use the selected branch as V2 does; deletes remain customer-scoped. Prices come
  from the server cart. Logout must never delete the saved server cart.
- Cart layout: editable rows and right summary; drawer shares editing controls,
  shows all lines and has View cart/Checkout actions. Keep 30+ item baskets usable.
- Checkout: editable order items and delivery details on the left; totals,
  billing details, payment choices, terms consent and submission on the right.
  Match delivery/pickup, partner slots, address creation and M-Pesa prompt/manual
  confirmation flows. V2's recurring-order UI is disabled and stays disabled here.
- Orders: billing/location/method overview, editable item table, product addition,
  quantity edits, removals, totals, save and cancellation. Preserve the 19:00
  Nairobi cutoff before next-day delivery and V2's eligible order statuses.
- Invoice/PDF: reproduce the active V2 invoice document's A4 layout: logo and QR,
  sale/buyer/supplier details, dispatched item table, tax-category summary, total
  and KRA/SCU fields. Preserve V3 UI typography/colours and signed tokenless reads.
- Shared shell, auth, landing, account and information pages: match V2's section
  placement and navigation without copying its colour overrides, fonts, analytics,
  hardcoded credentials, generated build output or monolithic component structure.

Verify with runtime contracts, focused unit tests and mocked desktop/mobile
journeys. Inspect the invoice in print media and a generated PDF. Do not create
live orders, take payments, send invitations or alter live customer carts to test.
Report actual completion and any parity gaps; do not describe a code comparison
as verified runtime equivalence.
