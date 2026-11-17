# ADM2 → Vue 3 Migration Tracker

- **Plan:** [`PLAN.md`](./PLAN.md)
- **Started:** 2026-11-16
- **Toolchain:** Node 26 LTS (legacy baseline: Node 18)
- **Current phase:** Phase 4 — Hardening and release
- **Current step:** 4.6 — Release and rollback note
- **Overall status:** ◐ In progress

> A step may only be marked `✅ Done` after its tests, build, and manual checklist pass.
> See the completion protocol below. Update this file in the same commit as the work.

---

## 1. How to use this tracker

1. Pick the next `☐ Not started` step in order. Do not start a later step while an earlier
   one is `◐ In progress` unless the plan explicitly allows parallel work.
2. Set the step to `◐ In progress` and add the date.
3. Implement the step.
4. Run the gate:

   ```bash
   yarn test
   yarn build
   yarn dev          # confirm the app still boots
   ```

5. Complete the step's manual checklist.
6. Commit as `step-<id>: <description>`.
7. Mark the step `✅ Done`, add the date and evidence.
8. Update **§2 Summary** and **§4 Evidence log**.

### Status legend

| Symbol | Meaning |
|---|---|
| `☐` | Not started |
| `◐` | In progress |
| `⛔` | Blocked (add an entry in §6) |
| `✅` | Done (gate passed) |
| `⏭` | Skipped (decision recorded) |

### Completion protocol

A step is **Done** only when all of the following are true:

- [ ] The step's code/docs are committed.
- [ ] `yarn test` passes.
- [ ] `yarn build` passes.
- [ ] `yarn dev` boots without new console errors.
- [ ] The step's manual checklist is completed.
- [ ] Evidence is recorded in §4.
- [ ] This tracker row is updated.

---

## 2. Summary

| Phase | Steps | Done | Status |
|---|---|---|---|
| Phase 0 — Baseline | 3 | 3 | ✅ Complete* |
| Phase 1 — De-risk on Vue 2 | 5 | 5 | ✅ Complete |
| Phase 2 — Framework/tooling cutover | 5 | 5 | ✅ Complete |
| Phase 3 — Feature verticals | 9 | 9 | ✅ Complete |
| Phase 4 — Hardening and release | 6 | 4 | ◐ In progress |
| **Total** | **28** | **26** | |

\* Node 26 is pinned via `.nvmrc` and `engines.node`. A real user backup fixture will be
added when available; the synthetic export/import round-trip already locks the format.
Phase 4: 4.5 skipped per D2; 4.6 is prepared in `RELEASE.md` with deploy/tag deferred.

---

## 3. Step tracker

### Phase 0 — Baseline

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 0.1 | Reproducible baseline + `pre-vue3` tag | S | ✅ | 2026-11-16 | 2026-11-16 | Node 18 build + `/login` HTTP 200 | `pre-vue3` → `12f88eb`; build OK |
| 0.2 | Characterization tests (pure logic) | S | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 15/15 green | Vitest 2.1.9 + Vite 5.4.21 (Node 18) |
| 0.3 | DB contract fixture (fake-indexeddb) | S | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 28/28; export/import round-trip | 13 DB tests; Dexie 4 `defineClass` verified |

**Phase 0 exit criteria**

- [x] `pre-vue3` tag exists.
- [x] Node 18 baseline version and Node 26 target version documented.
- [x] `.nvmrc` / `engines.node` pinned to Node 26.
- [x] Characterization tests cover money, invoice IDs, dates, and normalization.
- [x] DB fixture restores all tables and query assertions pass.
- [x] Export/import round-trip preserves all tables.
- [ ] Real user backup JSON captured as a committed fixture *(pending user data; synthetic round-trip covers the format)*

### Phase 1 — De-risk on Vue 2

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 1.1 | moment → date-fns | M | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 38/38; build + `/login` 200 | date-fns 2.30.0; `$date` global; reports covered |
| 1.2 | Remove Vue filters | S | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 38/38; build + `/login` 200 | 28 filters → `$money(...)`; `Vue.filter` removed |
| 1.3 | Event bus → mitt | S | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 40/40; build + `/login` 200 | mitt wrapper keeps `$on/$off/$emit/$buefy` |
| 1.4 | Web-only print/platform adapter | M | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 45/45; build + `/login` 200 | no Electron/Capacitor in runtime; browser print |
| 1.5 | Remove `window.Database` and `require()` | M | ✅ | 2026-11-16 | 2026-11-16 | `yarn test` 45/45; build + `/login` 200 | 22 files import `database`; zero globals/`require` |

**Phase 1 exit criteria**

- [x] No `moment` imports.
- [x] No `|` filters.
- [x] No `new Vue()` outside `main.js`.
- [x] No Electron/Capacitor references in runtime code. *(only `src/background.js`, an Electron entry point, remains; Step 4.4)*
- [x] No `window.Database` and no `require(` in `src/`.
- [ ] Tag `refactor-complete`. *(git deferred by request)*

