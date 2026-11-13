# FTF ecommerce — phase 2 backlog and backend review

Status: deferred improvements. Planning only.

Phase 1 is in [phase-1-rebuild-plan.md](phase-1-rebuild-plan.md). This document
contains optional phase 2 recommendations and the existing backend source review.
These items do not block the frontend rebuild.

## Optional backend and commerce improvements

Deferred by the user's scope correction on 15 Oct 2026. Earlier D1–D6 discussions
and the subsequently added defaults are retained here as improvement candidates,
not active phase 1 requirements. Review details when phase 2 is taken up; the
previous blanket planning authorization does not make these release conditions.

| Earlier item | Existing gap | Possible phase 2 change |
| --- | --- | --- |
| D1 — Consistent branch context | Catalog uses home-company context while parts of cart/checkout use the acting branch. | Apply authorized selected-branch context consistently across shopping endpoints. |
| D2 — Server cart | Current frontend persists its cart locally, although a server-cart API exists. | Adopt the server cart and define migration from local selections. |
| D3 — Customer/branch carts | Persisted server rows are customer-owned, without separate branch ownership. | Separate carts per customer and authorized branch. |
| D4 — Server checkout quote | Cart subtotal is incomplete; payment initiation accepts a frontend amount. | Generate complete server quotes and bind payment/order amounts to them. |
| D5 — Quote expiry and price hold | No reviewed quote contract provides expiry or a price guarantee. | Consider the previously discussed 10-minute maximum and unchanged-input price hold. |
| D6 — Stock reservation | Current reads do not reserve inventory or flash-sale allowance. | Reserve required quantities immediately before payment, with atomic allocation for credit/COD orders. |
| D7 — Reservation timeout | Reservation lifecycle and provider reconciliation are not established. | Define safe expiry/release and unresolved-payment handling. The previously suggested 15-minute window and 30-minute escalation are candidates to revisit. |
| D8 — Payment/order recovery | Partial order deduplication does not cover the whole payment flow, collection reuse, or allocation retries. | Durable checkout attempts, explicit idempotency, amount matching, and recoverable order finalization. |
| D9 — Cart concurrency/import | Server-cart edits, branch migration, and cleanup need additional semantics if adopted. | Revision conflicts, atomic edits, explicit imports, and cleanup that preserves newer selections. |
| D10 — Shared commerce rules | Cart/order validation, pickup handling, split fees/vouchers, and frontend/backend delivery rules differ. | Align server validation and pricing; decide business-policy changes separately from the frontend rebuild. |

The frontend stack, folder separation, route compatibility, and rebuilding in v3
are covered in the separate phase 1 plan. Phase 2 changes require their own scope
when that work is taken up.

## Appendix — Existing backend contract review, 15 Oct 2026

This appendix records the earlier source review. Statements about missing
capabilities describe the existing system and possible phase 2 work. They are not
phase 1 implementation requirements or release gates.

### Evidence and scope

This is a static review of the existing FTF source, not a live API certification.
No orders, carts, accounts, payments, migrations, or external notifications were
created or changed. Existing test source was read; tests were not run. Production
code, deployed migrations, database values, and actual provider behavior remain
unverified. The response layouts below are derived from code, not captured live
responses.

- Backend reference: `/home/blackmamba/Code/ftf-backend-v2`, clean working tree at
  commit `70827f4866d00fc3be17586b11822049689cff19` during review.
- Frontend reference: `/home/blackmamba/Code/ftf-ecommerce-v2`, commit
  `f6d02a4240c87d918aea2bd6a9c98087cfcd938b`; existing uncommitted auth-view edits
  were present and left untouched.
- A focused Postman organization collection search for `ecommerce` returned no
  matches. Findings therefore come from the routes, controllers, services, models,
  migrations, tests, and frontend callers below; the search is not evidence that
  undocumented APIs do not exist.

### Findings that change earlier assumptions

1. **A persisted server cart already exists.** Its reads resolve branch-specific
   product prices, processing charges, flash-sale allocations, and availability.
   No callers of `/ecommerce/cart` were found in the current frontend's `src/` or
   `scripts/`; the current application maintains a local cart.
2. **The cart is not a complete checkout quote.** It returns item pricing and a
   subtotal, with no voucher discount, tax breakdown, shipping total, or final
   payable total. Its writes return a message, not a recalculated cart.
