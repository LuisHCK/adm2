# ADM2 → Vue 3 Migration Plan

- **Status:** Planning — not started
- **Created:** 2026-11-16
- **Target:** Vue 3 + Vite, web-first only
- **Tracker:** [`TRACKER.md`](./TRACKER.md)

> This document defines *what* will change and *in what order*. Progress, evidence, and
> per-step sign-off live in `TRACKER.md`. A step is not done until the tracker gate is met.

---

## 1. Scope and invariants

### In scope

- The browser application: POS, inventory, products, customers, providers, sales,
  refunds, cashbox, reports, settings, dashboard, auth, backup/restore.
- Web-first PWA behavior with offline IndexedDB storage.

### Out of scope (for now)

- Electron, Capacitor, native shells.
- Silent thermal printing and dedicated hardware integration beyond keyboard-wedge
  barcode scanners.
- New features, redesigns, and backend/sync work.

### Hard invariants

1. **Existing IndexedDB data must open unchanged.**
   - Keep the database name `adm_2`.
   - Keep every table name and index definition exactly as-is, including the existing
     `invetory_id` / `invetory_product_id` typos.
   - No table renames and no destructive data migration. Schema version may only be
     bumped if genuinely required, with an explicit upgrade function and fixture test.
2. Keep existing `localStorage` keys (`company_logo`, persisted store state).
3. Report and receipt HTML output stays visually equivalent.
4. UI remains Spanish. i18n plumbing is preserved but not expanded.
5. Money, stock, refund, and cashbox calculations must not change behavior.

### Sequencing rationale

This is not a big-bang rewrite:

- **Phase 0** pins current behavior with tests before anything changes.
- **Phase 1** removes framework-specific hazards while still on Vue 2, where behavior is
  known and testable.
- **Phase 2** performs the framework and tooling cutover.
- **Phase 3** migrates feature-by-feature with parity tests.
- **Phase 4** hardens and releases.

If a phase stalls, the previous phase is still shippable.

---

## 2. Target stack

Versions verified against npm on **2026-11-16**.

| Concern | Current | Target | Notes |
|---|---|---|---|
| Runtime | Node 24.21 (installed) | **Node 26.x LTS** | Bun dropped; Node 18 used only for the legacy baseline |
| Framework | Vue 2.6.11 | **Vue 3.5.x** | Options API retained during migration |
| Build | Vue CLI 4 / webpack 4 | **Vite 8.3.x** | `@vitejs/plugin-vue` 6.x |
| State | Vuex 3 + vuex-persist | **Pinia 4.1.x** + `pinia-plugin-persistedstate` 4.7.x | Keep action names for a recognizable diff |
| Router | vue-router 3 | **vue-router 5.5.x** | `createRouter` + `createWebHistory` |
| UI | Buefy 0.9 / Bulma 0.9 | **Buefy 3.1.x / Bulma 1.x** | Buefy is Vue 3-native and maintained |
| i18n | vue-i18n 8 | **vue-i18n 11.4.x** | `legacy: false` |
| Dates | moment + vue-moment | **date-fns 4.4.x** | Use `date-fns/locale/es` |
| Forms | vee-validate 2 | **VeeValidate 4.15.x** | Keep vee-validate; migrate the two forms to the v4 API |
| DB | Dexie 3.2 | **Dexie 4.4.x** | Same schema; verify `defineClass` support |
| Charts | chart.js 2 + vue-chartjs 3 | **chart.js 4.6.x + vue-chartjs 5.3.x** | One chart wrapper to rewrite |
| Events | `new Vue()` bus | **mitt 3.0.x** | Thin `$on/$off/$emit` wrapper |
| PWA | register-service-worker | **vite-plugin-pwa 2.0.x** | Replace custom service worker |
| Tests | vestigial | **Vitest 5 + fake-indexeddb 6 + Playwright** | `@vue/test-utils` 2 for components |
| Language | JS + JSDoc | **JS + JSDoc first** | TypeScript optional in Phase 4 |

### 2.1 Removed dependencies