> Full browser CRUD smoke is deferred to the Playwright smoke in Step 2.5. Phase 1 is
> covered by 45 unit/DB tests, the production build, and a `/login` HTTP 200 check.

### Phase 2 — Framework and tooling cutover

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 2.1 | Vite + Vue 3 + Buefy 3 shell | L | ✅ | 2026-11-16 | 2026-11-16 | `yarn build` green; theme screenshots | Vite 8.3.8, Vue 3.5.45, Buefy 3.1.0, Bulma 1.0.4 |
| 2.2 | Router 5 + layouts + i18n 11 + PWA | M | ✅ | 2026-11-16 | 2026-11-16 | All routes render; guard; PWA build | vue-router 5.5.1, vue-i18n 11.4.20, 205 precache entries |
| 2.3 | Pinia 4 store + persistence | M | ✅ | 2026-11-16 | 2026-11-16 | 45/45 tests; reload persistence | Pinia 4.1.0 + persistedstate 4.7.1; lazy compat facade |
| 2.4 | Vue 3 syntax sweep | L | ✅ | 2026-11-16 | 2026-11-16 | Build + Buefy audit + screenshots | `.sync`, slots, lifecycle, forms, select, chart, EJS |
| 2.5 | Boot gate | S | ✅ | 2026-11-16 | 2026-11-16 | Playwright: 12 routes + login, 0 errors/warnings | register → routes → login round-trip |

**Phase 2 exit criteria**

- [x] `yarn build` green on Vue 3 + Vite.
- [x] Every route renders without uncaught console errors.
- [x] Buefy 3 components audited visually (modal, table, datepicker, upload, taginput, select, tabs, radio).
- [x] Zero `vuex` package/imports. *(A temporary `vuex-compat` helper remains for legacy `mapState`/`$store` call sites; remove in Phase 4.)*
- [x] PWA manifest + service worker generated. *(Installability not manually tested yet.)*
- [ ] Tag `vue3-alpha`. *(git deferred by request)*

### Phase 3 — Feature verticals

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 3.1 | Auth, registration, backup/restore | M | ✅ | 2026-11-16 | 2026-11-16 | 52/52 tests; E2E auth + export/import | duplicate check, logout, restore round-trip |
| 3.2 | Products, providers, customers | L | ✅ | 2026-11-16 | 2026-11-16 | 57/57 tests; catalog E2E all green | CRUD, duplicate barcode, payment math, toPlain |
| 3.3 | Inventories | L | ✅ | 2026-11-16 | 2026-11-16 | 57/57 tests; inventory E2E all green | create, bulk import, inline edit, low stock, unlimited |
| 3.4 | POS | L | ✅ | 2026-11-16 | 2026-11-16 | 57/57 tests; POS E2E all green | cash/credit, stock cap, discount, cashbox, receipt, auto-print |
| 3.5 | Sales, refunds, reports | M | ✅ | 2026-11-17 | 2026-11-17 | 57/57 tests; sales E2E all green | filters, details, invoice/report, partial/full refunds |
| 3.6 | Cashbox | M | ✅ | 2026-11-17 | 2026-11-17 | 57/57 tests; cashbox E2E all green | add/close/balance, total, search, report |
| 3.7 | Dashboard and charts | S | ✅ | 2026-11-17 | 2026-11-17 | 60/60 tests; dashboard E2E all green | counts, chart canvas, 7-day data, screenshot |
| 3.8 | Settings | M | ✅ | 2026-11-17 | 2026-11-17 | 60/60 tests; settings E2E all green | store/logo/currency, POS settings, DB tab |
| 3.9 | Remaining screens (port all; no deletions) | S | ✅ | 2026-11-17 | 2026-11-17 | 60/60 tests; misc E2E all green | Employees, Routes create, About |

**Phase 3 exit criteria**

- [x] Critical path passes on synthetic data. *(real backup import still pending)*
- [x] Money, stock, refund, and cashbox behavior verified by unit + E2E tests.
- [x] Invoice, receipt, sales report, and cashbox report render/print.
- [ ] Tag `parity`. *(git deferred; awaiting a real backup fixture)*

### Phase 4 — Hardening and release

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 4.1 | CI pipeline (install, lint, unit, build, e2e) | M | ✅ | 2026-11-17 | 2026-11-17 | Unit + build + 10 E2E suites green | GitHub Actions; bundled Chromium; 188s |
| 4.2 | PWA update flow, offline, bundle budget | S | ✅ | 2026-11-17 | 2026-11-17 | 11/11 E2E suites; offline shell/route | SW + manifest, auto-update, 647 kB budget |
| 4.3 | Accessibility and responsive audit | S | ✅ | 2026-11-17 | 2026-11-17 | Keyboard + mobile + unlabeled-button checks | labels, keyboard POS, no mobile overflow |
| 4.4 | Cleanup and README | S | ✅ | 2026-11-17 | 2026-11-17 | Lint/unit/build/12 E2E suites | removed legacy files; ESLint; README |
| 4.5 | Optional TypeScript for domain layer | L | ⏭ | — | — | Skipped per D2 (JS + JSDoc retained) | — |
| 4.6 | Release and rollback note | S | ◐ | 2026-11-17 | | Release runbook prepared | `docs/migration/RELEASE.md`; deploy/tag deferred |