3. **Order creation takes explicit product selections.** It does not consume or
   clear persisted cart rows. It recalculates prices separately and can create
   multiple orders. Cart adoption alone does not bind order creation to saved
   selections or clear submitted rows.
4. **Catalog and cart/checkout use different company context.** Catalog,
   categories, and recommendations use the customer's home company. Cart pricing,
   company details, addresses, vouchers, payments, and orders can use the acting
   branch. Adding a branch ID to a catalog query key cannot change that backend
   behavior.
5. **Final order totals are calculated on the server, but M-Pesa initiation takes
   an amount supplied by the frontend.** No full checkout preview/quote route was
   found in the reviewed ecommerce routes. A matching, authoritative amount before
   payment remains a contract gap.
6. **There is partial order deduplication, not an end-to-end retry guarantee.**
   Orders use a content fingerprint and a database uniqueness rule. Payment
   initiation and payment-to-order allocation require separate review before
   offering automatic retries.

### Common request and context contract

Customer endpoints are under `/api/ecommerce` and use `auth:api` plus customer
middleware. The current frontend sends a Bearer token and JSON requests. Customer
middleware checks customer user type and disabled status. The shared frontend
transport must support the verified token contract and keep authentication failures
separate from authorization failures.

For parent organizations, `branch_company_id` is required on acting-company routes.
A missing branch yields 422; malformed identifiers yield 422; unauthorized branches
are rejected with 403. Other customers normally act as their home company. The
server validates branch ownership; route guards and query keys do not replace it.

Cart rows belong to the authenticated **customer**, not to a company or branch.
`GET` and `POST /cart` use acting-company middleware for pricing and restrictions;
cart deletes are customer-scoped and do not require branch context. Switching
branches reprices the same saved selections. Separate staff/customer records are
not guaranteed to share a cart merely because they share a company.

The current frontend's branch-scoping helper does **not** include `/cart`. If the
server cart is adopted, request scoping and stale-response protection must cover
cart reads and writes with their actual route semantics.

Sources: [ecommerce routes](/home/blackmamba/Code/ftf-backend-v2/routes/ecommerce.php:24), [acting-company middleware](/home/blackmamba/Code/ftf-backend-v2/app/Http/Middleware/ResolveActingCompany.php:25), [customer middleware](/home/blackmamba/Code/ftf-backend-v2/app/Http/Middleware/IsCustomer.php:16), [current transport](/home/blackmamba/Code/ftf-ecommerce-v2/src/helpers/fetch-wrapper.js:69), [current branch-scoping helper](/home/blackmamba/Code/ftf-ecommerce-v2/src/helpers/branch-context.js:2).

### Catalog contract

| Operation | Request | Source-derived response / behavior |
| --- | --- | --- |
| Full listing | `GET /products` | Bare product array; optional `category` (ID), `unit` (ID), `express_delivery`, `order_by`, and `order`. Defaults to `created_at desc`; returns the full collection. |
| Lightweight listing | `GET /products/list` | Bare array selecting product `id`, `name`, `slug`, with variations, active unit variants, and category relations. |
| Product detail | `GET /products/{productID}` | Bare product object with nested variations/grade, unit variants/unit, media, processing options, custom pricing, flash sale, category, and tax. Unpublished detail returns 404. |
| Categories | `GET /config/categories` | Bare category array filtered using the home company's public/customer-group visibility. |
| Recommendations | `GET /recommendations` | Recommendation service result, consumed by the frontend as `count` plus `items[].product_id`; company comes from the authenticated customer. The frontend's `company_id` query parameter does not select the backend company. |
| Favourites | `GET /wishlist` | Customer-owned wishlist rows with nested product relations. |
| Add favourite | `GET /wishlist/{productID}/add` | A state-changing GET returning `{ message, data }`; represent it as a mutation and do not prefetch it as a read. |
| Remove favourite | `DELETE /wishlist/{productID}/delete` | `{ message }`; missing product or wishlist selection returns 404. |

The listing has no implemented search-term filtering, pagination envelope, or
filter aggregations in this controller. Keep current local filtering initially
unless a different verified backend listing contract is selected.