`vuex`, `vuex-persist`, `vue-moment`, `moment`, `vue-select`, `vue-chartjs@3`,
`raw-loader`, `register-service-worker`, `@vue/cli-*`, `babel-*`, `electron*`,
`*capacitor*`, unused `json2csv`, unused `html2canvas`.

### 2.2 Dates — date-fns

Moment is replaced by small helpers in `src/lib/datetime.js`:

- `formatDate(value, pattern)` — wraps `format` + `parseISO`.
- `toDate(value)` — normalizes ISO strings / Date objects.
- `startOfDay` / `endOfDay` / `isWithinInterval` for sales and cashbox filters.
- `eachDayOfInterval` / `subDays` for dashboard chart ranges.
- Spanish locale via `date-fns/locale/es`.

Moment and date-fns tokens differ. Examples:

| Moment | date-fns |
|---|---|
| `MMM DD YYYY, h:mm a` | `MMM dd yyyy, h:mm a` |
| `D/MM/YY, h:mm a` | `d/MM/yy, h:mm a` |
| `DD/MM/YYYY, h:mma` | `dd/MM/yyyy, h:mma` |
| `lll` | `PPpp` |

EJS report templates receive a `formatDate` helper instead of the `moment` object.
Approximate scope: ~30 call sites across 12 files plus 4 templates.

### 2.3 Forms — VeeValidate 4

**Decision: keep VeeValidate and upgrade from v2 to v4** (`vee-validate@4.15.x`).

- Only **two** components use validation today:
  - `src/components/providers/ProviderForm.vue`
  - `src/components/settings/Store.vue`
- v2's implicit `v-validate` directive and `errors.has()` / `errors.first()` API are gone
  in v4. Migrate both forms using either:
  - `<Form>` / `<Field>` components with slot props (`field`, `errors`), or
  - `useForm()` / `useField()` inside a `setup()` block.
- Keep the rest of each component on Options API. Only the validation block needs
  `setup()`.
- Rules become explicit: `required`, `email`, `min`, etc. Buefy `b-field` keeps rendering
  the error message via `:type` and `:message`.
- Remove the global `Vue.use(VeeValidate)` registration; import what each form uses.
- No new validation dependency is introduced.

### 2.4 `vue-select`

`vue-select@3.20.4` declares `peerDependencies.vue: "2.x"` and cannot be carried forward.
It is used in three files:

- `src/views/Pos.vue` (imported, apparently unused in template)
- `src/components/pos/PosSummary.vue` (customer selector)
- `src/components/inventory/InventoryProductForm.vue`

Replacement is decided in Step 3.4:

- **Preferred:** Buefy `b-autocomplete` (no new dependency).
- **Alternative:** `vue-multiselect@3.5` (closer API, new dependency).

### 2.5 Runtime and package manager

- **Toolchain runtime: Node 26 LTS** (26.13.x as of 2026-11-16), supported until April 2029.
  Vite 8 requires `^20.19 || >=22.12`; Vitest 5 requires `^22.12 || ^24 || >=26`; Node 26
  satisfies both.
- **Legacy baseline only: Node 18** via nvm/volta/Docker. Vue CLI 4 / webpack 4 will not
  build reliably on modern Node; the old app is built once only to establish a baseline.
- **Bun was evaluated and dropped.** Bun 1.4 can run Vite/Vitest/Playwright, but it has no
  LTS policy and this project gains little: the product runs in the browser, and no native
  modules remain after Electron is removed. Node 26 keeps the release gate conservative.
- **Node 27 is Alpha** (Oct 2026–Mar 2027) and is not used. It becomes LTS in Oct 2027.
- **Package manager: keep Yarn** (the existing `yarn.lock`) for the migration. Do not
  introduce a second package manager or lockfile during the rewrite.
- **Phase 0 test runner: Vitest 2.1.9 + Vite 5.4.21**, the last line that supports Node
  18. Step 2.1 upgrades to Vitest 5 + Vite 8 with the rest of the toolchain.

---

## 3. Test gates and the "done" protocol

Every step must pass this gate before it can be marked done in `TRACKER.md`:

