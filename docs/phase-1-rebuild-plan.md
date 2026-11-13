# FTF ecommerce — phase 1 frontend rebuild

Updated direction, 16 October 2026: [V2 layout and behaviour parity](v2-parity-plan.md)
now governs follow-up implementation, including the existing V2 server cart and
invoice template. Earlier local-cart and independently designed layout decisions
below describe the original rebuild and are superseded where they conflict.

Status: the phase 1 frontend is implemented and locally verified on 16 Oct 2026.
The agreed page inventory, stack and folder separation are in place. Backend
changes remain in phase 2. See [verification](phase-1-verification.md) for the
remaining configuration and existing-contract limits.

## What we are rebuilding

Build a clean frontend for the commerce capabilities supported by the existing
backend endpoints, using the agreed Vue stack and folder structure. Treat this as
receiving the endpoints and implementing a well-organized frontend around them.

Use v2 to discover existing capabilities, business requirements, and integration
examples. Its UI, exact screen sequence, component design, duplicated state,
workarounds, and frontend bugs are not requirements for the rebuild. Improve the
flow and implementation instead of reproducing those mistakes.

Use standard PrimeVue components with the built-in Aura preset. Custom colours,
branding, typography and theme changes are outside phase 1. Layout, navigation,
spacing and component arrangement are part of phase 1. Aim for
clear, usable forms and navigation with sensible loading, empty, error, and success
states. Do not copy v2's custom theme or visual layouts.

Phase 1 uses the existing backend contracts. New server quote, stock reservation,
branch-cart ownership, and payment-recovery contracts remain in the separate
[phase 2 backlog](rebuild-plan.md). They are not prerequisites for this rebuild.
Foundation, account access/setup, catalog, local cart, checkout, orders, account
capabilities, landing and information/legal pages are implemented.

## UI arrangement follow-up

The UI uses the existing default Aura theme, colours, fonts and type scale.
PrimeIcons is installed as `@primeicons/vue`; icons supplement labelled controls.
The layout follows standard shopping patterns and the local ui.sh design guidance
for hierarchy, restrained surfaces, grouped actions and responsive layouts.

- Shared header search/category navigation, a single cart control, an account menu,
  mobile shopping/account drawers and consistent breadcrumbs/footer groups.
- Catalog filters use a desktop toolbar/mobile drawer; sorting stays beside results.
  Product-card Add to cart buttons open a quick-add dialog using the shared option
  selector and cart validation, with compact favourite controls. Image and name links
  open product details, which keep images beside purchasing options on desktop.
- Cart and checkout accommodate B2B baskets of 30+ lines: full-width compact cart
  rows, accessible price breakdowns, desktop totals, a persistent mobile checkout
  action, and a five-line mini-cart preview leading to the full cart.
- Checkout keeps totals compact and makes large item reviews expandable and
  scrollable. On mobile, review precedes submission. Repeat-delivery controls are
  optional disclosures; payment/uncertain-result recovery is retained.
- Account/orders share responsive navigation. Forms use lighter separation,
  order lists use cards on mobile, and auth/onboarding, information, documents and
  application states retain consistent grouping and recovery actions.

Existing backend contracts, local-cart ownership, prices, validation and payment
rules are unchanged. A 35-item mocked basket was reviewed and submitted once with
all 35 product lines. See the verification record for completed checks and limits.

## Implementation progress

Code and planning documents live together in
`/home/blackmamba/Code/ftf-ecommerce-v3`. The phase plans are in `docs/`; there is
one foundation and one copy of each plan.

- Implemented the Vue/Vite/TypeScript entry, explicit routing, Pinia and Vue Query
  registration, standard Aura styling, and Tailwind v4/PrimeUI integration.
- Added a minimal shell/home entry, shared page recovery, generic access-denied and
  not-found pages, and a render-error boundary.
- Added the shared JSON transport with optional bearer authentication, cancellation,
  structured HTTP/field errors, API-base restrictions, and no automatic retries.
- Implemented password and OTP sign-in, password-reset request/check-email/reset
  pages, session restoration, safe return navigation, and sign-out. Forms use
  PrimeVue Forms and Zod. API responses validate critical identity/context fields.
- Implemented account-awaiting-approval routing from explicit company `pending`
  state. Other inactive/unknown company states and profile permission denial stay
  distinct. Parent accounts keep the existing structure-based access flow.
- Implemented branch discovery, mandatory parent-account selection, selected-company
  lookup, branch membership validation after refresh, and loading/empty/retry/error
  states. Independent accounts use their home company without sending a branch ID.
- Pinia holds the bearer token and selected branch in tab-scoped session storage;
  profiles, branches, and company records remain owned by TanStack Query. Passwords,
  OTP challenges, and fetched account records are not persisted.
- Branch changes cancel/remove queries under `['branch', ...]`; company query keys
  include the session revision and selected branch. Session replacement/sign-out
  clears private cached records and selected context. A late sign-out response cannot
  clear a newer session. Persisted branch IDs are rechecked against returned membership.
- Verified type checking, lint, formatting, production build, 101 unit tests, and
  170 desktop/mobile browser checks. Browser API calls are intercepted with test
  responses, including expiry, denied access, empty/error states, delayed branch
  responses, OTP, password recovery, and failed sign-out cleanup. No live
  authentication, OTP/email delivery, payment, or order operations were exercised.

- Implemented lead registration with a tokenless request-received confirmation,
  invitation acceptance, and signed-in contact/billing/delivery setup. Added focused
  forms and shared field feedback, existing-record defaults, optional certificate
  upload, required delivery coordinates, and saved-address reuse.
- Setup saves capture their session/company/branch and selection generation. An old
  save cannot advance or replace a new draft after switching branches, including a
  switch back to the original branch. Profile/branch discovery must resolve before
  any dependent company request becomes enabled.

- Implemented catalog/category/product/favourites pages, URL-backed search, category
  and grade filters, name sorting, and client pagination over the full product array.
  Added recommendations, explicit favourite mutations, reusable cards, typed selection
  drafts, minimum/fractional quantities, processing/specification options, and product
  price estimates. No editable catalog records are copied into Pinia or browser storage.
- Catalog queries wait for authenticated shopping context. Their keys reflect the actual
  home-company/customer endpoint scope; branch switches do not pretend to change server
  catalog pricing. Detail drafts reset across product, branch, or session changes.
- Catalog browser checks include failed/empty reads, unavailable products/categories,
  favourite failures and duplicate prevention, parent context readiness, 401 expiry,
  delayed reads after sign-out, and a late favourite 401 after replacement sign-in.

- Implemented one account-owned local selection store, guarded/versioned browser persistence,
  catalog add actions, a cart page and drawer, explicit edits/splits/merges/removals/clear,
  and shared basket calculations. Cart records contain selection identity and quantity;
  query-owned product records and calculated prices are not persisted.
- Implemented branch-scoped voucher discovery/checking through the existing endpoints,
  transient selected-code state, expiry feedback, VAT-inclusive product estimates, and
  minimum-basket feedback. Branch changes keep the local selections and clear the voucher.
- Added failure checks for storage writes/corrupt data, stale editors, observed cross-tab
  updates, changed minimums/options, account switching, and late voucher responses. Browser
  checks exercise the cart without any server-cart calls or commerce writes.