The list filters active products/unit variants and includes active or
`back_in_stock_soon` grade variants. Unlike product detail and cart eligibility,
it does not explicitly require `published` on the product query. Treat this as a
consistency issue to resolve, not a new intentional storefront behavior.

Catalog blocking reads `customerGroup.options.blocked_product_ids`, while
cart/order blocking also uses variant-level `CustomerGroupBlockedProduct` records.
These are distinct rules and data representations. A visible listing item is not
proof that it can be ordered for the selected branch.

Catalog payloads carry base and custom pricing metadata rather than the same
resolved effective-price fields exposed by the server cart. The current frontend
adapts nested data and applies custom pricing before a percentage group adjustment.
The server also supports explicit group price lists and suppresses flash-sale
pricing when a group price applies. Catalog display and cart/checkout pricing need
an agreed reconciliation policy, especially for branch shopping.

Sources: [product controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Products/ProductsController.php:14), [category controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Config/ConfigController.php:13), [recommendations controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/RecommendationModels/RecommendationsController.php:14), [wishlist controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Wishlist/WishlistController.php:13),
[current product adapter](/home/blackmamba/Code/ftf-ecommerce-v2/src/utils/data-rearranger.js:1), [group-pricing service](/home/blackmamba/Code/ftf-backend-v2/app/Services/CustomerGroupPricing/CustomerGroupPricingService.php:21), [cart controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Cart/CartController.php:25).

### Persisted cart contract

| Operation | Request | Result / semantics |
| --- | --- | --- |
| Read/reprice | `GET /cart`, with branch context when required | `{ items, sub_total, has_unavailable_items }`. |
| Add/update selections | `POST /cart` with `{ items: [...] }`, plus branch context when required | 200 `{ message }`. Upserts each normalized selection to an **absolute** quantity; omitted rows remain. It is not an increment operation or whole-cart replacement. |
| Remove one saved row | `DELETE /cart/{cartItemId}` | 200 `{ message }`; 404 for an absent or another customer's row. Identifier is the saved cart row ID. |
| Clear customer cart | `DELETE /cart` | 200 `{ message }`; deletes all rows for that customer across branch contexts. |

Each posted item accepts only:

- `product_unit_variant_id`: required integer, existing variant.
- `quantity`: required numeric value with at most two decimals, between `0.01`
  and `99999999.99`.
- `processing_type_id`: optional nullable integer, existing processing type.
- `specifications`: optional nullable string, maximum 255 characters.

Extra item keys such as price, tax, or frontend `priceType` are rejected by the
allowed-key rule. The cart model normalizes specifications by trimming,
lowercasing, removing blank/`none` values, sorting, and joining with commas.
Identity combines variant, processing type, and normalized specifications. There
is a database selection key to prevent duplicates, including unprocessed items.
Duplicate selections within one batch are rejected. Changing specifications or
processing creates a different selection; posting the replacement does not delete
the previous row. No single-row rename/edit-by-ID endpoint is exposed here.

Validation rejects inactive/unpublished products, inactive grade/unit variants or
units, invalid processing assignments, quantities below the configured minimum,
and fractions for whole-unit products with whole minimums. Default minimum is
`0.1` for KG and `1` otherwise; a fractional configured minimum permits fractional
non-KG quantities. Branch customer-group blocked variants are rejected as well.
The specifications string is length-checked and normalized, but the request does
not validate each ripeness/size/washed token against product-specific options.

Read responses keep unavailable saved selections visible, with
`is_available: false`, `unavailable_reason`, null `unit_price`, zero `line_total`,
and an empty `price_breakdown`. Each available row adds:

- `unit_price`, `line_total`, and `is_flash_sale`.
- `price_breakdown[]` entries containing `quantity`, `unit_price`,
  `is_flash_sale`, and `line_total`.
- Normal saved-row fields and loaded unit-variant/product/processing relations.

A mixed sale/regular row has an averaged `unit_price`; use the breakdown to render
actual portions. Cart `quantity` is cast to a two-decimal string in the model;
computed price fields are numeric. Handwritten transport types and boundary checks
must account for those representations instead of assuming all decimals are JSON
numbers.

Pricing starts from the variant price, applies group pricing, then company pricing.
Group pricing first checks an active explicit group price, then a percentage
markup. A cheaper active flash sale applies only when no group price is in effect.
Processing charges are added to each portion. Remaining sale quantity is shared
across saved rows for the same variant in saved-row order. A cart read does not
reserve stock or consume the sale allocation.

