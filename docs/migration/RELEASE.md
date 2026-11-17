# ADM2 Release and Rollback

- **Release type:** web-first PWA
- **Build output:** `dist/`
- **Runtime:** Node 26 LTS, Yarn 1.22.22
- **Status:** prepared; deploy/tag deferred while git is on hold and a real backup
  fixture is pending.

## Pre-release gate

Run from a clean checkout:

```bash
npm install -g yarn@1.22.22
yarn install --frozen-lockfile
yarn lint
yarn test
yarn build
yarn test:e2e
```

Expected at the time of writing:

- `yarn lint`: 0 errors (18 tracked `no-unused-vars` warnings)
- `yarn test`: 60/60
- `yarn build`: green
- `yarn test:e2e`: 12/12 suites, approximately 3.5 minutes
- Main JS bundle: ~647 kB against an 800 kB budget

### Manual release checks

1. Import a **real user backup JSON** at the preview origin, if any exist
   (IndexedDB is origin-scoped, so a new deployment starts empty otherwise).
   The legacy 1.x format itself is covered by
   `tests/unit/characterization/legacy-backup.spec.js`.
2. Register/login/logout and refresh; the session and store should persist.
3. Create a product, add it to an inventory, and make a cash sale from the POS.
4. Confirm stock decrements, the cashbox log appears, and the receipt print window opens.
5. Perform a partial refund and confirm stock/cashbox/customer credit update.
6. Close the cashbox and print its report.
7. Reload the app offline and navigate between routes.
8. Check the POS and main tables at 390×844 and desktop widths.

## Deployment

1. Upload `dist/` to any static host.
2. Enable **SPA history fallback** so unknown paths serve `/index.html`.
3. Serve over **HTTPS**; service workers and PWA installation require a secure context.
4. Cache headers:
   - `sw.js` and `registerSW.js`: `no-cache` / short max-age.
   - `assets/*`: immutable (content-hashed filenames).
   - `manifest.webmanifest`: short max-age.
5. Do not rewrite `/assets/*` to `index.html`.
6. The build root is `/`. Deploying under a subpath requires setting Vite `base`
   and `createWebHistory` picks it up automatically.

### Same-origin upgrade from the Vue 2 build

The Vue 2 build registered `/service-worker.js`; the Vue 3 build registers `/sw.js`.
A browser that still has the old worker installed keeps serving the cached Vue 2 shell,
so the new `index.html` is never fetched.

`public/service-worker.js` is a cleanup worker emitted at the old path. The old page
calls `register('/service-worker.js')` on boot, the browser picks up the changed bytes,
and the cleanup worker deletes all caches, unregisters itself, and reloads open clients.
The Vue 3 app then installs `/sw.js` normally. On a fresh origin the file is never
registered and has no effect.

Expect **one extra reload** for already-open tabs when upgrading an existing origin.
If a client still shows the old shell after that, do a hard reload; clearing site data
is the last resort.

The service worker is generated with `skipWaiting` + `clientsClaim`, so open clients pick
up the next deployment automatically. A hard reload is the fallback if a client is stuck
on an old shell.

## Rollback

The migration did **not** change the IndexedDB database name or schema
(`adm_2`, version `0.1`, including the legacy `invetory_*` typos). Therefore rollback is a
code-only operation:

1. Keep the previous `dist/` artifact (or rebuild from the `pre-vue3` tag).
2. Redeploy the previous artifact.
3. Ask users to reload; the current service worker will fetch the previous shell on the
   next navigation, or use a hard reload.
4. The previous Vue 2 build can read the same IndexedDB data.

**Do not roll back after any future schema bump without an explicit data migration.**
There has been no schema bump in this migration.

## Post-deploy smoke

- App shell loads and the store name appears in the sidenav.
- Login with the owner account works.
- Product/inventory/POS flows are reachable.
- Receipt print opens a browser print window.
- Offline reload serves the app shell.
- No uncaught console errors on the dashboard, POS, products, sales, and settings.

## Known caveats

- No real user backup fixture exists. The upgrade path is covered instead by
  `tests/fixtures/legacy-backup-v1.json`, generated with the Vue 2 app's own
  libraries (Dexie 3.2.2 + dexie-export-import 1.0.0) and imported in
  `tests/unit/characterization/legacy-backup.spec.js`.
- Employees is a placeholder screen; HelloI18n is preserved but unrouted (D4: no deletions).
- Form labels from Buefy are not programmatically associated with inputs; a full axe audit
  is still recommended.
- 18 ESLint warnings remain (legacy callback arguments).
- `yarn audit` reports 85 advisories, all in build/dev tooling or unused CLI
  sub-dependencies (`ejs > jake`), plus an unpatched `picomatch` in the build
  graph. No vulnerable package appears in `dist/`. See `TRACKER.md`.
- Desktop (Electron) and native (Capacitor) shells are out of scope.