The remaining phase 1 frontend has now been implemented: checkout and confirmation,
order history/detail/edit/cancel/reorder/feedback, account profile/password/company/team,
addresses, documents, reports, landing navigation and all agreed help/legal pages.
Backend changes remain in phase 2. The final verification record is in
[phase-1-verification.md](phase-1-verification.md); ownership and current business
rules are summarized in [architecture.md](architecture.md) and
[commerce-rules.md](commerce-rules.md).

The completion slice adds fresh preflight reads, an immutable checkout submission,
bounded status polling, minimal tab-scoped attempt recovery, guarded cart clearing,
private/public document boundaries, local QR rendering, and existing-link aliases.
External analytics transmission was not enabled after automatic approval review
rejected that separate egress action, and the user chose to keep it disabled.
It does not block the commerce frontend.
The complete legacy privacy and terms wording was retained with a conversion
self-check. No live commerce writes, deployment, commit or push was performed.

### Auth/context contracts used by this slice

| Operation | Existing contract |
| --- | --- |
| Password sign-in | `POST /auth/login` with `email`, `password`; consume `data.token` and a customer user. |
| OTP request/sign-in | `POST /auth/customer/request-otp` with `intent: login`, email or phone and `channel: auto`; consume top-level `otp_token`/`channel`, then `POST /auth/customer/login-otp` with the contact, token and `otp_code`. |
| Session profile | `GET /ecommerce/profile`, bare user with `customer.company`; never branch-scoped. |
| Sign-out | Existing `GET /auth/logout` with bearer token; the server currently revokes the user's tokens. Local cleanup runs even if that request fails. |
| Password recovery | `POST /auth/forgot-password` with email; `POST /auth/reset-password` with email, token, password and confirmation. Keep `/auth/password-reset` for existing email links and support `/auth/reset-password` as an alias. |
| Branch membership | `GET /ecommerce/company/branches`; consume `{ data: [{ id, name }] }`, without selected branch context. |
| Selected company | `GET /ecommerce/company`; parent accounts send `branch_company_id` in the query string, independent accounts omit it. |

The branch query prefix and selected context are used by the implemented features;
this does not change the backend's catalog/company scoping or introduce server
carts, quotes, or reservations. Registration and onboarding contracts are recorded
below.

### Registration and onboarding contracts used by this slice

The current public `POST /auth/register` calls `registerLead`, not the token-issuing
`registerCustomer` service method. It requires business name, category, customer
name (maximum 100 characters), email, and a unique ten-digit phone number. Password
is nullable. Success returns `data.company` with `is_lead: true`, without a token;
the account cannot sign in while it remains a lead. The public form therefore
collects the required business/contact details and confirms that the team will
complete setup. It does not redirect into protected company endpoints or invent a
signed-in/pending session. The existing HTTP-200 registration failure envelope is
rejected when it lacks the success data. Business-category options mirror the
backend's `CompanyCategory` values; this is distinct from catalog product categories.

| Capability | Existing contract and frontend behavior |
| --- | --- |
| Invitation acceptance | `POST /auth/accept-invitation` with token, email, name, numeric phone, password and confirmation. Customer invitation service requires name/phone; endpoint requires at least six password characters. It returns a message without a session token. Preserve the emailed query-link format, show malformed/expired-link errors, and offer sign-in after acceptance. |
| Contact person | `PUT /ecommerce/company` with only `contact_person_name`, `contact_person_email`, `contact_person_phone`, and `contact_person_designation`; designation is optional. Existing values prefill the form; unrelated company fields are not sent. |
| Billing details | The same company `PUT`, with nested `billing_details.business_name/address/postal_code/city` and optional KRA PIN/certificate. Collect a real postal code. Omit `kra_certificate` unless a replacement was selected; clearing an unsaved selection does not claim to delete a saved certificate. Encode a selected PDF/JPEG/PNG/WebP as a data URL, with the existing five-MB frontend limit; send it only with the confirmed billing save. |
| Delivery addresses | `GET /ecommerce/addresses` returns company addresses plus possible pickup locations. Only same-company saved addresses count as onboarding delivery addresses. `POST /ecommerce/addresses` requires address type, location name, address, city, contact name/phone, latitude, longitude, and boolean `is_default`. The first company address becomes default; later setup additions do not replace an existing default. |
| Delivery location | Capture current browser location on an explicit action, or accept manually entered coordinates. Require finite latitude/longitude within valid ranges, preserve zero coordinates, and handle denied/unavailable geolocation without fabricated defaults. No external map SDK, hardcoded map key, or automatic location request was introduced. |
| Company scope | Parent accounts must select a returned branch before setup. Company/address reads send `branch_company_id` in the query; their writes send it in the JSON body. Independent accounts omit it. Session and branch context are captured when a save starts. |

`/auth/contact-person`, `/auth/billing-details`, and `/auth/delivery-address` require
a valid signed-in customer and company context. Explicitly pending customers may
save their account details while shopping remains blocked. Inactive/unknown or
permission-denied accounts retain the separate access handling. These known setup
paths are safe login/branch-selection return destinations.

The endpoints do not expose an onboarding completion flag or an atomic onboarding
transaction. Save each step separately, derive defaults from saved records, permit
supported setup-later navigation, and do not persist a fabricated completion state.
Failures remain beside the form with field errors and typed input intact. A 401
expires the session; other failed writes are not automatically replayed. Finishing
setup does not activate an account. A public self-service wizard that creates a
session would require a separate backend decision in phase 2.

### Catalog contracts and implementation

Catalog is implemented in `pages/catalog`, `components/catalog`,
`composables/catalog`, `api/catalog.ts`, `queries/catalog.ts`, `types/catalog.ts`,
and `utils/catalog`; shared currency formatting lives in `lib/currency.ts`.
The route pages compose the browser/detail containers. Search and filters own
input intent, cards/grid own presentation, and the product configurator owns the
temporary draft through `useProductSelection`. No cart store or checkout flow is
introduced in this slice.