**Phase 4 exit criteria**

- [ ] CI is required and green on PRs.
- [ ] Production deployment verified with a real backup import.
- [ ] Rollback instructions written.
- [ ] Tag `release`.

---

## 4. Evidence log

Record commands, test counts, CI links, screenshots, or notes. Newest first.

| Date | Step | Evidence |
|---|---|---|
| 2026-11-17 | 4.6 | Legacy backup upgrade path pinned without a user file: `tests/fixtures/legacy-backup-v1.json` was produced by the Vue 2 build's own libraries (Dexie 3.2.2 + dexie-export-import 1.0.0; 14 tables, `formatName: dexie`, `formatVersion: 1`) and is re-imported under dexie-export-import 4.4.2 by `tests/unit/characterization/legacy-backup.spec.js` (7 tests: row counts per table, owner login lookup, settings, barcodes/provider links, stock/price, cash+credit sales with customer link, cashbox sum `34`). Unit **67/67**. |
| 2026-11-17 | 4.6 | Pre-merge hardening: forced Bulma light theme against `prefers-color-scheme: dark` and `data-theme="dark"`; fixed the dashboard chart resize loop (canvas 300px → 10,919px over 3s); POS now explains an empty inventory instead of "No hay resultados"; legacy `/service-worker.js` cleanup worker for same-origin upgrades (verified: caches cleared, 0 registrations); `yarn audit` triaged — 85 advisories, all build/dev tooling or unused `ejs > jake` CLI paths, 0 vulnerable packages in `dist/`. CI green on `af03ed4`. |
| 2026-11-17 | 4.6 | Release runbook created at `docs/migration/RELEASE.md`: pre-release gates, real-backup check, static host/SPA fallback/cache headers, code-only rollback (DB name/schema unchanged), post-deploy smoke, known caveats. Deploy and git tag intentionally deferred. |
| 2026-11-17 | 4.4 | Removed Cypress leftovers, broken `HelloWorld` unit spec, Electron `build/` icons, `.browserslistrc`, unused `filters/index.js`/`hotkeys.js`; removed unused imports/registrations; fixed `filtered_data` cashbox bug and mutating sort computed. Added ESLint 10 flat config (`yarn lint`, 0 errors / 18 warnings), CI lint step, and rewrote README. Full suite **12/12**, 215s; bundle **647.2 kB**. |
| 2026-11-17 | 4.3 | A11y/responsive E2E: keyboard-only POS (`Ctrl+1` focus/search, Enter add, `Ctrl+2` complete), zero unlabeled buttons on POS/Products/Sales, mobile 390×844 with no horizontal overflow on POS/Products/Settings, mobile menu opens. **0 page errors.** Added aria-labels to icon-only controls and clamped page overflow. |
| 2026-11-17 | 4.2 | PWA E2E: `sw.js` + `registerSW.js` generated, auto-update (`skipWaiting`), manifest linked with icons/lang `es`, SW controls the page, offline reload and `/products` route render. Main bundle **647.1 kB** against an **800 kB** budget. Full suite **11/11**, 191s. |
| 2026-11-17 | 4.1 | Added `.github/workflows/ci.yml` (Node 26, Yarn 1.22.22, unit, build, Playwright Chromium, E2E), `tests/e2e/browser.mjs` (Chrome locally / bundled Chromium in CI), and `tests/e2e/run-all.mjs` (`yarn test:e2e`). Full suite: **10/10 E2E suites, 188s, 0 failures**, bundled Chromium. Unit: **60/60**. |
| 2026-11-17 | 3.9 | Misc E2E: Employees placeholder, Routes screen + create (`Ruta Test`, phone, description), About page. **60/60 tests; 0 page errors.** No screens deleted, per D4. |
| 2026-11-17 | 3.8 | Settings E2E: store name/address/phone/legal/currency (`€`), logo upload, sidenav name/logo update, persistence after reload; POS invoice message persisted; currency applied on dashboard; database export/import tab present. **60/60 tests; 0 page errors.** |
| 2026-11-17 | 3.7 | Dashboard E2E: cash total `$20`, sales count `2`, customer list, latest sales rows, low-stock card, chart canvas with non-zero size; screenshot verified chart.js 4 lines/legend. **60/60 tests; 0 page errors.** Extracted `buildSalesGraph` and unit-tested cash/credit counts per day; credit sales no longer add to the cashbox. |
| 2026-11-17 | 3.6 | Cashbox E2E: POS sale adds $20; sale log listed; close modal previews $15 balance; withdrawal $5; after close total is $15 with `Cierre de caja` + `Saldo en caja` logs and `$-5`; search filters to close logs; report print opens a window. **57/57 tests; 0 page errors.** Fixed the close `b-modal` to `modelValue`, readonly balance binding, and error toast type. |
| 2026-11-17 | 3.5 | Sales E2E: two sales ($35), payment filters, sale-id search, details modal, invoice print popup, report print popup; partial refund ($20 remaining, stock restored, cashbox `Reembolso venta #1`); full cash refund ($0); full credit refund (customer debt `$0`). **57/57 tests; 0 page errors.** Fixed refund `v-model`, net subtotal, stock restoration, cashbox reversal, and credit-debt reduction. |
| 2026-11-16 | 3.4 | POS E2E: product search → cart; quantity 10 capped to stock 5 with warning; 10% discount ($20 → $18); customer select; cash sale with receipt preview; stock 5→3; cashbox log `Venta POS cont #1`; sales list `Contado`; credit sale listed and customer balance `$10`; auto-print toggle persisted and opened a print window. **57/57 tests; 0 page errors.** Fixed `ProductSearch` `emits`, search input focus, receipt modal close, and awaited stock/cashbox writes. |
| 2026-11-16 | 3.3 | Inventory E2E: create inventory, create product, open inventory, bulk import via `/products?selectedInventory=id` (preselected inventory shown), price 10/stock 3, inline stock edit to 4, low-stock dashboard card, unlimited-stock switch. **57/57 tests; 0 page errors.** Fixed `InventoryStatus` to load products before rendering, `ContentEditable` focus/`inputType`, `inventoryId` data, and card/summary prop defaults. |
| 2026-11-16 | 3.2 | Catalog E2E: product create, search by barcode/brand, edit, duplicate-barcode rejection, delete; provider required validation, create/edit/delete; customer create, payment, detail, `$10` abono, `$0` balance. **57/57 tests; 0 page errors.** Added `toPlain()` for reactive→IndexedDB writes, declared form `emits`, fixed `toArray(callback)` bugs, customer credit/payment sums, balance clamping, product/provider delete, and product-form provider loading. |
| 2026-11-16 | 3.1 | `registerUser` now trims and rejects duplicate username/email; registration validates required fields and 6-char passwords. Added 7 auth unit tests (bcrypt digest, duplicate username/email, wrong/right password, username/email login, logout). Playwright E2E: register → logout → guarded route → login → export backup (2.5 kB, `formatName: dexie`, `databaseName: adm_2`) → import → confirm → reload with store restored. **52/52 tests; 0 page errors.** |
| 2026-11-16 | 2.5 | Playwright boot gate: register (`admin`/`secret123`/`Tienda Test`) → 12 routes (`/`, `/pos`, `/products`, `/inventories`, `/sales`, `/customers`, `/providers`, `/cashbox`, `/settings`, `/employees`, `/routes`, `/about`) → login round-trip. **0 page errors, 0 console warnings.** Screenshots captured for dashboard, products, POS, settings, and product modal. |
| 2026-11-16 | 2.4 | Vue 3 syntax sweep: 18 `.sync` → `v-model` / `v-model:checked-rows`; `slot=` → `#`; `beforeDestroy` → `beforeUnmount`; removed `.native`; migrated 2 forms to VeeValidate 4 `validate()`; replaced `vue-select` with `b-autocomplete`; rewrote the chart wrapper for chart.js 4/vue-chartjs 5; `?raw` EJS imports + browser `fs` alias. Fixed Buefy 3 radio icon negative margins and upload styling. |
| 2026-11-16 | 2.3 | Pinia 4.1.0 + `pinia-plugin-persistedstate` 4.7.1. Store created lazily after `app.use(pinia)` so plugins apply; persistence verified (`localStorage.app` contains the user/store). Temporary `$store`/`mapState` compat facade keeps legacy call sites working. **45/45 tests pass.** |
| 2026-11-16 | 2.2 | `vue-router` 5.5.1 (`createRouter`/`createWebHistory`, return-style guard), `vue-i18n` 11.4.20 (`legacy: false`, `import.meta.glob`), Vue 3 directives, PWA manifest/service worker generated (205 precache entries). Fixed Login's duplicate `created()` redirect and `/home` path bug. |
| 2026-11-16 | 2.1 | Cut over to Vite 8.3.8 + Vue 3.5.45 + Buefy 3.1.0 + Bulma 1.0.4. Rewrote `package.json`, added root `index.html`/`vite.config.js`, `"type": "module"`, Node 26 engines/.nvmrc, SCSS `@use` theme, removed Vue CLI/webpack/Electron/Capacitor configs. `yarn build` green. |
| 2026-11-16 | 1.5 | Replaced all 43 `Database.*` call sites with a module import across 22 `.vue` files; removed `window.Database`; converted `backupDatabase(Database)` / `restoreDatabase(Database, …)` to the imported instance; replaced `require('@/assets/...')` with ESM imports in `settings/Database.vue` and `Layout/SideNav.vue`; fixed the `Database.vue` import casing in `Settings.vue`. **45/45 tests pass.** `yarn build` green; `/login` HTTP `200`. `grep` confirms no `window.Database` and no `require(` in `src/`. |
| 2026-11-16 | 1.4 | Rewrote `lib/print.js` as a browser-only adapter (`window.open` + write + print + afterprint close), `getPrintersList()` returns `[]`, `receiptPrint` prints via the invoice template. Removed the Electron branch and `electron-utils.js`, removed Capacitor from `main.js`, `platform.js`, and `settings/Pos.vue`; deleted `platform.js`. Removed `@capacitor/*`, `vue-cli-plugin-capacitor`, `electron-pos-printer`, and the `capacitor:*` scripts. Added 5 print tests. **45/45 tests pass.** `yarn build` green; `/login` HTTP `200`. |
| 2026-11-16 | 1.3 | Added `mitt@3.0.1`; replaced `new Vue()` bus with a drop-in wrapper exposing `$on/$off/$emit` plus a Buefy programmatic `$buefy` shim (dialog/loading/notification/snackbar/toast). No call sites changed. Added 2 event-bus tests. **40/40 tests pass.** `yarn build` green; `serve -s dist` → `/login` HTTP `200`. |
| 2026-11-16 | 1.2 | Removed `Vue.filter('money')`; registered `this.$money = formatNumber`; replaced all 28 `\| money` usages across 13 templates with `$money(...)` using a boundary-safe regex; added the Home.vue `:total="$money(totalMoney)"` binding. **38/38 tests pass.** `yarn build` green; `serve -s dist` → `/login` HTTP `200`. No Vue filters remain. |
| 2026-11-16 | 1.1 | Replaced moment/vue-moment with `date-fns@2.30.0` (temporary Node-18/webpack-4 pin; upgrade to 4.4.0 in Step 2.1). Added `toDate`, `formatDate`, `dateToISO`, `startOfDayDate`, `endOfDayDate`, `isDateWithin`; registered `this.$date`; updated 12 components/views, 4 report/EJS templates, cashbox controller, backup filename, print receipt. Removed all `$moment`/`moment` imports and the `moment` filter. Added 10 datetime tests + 2 report-rendering tests. **38/38 tests pass.** `yarn build` green; `serve -s dist` → `/login` HTTP `200`. Note: `PaymentForm` used `form.data` (typo); now uses `form.date`. |
| 2026-11-16 | 0.3 | Added `fake-indexeddb@6.2.8`; `setup.js` installs `window`/`self`/`FileReader` shims; `db-contract.spec.js` (13 tests) seeds all 14 tables, asserts schema/indexes, auth lookup, product search, settings lookup, sale filters + compound index, inventory product lookup, customer payments, cashbox close, unique constraints, and a full `exportDB` → `importDB` round-trip under a new DB name. **28/28 tests pass.** Verified `defineClass` still exists in Dexie `4.4.7` via a throwaway install. `yarn build` green. |
| 2026-11-16 | 0.2 | `vitest@2.1.9` + transitive `vite@5.4.21` (Node 18 compatible; Vitest 5 requires Node 22.12+/26). Added `test` / `test:watch` scripts, `vitest.config.js` (`@` alias + `.ejs` raw transform), and 6 characterization specs. `yarn test` → **15/15 passed**. `yarn build` green; `serve -s dist` → `/login` HTTP `200`. Minimal interop fix: all `import * as moment` → `import moment` (6 files). |
| 2026-11-16 | 0.1 | Tag `pre-vue3` → `12f88eb`; branch `migration/vue3`; Node `18.20.8` baseline; Yarn `1.22.22` via corepack (`packageManager` pinned in `package.json`); `NODE_OPTIONS=--openssl-legacy-provider yarn build` succeeded; `serve -s dist` → `/login` HTTP `200`, title and `<div id="app">` present. |

