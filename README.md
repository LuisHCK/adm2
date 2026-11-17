# ADM2

ADM2 is a web-first point-of-sale and inventory manager for small stores. It runs entirely
in the browser, stores data locally with IndexedDB, and works offline as a PWA.

## Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.5 |
| Build | Vite 8 |
| UI | Buefy 3 / Bulma 1 |
| State | Pinia 4 + persisted state |
| Router | Vue Router 5 |
| i18n | Vue I18n 11 |
| Data | Dexie 4 (IndexedDB) |
| Charts | Chart.js 4 + vue-chartjs 5 |
| Dates | date-fns 4 |
| Forms | VeeValidate 4 |
| Tests | Vitest 5 + Playwright |
| Runtime | Node 26 LTS |

Desktop (Electron) and native (Capacitor) shells are intentionally out of scope for this
web-first version.

## Features

- Product, provider, and customer management
- Multiple inventories with stock, price, lot, and unlimited-stock support
- POS with barcode/search, cart, discounts, cash/credit sales, and customer credit
  (products must be added to an inventory before they appear in the POS)
- Receipt and invoice printing through the browser
- Sales history, partial/full refunds, and sales reports
- Cashbox with add/close/balance transactions, filters, and reports
- Dashboard with sales chart and low-stock alerts
- Local backups: export/import the full IndexedDB database as JSON
- Offline PWA with auto-updating service worker

## Requirements

- **Node 26 LTS** (`.nvmrc` is pinned to `26`)
- **Yarn 1.22.22**

Node 26 no longer ships Corepack, so install Yarn explicitly:

```bash
npm install -g yarn@1.22.22
```

## Setup

```bash
yarn install
yarn dev
```

Open the printed local URL. On first run the app asks you to create the store owner account.

## Scripts

| Command | Purpose |
|---|---|
| `yarn dev` | Vite dev server with HMR |
| `yarn build` | Production build into `dist/` |
| `yarn preview` | Serve the production build locally |
| `yarn test` | Vitest unit/DB tests |
| `yarn test:watch` | Vitest watch mode |
| `yarn test:e2e` | Start a preview server and run all Playwright suites |

The E2E runner uses the installed Google Chrome locally. CI sets
`PLAYWRIGHT_CHANNEL=bundled` and uses the Chromium installed by Playwright.

## Architecture

```
src/
  controllers/   Dexie-backed data access (sales, customers, inventory, cashbox, users)
  db/            Dexie schema, class mappings, backup export/import
  store/         Pinia store + temporary Vuex-style compatibility facade
  lib/           money/date helpers, auth, validation, printing, serialization
  reports/       EJS invoice, receipt, sales, customer, and cashbox reports
  views/         Routed screens (POS, products, inventories, sales, cashbox, settings)
  components/    Feature components and shared UI
  locales/       i18n messages
docs/migration/  Migration plan and execution tracker
```

The database name is `adm_2` and the schema must remain backward compatible with existing
installs. Local backups are JSON files exported with `dexie-export-import`.

## Testing

```bash
yarn test
yarn build
yarn test:e2e
```

The Playwright suites cover first-run registration, login/logout, backup export/import,
product/provider/customer CRUD, inventory bulk import and stock edits, POS cash/credit
sales, refunds, cashbox close/balance, dashboard/chart rendering, settings, PWA offline
mode, and keyboard/mobile flows.

## Deployment

Deploy the contents of `dist/` to any static host with SPA history fallback enabled
(`/index.html` for unknown paths). The generated service worker and manifest make the app
installable and offline-capable.

## Migration notes

This project was migrated from Vue 2 + Vue CLI + Vuex + Buefy 0.9. The plan and the
step-by-step execution record, including tests and known caveats, are in:

- [`docs/migration/PLAN.md`](docs/migration/PLAN.md)
- [`docs/migration/TRACKER.md`](docs/migration/TRACKER.md)
- [`docs/migration/RELEASE.md`](docs/migration/RELEASE.md)

## Screenshots

![Dashboard](public/screenshots/4413dfd3-15a1-47f5-90cc-9c7356d7d64d.jpeg)
![POS](public/screenshots/30510e0b-5deb-4547-99c9-9b61aefb7587.jpeg)
![Products](public/screenshots/c17b8e0a-16f6-4b8f-ba0b-99fb47b90e87.jpeg)
