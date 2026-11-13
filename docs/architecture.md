# Frontend architecture

The implementation is in `/home/blackmamba/Code/ftf-ecommerce-v3`.

Plain Vue 3 and explicit Vue Router routes compose the application. TypeScript,
Pinia, TanStack Vue Query, PrimeVue Forms/Zod, the local Aura-derived FTF preset, Tailwind
CSS v4 and VueUse remain the foundation. No Nuxt, feature modules, generated
backend schemas or copied v2 styling is required. Local theme source and its
compatibility boundary are documented in `src/theme/ftf/PROVENANCE.md`.

## Folder ownership

| Folder                          | Implemented responsibility                                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/`                        | Route entry compositions, grouped by landing, auth, organization, catalog, cart, checkout, orders, account, help and legal. NotFound/AccessDenied/Error remain application-wide pages. |
| `components/`                   | Feature UI and forms; shared status/field feedback; header/footer.                                                                                                                     |
| `layouts/`                      | Storefront shell, auth presentation and account navigation.                                                                                                                            |
| `composables/`                  | Session/context, catalog selection, cart coordination, checkout attempts and scoped reads/writes.                                                                                      |
| `api/`                          | Existing endpoint requests and runtime response validation.                                                                                                                            |
| `queries/`                      | Context-aware query options and existing feature query factories.                                                                                                                      |
| `types/` / `validation/`        | Handwritten response and input contracts.                                                                                                                                              |
| `stores/`                       | Session token, selected branch, local cart selections and checkout attempt coordination.                                                                                               |
| `utils/`                        | Pure selection, price, quantity, delivery/date, document URL and chart rules.                                                                                                          |
| `content/legal/`                | Existing policy text as local text blocks; no backend HTML execution.                                                                                                                  |
| `e2e/` / colocated `__tests__/` | Browser journeys and focused unit/contract checks.                                                                                                                                     |

The plan's supporting filenames illustrate responsibilities. Empty folders and
placeholder modules are not implementation requirements.

## State and flow

Catalog and account records remain in Vue Query. Pinia never becomes another
copy of the fetched product, company, address or order database. Components own
editable form drafts. Query keys include the current session revision; acting-
company reads also include the selected branch. Endpoint scope determines whether
a request receives a branch ID.

The cart stores selections and quantities under the signed-in user. It derives
prices from the current catalog. Checkout consumes that cart and captures one
immutable submission; it does not create another editable cart. Confirmed order
creation clears the local cart only if its owner and revision still match.

A checkout reference is written before a payment/order request. Status polling
uses GET requests for at most two minutes while the checkout page is active.
Unknown outcomes never automatically replay a write. Refresh restores the minimal
reference but cannot reconstruct an order payload. A customer can check payment
status, inspect orders, and contact support. This is tab-local frontend recovery,
not a backend reconciliation or idempotency guarantee.

Orders owns history, details, edits, cancellation, feedback and reorder. Reorder
resolves current products/options and commits available selections atomically to
the cart after review. Account owns profile, company details, staff, delivery
addresses, invoices, credit notes and reports. Existing contact/billing/address
forms are reused rather than copied into new feature modules.

Signed invoice and credit-note URLs retain their signature parameters and use
public, tokenless reads. Their errors do not become private session-expiry events.
Information/legal pages remain accessible without sign-in or approval. Mutations
capture their original context so late results cannot overwrite a replacement
session, selected company, route draft or newer cart.

## Deliberate integration boundaries

Location entry uses explicit browser geolocation or validated manual coordinates.
Reports use server-provided data, simple SVG and equivalent accessible tables.
Documents use browser printing/PDF saving and a local QR encoder. There are no
hardcoded map credentials, invented pickup locations, remote QR services or copied
analytics identifiers. External analytics transmission was not enabled; see the
verification record for the automatic approval-review restriction.

## UI composition

The shared header, main content, footer and mobile cart action bar use
`max-w-8xl` (90rem / 1440px at the default root font size), defined once through
`--container-8xl` in `src/assets/styles/main.css`, with existing responsive page
padding. Header and footer borders/backgrounds span the viewport; their inner
content aligns with main content. Category navigation inherits the header container.
Account panels retain `max-w-2xl`, auth forms `max-w-lg`, and branch selection
`max-w-xl`. The checkout form and summary together retain a narrower `max-w-7xl`
container. Theme configuration, colours and typography are unchanged.

The header owns shared search, category navigation, account access and the mini-cart.
Its layout follows the supplied storefront screenshots: shared store identity,
integrated search, customer name and consistent favourites/account/cart icons on the first
row, then a single scrolling category row with an active underline. HeaderSearch
retains query-backed searches using PrimeVue IconField, InputIcon and InputText,
with live catalog filtering and Enter submission. Aura manages icon placement and
input spacing (https://primevue.dev/iconfield/); the icon is decorative.
CatalogNavigation owns scrolling and its vertical mobile variant. StorefrontIdentity is reused by the header and footer. Only the
cart displays a quantity badge, from the existing local cart; actions retain
accessible names. The favourites shortcut does not fetch its own count.
The footer groups existing Shop, Account and Support routes beside the store
identity, with Terms and Privacy on a separate legal row. The user-supplied delivery message
reads “Order before 22:00 for next-day delivery”; the Support column retains the
existing Delivery information link. Unsupported screenshot links are omitted. Aura configuration, colour tokens,
font family and the agreed container width remain unchanged.

AccountLayout shares navigation across account and order pages without moving their
route files. The mobile variants use PrimeVue drawers and restore keyboard focus
when closed. Query-backed search and filters retain their URL state.

CartContents owns the editable full cart. CartPreview shows at most five lines and
links to the full cart. Both views reuse CartItem for images, name/grade, unit
prices, quantity inputs and removal. The compact drawer keeps option editing in
the full cart. useCart shares quantity validation, stale-context checks and input
recovery between both views. Empty drawers do not show a disabled product-query
loading state. CartLineSummary shares read-only variant/quantity/price
presentation with checkout. CheckoutOrderSummary keeps totals visible and large
basket reviews compact; CheckoutDetailsForm keeps its delivery/payment draft while
resizing. The existing API, validation and calculation contracts remain in place.
Quantity-only cart edits retain their original row position and use the existing
validated, atomic local-storage commit. Aura configuration and the global colour/font stylesheet are unchanged.

The catalog follows the public PrimeBlocks Category Pages example, “With Dropdown
Filter and Hover CTA” (https://primeblocks.dev/ecommerce/categorypage): a grouped
page heading, horizontal desktop filters and sorting, and a full-width product
grid. Mobile filters use the existing drawer.
Catalog filters cover category and grade, using canonical grade IDs from active
product variations with an active unit. Retired unit/express URL parameters are
removed from old links. Filtering remains local to the existing product response.
Product tiles have no outer card frame; images, metadata, prices and actions share
consistent positions. Add to cart opens a PrimeVue Dialog in the listing, reusing
ProductConfigurator and useCart for grade, unit, quantity, optional preparation,
validation and local-cart persistence. ProductGrid owns one active dialog and
returns focus to its triggering button after closing. Successful additions show
feedback with a View cart link; failed saves retain the draft. Image and name
links open product details. The same interaction applies to favourites and
recommendations. Recommendations are a separate section below the listing. Existing search,
filter, pricing, favourites and pagination contracts remain in place.

PrimeVue component metadata was checked against the routed Button, Select,
Checkbox, Drawer, Tag, Paginator and Skeleton documentation at
https://primevue.dev/. Six component validations passed. The Button validator
flags the `to` attribute forwarded to `RouterLink` through its documented `as`
component prop; that integration passes the project type check and browser
navigation checks. The final catalog checks passed: production build, targeted
lint/format checks, 101 unit tests, 22 desktop/mobile catalog flow tests, and six
responsive/filter/B2B basket browser tests. Layout previews use mocked API data
and test-only images; no live backend mutations were exercised.

Cart and checkout follow the public PrimeBlocks Shopping Cart “Full Width” example
(https://primeblocks.dev/ecommerce/shoppingcart) and Checkout Form “2 Columns”
example (https://primeblocks.dev/ecommerce/checkoutform). Compact cart rows expose
quantity editing beside a combined product-name/grade heading and line estimate.
Price per unit appears beneath the heading, including processing costs and a
range when sale and regular portions have different prices. Edit options shows
only changeable processing/specification fields; quantity stays in the cart row.
Split editing retains a quantity input to allocate the new part. Description,
fixed Grade/Unit selectors and product-estimate cards are omitted from cart
editors. Items without options omit Edit/Split actions; stale saved options can
still be cleared. Item price breakdowns are omitted. Totals use an unboxed sticky
desktop column and the existing mobile checkout action. Large checkout item lists start collapsed and scroll within a
bounded review, while delivery/payment and submission remain in one form across
breakpoints. Delivery and permitted payment methods use labelled radio controls;
a valid saved default address is selected when returned by the existing API.
The products estimate excludes the separately displayed delivery fee per order.
No backend cart, quote, reservation or payment contracts are introduced.

Cart/checkout validation passed the production build, targeted lint/format checks,
102 unit tests, all 78 cart/commerce desktop/mobile regression cases (two were
rerun after the build replaced assets during the first run), and four responsive
checkout/35-item basket cases. Rendered layouts were reviewed at 320, 390, 768 and
1280px with light/dark previews. Six PrimeVue component validations passed; the
Button metadata warning remains limited to RouterLink's forwarded `to` attribute.
Browser checks use mocked APIs and do not create live orders or payments. The
existing invalid PrimeUI licence warning remains visible and needs a valid licence
configuration separately.

The focused cart-option/unit-price update passed build/type checking, lint/format,
102 unit tests, and 54 desktop/mobile browser cases across cart, catalog, order
editing and checkout (including the 35-item basket). Size-only editors were
visually reviewed at 1280, 390 and 320px. Current Select, InputNumber and Button
usage passed PrimeVue MCP validation against https://primevue.dev/select,
https://primevue.dev/inputnumber and https://primevue.dev/button. Existing pricing
calculations and backend contracts are unchanged.

Account and order layouts use the public PrimeBlocks Setting screen “Profile”
(https://primeblocks.dev/application/settingscreen), Form Layout “Two Columns and
Stacked” (https://primeblocks.dev/application/formlayout), Order History “Row
Expansion” (https://primeblocks.dev/ecommerce/orderhistory), and Order Detail Page
“Simple” (https://primeblocks.dev/ecommerce/orderdetailpage) as layout references.
The history reference supplies aligned metadata rows; existing order-detail routes
remain the way to open an order rather than adding a second expansion workflow.
Their sample branding, colours, fonts, retail images and unsupported actions are
not copied. Existing Aura configuration and global colour/font rules remain unchanged.
The shared storefront width is documented under UI composition above.

AccountLayout owns shared grouped navigation, company context, breadcrumbs and
its mobile drawer. Account details uses PrimeVue tabs for Profile, Preferences,
Company, Team and Security. Inactive panels remain mounted so drafts survive
switching tabs and resizing. ProfileForm saves personal details; AccountPreferences
keeps contact preferences and billing notifications as separate requests.
Company details, team and password forms retain their existing validation and
scope. Delivery-address editing uses a separate drawer, preserves zero-valued
coordinates, and restores trigger focus after closing. A focused field is blurred
before the form unmounts so PrimeVue Forms processes its last change safely.

Orders/invoices and credit notes use Aura DataTable/Column on desktop and compact
rows on mobile, with their existing server pagination and filters. Displayed
filter drafts now follow route changes, including browser back/forward and clear.
Invoices retain the existing eligibility filter and explain that the list contains
issued documents from the current orders-results page. Order details groups
status, delivery and payment metadata above the order, keeps desktop totals beside
the item table, and puts mobile totals before long item lists. Order editing
retains product configuration, validation and explicit save behavior; its row
actions move below the product summary on narrow screens. Invoice and credit-note
documents share private account navigation while signed public documents remain
standalone. Printable table quantities, server totals, safe document links and QR
handling are unchanged.

Account/order validation passed the production build and type check, targeted
lint/format checks, 102 unit tests, and 62 desktop/mobile account/commerce cases.
The final mobile row/summary adjustment passed eight focused cases. Tests cover
all account/order pages at 320, 390, 768 and 1280px, 35-item orders, draft retention,
keyboard activation, drawer focus, filter history, printing and signed-document
isolation. Rendered light/dark screenshots were reviewed. PrimeVue metadata
validation passed DataTable, Select, InputText, Textarea, Tag, Paginator, Drawer,
Checkbox, InputNumber and Tabs (https://primevue.dev/). Column is documented in the
DataTable API rather than as a separate MCP component. The Button validator still
flags only RouterLink's forwarded `to` prop; project type/build/navigation checks
cover that integration. All browser actions use mocked APIs; live company,
account, order and payment changes were not performed. The existing PrimeUI
licence warning remains visible.

Header/footer checks passed the build/type check, targeted lint/format checks and
102 existing unit tests. The shared-shell regression run passed 154 desktop/mobile
cases; the icon/copy refinements passed 28 focused UI cases. Removing the added
header/footer surface and avatar colour overrides then passed six final shell
cases, including light/dark inheritance and 320–1440px previews. Global Aura and
font configuration were not edited. PrimeVue Button, Avatar and Badge usage was
validated against routed metadata (https://primevue.dev/button/,
https://primevue.dev/avatar/, https://primevue.dev/badge/). All browser API calls
were mocked; live backend changes were not performed. The existing licence
warning remains visible.

## Authentication layout

Auth routes now use AuthLayout instead of the storefront shell. The structural
reference is v2's AuthSplitShell, LoginView, onboarding views, check-email page and
approval page: a full-height desktop split, a stationary identity/information
column, a centred form column, and a single column on mobile. Check-email and
awaiting-approval use the centred status layout. Existing session, branch and
recovery controls remain available in AppHeader; storefront search, categories,
cart and footer are absent from these focused pages. Guest auth headers do not
repeat a sign-in link.

On desktop, the logo sits directly above the introductory message as one centred
group. The right form column uses Aura surface-50 in light mode and surface-900
in dark mode to distinguish the split. Mobile and centred status pages retain
their page background. Typography and the global Aura preset are unchanged.

AuthIntroduction supplies the information panel with v2's message and benefit
arrangement using existing PrimeIcons and Aura text colours. AccountSetupNavigation
shares the existing three setup steps between the desktop side panel and mobile
progress navigation. No v2 theme, fonts, imagery, analytics, authentication logic
or backend contracts were copied. Current form cards were removed; password
recovery is beside the password label; alternative sign-in and registration links
follow the v2 composition. Registration/invitation fields use responsive columns.
Onboarding opts into two columns on the existing organisation forms; their account
page defaults stay unchanged, and delivery-location controls span the form width.
All current validation, errors, loading states, scoped writes, approval rules and
late-response safeguards are retained.

Auth layout verification passed the production build/type check, targeted lint and
format checks, two existing recovery-form unit tests, and all 52 auth/onboarding
browser cases. The final header and delivery-field refinements passed 12 focused
desktop/mobile cases, including the shared account forms and public navigation.
Rendered previews were reviewed at 320, 768 and 1280px in light and dark modes.
Only mocked endpoints were exercised; no live auth, account or backend changes
were performed. The existing PrimeUI licence warning remains visible.

## Storefront landing composition

The landing page follows the hierarchy reviewed in PrimeBlocks Storefront Page #1
(https://primeblocks.dev/ecommerce/storefront): shopping banner, category previews,
product selection and secondary shopping shortcuts. LandingHero reuses an existing
v2 produce photograph, current Aura controls and the original heading/body styles.
LandingCatalog reuses the existing catalog queries, pricing clock and ProductGrid.
Only visible products from the current catalog can appear in recommendations;
unknown, unpublished and inactive IDs are excluded and duplicate IDs are removed.
Without usable recommendations, a regular catalog selection is shown. There are
no invented campaigns, discounts or product rankings. Category previews use real
catalog images where available, with six previews and the full category navigation
retained in the header. Guest visitors see sign-in, account request and onboarding
information without protected catalog requests.

The separate Shopping help / Manage your account / Account setup link row was
removed at the user's request. Help and account navigation remain in the shared
header/footer. Theme configuration, colours and typography are unchanged. The shared
storefront width is documented under UI composition above. Landing functionality
uses existing endpoints and local cart state; external analytics remain disabled.

CompanyContext is shared by the landing page, catalog, products, cart, checkout,
account/orders and branch selection. Its “Shopping for…” message appears only for
a parent account with a valid selected branch, ready company data and a matching
branch/company ID. Independent customers do not see the message. Loading, errors
and retry feedback remain available for both account types. No backend behavior
or branch-selection contracts were changed.