**Cart refresh requirement:** after a successful cart write, refetch/invalidate
the cart query to obtain repriced state; the mutation response cannot replace it.
There is no voucher/shipping/tax/final-total quote in this response. Avoid describing
`sub_total` as the final payable amount or a stock reservation.

Sources: [cart controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Cart/CartController.php:25), [cart request validation](/home/blackmamba/Code/ftf-backend-v2/app/Http/Requests/Ecommerce/UpdateCartRequest.php:18), [cart model](/home/blackmamba/Code/ftf-backend-v2/app/Models/Customer/Cart.php:44), [cart test source](/home/blackmamba/Code/ftf-backend-v2/tests/Http/Controllers/Ecommerce/Cart/CartControllerTest.php:73).

### Checkout and order submission contract

Supporting reads are `GET /company`, `GET /addresses`, `GET /vouchers`, and
`GET /vouchers/{voucher_code}`, with acting-company context. Company data includes
customer-group options and allowed payment options; addresses include company
addresses plus configured group pickup locations. The frontend currently derives
payment choices and delivery slots from those records and local rules. There are
no dedicated available-method, available-slot, or full-checkout-quote routes in
this ecommerce route file.

`GET /vouchers` returns a bare applicable coupon or 200 `{ message: "No valid
voucher found." }`, not an array. Explicit validation returns a bare coupon or
400 `{ message }`. Coupon eligibility considers active/expiry state, company/bulk
scope, usage limits, and first-order restrictions. Order creation validates and
redeems coupons separately; a prior valid read is not a reservation.

`POST /orders` accepts the following source-derived contract:

| Field | Current validation / meaning |
| --- | --- |
| `delivery_type` | Required: `Delivery`, `Pickup`, or `Pickup_Location`. |
| `payment_type` | Required: `credit`, `cash_on_delivery`, or `mpesa`. |
| `payment_collection_id` | Existing payment collection, required for M-Pesa; controller further requires same acting company and exact status `success`. |
| `delivery_date` | Nullable date, required for `Delivery`. |
| `partner_products_delivery_date` | Optional nullable date; used when partner orders are split. |
| `delivery_address_id` | Existing address, required for Delivery/Pickup_Location; controller then looks up a same-company address or any pickup address. |
| `delivery_slot` | Required string; no allowed-slot membership rule in the controller. |
| `coupon_code` | Optional nullable string; validated by the coupon service. |
| `shipping_cost` | Optional numeric input; replaced with the selected address's fee when that address resolves. |
| `delivery_notes` | Optional nullable string. |
| `is_recurring` / `recurring_dates` | Boolean and array, required together when recurring; individual date elements are not validated here. Dates are joined into a comma-separated stored value. |
| `products` | Required non-empty array with existing `product_unit_variant_id`, numeric `order_quantity`, optional existing `processing_type_id`, optional string `specifications`. |
| `order_date` | Optional date; defaults to current time. |

The server sets company, source, and creator; it recomputes product prices,
processing charges, flash-sale portions, coupon discounts, taxes, and order totals.
It does not use submitted unit prices as authoritative values. Shipping contributes
to total only for `Delivery`. Current tax calculation uses prices before coupon
reduction, while coupon discounts reduce line selling prices. This describes the
existing algorithm and is not a tax-policy recommendation.

Existing differences and gaps retained for phase 2:

- Order validation is weaker than cart validation: quantity is only `numeric`,
  with no explicit positivity/precision/minimum or whole-unit rule in this path.
  Cart's `unavailableReason()` checks are not invoked by order creation. The order
  service does reject variant-level customer-group blocks. Do not assume every
  cart eligibility rule is enforced when a client directly posts an order.
- Specifications are cleaned differently in the order controller than in the cart
  model. The current frontend merges intentional sale/regular portions and rejects
  repeated selections of the same price type before sending, then strips
  `priceType`. Server-side duplicate-selection semantics need alignment.
- `Pickup` has nullable address/date validation, but the controller still directly
  accesses those values and requires an address lookup to succeed. Verify the
  supported pickup payload instead of interpreting nullable fields as a reliable
  address-free checkout contract.