| Capability | Existing contract and frontend behavior |
| --- | --- |
| Full catalog | Authenticated `GET /ecommerce/products` returns a bare array. Fetch it once per session cache context, then search/filter/sort and paginate locally, twelve products per page. Do not invent server search/page parameters or substitute `/products/list` for full records. Hide unpublished/inactive products. |
| Categories and grades | Authenticated `GET /ecommerce/config/categories` returns a bare array. `/catalog/category/:categoryId` derives its title and products from returned IDs. Unknown categories, valid empty categories, category-read failures, and no search matches have separate feedback. Grade choices are deduplicated from active grade relationships with an active unit in the visible catalog. Filtering matches canonical grade IDs, without another endpoint. |
| Details/configuration | `GET /ecommerce/products/{id}` returns one full product; a missing, blocked or unpublished product can return 404. Validate the returned identity, track the reactive route ID, and keep unavailable/error/retry states out of the configurator. Grade/unit/processing IDs must belong to the returned relationship. Back-in-stock-soon grades remain visible and cannot produce a valid selection. |
| Quantity/specifications | Retain the supported quantity rule: KG or fractional minimums permit two decimal places; other units use whole quantities. Use the returned positive minimum, with existing KG 0.1/other-unit 1 fallbacks. Blank, non-finite, below-minimum and overprecise drafts cannot produce a selection. Size/ripeness/washing options come from comma-separated product fields; unselected optional specifications remain null. Reset unit/processing/quantity dependencies when changing unit. |
| Price display | Normalize finite decimal strings/numbers at the response boundary. Use the matching home-company custom price before available percentage group markup or base price. Active, dated, unexhausted lower-price sales apply to their remaining quantity; estimate the rest at the regular price, with returned processing cost on both portions. Unzoned promotion dates use the backend's Africa/Nairobi timezone. A local clock stops displaying an expired promotion without waiting for another request. Estimates exclude delivery, use VAT-inclusive selling prices where applicable, and are not checkout quotes or stock reservations. |
| Favourites | `GET /ecommerce/wishlist` returns saved product IDs and embedded records. Display current product cards/prices from the full catalog rather than the wishlist's differently loaded product data. Keep unavailable saved products separately removable. Explicit `GET /ecommerce/wishlist/{id}/add` is a TanStack mutation; removal uses `DELETE /ecommerce/wishlist/{id}/delete`. Disable conflicting writes, invalidate on success, retain saved state on failure, and never replay writes automatically. |
| Recommendations | `GET /ecommerce/recommendations` returns `{ items }`. Deduplicate product IDs and join them to visible full-catalog products; ignore recommendation prices and IDs absent from the catalog. A failed or empty recommendation response does not block shopping. |
| Access/context | All catalog routes require sign-in and the established company/branch readiness checks. Catalog/category/detail/recommendation requests remain home-company scoped; wishlist remains customer scoped. They send no invented `branch_company_id` or `company_id`. Query keys use session revision, and session replacement clears them. A late mutation cannot invalidate or expire a newer session. |

Routes are `/catalog`, `/catalog/category/:categoryId`,
`/catalog/products/:productId`, and `/favourites`. Search, grade, sort and page are
bookmarkable query state; changes reset pagination.
Detail requests do not load the entire catalog unnecessarily. Product media has a
missing/failed-image fallback, and descriptions render as text rather than injecting
backend HTML. Default PrimeVue Aura controls and responsive utility layouts are used.
The copied environment does not contain `VITE_PRIMEUI_LICENSE_KEY`; browser
inspection currently shows an **Invalid PrimeUI License** notice. This existing
configuration issue is recorded separately from catalog behavior and was not bypassed.

The current product endpoints do not expose explicit per-variant group-price lists
and use home-company restrictions/prices while checkout uses the selected branch.
For independent accounts, available home-company percentage markup is used. For
parent accounts, never apply an acting branch's markup to home-company catalog
prices. Keep authoritative catalog/checkout price alignment in phase 2, using the
existing endpoint data as an estimate in phase 1. This does not prevent catalog
implementation or introduce a new price guarantee.

Catalog's validated selection contains product/unit-variant identity, optional
processing identity, quantity and optional specification values. The local-cart
slice now consumes it through its action and owns add/edit/persistence/basket
calculations. Catalog configuration emits intent; it does not mutate cart arrays,
write server-cart rows, or submit orders.

### Local cart implementation

The local cart is implemented in `stores/cart.ts`, `composables/cart`,
`components/cart`, `pages/cart/CartPage.vue`, `types/cart.ts`, `validation/cart.ts`,
and `utils/cart`. The shared catalog configurator emits a validated selection to
the cart action. The cart page and responsive drawer compose the same item/editor,
voucher, and summary components. Drawer navigation closes the overlay; shopping
context must be ready before opening it. Checkout remains the next slice.

| Concern | Implemented behavior |
| --- | --- |
| Ownership/storage | One local cart per signed-in user on this browser, under `ftf:v3:cart:<userId>`, with schema version 1. Persist only product/unit-variant/processing IDs, quantity and optional specification values. Sign-out/session replacement detaches memory and transient voucher/feedback state; signing back into the same account restores its local selections. Another account never receives that cart in the UI. No bearer token, prices, fetched product records, billing/contact/address data or voucher response is stored with the cart. |
| Branch changes | Keep the same local selection collection, clear the selected voucher, close stale edits, and revalidate against current shopping context. There are no isolated branch carts in phase 1. Current home-company catalog limitations remain as already documented; no branch pricing guarantee is invented. |
| Identity/add | Identity includes product ID, unit-variant ID, processing-type ID and normalized optional size/ripeness/washing values. Equivalent null/none/whitespace/case forms merge; distinct processing/options stay separate. Quantity is not identity. Revalidate returned product/grade/unit/processing/specification relationships and quantity before committing. Preserve the existing dairy add cutoff of 3 pm in Africa/Nairobi. |
| Edits/splits/merges | Editors use a separate draft and explicit save/cancel. Edit quantity/processing/specifications for the selected unit; changing grade/unit uses catalog remove/re-add. A split keeps the same unit, requires different options, and validates both remaining and split quantities. Save the entire result once; an invalid edit or failed persistence cannot partially decrement an item. Matching edited/split selections merge into one line. A changed cart revision invalidates a stale editor. |
| Persistence failures | Validate restored records without deleting unreadable or unsupported data. Offer retry and an explicit saved-cart reset. Writes complete before replacing in-memory selections; a failed write retains the prior saved cart and editor draft with feedback. Detect an observed competing local-storage value before writing and require reload. Storage events reload the current account's cart and close stale edits with feedback. This is local browser coordination, not a cross-device or server concurrency guarantee. |
| Revalidation | Cart entry/drawer opening refreshes full product data. Missing/unpublished/inactive products and removed grades/units/options stay visible as unavailable selections and can be removed. Quantity/specification issues can be repaired in the editor when the unit still exists. Failed product reads preserve stored selections and offer retry; they do not produce a plausible complete basket total from missing prices. |
| Sale/regular portions | Keep one submitted selection quantity. Derive display portions with shared price utilities and allocate available sale quantity once per unit variant across all processing/specification lines. Recompute on quantity, selection, pricing data and promotion-time changes. Expiry returns unreserved quantities to regular-price display; it does not rewrite stored selections. |
| Basket feedback | Shared calculations derive item estimates, product subtotal, voucher estimate, included VAT and minimum-basket shortfall. Selling prices already include VAT where applicable; do not add VAT a second time. Show the included amount before voucher to match the reviewed backend algorithm. Use the returned company-group minimum (including an explicit zero), otherwise the existing 5,000 KES default. Minimum feedback uses the displayed product total after estimated voucher savings; delivery remains for checkout. Unavailable lines prevent a complete-basket estimate/discount from being represented as confirmed. |
| Voucher selection | Shared `api/checkout.ts`, `queries/checkout.ts` and `types/checkout.ts` currently implement only the existing voucher reads. Discovery consumes a bare coupon or the exact no-voucher envelope; checking a code consumes a bare coupon or its error. Parent reads send `branch_company_id` in the query. Apply a selected code only after its current-context check succeeds. Keep failed codes beside the field, allow removal/retry, stop estimating savings at expiry, and ignore late previous-branch results. The code is transient and rechecked after refresh/reselection; no voucher is redeemed by cart. |