### Running commands

```bash
# unit/DB tests
yarn test

# watch mode
yarn test:watch

# production build
yarn build

# preview the production build
yarn preview

# dev server
yarn dev

# boot gate (needs `yarn preview` on 127.0.0.1:4173)
node tests/e2e/boot-gate.mjs
```

Playwright uses the installed Google Chrome (`channel: 'chrome'`), so no browser download is
required. Screenshots can be regenerated with `node tests/e2e/screenshots.mjs`.

### Manual smoke checklist (reusable)

Use after every step that changes runtime behavior:

- [ ] App boots at `/`.
- [ ] Registration or login route renders.
- [ ] Login succeeds with seeded user.
- [ ] Products list loads; create/edit works.
- [ ] Inventory list loads.
- [ ] POS: add product, change qty, complete a cash sale.
- [ ] Sales list shows the sale; details open.
- [ ] Receipt/invoice print preview opens.
- [ ] Cashbox shows the sale log.
- [ ] Browser console has no new uncaught errors.

---

## 5. Decision log

Update when a decision is made. Decisions from `PLAN.md` §6 are pre-seeded here.

| ID | Decision | Options | Recommendation | Final decision | Decided by | Date |
|---|---|---|---|---|---|---|
| D1 | Form library | Regle 1.29 / VeeValidate 4.15 | VeeValidate 4.15 | **VeeValidate 4.15 (keep vee-validate)** | Luis | 2026-11-16 |
| D2 | TypeScript timing | JS + JSDoc first / TS now | JS first, TS in 4.5 | **JS + JSDoc first** | Luis | 2026-11-16 |
| D3 | Phase 1 pre-refactors | Full de-risk / collapse into Phase 2 | Full de-risk | **Full de-risk** | Luis | 2026-11-16 |
| D4 | Unused screens | Port / delete | Port all; delete nothing | **Port all; no deletions** | Luis | 2026-11-16 |
| D5 | Node toolchain | Node 26 LTS / Node 18 baseline / Bun 1.4 | Node 26 LTS; Node 18 baseline; drop Bun | **Node 26 LTS toolchain, Node 18 legacy baseline, Bun dropped** | Luis | 2026-11-16 |
| D6 | `vue-select` replacement | `b-autocomplete` / `vue-multiselect@3.5` | Spike in 3.4 | Deferred | | |

