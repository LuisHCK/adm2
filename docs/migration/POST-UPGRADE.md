# Post-Upgrade Improvements

Things worth doing **after** the Vue 3 migration is merged. This is the short list:
only items that are a correctness, money, data, or maintenance risk. Everything
the migration already settled is deliberately absent.

Status at time of writing: `yarn test` 67/67, `yarn test:e2e` 12/12, lint 0 errors,
CI green. Nothing here blocks the merge.

## Priority

| # | Item | Why it matters | Effort |
|---|---|---|---|
| 1 | Decide the deployment origin | Silent, total data loss if it changes | S |
| 2 | Validate receipt printing on real hardware | Money and customer experience at the counter | M |
| 3 | Employees screen is not real | Visible screen backed by a table that does not exist | M |
| 4 | Split the 647 kB single bundle | Slow first load on cheap POS tablets | M |
| 5 | Retire the Vuex compatibility facade | 17 files / 46 call sites of dead-end API | M |
| 6 | Associate form labels with inputs | Screen readers announce unlabeled fields | M |
| 7 | Fix the PWA splash background | Black flash on a light-only app | XS |
| 8 | Track the audit/Sass deprecation runway | Deliberately deferred, needs a decision | S |

---

## 1. Decide the deployment origin

**Why it matters.** IndexedDB is origin-scoped. The database name and schema were
deliberately left unchanged (`adm_2`, v0.1), so:

- **Same origin** → every existing browser keeps its users, products, sales, and
  cashbox. Nothing to do.
- **New origin** → every existing installation starts empty. Without a backup there
  is no recovery path.

This is the only item that can destroy data, and it cannot be fixed later.

**Action.** Confirm the target origin before the first deploy. If it must change,
export backups from the old origin first (Settings → database export).

**Done when.** The deployed origin is documented in `RELEASE.md` and matches the old
app's origin, or a written decision says existing installs start fresh.

## 2. Validate receipt printing on real hardware

**Why it matters.** The Vue 2 app printed through Electron's thermal printer API.
The Vue 3 web build opens `window.print()` with a receipt layout. That is correct for
the browser, but nobody has printed a receipt on the actual POS printer.

**Known risks.** Thermal paper width (58 mm vs 80 mm), margins, page size selection,
cut behaviour, and whether the cashier can complete a sale without a print dialog
blocking the flow. `auto-print` is wired and tested as "opens a print window", not as
"paper comes out correct".

**Action.** Print one cash invoice, one credit invoice, and one cashbox close report on
the real printer. Adjust `@media print` rules in the receipt components only.

**Done when.** A real receipt and a real cierre de caja print correctly without
manual dialog fiddling, on the store's actual hardware.

## 3. Employees screen is not real

**Why it matters.** `/employees` renders a "Nuevo" button and an empty list, so it
looks shipped. It is not: `src/views/Employees.vue` calls `database.employee`, and
there is no `employee` table in the `adm_2` v0.1 schema. `getEmployees()` is never
called, so it does not throw today — it will the moment the button or the hook is
wired up.

**Action.** Either build it (schema bump + `classes.js` model + controller + screen,
which means a real data migration and a rollback story) or remove the route and nav
entry. Both are fine; leaving it as a convincing empty screen is not.

**Done when.** The screen either works end-to-end or is gone.

## 4. Split the 647 kB single bundle

**Why it matters.** The whole app is one chunk: `647.2 kB` against an `800 kB` budget.
It parses before the POS is interactive. The budget is a guard rail, not a target.

**Action.** Route-level `() => import(...)` for the rarely used screens
(`/sales`, `/customers`, `/cashbox`, `/settings`, `/reports`) plus manual chunks for
`chart.js` and `ejs`. Chart.js is only used by the dashboard; `ejs` only by printing.

**Done when.** Initial JS for `/pos` is materially smaller and the dashboard chart
still passes `chart height is stable` in `dashboard.mjs`.

## 5. Retire the Vuex compatibility facade

**Why it matters.** `src/store/index.js` exposes a Pinia-backed object as
`app.config.globalProperties.$store`, and **17 files / 46 call sites** still use it.
It was the right call for a behaviour-preserving migration, but it hides Pinia, breaks
`storeToRefs` ergonomics, and makes every new feature copy the old pattern.

**Action.** Migrate one feature area at a time (start with settings, then layout), moving
to `useStore()` + `storeToRefs()`, then delete `compatStore`. Do this in the same pass
that clears the 18 remaining `no-unused-vars` warnings.

**Done when.** `compatStore` is deleted and `grep -r '\$store' src` returns nothing.

## 6. Associate form labels with inputs

**Why it matters.** Buefy's `<b-field label="…">` renders a label that is not
programmatically tied to its input. Screen readers announce unlabeled fields across
registration, product, customer, and settings forms. `a11y.mjs` currently checks
keyboard flow and unlabeled *buttons*, not inputs.

**Action.** Prefer explicit `<label for>` + `id`, or pass `aria-label` on inputs where a
visible label already exists. Extend `tests/e2e/a11y.mjs` with an input-label check so
it cannot regress.

**Done when.** Every input on the main forms has an accessible name, enforced by the
a11y suite.

## 7. Fix the PWA splash background

**Why it matters.** `vite.config.js` sets `background_color: '#000000'` while the app is
light-theme only. Installed users see a black splash before a white app. This is
`<vite.config.js:17>` and is a one-line fix that makes the PWA feel intentional.

**Action.** Set it to the app's light surface colour (`#fafafa`) and keep
`theme_color: '#1976d2'`.

**Done when.** Installing the PWA shows a light splash on both mobile and desktop.

## 8. Track the audit and Sass deprecation runway

**Why it matters.** Two clocks are running that nobody owns yet.

**Dependency audit.** `yarn audit` reports 85 advisories. None are reachable at runtime:
they are build-time Babel/workbox/glob paths, plus `ejs > jake` CLI sub-dependencies
that never enter the bundle (`grep` for `minimatch`, `picomatch`, `lodash`,
`semver`, `@babel/traverse` in `dist/assets/*.js` returns nothing). `picomatch` has
**no patched release**, so the count cannot reach zero. Track it; do not gate CI on it.

**Sass deprecations.** The build emits 8 warnings: 5 × `if-function`, 2 ×
`global-builtin` (e.g. `transparentize`, `unquote`), 1 × `color-functions`. They
originate in Bulma/Buefy's own SCSS, not in our components, so Dart Sass 3.0 will
require a Bulma/Buefy upgrade rather than a local patch.

**Action.** Re-check both after any Bulma or Vite major. If we ever need to upgrade Dart
Sass, plan a Bulma upgrade in the same pass.

**Done when.** A decision is recorded: either "accepted, re-check quarterly" or an
upgrade is scheduled.

---

## Deliberately not doing

Listed so they do not get re-litigated:

- **TypeScript.** Deferred by decision D2. JSDoc on the data layer is the current
  contract; converting is a separate project.
- **Electron and Capacitor.** Out of scope for the web-first build. The `pre-vue3` tag
  keeps the old shells recoverable.
- **Reaching zero audit findings.** Impossible while `picomatch` is unpatched.
- **Rewriting the i18n setup.** `legacy: false` works; HelloI18n remains unrouted but
  present, per the no-deletions rule.