`/cart` is authenticated and requires valid shopping context. The header count is
the number of configured selection lines, rather than summing mixed physical units.
The cart and drawer use the same reactive store and calculations. Optional product
preferences offer a keyboard-accessible **No preference** choice. Clear-cart intent
is confirmed within the UI, and saved-data recovery requires an explicit action.

V2 storage remains untouched; there is no implicit migration or deletion. No new
package, backend file, server-cart API integration, payment attempt, order request,
quote, reservation, or checkout screen was added. The existing license notice remains
a separate environment configuration item. Focused unit and desktop/mobile checks
use intercepted API responses; no live voucher redemption/order/payment action was
performed. Six PrimeVue component API validations and desktop/mobile visual checks
also passed.

## Scope boundary

| Keep | Improve or choose afresh |
| --- | --- |
| Supported commerce capabilities and applicable business rules. | Navigation, page composition, form sequence, feedback, and frontend coordination. |
| Existing endpoint methods, payload requirements, authentication, and authorization context. | Typed request functions, query ownership, validation, and error handling. |
| Product configuration, quantities, pricing inputs, delivery choices, vouchers, and supported payment/order operations. | Components, composables, client state, calculation helpers, and frontend safeguards. |
| Existing customer/account/order information and integrations required by those capabilities. | Standard PrimeVue presentation and a maintainable folder structure. |

Phase 1 improvements are limited to the agreed capabilities and pages: clearer
flow, correct frontend behavior, maintainable code, and the agreed stack. An API's
existence does not automatically bring every possible feature into scope. New
backend capabilities remain in phase 2. Do not invent pricing, delivery, or payment
policies while improving frontend flow. Where v2 contradicts an endpoint contract,
use that contract and the required business behavior rather than copying the bug.

The page inventory is settled for this phase. About, standalone Cookie Policy,
standalone Search Results, Maintenance, and Offline pages are not included.
Search and no-results handling belong to the catalog; FAQ content belongs to Help.
Further page discovery is not a prerequisite for starting the agreed rebuild.

## Agreed stack

- Plain Vue 3 + Vite, TypeScript, Composition API, and `<script setup lang="ts">`.
- Vue Router with explicitly registered routes and guards.
- TanStack Vue Query for existing server data, queries, mutations, and caching.
- Pinia for shared client-owned state; local Vue state for component/form drafts.
- PrimeVue with the standard Aura preset. No custom FTF theme or v2 theme overrides.
- Tailwind CSS v4 with the Vite integration and `tailwindcss-primeui`, for layout,
  spacing, responsive utilities, and theme-aware application surfaces. Keep
  PrimeVue in styled mode; do not rebuild its component styling with utilities.
- PrimeVue Forms and Zod for typed form validation, with mapped server field errors.
- VueUse where an existing utility is useful; do not add custom equivalents.
- Handwritten TypeScript API contracts; backend schemas and generated clients are
  not prerequisites.
- Focused Vitest/Vue Test Utils checks, Playwright journeys, vue-tsc, and Vite build.

Choose frontend validation from endpoint requirements and confirmed business rules.
Improve labels, field feedback, pending states, and prevention of duplicate actions;
do not inherit v2 validation timing or errors merely because they already exist.
Validate critical response values without assuming every decimal is a JSON number.

## Folder structure

Keep the agreed separation of pages, components, composables, requests, queries,
types, stores, validation, and pure utilities. Group each by business area. Pages
assemble the UI and behavior; they are not containers for nested feature modules.
There is no `src/modules/` directory, Nuxt layer, or generated routing.

The tree records the agreed page inventory and folder separation. Supporting
component/composable/helper names illustrate ownership and are not a checklist of
empty files to create. Choose their boundaries when implementing each flow.
Navigation and form presentation may improve without reopening the page inventory
or copying v2's exact UI sequence. Meet the endpoint and account-state requirements.

No custom theme directory is needed: configure the built-in preset in application
setup. Keep necessary environment and deployment integration compatible, without
copying v2's styling configuration or adding a deployment project to phase 1.
Keep Tailwind imports and PrimeVue integration in the application stylesheet and
Vite/application setup. Do not add a v3-style configuration merely because v2 or
a generic skill example uses it. If an explicit dark selector is used, keep the
PrimeVue selector and Tailwind variant aligned; a new theme-switching feature is
not required for this review.