---

## 6. Blockers

Add an entry when a step is blocked. Remove it when resolved, and note the resolution in
the evidence log.

| Date | Step | Blocker | Owner | Resolution |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 7. Milestones

| Tag | Meaning | Status | Date |
|---|---|---|---|
| `pre-vue3` | Baseline before migration | ✅ | 2026-11-16 |
| `refactor-complete` | Phase 1 finished on Vue 2 | ✅ (tag deferred) | 2026-11-16 |
| `vue3-alpha` | Vue 3 app boots; all routes render | ✅ (tag deferred) | 2026-11-16 |
| `parity` | Features match pre-migration behavior | ◐ Synthetic verified; real backup pending | 2026-11-17 |
| `release` | Hardened, tested, deployed | ☐ | |

---

## 8. Notes and gotchas

- **Node 26 does not ship corepack.** Install Yarn 1.22.22 globally (`npm i -g yarn@1.22.22`)
  on Node 26. Node 18 still has it. `.nvmrc` and `engines.node` pin 26.
- **`package.json` is `"type": "module"`.** Vite/Vitest configs are ESM.
- **Pinia stores must be created after `app.use(pinia)`.** Creating the store at module
  load skipped the persistence plugin. The default store export is now a lazy compat
  facade; keep it lazy until legacy call sites are removed.