1. `yarn test` is green (unit/DB tests covering the step).
2. `yarn build` is green.
3. Step-specific manual checklist is completed.
4. Commit is named `step-<id>: <description>`.
5. Tracker row is updated with status, date, and evidence (test output, CI link,
   screenshot path, or command).
6. `yarn dev` still boots the application.

**Definition of done:** tests exist, pass, and the manual checks are recorded.
"It compiles" is not done.

### Test layers

| Layer | Tool | Purpose |
|---|---|---|
| Unit | Vitest | Money math, invoice formatting, date helpers, cart getters, cashbox math |
| DB | Vitest + fake-indexeddb | Schema opens, seeds, queries, upgrade path |
| Component | `@vue/test-utils` 2 | Only tricky components: cart table, refund modal, forms |
| E2E | Playwright | Register → login → product → inventory → sale → receipt → refund → backup |
| Manual | Checklist | Browser print dialog, barcode keyboard scan, POS hotkeys, responsive layout |

### Data reality check

IndexedDB is origin-scoped. A preview deployment **will not have the user's data**.
Every preview smoke test starts by importing a real backup JSON at the preview origin.

---

## 4. Step-by-step plan

Effort tags: **S** ≤ 0.5 day · **M** 0.5–2 days · **L** 2–5 days.
Effort assumes a solo developer familiar with the codebase.

### Phase 0 — Baseline (no framework changes)

#### Step 0.1 — Reproducible baseline `S`

- Tag the current commit `pre-vue3`.
- Record Node/Yarn versions.
- Use **Node 18** (nvm/volta/Docker) for this step only: Vue CLI 4 / webpack 4 will not
  build reliably on modern Node/OpenSSL. The migration toolchain is **Node 26 LTS** (see
  §2.5); do not try to build the legacy app with Node 26.
- Pin the migration toolchain with `.nvmrc` (`26`) and `package.json` `engines.node`
  (`>=26`). This can be done now or in Step 2.1; record which.
- No application changes.

**Test:** baseline `yarn build` produces `dist/`; serve it and load `/login`.

**Done:** tag exists; baseline command, Node 18 baseline version, and Node 26 target
version documented.

#### Step 0.2 — Characterization tests for pure logic `S`

- Add a Node-18-compatible test runner. **Vitest 2.1.9 + Vite 5.4.21** is used in Phase 0;
  upgrade to Vitest 5 + Vite 8 in Step 2.1.
- No behavior changes. Minimal import-interop fixes are allowed if a test exposes a
  Vite/Node incompatibility; record them.
- Cover:
  - `Maths.percentOfNum` / `Maths.getPercent`
  - `invoiceFormatId`
  - `formatNumber` (money filter logic)
  - `normalizeText` / `compareText`
  - `lastXdays`
  - `enumerateDaysBetweenDates`
  - Cashbox reference, date, and log-type helpers

**Test:** `yarn test` green on the Vue 2 codebase (15 tests at time of writing).

**Done:** these behaviors are pinned before any change.

#### Step 0.3 — DB contract fixture `S`

- Vitest + fake-indexeddb: open `adm_2` with the current schema, seed every table, assert
  the queries used by controllers.
- Save a real exported backup JSON as a fixture (manual export from a running install).
- Verify whether `Dexie.defineClass` still works on Dexie 4. If not, plan to drop the
  class mapping but keep the stored object shape unchanged.

**Test:** fixture restores and all controller queries return expected rows.

**Done:** schema and data contract locked; regressions fail here.

---

### Phase 1 — De-risk on Vue 2 (framework-agnostic)

Each step is independently shippable. Do not skip these unless we explicitly accept a
riskier cutover. They remove the exact patterns Vue 3 no longer supports.

#### Step 1.1 — moment → date-fns `M`

- Replace all `moment` / `$moment` usage in `lib`, `controllers`, `reports`, `views`,
  `components`, and EJS templates.
- Update format tokens and Spanish locale.
- See §2.2 for token mapping.

**Test:** date-helper unit tests; manual sales date-range filter; invoice/report print
output.