- Allowed payment types are enumerated, but this order path does not check every
  choice against company `allowed_payment_options`. M-Pesa initiation separately
  checks company eligibility.
- The general company delivery-day/cutoff policy is enforced; server configuration
  is `Africa/Nairobi`. The controller directly calls the cutoff check, while a
  service-level check also supports an enforcement setting. The current frontend
  additionally applies dairy restrictions, minimum basket rules, and local slot
  rules not found in the reviewed ecommerce order path. Establish one agreed
  policy rather than assuming identical enforcement.
- Order creation prices a submitted selection array independently of persisted
  cart rows. It does not clear those rows. The existing frontend clears its local
  cart on the success page; server-cart cleanup and protection of newer selections
  need a separate plan if the server cart is adopted.

With consolidated invoicing enabled, the service creates one order. Otherwise it
creates an FTF order plus separate orders for each partner, with partner delivery
date override and a fixed partner slot of `12:00-14:00`. Only the primary split order
receives the coupon. Each delivered split order inherits the shipping cost, which
can differ from the frontend's single-basket discount and delivery-fee estimate.
The combined payable mismatch is recorded for phase 2 pricing/quote work.

Success is 201 `{ message, order }` for one order, or
`{ message, orders, total_orders_created }` for several. Normalize the frontend's
result to a single orders collection while preserving server order IDs/totals.
Validation errors and controller errors must retain HTTP status, message, and
field errors in the future transport; the current fetch wrapper discards most
structured error data. Controller business rejections commonly use 400, with
422 validation and 404 lookups also relevant. Actual deployed error envelopes
have not been sampled.

Sources: [order controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Orders/OrderController.php:106), [order service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Order/OrderService.php:56), [cutoff service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Order/OrderCutOffService.php:56), [address controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Addresses/AddressController.php:14),
[company controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Company/CompanyController.php:12), [voucher controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Orders/VoucherEcommerceController.php:17), [coupon validation service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Promotions/CouponsService.php:249), [current order payload preparation](/home/blackmamba/Code/ftf-ecommerce-v2/src/utils/order-items.js:17), [current success-page cleanup](/home/blackmamba/Code/ftf-ecommerce-v2/src/views/checkout/SuccessCheckoutView.vue:21).

### M-Pesa lifecycle and retry boundaries

1. `POST /checkout/init-mpesa-checkout` accepts `{ amount, mpesa_number }` plus
   branch context when required. Amount must be numeric and at least 1; phone is
   a string up to 15 characters, not a backend phone-format rule here.
2. The controller checks `Company::isMpesaEnabled()`, calls Lotus, and creates a
   pending collection tied to company/user and a provider transaction ID. It
   returns 200 `{ message, data: paymentCollection }`. Provider rejection yields
   400; exceptions can yield 500.
3. In non-production environments, the provider request sends amount **2**, while
   the saved collection records the requested amount. Do not infer production
   amount reconciliation from a successful non-production payment.
4. `GET /checkout/collections/{id}` returns the bare same-company collection, or
   404 `{ error: "Collection not found." }`. It reads local status; it does not
   actively ask the provider to reconcile. The collection webhook changes status
   to `success` or `failed` based on the provider transaction ID.
5. The current frontend initiates payment using its calculated total, polls, then
   posts the order with `payment_type: "mpesa"` and the collection ID. Its poller
   treats `success` and `completed` as success, while the ecommerce order controller
   accepts only `success`; retain the endpoint-specific distinction in types/UI.
6. Manual entry of an M-Pesa reference currently adds text to delivery notes and
   submits the existing collection ID. It is not a backend reference-verification
   operation and cannot bypass the controller's collection-status requirement.

The current frontend stores pending form values, but `submitOrder` reads live cart
items and payment selection again when it runs. Its pending state is not yet an
immutable paid-cart snapshot; the rebuild must explicitly bind those values.

The reviewed initiation path has no client idempotency key or checkout snapshot
binding. The Lotus integration also uses a shared retry helper with up to three
attempts by default. Provider deduplication and uncertain-outcome reconciliation
have not been verified; frontend `retry: false` alone is not an end-to-end
no-duplicate-charge guarantee.

