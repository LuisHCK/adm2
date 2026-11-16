# ADM2 → Vue 3 Migration Tracker

- **Plan:** [`PLAN.md`](./PLAN.md)
- **Started:** 2026-11-16
- **Toolchain:** Node 26 LTS (legacy baseline: Node 18)
- **Current phase:** Phase 0 — Baseline
- **Current step:** 0.2 — Characterization tests
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
| Phase 0 — Baseline | 3 | 1 | ◐ In progress |
| Phase 1 — De-risk on Vue 2 | 5 | 0 | ☐ Not started |
| Phase 2 — Framework/tooling cutover | 5 | 0 | ☐ Not started |
| Phase 3 — Feature verticals | 9 | 0 | ☐ Not started |
| Phase 4 — Hardening and release | 6 | 0 | ☐ Not started |
| **Total** | **28** | **1** | |

---

## 3. Step tracker

### Phase 0 — Baseline

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 0.1 | Reproducible baseline + `pre-vue3` tag | S | ✅ | 2026-11-16 | 2026-11-16 | Node 18 build + `/login` HTTP 200 | `pre-vue3` → `12f88eb`; build OK |
| 0.2 | Characterization tests (pure logic) | S | ☐ | | | `yarn test` green on Vue 2 | |
| 0.3 | DB contract fixture (fake-indexeddb) | S | ☐ | | | Fixture restore + controller queries | |

**Phase 0 exit criteria**

- [x] `pre-vue3` tag exists.
- [x] Node 18 baseline version and Node 26 target version documented.
- [ ] `.nvmrc` / `engines.node` pinned to Node 26. *(deferred to Step 2.1)*
- [ ] Characterization tests cover money, invoice IDs, dates, and normalization.
- [ ] DB fixture restores all tables and query assertions pass.

### Phase 1 — De-risk on Vue 2

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 1.1 | moment → date-fns | M | ☐ | | | Date helper tests + print output | |
| 1.2 | Remove Vue filters | S | ☐ | | | `formatNumber` tests + table smoke | |
| 1.3 | Event bus → mitt | S | ☐ | | | Pub/sub test + manual flows | |
| 1.4 | Web-only print/platform adapter | M | ☐ | | | Receipt HTML test + browser print | |
| 1.5 | Remove `window.Database` and `require()` | M | ☐ | | | Unit + build + CRUD smoke | |

**Phase 1 exit criteria**

- [ ] No `moment` imports.
- [ ] No `|` filters.
- [ ] No `new Vue()` outside `main.js`.
- [ ] No Electron/Capacitor references in runtime code.
- [ ] No `window.Database` and no `require(` in `src/`.
- [ ] Tag `refactor-complete`.

### Phase 2 — Framework and tooling cutover

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 2.1 | Vite + Vue 3 + Buefy 3 shell | L | ☐ | | | `yarn dev` + `yarn build` + theme check | |
| 2.2 | Router 5 + layouts + i18n 11 + PWA | M | ☐ | | | All routes render; `$t`; guard | |
| 2.3 | Pinia 4 store + persistence | M | ☐ | | | Cart getter tests + reload smoke | |
| 2.4 | Vue 3 syntax sweep | L | ☐ | | | Build + Buefy audit checklist | |
| 2.5 | Boot gate | S | ☐ | | | Playwright smoke + all routes | |

**Phase 2 exit criteria**

- [ ] `yarn build` green on Vue 3 + Vite.
- [ ] Every route renders without uncaught console errors.
- [ ] Buefy 3 components audited (modal, table, datepicker, upload, taginput, select, tabs).
- [ ] Zero Vuex references.
- [ ] PWA installable.
- [ ] Tag `vue3-alpha`.

### Phase 3 — Feature verticals

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 3.1 | Auth, registration, backup/restore | M | ☐ | | | Register/login/logout + import/export round-trip | |
| 3.2 | Products, providers, customers | L | ☐ | | | CRUD + search + VeeValidate 4 validation | |
| 3.3 | Inventories | L | ☐ | | | Inventory/product stock + bulk import | |
| 3.4 | POS | L | ☐ | | | Cart → sale → stock → cashbox → receipt | |
| 3.5 | Sales, refunds, reports | M | ☐ | | | Filters + refund math + invoice print | |
| 3.6 | Cashbox | M | ☐ | | | Transactions + totals + report | |
| 3.7 | Dashboard and charts | S | ☐ | | | Counts + chart range | |
| 3.8 | Settings | M | ☐ | | | Store/POS settings + DB export/import | |
| 3.9 | Remaining screens (port all; no deletions) | S | ☐ | | | All routes render + build | |

**Phase 3 exit criteria**

- [ ] Critical path passes on an imported real backup.
- [ ] Money, stock, refund, and cashbox behavior matches the pre-migration app.
- [ ] All reports and receipts render correctly.
- [ ] Tag `parity`.

### Phase 4 — Hardening and release

| ID | Step | Effort | Status | Started | Done | Tests | Evidence |
|---|---|---|---|---|---|---|---|
| 4.1 | CI pipeline (install, lint, unit, build, e2e) | M | ☐ | | | Pipeline green | |
| 4.2 | PWA update flow, offline, bundle budget | S | ☐ | | | Offline smoke + Lighthouse | |
| 4.3 | Accessibility and responsive audit | S | ☐ | | | Keyboard-only POS + mobile widths | |
| 4.4 | Cleanup and README | S | ☐ | | | No dead refs; build green | |
| 4.5 | Optional TypeScript for domain layer | L | ☐ | | | `vue-tsc` green | |
| 4.6 | Release and rollback note | S | ☐ | | | Production smoke | |

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
| 2026-11-16 | 0.1 | Tag `pre-vue3` → `12f88eb`; branch `migration/vue3`; Node `18.20.8` baseline; Yarn `1.22.22` via corepack (`packageManager` pinned in `package.json`); `NODE_OPTIONS=--openssl-legacy-provider yarn build` succeeded; `serve -s dist` → `/login` HTTP `200`, title and `<div id="app">` present. |

### Running commands

```bash
# unit/DB tests
yarn test

# watch mode
yarn test --watch

# e2e (once configured)
yarn test:e2e

# production build
yarn build

# dev server
yarn dev
```

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
| `pre-vue3` | Baseline before migration | ☐ | |
| `refactor-complete` | Phase 1 finished on Vue 2 | ☐ | |
| `vue3-alpha` | Vue 3 app boots; all routes render | ☐ | |
| `parity` | Features match pre-migration behavior | ☐ | |
| `release` | Hardened, tested, deployed | ☐ | |

---

## 8. Notes and gotchas

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