**Done:** zero `moment` imports; printed date strings match snapshots.

#### Step 1.2 — Remove Vue filters `S`

- Delete `Vue.filter('money')`.
- Replace `| money` and `| moment(...)` in templates with `$money(...)` / `$date(...)`.
- Files include sales list, sale details, refund modal, receipt preview, cashbox logs,
  accounts, dashboard inventory status, product search.

**Test:** unit tests for `formatNumber`; manual tables and receipts.

**Done:** no `|` filter syntax remains.

#### Step 1.3 — Event bus → mitt `S`

- Replace the `new Vue()` bus with a mitt wrapper exposing `$on/$off/$emit`.
- Provide a Buefy programmatic shim for the existing `EventBus.$buefy` usage.
- Update ~10 files.

**Test:** unit test pub/sub; manual cashbox, registration, settings, side-nav logo flows.

**Done:** no `new Vue()` outside `main.js`.

#### Step 1.4 — Web-only print/platform adapter `M`

- Remove Electron branches from `lib/print.js`, `lib/platform.js`, `lib/electron-utils.js`.
- Make `receiptPrint` render receipt HTML and use browser printing.
- Remove `electron-pos-printer`, Capacitor imports, and splash screen code.

**Test:** unit-test receipt HTML generation; manual print preview in Chromium.

**Done:** no Electron/Capacitor references in runtime code; browser printing works.

#### Step 1.5 — Remove globals and `require()` `M`

- Replace 43 `window.Database.*` sites with module imports.
- Replace 4 `require(...)` calls with ESM imports/assets.

**Test:** unit + build; manual CRUD smoke.

**Done:** no `window.Database`, no `require(` in `src/`.

#### Phase 1 gate

Tag `refactor-complete`; full manual smoke on the old stack; tests green.

---

### Phase 2 — Framework and tooling cutover

#### Step 2.1 — Vite + Vue 3 + Buefy 3 shell `L`

- Add root `index.html` and `vite.config.js` (alias `@`, Vue plugin, PWA plugin).
- Rewrite `package.json` scripts and dependencies.
- Delete `vue.config.js` and `babel.config.js`; move env vars to `VITE_*`.
- Migrate `buefy.scss` to `@use "bulma/sass" with (...)` and
  `@use "buefy/src/scss/buefy"`.
- Replace 8 `@import '~bulma/...'` + `@include mobile` usages with owned breakpoint
  mixins or plain media queries.
- Verify MDI font paths and Poppins assets from `public/`.

**Fallback if SCSS fights back:** prebuilt Bulma/Buefy CSS plus CSS-variable overrides.

**Test:** `yarn dev` mounts the app; `yarn build` green; fields, tags, buttons render with
the correct theme colors.

**Done:** build green, visual theme matches, no `~` imports.

#### Step 2.2 — Router 5 + layouts + i18n 11 `M`

- `createRouter` / `createWebHistory`; async guard; route meta layouts.
- `createI18n({ legacy: false })` + `import.meta.glob` locale loading.
- Register `click-outside` with Vue 3 directive hooks (`beforeMount` / `unmounted`).
- PWA manifest and service worker via `vite-plugin-pwa`.

**Test:** every route renders without console errors; guard redirects registration/login
correctly; `$t` resolves.

**Done:** all routes reachable; PWA installable.

#### Step 2.3 — Pinia 4 store `M`

- Rewrite the 171-line store with the **same action names** (`SET_STORE`,
  `ADD_PRODUCT_TO_SHOPPING_CART`, etc.) to keep call sites recognizable.
- `mapState`/`mapGetters` → `mapState(useAppStore, [...])`.
- `$store.commit/dispatch` → store actions.
- Persist state via `pinia-plugin-persistedstate`.

**Test:** unit tests for cart math/getters; manual cart survives reload; auth guard uses
`userCount`.

**Done:** zero Vuex references; persisted cart and store data match old behavior.

#### Step 2.4 — Vue 3 syntax sweep `L`