- **`vuex-compat.js` is temporary.** It provides `mapState`/`mapGetters` and a `$store`
  facade over Pinia. No `vuex` package or import remains. Remove in Phase 4.
- **Vue 3 reactive proxies cannot be written to IndexedDB.** Every Dexie write from a Vue
  form goes through `toPlain()` (`src/lib/serialization.js`); otherwise IndexedDB throws
  `DataCloneError`. Apply it to every new write path.
- **Root `<form>` components must declare `emits`.** Without `emits: ['submit']` (or
  `input`), Vue 3 falls the listener through to the native `<form>`, so the handler fires
  twice and the second call receives a `SubmitEvent` (also a `DataCloneError`). Declared in
  product, provider, customer, payment, and inventory forms.
- **Dexie's `toArray(callback)` is ignored.** Fixed the remaining callback-style calls in
  Customers, Customer, and Products; use `await collection.toArray()`.
- **A11y status:** icon-only controls on the main tables/POS have `aria-label`s; the
  keyboard POS flow and 390×844 responsive layout are tested. **Remaining debt:** Buefy
  `b-field` labels are not programmatically associated with inputs (no `for`/`id`), and
  table semantics are only as good as Buefy's. A full axe audit is still recommended.
- **PWA is production-ready enough for this migration.** `vite-plugin-pwa` generates the
  manifest and an auto-update service worker (`skipWaiting`/`clientsClaim`), and offline
  reload + navigation work with IndexedDB data. Main bundle budget is 800 kB; current main
  chunk is ~647 kB. Offline console `ERR_INTERNET_DISCONNECTED` entries are expected and
  filtered in the test.
- **Lint is now configured.** `yarn lint` uses ESLint 10 + `eslint-plugin-vue` (flat config)
  and gates CI on errors. It currently reports 18 warnings (`no-unused-vars` in legacy
  callbacks); they are tracked but non-blocking.
- **Dead tooling removed.** Cypress leftovers, the broken `HelloWorld` unit spec, Electron
  `build/` icons, `.browserslistrc`, and unused `filters/index.js`/`hotkeys.js` are gone.
  Unused screen/component files (`Invoice.vue`, `InvoiceModal.vue`,
  `large-invoice-preview.vue`, `Route.vue`, `HelloI18n.vue`) are intentionally kept per D4.
- **TypeScript remains optional** and was skipped per D2. The domain layer stays JS + JSDoc.
- **Employees is still a placeholder screen.** Its "Nuevo" button has no handler and
  `getEmployees` references a non-existent `employee` table; it is intentionally preserved
  per D4 (no deletions). `HelloI18n` is also preserved but unrouted.