```text
ftf-ecommerce-v3/
├── docs/
│   ├── phase-1-rebuild-plan.md
│   ├── rebuild-plan.md
│   ├── architecture.md
│   └── commerce-rules.md
├── public/
│   ├── favicon.ico
│   └── videos/
├── e2e/
│   ├── fixtures/
│   ├── auth.spec.ts
│   ├── catalog.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── branch-shopping.spec.ts
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── env.d.ts
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │       ├── main.css
│   │       └── base.css
│   ├── router/
│   │   ├── index.ts
│   │   ├── guards.ts
│   │   └── __tests__/guards.spec.ts
│   ├── layouts/
│   │   ├── StorefrontLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── AccountLayout.vue
│   ├── pages/
│   │   ├── NotFoundPage.vue
│   │   ├── AccessDeniedPage.vue
│   │   ├── ErrorPage.vue
│   │   ├── auth/
│   │   │   ├── LoginPage.vue
│   │   │   ├── RegisterPage.vue
│   │   │   ├── ContactPersonPage.vue
│   │   │   ├── BillingDetailsPage.vue
│   │   │   ├── DeliveryAddressPage.vue
│   │   │   ├── ForgotPasswordPage.vue
│   │   │   ├── ResetPasswordPage.vue
│   │   │   ├── PasswordResetCheckEmailPage.vue
│   │   │   ├── AcceptInvitationPage.vue
│   │   │   └── AccountPendingApprovalPage.vue
│   │   ├── organization/ParentAccountPage.vue
│   │   ├── catalog/
│   │   │   ├── CatalogPage.vue
│   │   │   ├── CategoryPage.vue
│   │   │   ├── ProductPage.vue
│   │   │   └── FavouritesPage.vue
│   │   ├── cart/CartPage.vue
│   │   ├── checkout/
│   │   │   ├── CheckoutPage.vue
│   │   │   └── CheckoutSuccessPage.vue
│   │   ├── orders/
│   │   │   ├── OrdersPage.vue
│   │   │   ├── OrderDetailsPage.vue
│   │   │   └── EditOrderPage.vue
│   │   ├── account/
│   │   │   ├── AccountDetailsPage.vue
│   │   │   ├── DeliveryAddressesPage.vue
│   │   │   ├── InvoicesPage.vue
│   │   │   ├── InvoiceDetailsPage.vue
│   │   │   ├── CreditNotesPage.vue
│   │   │   ├── CreditNoteDetailsPage.vue
│   │   │   ├── OrderInsightsPage.vue
│   │   │   └── ImpactDashboardPage.vue
│   │   ├── landing/LandingPage.vue
│   │   ├── help/
│   │   │   ├── HelpPage.vue
│   │   │   ├── ContactPage.vue
│   │   │   ├── DeliveryInformationPage.vue
│   │   │   └── ReturnsAndRefundsPage.vue
│   │   └── legal/
│   │       ├── PrivacyPolicyPage.vue
│   │       └── TermsAndConditionsPage.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── HeaderSearch.vue
│   │   │   └── CatalogNavigation.vue
│   │   ├── form/
│   │   │   ├── FormField.vue
│   │   │   └── FormFeedback.vue
│   │   ├── shared/
│   │   │   ├── PageState.vue
│   │   │   ├── QueryStatus.vue
│   │   │   ├── InformationPage.vue
│   │   │   └── PageBreadcrumb.vue
│   │   ├── auth/
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegistrationForm.vue
│   │   │   └── PasswordFields.vue
│   │   ├── organization/
│   │   │   ├── BranchSelector.vue
│   │   │   ├── CompanyDetailsForm.vue
│   │   │   ├── BillingDetailsForm.vue
│   │   │   ├── ContactPersonForm.vue
│   │   │   ├── StaffList.vue
│   │   │   └── InviteStaffDialog.vue
│   │   ├── catalog/
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductGrid.vue
│   │   │   ├── ProductFilters.vue
│   │   │   ├── ProductFilterFields.vue
│   │   │   ├── ProductDetails.vue
│   │   │   ├── ProductConfigurator.vue
│   │   │   └── RecommendedProducts.vue
│   │   ├── cart/
│   │   │   ├── CartDrawer.vue
│   │   │   ├── CartPreview.vue
│   │   │   ├── CartContents.vue
│   │   │   ├── CartLineSummary.vue
│   │   │   ├── CartItem.vue
│   │   │   ├── CartItemEditor.vue
│   │   │   ├── CartSummary.vue
│   │   │   └── VoucherField.vue
│   │   ├── checkout/
│   │   │   ├── CheckoutFlow.vue
│   │   │   ├── CheckoutDetailsForm.vue
│   │   │   └── CheckoutOrderSummary.vue
│   │   ├── orders/
│   │   │   ├── OrderList.vue
│   │   │   ├── OrderItems.vue
│   │   │   ├── OrderStatus.vue
│   │   │   ├── CancelOrderDialog.vue
│   │   │   └── OrderFeedbackForm.vue
│   │   ├── account/
│   │   │   ├── AccountNavigation.vue
│   │   │   ├── AddressForm.vue
│   │   │   ├── AddressList.vue
│   │   │   ├── ChangePasswordForm.vue
│   │   │   ├── PriceChart.vue
│   │   │   └── TopProducts.vue
│   │   └── landing/
│   │       ├── CategoryLinks.vue
│   │       └── ShoppingLinks.vue
│   ├── composables/
│   │   ├── catalog/
│   │   │   ├── useProductSelection.ts
│   │   │   └── useCatalogFilters.ts
│   │   ├── cart/useCart.ts
│   │   ├── checkout/
│   │   │   ├── useCheckout.ts
│   │   │   ├── useDeliveryOptions.ts
│   │   │   └── useMpesaPayment.ts
│   │   ├── organization/useShoppingContext.ts
│   │   └── orders/useReorder.ts
│   ├── api/
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── catalog.ts
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   ├── account.ts
│   │   └── landing.ts
│   ├── queries/
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── catalog.ts
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   ├── account.ts
│   │   └── landing.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── catalog.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   ├── account.ts
│   │   └── landing.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   ├── cart-persistence.ts
│   │   ├── shopping-context.ts
│   │   └── __tests__/
│   │       ├── cart.spec.ts
│   │       ├── persistence.spec.ts
│   │       └── shopping-context.spec.ts
│   ├── validation/
│   │   ├── auth.ts
│   │   ├── catalog.ts
│   │   ├── cart.ts
│   │   ├── organization.ts
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   └── account.ts
│   ├── utils/
│   │   ├── catalog/
│   │   │   ├── quantity.ts
│   │   │   ├── pricing.ts
│   │   │   ├── search.ts
│   │   │   └── __tests__/
│   │   │       ├── quantity.spec.ts
│   │   │       └── search.spec.ts
│   │   ├── cart/
│   │   │   ├── line-identity.ts
│   │   │   ├── calculations.ts
│   │   │   └── __tests__/calculations.spec.ts
│   │   ├── checkout/delivery.ts
│   │   └── orders/edit-eligibility.ts
│   ├── analytics/
│   │   ├── catalog.ts
│   │   ├── cart.ts
│   │   └── checkout.ts
│   └── lib/
│       ├── api.ts
│       ├── query-client.ts
│       ├── validation.ts
│       ├── currency.ts
│       ├── dates.ts
│       ├── analytics.ts
│       └── __tests__/
│           ├── api.spec.ts
│           ├── currency.spec.ts
│           └── dates.spec.ts
├── .env.example
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

## Application-wide pages and account approval

| Page | Responsibility |
| --- | --- |
| `pages/NotFoundPage.vue` | Router catch-all for an unmatched URL. Offer a clear way back to a valid page. |
| `pages/AccessDeniedPage.vue` | An authenticated user cannot access the requested resource or operation. Use it for a page-level permission denial; an action-level denial can stay beside the action. |
| `pages/ErrorPage.vue` | Recovery fallback when a page or application view cannot render/load. Offer safe navigation or a read retry where appropriate. |
| `pages/auth/AccountPendingApprovalPage.vue` | The signed-in account is awaiting approval, as indicated by existing account/company state. Explain that state and provide the supported sign-out/support actions. |

Keep authentication, authorization, account approval, and unexpected errors separate:

- A missing/expired session returns the user to login, retaining a safe return
  location where appropriate. It does not display a permission or approval page.
- Account approval guards use returned account/company state. Do not infer pending
  approval from every 403 or assume every inactive account is awaiting approval.
- Permission denial does not change approval status or log out a valid session.
  Guards must allow each fallback page to render without redirect loops.
- Use `components/shared/ErrorState.vue` for recoverable section/query failures;
  show field validation errors in their forms. Do not send every failed request to
  the application-wide error page. An error page does not automatically retry
  payment or order writes or clear cart/submission data.

V2's `AccessView.vue` is an account-under-review screen, so its responsibility maps
to `AccountPendingApprovalPage.vue`. If retaining the old `/auth/access-denied`
link, redirect it into the approval flow; give general permission denial a distinct
route. The frontend fallback pages do not create backend authorization guarantees
or change the existing account-approval policy.

Maintenance and offline pages are not part of the current capability scope. Add
one only if a supported operating flow later needs it. These choices define page
ownership and navigation; the progress section records what is implemented.

## Help and information pages

The following static pages are included in phase 1. Group them under `pages/help/`
and link them from shared navigation/footer where useful. They use approved company
content and do not require new backend endpoints, stores, or query modules.

| Page | Content |
| --- | --- |
| `HelpPage.vue` | FAQs and practical guidance for ordering, payment, and account/order tasks. |
| `ContactPage.vue` | Approved support channels and opening hours, using phone/email links rather than a submission form. |
| `DeliveryInformationPage.vue` | Delivery coverage, scheduling, and how charges are determined. Context-specific dates, slots, and fees remain part of checkout. |
| `ReturnsAndRefundsPage.vue` | Approved guidance on damaged goods, returns, and refund enquiries, with links to support. No automated return/refund workflow is added. |

Use the default PrimeVue presentation. These are content pages, separate from the
application-wide fallback pages and the interactive checkout/account flows.

## Folder responsibilities

| Location | Responsibility |
| --- | --- |
| `pages/<area>/` | Route entry components that assemble UI and composables. |
| `components/<area>/` | Focused business UI with explicit props and events. |
| `components/form/`, `components/shared/`, `components/layout/` | Standard form helpers, feedback, and shared application shell. |
| `composables/<area>/` | Stateful feature behavior and flow coordination. |
| `api/<area>.ts` | Typed requests through `lib/api.ts`; no navigation, dialogs, or notifications. |
| `queries/<area>.ts` | Query keys, fetching, mutations, invalidation, and cancellation. |
| `types/<area>.ts` | Handwritten transport types and frontend models. |
| `stores/` | Shared client state and persistence, without copies of query-owned server data. |
| `validation/<area>.ts` | Input rules and mapping of field errors. |
| `utils/<area>/` | Pure quantity, identity, calculation, and scheduling helpers. |
| `analytics/<area>.ts` | Existing feature tracking through a common integration. |
| `lib/` | Shared transport, query client, formatting, and integration setup. |
| Colocated `__tests__/` and `e2e/` | Focused rules/components and end-to-end capability checks. |

Reuse standard PrimeVue controls before writing wrappers. Extract components and
composables where responsibilities warrant it. Avoid a broad shopping store,
duplicate cart collections, utility barrels, and abstractions without a current
consumer. The agreed structure is a way to keep ownership clear, not an obligation
to split every small operation into another file.

Dependency direction: pages compose feature components and composables;
composables coordinate queries, client stores, validation, and pure utilities;
queries call API functions; API functions use the shared transport and types.
Stores own client state/actions, not remote fetching or navigation. Coordinate
session/context cleanup in the feature flow rather than creating store/router/API
import cycles. Query-owned records stay read-only to consumers, and nobody imports
implementation from a page. Cross-area reuse goes through the owning area's
query/action API or a pure helper, without another copy of its state.

### Vue boundaries for these flows

Pages compose queries, feature actions, and child components. Read-only props go
down; typed events carry user intent up. Children do not mutate parent/query data
or start payment by watching a prop. Use `v-model` for real form/edit bindings.

| Boundary | Inputs and outputs |
| --- | --- |
| Product grid/card | Read products and display state; emit selection/favourite intent. Fetch a listing once through its query owner, not independently in every card. |
| Product configurator | Read product options/rules; keep a local draft; emit a validated configured selection for the cart action. |
| Cart item/editor | Read a line and edit rules; emit quantity/specification/split/remove intent. The cart action applies validated changes. |
| Delivery section | Read addresses, company options, and checkout form values; emit changes and validation feedback. It does not own a cart. |
| Payment section | Read eligible methods and pending status; emit payment choice/details. The checkout coordinator initiates payment. |
| Order review | Read the prepared submission and totals; emit submit intent. It does not recalculate a different total or call endpoints itself. |

Keep pure calculations in utilities and derived views in `computed`; watchers are
for effects, with cleanup for requests/timers. Preserve reactive store access via
store properties or `storeToRefs`. Product/category route inputs must remain
reactive query inputs so navigating to another product in the same page instance
loads the new data. Async guards await account/context readiness and return a
clear route result without redirect loops.

## Catalog, cart, and checkout responsibilities

| Area | Owns |
| --- | --- |
| Catalog | Listings, categories, search/filtering, product details, recommendations, favourites, and valid product configuration. |
| Cart | One client-side selection collection, line identity, add/edit/split/merge/remove actions, voucher selection, and displayed basket calculations. |
| Checkout | Delivery and payment choices, review, existing payment/order endpoint coordination, submission feedback, and handoff to confirmed orders. |

Catalog provides a configured selection to cart. Cart exposes selections to
checkout. Checkout does not maintain another editable cart, and orders owns the
resulting purchase history and post-purchase actions.

### Catalog

- Model grade/unit relationships, allowed specifications, minimums, and fractional
  quantities clearly, using existing contracts and required business rules.
- Separate product fetching from selection drafts and keep shared quantity logic
  in pure utilities. Search/filter behavior may be simplified or improved without
  adding a backend search requirement.
- Show applicable prices and promotions from the available data. Do not treat a
  frontend price estimate as a new server-backed guarantee.

### Cart

- Use one Pinia owner for local selections and a small persistence helper. Server
  cart adoption stays in phase 2; this phase does not require a cart API/query file.
- Define line identity and quantity edits explicitly, handling valid configurations
  and sale/regular price portions without copying unnecessary v2 representations.
- Use one calculation path for basket feedback and review. Separate UI edits from
  saved client state, validate before applying changes, and handle persistence errors.
- Define v3 storage deliberately. V2's exact storage keys, object shape, migration
  code, and reset quirks are not architecture requirements. If existing browser
  selections need carrying over for rollout, use a small, explicit compatibility
  step; do not silently discard user data or build a server-cart migration here.

### Checkout

- Compose delivery, payment, order review, and submission behavior independently.
  Improve validation order and feedback so customers can resolve issues before
  taking the next action.
- Use supported delivery methods, addresses, dates, slots, cutoffs, recurring dates,
  partner scheduling, and permitted payment choices. Keep applicable date rules
  and calendar-date handling consistent with the backend's Africa/Nairobi context.
- Follow the existing backend payment dependency: initiate M-Pesa with the required
  payload, read collection status, and submit the order with the required successful
  collection reference. Support the existing credit/COD paths where eligible.
- Disable repeated submit/payment clicks while a request is active and avoid
  automatic payment/order write retries. Keep selections and the payment reference
  tied to the client submission being processed; later edits or branch switches
  cannot alter it. These are frontend safeguards, not a guarantee against duplicate
  charges/orders across sessions or an unknown server outcome.
- Improve pending, failure, unconfirmed-payment, retry, and success feedback within
  existing API capabilities. V2's exact dialogs, polling constants, and manual
  reference-entry UI are not requirements. Never present reference text alone as
  verified payment or claim recovery capabilities the backend does not provide.
- Render both single- and multiple-order results. Clear cart selections only after
  confirmed order creation, accounting for any newer client edits.

These are frontend responsibilities against current contracts. A server quote,
price hold, inventory reservation, or backend reconciliation worker is phase 2 work.

## Flow through the existing endpoints

Paths below are relative to the configured API base. This map comes from the
existing routes/controllers; it adds no endpoints. API modules follow the operation's
owner even when operations share a URL prefix: order placement belongs in
`api/checkout.ts`, while order history belongs in `api/orders.ts`.

| Flow | Existing endpoint or local operation | Frontend owner |
| --- | --- | --- |
| Browse/configure | `GET /ecommerce/products`, `GET /ecommerce/products/list`, `GET /ecommerce/products/{id}`, `GET /ecommerce/config/categories`, `GET /ecommerce/recommendations` | `api/catalog.ts`, `queries/catalog.ts`, catalog composables/components. |
| Favourites | `GET /ecommerce/wishlist`; `GET /ecommerce/wishlist/{id}/add`; `DELETE /ecommerce/wishlist/{id}/delete` | Catalog queries for reads; explicit mutations for add/delete, even though add uses GET. |
| Cart edits | Local add/edit/split/merge/remove and persistence; no server-cart calls | `stores/cart.ts`, `composables/cart/useCart.ts`, cart validation/utilities. |
| Voucher feedback | `GET /ecommerce/vouchers` and `/ecommerce/vouchers/{code}` | Shared checkout API/query functions consumed by cart/checkout; selected code is client state. A valid read is not a reserved discount. |
| Branch/company setup | `GET /ecommerce/company/branches`, `GET /ecommerce/company` | Organization queries/context; only dependent endpoints receive authorized branch context. |
| Delivery addresses | `GET /ecommerce/addresses` and its existing create/update operations | Account API/queries, consumed by checkout. |
| M-Pesa initiation/status | `POST /ecommerce/checkout/init-mpesa-checkout`; `GET /ecommerce/checkout/collections/{id}` | Checkout API/query layer and payment composable. |
| Place order | `POST /ecommerce/orders` | Checkout coordinator and mutation; normalize single/multiple-order success. |

Catalog flow: load categories/products, narrow the listing, choose valid options,
then add through the cart action. The listing endpoint returns a full array, not
a paginated search response; use supported server filters and client-side search/
pagination without inventing search/page parameters. `/products/list` is a smaller
payload, not interchangeable with full product details. Unavailable detail responses
must leave an understandable state instead of an invalid selection.

Cart flow: validate the configured selection, apply an explicit local action,
derive line portions and basket feedback, and persist the result. Use variant,
processing, and normalized specifications for selection identity; keep display
price portions distinct from submitted selection identity. Cart owns selections,
editing, and basket calculations. It does not own order HTTP payloads or payment.

Checkout prepares the order payload from a read-only copy of those selections and
checkout choices. Its single payload mapper combines display portions for the same
submitted selection into `products`, sending `product_unit_variant_id`,
`order_quantity`, optional `processing_type_id`, and `specifications`. Display-only
cart fields are not API fields. Order review and payment use the same frontend
calculation result; they do not maintain separate basket formulas.

Checkout flow: resolve context and choices, validate required inputs, prepare a
read-only client submission, and show review. For M-Pesa, send `amount` and
`mpesa_number`, retain the returned collection ID, then read its status. The order
controller requires exact `success`; do not map `completed` to order-ready merely
because v2 did. Send `payment_type: mpesa` and `payment_collection_id` with the
prepared order. Credit/COD skips external payment initiation. Normalize
`{ order }` and `{ orders, total_orders_created }` into one frontend orders array.

A pending status or a network/polling timeout stays unconfirmed. Status GET reads
local collection state; it is not provider reconciliation. Do not automatically
replay an uncertain initiation/order POST or promise end-to-end idempotency. Keep
the attempt reference and client submission separate from editable cart/form state.
Disable conflicting context changes while an attempt is active or isolate their
callbacks from the new context. Frontend fixes cannot create backend guarantees.

No dedicated delivery-slot, payment-method-discovery, or quote route was identified
in the reviewed ecommerce routes. Derive choices from available company/address
configuration and confirmed rules. In particular, nullable pickup validation does
not establish an address-free order: the current controller still looks up an
address. Use a supported payload; keep changing that backend behavior in phase 2.
Where displayed fees/vouchers differ from server calculation, record the mismatch
and align what current data supports; do not label client totals a guaranteed quote
or silently introduce a new shipping/tax/discount policy.

## State and cross-feature ownership

| State or operation | Owner |
| --- | --- |
| Products, favourites, addresses, company configuration, profiles, orders, and other fetched records | TanStack Vue Query. |
| Session token and client session lifecycle | Auth store and transport, using current authentication requirements. |
| Selected branch/context | Organization context store; fetched branch records remain query-owned. |
| Client cart and persistence | Cart store and persistence helper. |
| Product/form/edit drafts | Local state or PrimeVue Forms; Pinia only when state must be shared. |
| Search, filters, and pagination | Local or route state chosen for a clear flow; retain compatibility for meaningful existing links. |
| Checkout coordination and pending submission | Checkout composable with explicit status and submission data. |

Auth owns session and account-access flow. Organization owns branch selection,
company/billing/contact/staff operations. Account owns addresses, invoices, credit
notes, and reporting. Orders owns history, details, editing, cancellation, feedback,
and reorder; reorder delegates additions to cart.

Resolve branch selection before dependent operations, scope requests only as the
existing endpoints support, and include their actual context in query keys. Handle
logout, stale results, in-flight requests, and late callbacks consistently. A clean
frontend context layer does not make home-company catalog endpoints branch-aware.
On a branch change, refresh dependent queries and revalidate address, voucher,
delivery, and payment choices. Keep late responses tied to their original context.
The local cart is not a set of isolated branch carts; introducing that ownership
model remains phase 2.

Routes and layouts may be simplified. Retain meaningful external links and token/
signature parameters for invitation, password reset, invoices, and similar flows,
using compatibility redirects where needed. Internal route names, v2 test pages,
and its exact number of layouts are not preservation requirements. Do not change
backend registration eligibility or enable a flow merely because a v2 file exists.

## Capabilities to cover

Use the existing application and endpoints, plus the agreed static information
pages, to check coverage of:

- Account access, onboarding where enabled, invitation, password recovery, and
  required company/account details.
- Catalog, product selection, favourites, recommendations, and local cart.
- Static Help, Contact, Delivery Information, and Returns and Refunds pages.
- Pricing inputs, vouchers, quantities, delivery rules, checkout, and supported
  payment/order operations.
- Orders, edit/cancel/reorder where supported, recurring orders, partner delivery,
  invoices, credit notes, addresses, and existing account reports.
- Maps/address entry, charts, document/QR display, feedback, and analytics where
  needed by these capabilities. Retain integrations because the capability needs
  them, not because every v2 dependency must be copied.

This is a capability checklist, not a requirement to reproduce every v2 screen,
visual detail, developer route, interaction, or implementation defect.

## Skills audit for this work

| Skill | Use and boundary |
| --- | --- |
| `vue-best-practices` | Applied to this review: typed Composition API, thin pages, component boundaries, explicit data flow, pure derivations, and composables. |
| `vue-pinia-best-practices` | Applied to client cart/session/context ownership, reactive access, and explicit actions; query data remains query-owned. |
| `vue-router-best-practices` | Applied to reactive product/category inputs, awaited context guards, and navigation cleanup. |
| `vue-testing-best-practices` | Applied to the planned acceptance checks: test visible behavior, emitted intent, request payloads, and failure paths, not v2 screenshots or component internals. The progress section records the implemented foundation checks. |
| `tailwindcss-development` | Applied to utility usage and layout conventions. Its v3-specific setup examples do not apply to the agreed v4 stack; follow the checked reference setup and version-matched docs. |
| `primevue:primevue-router` and focused PrimeVue skills | Select the narrow skill when implementing: setup for integration, component implementation for forms/controls, theming for Aura/Tailwind integration, accessibility for component behavior. Use current component metadata and API validation during implementation, together with project type/build/browser checks. |
| `create-adaptable-composable` | Available when a concrete reusable composable needs reactive/ref/getter inputs. Do not turn every application helper into a library API. |
| `vue-debug-guides`, PrimeVue audit, `accessibility-audit` | Use for concrete runtime/component/accessibility checks once screens exist; no blanket implementation audit is claimed now. |

Brand-kit, design-elevation, dark-mode generation, Figma, Nuxt-specific approaches,
and backend implementation/testing skills are not needed for this planning scope.
Skill suggestions cannot add features or override the agreed stack.

## Delivery and verification

For each requested implementation slice:

1. Map supported endpoint operations, payloads, account states, and required
   capabilities. Use v2 callers as supporting evidence, not as the design contract.
2. Set up the agreed Vue/TypeScript foundation, default PrimeVue preset, transport,
   state ownership, and folder separation.
3. Implement small slices: auth/context, catalog, cart, checkout, then remaining
   account/order capabilities and the agreed static help pages. Choose clear flows
   and fix frontend mistakes within the existing contracts as each slice is built.
4. Check critical rules, state transitions, endpoint payloads, error handling, and
   supported customer journeys with focused tests, type checking, and a build.
   Include product-param navigation, failed cart edits, fractional/sale portions,
   wishlist mutation invalidation, branch changes, payment pending/failure/unknown
   outcomes, duplicate-click prevention, and single/multiple-order success. Include
   unmatched URLs, permission denial, account awaiting approval, expired sessions,
   and page-versus-inline error handling without redirect loops. Test
   outcomes and requests rather than private store fields or component layout.

Acceptance is capability coverage, correct integration with the existing APIs,
clear frontend flows, and the agreed stack/structure. Confirm that the agreed
pages and capabilities are covered, client/server state has one owner, the core
catalog-to-cart-to-checkout journey works, and focused checks/type checking/build
pass. There is no v2 screenshot, exact UI sequence, or internal-code parity
requirement, and no phase 2 backend capability is a completion gate. Visual
customisation can be a separate later task.

The phase 1 frontend capability slices are implemented. See the verification record
for check results and current configuration/contract limits. Backend changes and
stronger commerce guarantees remain separate phase 2 work.

## Reference material

- [Existing backend contract review](rebuild-plan.md#appendix--existing-backend-contract-review-15-oct-2026).
- [Ecommerce routes](/home/blackmamba/Code/ftf-backend-v2/routes/ecommerce.php).
- [Products contract](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Products/ProductsController.php).
- [Order submission contract](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Orders/OrderController.php).
- [Payment initiation/status contract](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/PaymentOnCheckout/PaymentOnCheckoutController.php).
- [PrimeVue Tailwind integration](https://primevue.dev/tailwind).
- [V2 routes and capabilities](/home/blackmamba/Code/ftf-ecommerce-v2/src/router/index.js).
- [V2 auth redirects](/home/blackmamba/Code/ftf-ecommerce-v2/src/router/authNavigation.js) and [account-under-review screen](/home/blackmamba/Code/ftf-ecommerce-v2/src/views/auth/AccessView.vue).
- [V2 shopping requests](/home/blackmamba/Code/ftf-ecommerce-v2/src/api/shoppingApi.js).
- [V2 checkout integration](/home/blackmamba/Code/ftf-ecommerce-v2/src/views/checkout/CheckoutView.vue).
- [FTF Lab application setup — built-in Aura preset](/home/blackmamba/Code/ftf-lab-erp/src/main.ts).
- [FTF Lab stack](/home/blackmamba/Code/ftf-lab-erp/package.json).
- [FTF Lab Vite integration](/home/blackmamba/Code/ftf-lab-erp/vite.config.ts) and [Tailwind/PrimeUI stylesheet](/home/blackmamba/Code/ftf-lab-erp/src/assets/main.css).
- [Vue best practices skill](/home/blackmamba/.agents/skills/vue-best-practices/SKILL.md), [Pinia skill](/home/blackmamba/.agents/skills/vue-pinia-best-practices/SKILL.md), [Router skill](/home/blackmamba/.agents/skills/vue-router-best-practices/SKILL.md), [testing skill](/home/blackmamba/.agents/skills/vue-testing-best-practices/SKILL.md), and [Tailwind skill](/home/blackmamba/.agents/skills/tailwindcss-development/SKILL.md).
- [Architecture references, including Shopware folder separation](rebuild-plan.md#reference-material).

Registration/onboarding source references:
- [Existing auth controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Api/Auth/AuthController.php) and [registration/invitation service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Auth/AuthService.php).
- [Company update controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Company/CompanyController.php), [address controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Addresses/AddressController.php), and [company categories](/home/blackmamba/Code/ftf-backend-v2/app/Enums/CompanyCategory.php).
- [PrimeVue Forms](https://primevue.dev/forms), [Select form binding](https://primevue.dev/select), and [custom file upload](https://primevue.dev/fileupload).

Catalog source references:

- [Products and publication checks](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Products/ProductsController.php), [category visibility](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Config/ConfigController.php), and [wishlist operations](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Wishlist/WishlistController.php).
- [Recommendation response](/home/blackmamba/Code/ftf-backend-v2/app/Services/RecommendationModels/RecommendationService.php), [group pricing](/home/blackmamba/Code/ftf-backend-v2/app/Services/CustomerGroupPricing/CustomerGroupPricingService.php), and [existing order price portions](/home/blackmamba/Code/ftf-backend-v2/app/Services/Order/OrderService.php).
- [Existing quantity rules](/home/blackmamba/Code/ftf-ecommerce-v2/src/utils/quantity-rules.js), [promotion dates](/home/blackmamba/Code/ftf-backend-v2/app/Services/FlashSalePricing/FlashSalePricing.php), and [backend timezone](/home/blackmamba/Code/ftf-backend-v2/config/app.php).
- [PrimeVue InputNumber](https://primevue.dev/inputnumber) and [Paginator](https://primevue.dev/paginator), alongside the Select/InputText/Button/Message metadata. Final API validation passed for all six checked components; project build and desktop/mobile checks cover integration separately.

Local-cart source references:

- [Existing quantity rules](/home/blackmamba/Code/ftf-ecommerce-v2/src/utils/quantity-rules.js) and [dairy add cutoff](/home/blackmamba/Code/ftf-ecommerce-v2/src/composables/useOrderCutoffs.js).
- [Voucher controller](/home/blackmamba/Code/ftf-backend-v2/app/Http/Controllers/Ecommerce/Orders/VoucherEcommerceController.php), [coupon response fields](/home/blackmamba/Code/ftf-backend-v2/app/Models/Promotions/Coupon.php), and [eligibility/redemption service](/home/blackmamba/Code/ftf-backend-v2/app/Services/Promotions/CouponsService.php).
- [Order pricing and included-VAT algorithm](/home/blackmamba/Code/ftf-backend-v2/app/Services/Order/OrderService.php) and [existing frontend basket calculation/minimum](/home/blackmamba/Code/ftf-ecommerce-v2/src/composables/useCart.js).
- [PrimeVue Drawer](https://primevue.dev/drawer), [InputNumber](https://primevue.dev/inputnumber), [Select](https://primevue.dev/select), [InputText](https://primevue.dev/inputtext), [Button](https://primevue.dev/button), and [Message](https://primevue.dev/message): current MCP component metadata and final usage validation were applied.