- 18 `.sync` → `v-model` / `v-model:name` (especially `b-modal :active.sync`,
  `b-table :checked-rows.sync`).
- 16 `slot="x"` → `#x` (`#footer`, `#empty`, `#title`, `#header`).
- 3 `beforeDestroy` → `beforeUnmount`.
- Buefy audit: `b-modal`, `b-table`, `b-datepicker`, `b-upload`, `b-taginput`,
  `b-select`, `b-tabs`.
- Replace `vue-select` usages (see §2.4).

**Test:** build green + route smoke + Buefy component checklist.

**Done:** no Vue 2-only syntax; no Buefy deprecation warnings at runtime.

#### Step 2.5 — Boot gate `S`

- Cold boot on empty DB → registration.
- Import a real backup → login.
- Visit every route.

**Test:** Playwright smoke: app loads, register, login, navigate all routes, no uncaught
console errors.

**Done:** app usable end-to-end; tag `vue3-alpha`.

---

### Phase 3 — Feature verticals

Order chosen by risk and dependency. Each step ends with unit/DB tests for its logic, a
Playwright or manual flow, and a tracker tick.

#### Step 3.1 — Auth, registration, backup/restore `M`

Acceptance:
- First-run registration works.
- Duplicate username/email rejected.
- Wrong/right login behaves correctly.
- Logout clears the session.
- Export → import round-trip preserves all tables.
- bcrypt hash/compare works.

#### Step 3.2 — Products, providers, customers `L`

Acceptance:
- Create/edit/delete product.
- Unique barcode error message is preserved.
- Search by name/brand/barcode works.
- Provider form validates via VeeValidate 4.
- Customer credit/payment math is correct.

#### Step 3.3 — Inventories `L`

Acceptance:
- Create inventory.
- Add product to inventory.
- Stock, price, and unlimited-stock edits work.
- Low-stock display works.
- Bulk import works.
- Preselected inventory via query param works.

#### Step 3.4 — POS `L`

Acceptance:
- Search/scan adds product to cart.
- Quantity is capped at available stock.
- Discount and customer selection work.
- Cash/credit sale completes.
- Stock is decremented.
- Cashbox log is written.
- Receipt preview works.
- Auto-print setting behaves correctly.

#### Step 3.5 — Sales, refunds, reports `M`

Acceptance:
- List/filter by date/payment/search.
- Totals are correct.
- Sale details render.
- Full/partial refund updates stock, cashbox, and customer credit.
- Invoice printing works.

#### Step 3.6 — Cashbox `M`

Acceptance:
- Add/subtract transaction works.
- Close/balance works.
- Filters and totals work.
- Report printing works.

#### Step 3.7 — Dashboard and charts `S`

Acceptance:
- Dashboard counts are correct.
- Sales chart renders with date range.
- chart.js 4 rendering is correct.

#### Step 3.8 — Settings `M`

Acceptance:
- Store name/logo/currency can be changed.
- POS settings can be changed.
- Database export/import works.

#### Step 3.9 — Remaining screens `S`

- Employees, Routes, About, HelloI18n.
- **Decision: port all screens. Do not delete anything.** Some may be planned work.
- Bring them onto Vue 3 semantics even if functionally unfinished; preserve current
  behavior and routes.

#### Phase 3 gate

Tag `parity`; full critical path passes on imported real data.

---

### Phase 4 — Hardening and release

| Step | Work | Test / done |
|---|---|---|
| **4.1** `M` | CI (GitHub Actions): install, lint, unit, build, Playwright | Pipeline green on PR |
| **4.2** `S` | PWA update flow, offline check, bundle budget | Offline smoke; Lighthouse check |
| **4.3** `S` | Accessibility and responsive audit of POS and tables | Keyboard-only POS flow; mobile widths |
| **4.4** `S` | Cleanup: legacy configs, Cypress leftovers, dormant Electron/Capacitor files, unused deps, README | No dead references; build green |
| **4.5** `L` *(optional)* | TypeScript for `db/`, `controllers/`, `lib/` + `vue-tsc` | Typecheck green |
| **4.6** `S` | Release: tag, deploy, rollback note | Production smoke with real backup |