- **Routes supports create only.** The route form creates route records and cards; edit/
  delete were never implemented in the legacy app.
- **Credit sales do not add to the cashbox.** Only `sale_type === 'cash'` writes an `add`
  log; credit sales affect customer debt instead.
- **Dashboard chart data is extracted** to `buildSalesGraph` and unit-tested. The E2E checks
  the canvas and screenshot; calendar interaction for the date range is still manual.
- **Cashbox close uses a `modelValue` modal.** `TransactionForm` previously used the Vue 2
  `active` prop and never opened. The read-only balance field also needed `:model-value`.
  Closing registers a `close` withdrawal and a `balance` carry-over; `getMoneyInCashBox`
  starts after the latest close.
- **Refunds are real now.** `RefundModal` uses `modelValue`/`update:modelValue`, restores
  stock for refunded lines, writes a `subtract` cashbox log for cash sales, and reduces the
  sale total so credit debt (`Customers`) drops. Net subtotal includes line discounts.
- **Date-range sales filter is not E2E-tested.** Payment/search filters are covered; date
  filtering is covered by `isDateWithin` unit tests. Add a calendar interaction test later.
- **Custom components using native event names need `emits`.** `ProductSearch` emits
  `input`; without `emits: ['input']` Vue 3 falls it through to the root DOM and the POS
  cart never receives the product. Declared.
- **`#searchInput` lives on the Buefy wrapper, not the inner input.** Focus/typing must
  target `#searchInput input`.
- **POS receipt preview is now shown after a sale** when auto-print is off; the modal has a
  close button. Auto-print opens a browser print window instead.
- **Inventory stock and cashbox writes are awaited** before the success toast, so tests and
  users see consistent state.
- **Inventory bulk import flow:** inventory detail → "Importar productos" →
  `/products?selectedInventory=<id>` → select products → "Agregar al inventario" →
  set stock/price → save → confirm. The query param preselects the inventory.
- **Low-stock threshold is hardcoded to 5** in `InventoryStatus` (`minQuantity`). The DB
  fields `minimum` / `alert_on_min` are not used yet; decide whether to honor them in 3.7.
- **Product delete is guarded.** A product cannot be deleted while it belongs to an
  inventory; provider deletion cascades `product_provider` rows.
- **Customer balance is clamped at zero** after credit sales and payments.
- **Buefy 3 emits `update:modelValue`, not `input`.** All legacy `:value` + `@input`
  bindings on Buefy components were converted to `@update:model-value` (inputs, selects,
  datepickers, switches, numberinput, autocomplete, upload). Native `<input>` and custom
  component `@input` handlers were left alone.
- **`EventBus.$buefy` is wired from the installed app.** Buefy 3 exports dialog classes,
  not instances; `main.js` calls `setBuefy(app.config.globalProperties.$buefy)`. This fixes
  the backup import confirmation dialog.
- **Registration is first-run only.** `Registration.vue` redirects to `/login` when users
  exist, so duplicate-account rejection is covered by unit tests rather than the UI.
- **Backup files** are named `yyyy-MM-dd_HHmmss.json`; export emits `EXPORT_FINISH`,
  import emits `IMPORT_FINISH`, and both round-trip successfully through the settings UI.
- **Login fixes:** `Login.vue` had two `created()` hooks; the last always redirected home.
  It also pushed `/home`, which is not a route. Both are fixed.
- **EJS runs in the browser.** `fs` is aliased to `src/lib/browser-fs.js`; EJS includes are
  unsupported. Reports use plain `render()` without includes.
- **`vue-chartjs` 5 needs non-empty initial data.** The wrapper normalizes `{}` to
  `{ labels: [], datasets: [] }`.
- **Buefy 3 radio buttons need a CSS override** for the negative icon margin
  (`.b-radio.radio.button .icon:first-child:nth-last-child(2)`).
- **`vue-select` is replaced by `b-autocomplete`** in POS; clearing emits `{}`.
- **VeeValidate 4 uses standalone `validate(value, 'required')`** in the two legacy forms.
- **PWA** is generated by `vite-plugin-pwa` (manifest + service worker, 205 precache
  entries). Installability is not manually tested yet.
- **Build warning:** the main JS chunk is ~662 kB. Code-splitting/budget work is in
  Phase 4.
- **Peer warnings:** `@vue/devtools-api` (Pinia) and `workbox-build` (PWA) are unmet peers;
  neither blocks build or runtime. Revisit in Phase 4.
- **Toolchain is Node 26 LTS.** Pin `.nvmrc` (`26`) and `engines.node` (`>=26`).
  Vite 8 needs `^20.19 || >=22.12`; Vitest 5 needs `^22.12 || ^24 || >=26`.
- **The legacy baseline runs on Node 18 only.** Vue CLI 4 / webpack 4 will not build
  reliably on Node 26; do not try.
