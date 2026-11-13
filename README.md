# FTF ecommerce v3

Phase 1 frontend rebuild in `/home/blackmamba/Code/ftf-ecommerce-v3`.
Plain Vue 3/Vite, TypeScript, explicit Vue Router routes, Pinia, TanStack Vue Query,
PrimeVue Forms/Zod, the local Aura-derived FTF theme, Tailwind CSS v4 and VueUse.

## Run locally

Use Node `^22.18.0` or `>=24.12.0` and npm.

```sh
npm ci
npm run dev
```

The local `.env` was copied from v2, is Git-ignored and remains mode `600`.
For a fresh checkout, copy `.env.example` to `.env`. `VITE_API_URL` includes the
existing `/api` prefix. Browser `VITE_` values must contain public configuration
only. Configure `VITE_PRIMEUI_LICENSE_KEY`: the copied environment currently lacks
it and PrimeVue displays **Invalid PrimeUI License**. No licensing bypass is used.

## Implemented routes

| Area                       | Entry points                                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing and account access | `/`, `/auth/login`, `/auth/register`, invitation, password/OTP recovery and approval/setup routes.                                                                                        |
| Shopping                   | `/catalog`, `/catalog/category/:categoryId`, `/catalog/products/:productId`, `/favourites`, `/cart`, `/checkout`, `/checkout/success`.                                                    |
| Orders                     | `/orders`, `/orders/:id`, `/orders/:id/edit`; existing order/edit links retain aliases.                                                                                                   |
| Account                    | `/account`, `/account/addresses`, `/account/invoices`, `/account/credit-notes`, `/account/insights`, `/account/impact`.                                                                   |
| Documents                  | `/account/invoices/:id`, `/account/credit-notes/:id`; emailed `/order/invoice/:id?signature=…`, `/order/invoice-new/:id?signature=…` and `/credit-note/:id?signature=…` remain supported. |
| Information                | `/help`, `/contact`, `/delivery-information`, `/returns-and-refunds`, `/privacy-policy`, `/terms-and-conditions`.                                                                         |
| Application-wide states    | Not found, access denied, render/request recovery, and account awaiting approval remain distinct.                                                                                         |

Parent accounts select a returned branch before shopping. Existing home-company
catalog/staff/feedback boundaries remain explicit. The local cart stores minimal
account-owned selections. Checkout refreshes existing data, validates delivery/
payment choices, supports recurrence and partner dates, handles M-Pesa status and
normalizes single/multiple-order confirmations. Orders support eligible edits,
cancellation, feedback and reviewed reorder. Account includes profile/password,
company contact/billing, team invitations, address management, documents and reports.

No backend, server-cart, quote, reservation or payment-reconciliation contract was
changed. Local estimates remain estimates. An uncertain payment/order write is
never automatically retried. Keep its reference, inspect orders and contact support;
refresh cannot reconstruct a lost submission. Live commerce operations were not
used for testing.

## Structure and checks

Pages compose focused feature components. Composables coordinate state; API/query
layers own fetched records; stores own client session/context/cart/attempt state;
validation/types and pure utilities express current contracts and commerce rules.
No `modules/` or Nuxt routing is introduced. The directly editable FTF theme is
in `src/theme/ftf/`; see its [source and compatibility notes](src/theme/ftf/PROVENANCE.md).

```sh
npm run type-check
npm run lint
npm run format:check
npm run test:unit -- --run
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=4
```

Browser tests intercept API calls and fail closed. They do not send live emails,
create real orders or initiate real payments. The local QR encoder is the only
runtime dependency added in the completion slice; it retains document QR display
without an external rendering service. External analytics services remain disabled by user choice.

- [Phase 1 plan and progress](docs/phase-1-rebuild-plan.md)
- [Architecture and ownership](docs/architecture.md)
- [Current commerce rules](docs/commerce-rules.md)
- [Verification and remaining limits](docs/phase-1-verification.md)
- [Separate phase 2 backend backlog](docs/rebuild-plan.md)