**Rough effort:** Phase 0 ≈ 2–3 days · Phase 1 ≈ 3–5 days · Phase 2 ≈ 4–6 days ·
Phase 3 ≈ 2–3 weeks · Phase 4 ≈ 3–5 days.

---

## 5. Risk register

| Risk | Impact | Mitigation | Step |
|---|---|---|---|
| Legacy baseline won't build on Node 26 (webpack 4) | Can't verify old behavior | Use Node 18 or Docker for the baseline only; characterization tests | 0.1–0.2 |
| Buefy 3 / Bulma 1 SCSS differences | Blocks boot | Dedicated SCSS migration; fallback to prebuilt CSS + CSS variables | 2.1 |
| Buefy component API changes | Broken modals/tables | Explicit component audit + Playwright smoke | 2.4 |
| Dexie data incompatibility | Data loss (unacceptable) | No schema renames; fixture test; import real backup at preview origin | 0.3, 3.1 |
| Printing behavior changes | Receipts wrong | HTML snapshot tests; browser print baseline; desktop deferred | 1.4, 3.5 |
| `vue-select` unsupported | 3 screens broken | Replace with `b-autocomplete` or `vue-multiselect@3.5` | 3.2 / 3.4 |
| VeeValidate 2 → 4 API change | Two forms break | Rewrite with `Form`/`Field` or `useForm`/`useField`; parity tests | 3.2 / 3.8 |
| Hidden coupling (`window.Database`, EventBus) | Runtime surprises in Vue 3 | Remove before cutover | 1.3, 1.5 |
| Big cutover window | App unusable mid-migration | Phase gates; `pre-vue3` tag; deploy only at `vue3-alpha` / `parity` | all |

---

## 6. Decisions

D1–D5 are decided. D6 is deferred to Step 3.4.

| # | Decision | Options | Recommendation | Status |
|---|---|---|---|---|
| D1 | Form library | Regle 1.29 / VeeValidate 4.15 | **VeeValidate 4.15** (keep vee-validate) | **Decided** |
| D2 | TypeScript timing | JS + JSDoc first / TypeScript now | **JS + JSDoc first**, TS optional in 4.5 | **Decided** |
| D3 | Phase 1 pre-refactors | Full de-risk / collapse into Phase 2 | **Full de-risk** | **Decided** |
| D4 | Unused screens | Port / delete Employees, Routes, About, HelloI18n | **Port all; delete nothing** (may be planned work) | **Decided** |
| D5 | Node toolchain | Node 26 LTS / Node 18 baseline / Bun 1.4 | **Node 26 LTS** for migration; **Node 18** only for legacy baseline; Bun dropped | **Decided** |
| D6 | `vue-select` replacement | `b-autocomplete` / `vue-multiselect@3.5` | Decide in 3.4 after a 1-hour spike | Deferred |

> **D1–D5 decisions (2026-11-16):** Keep VeeValidate (v4), JS + JSDoc first, run the full
> Phase 1 de-risk pass, port all remaining screens without deleting anything, and use Node
> 26 LTS for the toolchain (Node 18 only for the legacy baseline). Bun was dropped.

---

## 7. Milestones and tags

| Tag | Meaning |
|---|---|
| `pre-vue3` | Baseline before any migration work |
| `refactor-complete` | Phase 1 finished on Vue 2 |
| `vue3-alpha` | Vue 3 app boots and all routes render |
| `parity` | All features match pre-migration behavior |
| `release` | Hardened, tested, deployed |

---

## 8. Change log

| Date | Change |
|---|---|
| 2026-11-16 | Initial plan created |
| 2026-11-16 | D5 decided: Node 26 LTS toolchain, Node 18 legacy baseline, Bun dropped |
| 2026-11-16 | D1–D4 decided: VeeValidate 4, JS-first, full Phase 1 de-risk, port all screens |
| 2026-11-16 | Step 0.2: Phase 0 test runner pinned to Vitest 2.1.9 + Vite 5.4.21 (Node 18) |