Order submission checks collection company/status but does not compare the
collection amount with the combined recalculated order totals or explicitly reject
reuse of an already-applied collection in this controller. The service marks
orders paid when a collection ID is present, and the controller then creates
payment allocations for the returned orders. Allocation occurs after the order
creation transaction; this can produce a committed order plus a later error.
These are backend contract gaps to resolve, not frontend guarantees to simulate.

Order deduplication hashes company, delivery date, delivery address, and product
variant/quantity/processing/specification content. The unique index applies to
non-cancelled orders; conflict handling returns an existing order. It does not
include payment collection, coupon, payment method, delivery slot/type, notes, or
recurring dates in the fingerprint. It is not a per-attempt client idempotency
contract, and returning an existing order does not stop the controller from
attempting payment allocations again. Treat order retries and paid-but-order-
pending recovery as unresolved until exercised against the full API flow.

Sources: [checkout payment controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/PaymentOnCheckout/PaymentOnCheckoutController.php:21), [payment collection model](/home/blackmamba/Code/ftf-backend-v2/app/Models/PaymentCollection/PaymentCollection.php:26), [collection webhook](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Api/Webhooks/Lotus/LotusWebhookController.php:52), [Lotus integration](/home/blackmamba/Code/ftf-backend-v2/app/Integrations/Lotus/LotusIntegrationService.php:28),
[integration retry helper](/home/blackmamba/Code/ftf-backend-v2/app/Integrations/Concerns/HandlesIntegrationFailures.php:40), [order controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Orders/OrderController.php:106), [order service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Order/OrderService.php:56), [order uniqueness migration](/home/blackmamba/Code/ftf-backend-v2/database/migrations/2026_03_26_120000_update_orders_idempotency_index_for_cancelled_status.php:11),
[order deduplication test source](/home/blackmamba/Code/ftf-backend-v2/tests/Services/Order/OrderServiceTest.php:978).

### How this review is used

The current contracts above inform phase 1 request types and behavior parity.
Differences between current frontend and backend behavior are recorded gaps for
phase 2; they do not require implementing new backend contracts before rebuilding
the current screens and flows.

Existing cart/order tests are useful reference material, especially for fractional
quantities, pricing, split orders, cutoffs, and duplicate submissions. Future
backend changes need their own focused verification when phase 2 is authorized.

## Reference material

These references explain the plan's origins. The requirements and decisions above
are self-contained; implementation does not require inheriting another project's
architecture, dependencies, authentication model, or backend contracts.

- Shopware local reference: `/home/blackmamba/Code/shopware`; inspected `app/pages`,
  `app/components`, `app/composables`, and installed commerce composable source.
- FTF Lab ERP local reference: `/home/blackmamba/Code/ftf-lab-erp`.
- [Shopware Frontends internal structure](https://developer.shopware.com/frontends/concepts/internal-structure.html).
- [Shopware Vue starter structure](https://developer.shopware.com/frontends/introduction/templates/vue-starter-template.html).
- [Shopware product configuration](https://developer.shopware.com/frontends/frontends-recipes/catalog/variants.html).
- [Shopware listing and filters](https://developer.shopware.com/frontends/frontends-recipes/catalog/listing.html).
- [Shopware cart](https://developer.shopware.com/frontends/frontends-recipes/checkout/cart.html).
- [Shopware checkout and order placement](https://developer.shopware.com/frontends/frontends-recipes/checkout/checkout.html).
- [Shopware session context](https://developer.shopware.com/frontends/frontends-recipes/context/session-context.html).
- [TanStack server/client state distinction](https://tanstack.com/query/latest/docs/framework/vue/guides/does-this-replace-client-state).

Shopware references describe Shopware's contracts. They guide the design and do not
establish capabilities of the FTF backend.


## Registration integration finding — 15 Oct 2026

The current public `POST /auth/register` calls `AuthService::registerLead`, which
creates a lead/customer record and returns only `data.company`. It does not return
a token, and sign-in rejects accounts whose company remains a lead. The older
`registerCustomer` method can return a token but is not the service called by this
route. Phase 1 follows the lead-request flow and provides existing authenticated
company/address setup separately. If a future public self-service wizard needs to
continue straight into protected onboarding, decide that backend contract here in
phase 2. No change to registration, activation, invitation, or token contracts is
assumed or implemented by this finding.