- **Legacy baseline build recipe (Node 18):**

  ```bash
  source ~/.nvm/nvm.sh && nvm use 18
  yarn install --ignore-scripts --frozen-lockfile
  node node_modules/electron/install.js   # the Electron CLI plugin loads even for a web build
  NODE_OPTIONS=--openssl-legacy-provider yarn build
  npx serve -s dist -l 4173               # verify /login returns 200
  ```

  `--openssl-legacy-provider` is required because webpack 4 uses MD4.
  `--ignore-scripts` avoids the Electron download during install, but the web build still
  loads `vue-cli-plugin-electron-builder`, which requires the Electron binary.
- **Yarn is pinned to `1.22.22`** via corepack (`packageManager` in `package.json`).
  Run `corepack enable` on a fresh machine.
- **Phase 0 test runner is Vitest `2.1.9` + Vite `5.4.21`.** Vitest 5 requires Node
  22.12+/26, so it cannot run on the Node 18 baseline. Upgrade both in Step 2.1.
- **Phase 1 date library is `date-fns@2.30.0`.** date-fns 4 ships optional chaining in
  its CJS build, which webpack 4 cannot parse. Upgrade to `date-fns@4.4.0` in Step 2.1
  together with Vite 8.
- **Templates use the global `$date(value, pattern)` helper.** It defaults to the Spanish
  locale. Use date-fns tokens (`dd/MM/yyyy`, `EEE d MMM`), not moment tokens.
- **Database access is a module import.** `import database from '@/db'` everywhere;
  `window.Database` is gone. The DB instance is still a singleton.
- **No `require()` in `src/`.** Assets use ESM imports (`logo.png`, `products.json`).
- **Web printing uses the invoice template.** `receiptPrint(sale)` prints the invoice via
  the browser dialog. A dedicated 180px thermal-receipt layout and silent printing are
  deferred (desktop/hardware out of scope). `getPrintersList()` returns `[]`.
- **POS settings `default_printer` and `show_receipt_popup` are now inert.** Browser
  printing ignores the printer name and does not show a receipt popup. Revisit their UI
  in Step 3.8; `auto_print_receipt` still triggers the browser print dialog.
- **`src/background.js` is the only Electron file left.** It is not part of the web
  runtime and will be removed in Step 4.4. The legacy web build still loads the Electron
  CLI plugin, so the Electron binary is still required for Phase 1 builds.
- **Event bus is mitt with a compatibility wrapper.** `EventBus.$on/$off/$emit` and a
  `$buefy` programmatic shim keep the legacy call sites working. No `new Vue()` remains
  outside `main.js`.
- **Templates use the global `$money(value)` helper.** It wraps `formatNumber`; no Vue
  filters remain. The helper module still captures `store.getters.currency` at import
  time; fix that when the store is rewritten (Step 2.3).
- **`cashBoxDateFormat` lowercases the meridiem** to preserve legacy reference IDs
  (`...am` rather than `...AM`).
- **DB tests polyfill browser globals.** `setup.js` provides `window`, `self`,
  `localStorage`, and a minimal `FileReader`; `dexie-export-import@1.0.0` needs the latter.
  Revisit when it is upgraded to `4.4.2` in Step 2.1.
- **`Dexie.defineClass` exists in Dexie 4.4.7.** The class mappings can stay; no data-shape
  change is required for the upgrade.
- **A real user backup fixture is still pending.** The synthetic export/import test locks
  the dump format; attach a real backup when available.
- **`dexie-export-import` is `1.0.0` on the baseline.** It requires Dexie 3; upgrade it
  together with Dexie 4 in Step 2.1.
- **`yarn add --ignore-scripts` removes the Electron binary.** Re-run
  `node node_modules/electron/install.js` before the next legacy build.
- **`moment` must use a default import** (`import moment from 'moment'`) under Vite.
  The legacy `import * as moment` form is not callable after ESM interop.
- **Bun was evaluated and dropped.** No LTS policy; no benefit for a browser-only app.
- **Node 27 is Alpha**, not LTS. It becomes LTS in Oct 2027.
- **IndexedDB is origin-scoped.** Preview deployments need a real backup import before
  smoke testing.
- **Keep table names and indexes unchanged**, including `invetory_id` and
  `invetory_product_id`. A rename is a data migration, not a cleanup.
- **`vue-select` is Vue 2-only.** It must be replaced, not upgraded.
- **VeeValidate stays, but v2 → v4.** The `v-validate` directive and `errors.has()` API are
  removed; only two forms are affected.
- **Do not delete unfinished screens.** Employees, Routes, About, and HelloI18n are ported
  as-is; they may be planned work.
- **Buefy 3 is Vue 3-native** and keeps `b-*` components plus `$buefy` programmatic APIs;
  `bulma` 1.x is the new CSS base.
- **Vue filters are gone in Vue 3.** Remove them in Phase 1, before the cutover.
- **`electron.remote` is removed in modern Electron.** Desktop is out of scope; do not
  carry the current print code forward.
