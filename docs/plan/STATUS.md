---
status: living
updated: 2026-11-20
---

# STATUS — resume work here

This file is the single answer to "where are we?". It is updated at the **end** of every
work session. If it disagrees with reality, fix this file first.

## Cold start (agent or human)

Read, in this order:

1. `docs/plan/STATUS.md` — this file
2. `AGENTS.md` — rules you must not break
3. `docs/plan/roadmap.md` — phases and exit criteria
4. `docs/specs/00-conventions.md` — technical conventions
5. The spec of the task you are about to do

Do not read the whole `docs/` tree before starting. Read the spec for the task only.

## Current position

| Field | Value |
|---|---|
| Phase | **Phase 0 — Stack spike** |
| Phase status | `not started` |
| Spec in progress | none |
| Code state | Vue 3 browser-only app on `master`; no `server/` yet |
| Docs state | Plan, specs, context, ADRs written (2026-11-20) |
| Blocking question | Q4 (Fastify plugins under Bun) — resolved by the spike |
| **Next action** | `P0-01` — create the monorepo skeleton and run `bun --version` / pin it |

## How to update this file

1. Move exactly one task to `in_progress` when you start it.
2. When done: move it to `done`, fill the evidence column, set the next action.
3. If a task is blocked, mark it `blocked` and record **what** would unblock it.
4. Keep the "Current position" table truthful. Delete stale rows; do not accumulate.
5. A session that ends without updating this file is an incomplete session.

## Task board

Statuses: `todo` · `in_progress` · `blocked` · `done` · `dropped`.

### Phase 0 — Stack spike

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P0-01 | Create `server/`, `frontend/`, `shared/` skeleton; pin Bun in `.bun-version` | roadmap §3 | todo | |
| P0-02 | Fastify boots on Bun; `GET /api/v1/health` returns 200 | roadmap §4 | todo | |
| P0-03 | Verify `@fastify/cookie` + `@fastify/static` under Bun | Q4 | todo | |
| P0-04 | `bun test` + `bun run typecheck` run in CI | roadmap §3 | todo | |
| P0-05 | `bun build --compile --target=bun-windows-x64` produces an `.exe` | roadmap §4 | todo | |
| P0-06 | Windows box: service + sale + power cut + restart; data survives | roadmap §4 | todo | |

### Phase 1 — Domain port to TypeScript

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P1-01 | Move `src/` → `frontend/`; fix imports, Vite config, E2E paths | roadmap §3 | todo | |
| P1-02 | Port money primitives (minor units, rounding, tax, percentages) | `00-conventions.md` | todo | |
| P1-03 | Port cart totals and discounts | `sales.md` | todo | |
| P1-04 | Port refund/credit arithmetic | `refunds.md`, `customers-credit.md` | todo | |
| P1-05 | Port dashboard aggregates | `00-conventions.md` | todo | |
| P1-06 | Repository interfaces for every entity (no SQL yet) | `00-conventions.md` | todo | |
| P1-07 | Record every intentional behaviour change vs the Vue 2 app | this file | todo | |
| P1-08 | Confirm 12 E2E suites still pass against `frontend/` | roadmap §4 | todo | |

### Phase 2 — Server core

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P2-01 | SQLite bootstrap: pragmas, migration runner, `schema_migrations` | `00-conventions.md` | todo | |
| P2-02 | Schema: users, sessions, registers, cash, catalog, inventory | specs | todo | |
| P2-03 | Auth: setup, login, refresh rotation, logout, me, lockout | `auth.md` | todo | |
| P2-04 | PIN + admin approval endpoint; session revocation | `auth.md` | todo | |
| P2-05 | Users, roles, permission enforcement, audit log | `users-roles.md` | todo | |
| P2-06 | Registers + cash sessions: open, movements, partial/closing counts | `registers-cash.md` | todo | |
| P2-07 | Catalog: products, services, prices, taxes, providers, customers | `catalog.md` | todo | |
| P2-08 | Inventory: inventories, stock ledger, adjustments, bulk import | `inventory.md` | todo | |
| P2-09 | Sales preview + commit (atomic, idempotent, 409 conflicts) | `sales.md` | todo | |
| P2-10 | Refunds with per-line quantities and approval caps | `refunds.md` | todo | |
| P2-11 | Customer credit: payments, derived balance | `customers-credit.md` | todo | |
| P2-12 | Exchange rates: resolution ladder, USD tender, rounding modes | `currency.md` | todo | |
| P2-13 | Fiscal profile + document series numbering | `fiscal.md` | todo | |
| P2-14 | Concurrency tests: oversell, duplicate submit, concurrent refund | `sales.md` | todo | |

### Phase 3 — Frontend cutover

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P3-01 | API client + shared contract types (JSDoc) | `00-conventions.md` | todo | |
| P3-02 | Replace Dexie repositories with API repositories | all specs | todo | |
| P3-03 | Login, register selection, session expiry, offline block | `auth.md` | todo | |
| P3-04 | POS: preview call, conflict UI, price-change UI | `sales.md` | todo | |
| P3-05 | Cash screens: open, count (blind), close, differences | `registers-cash.md` | todo | |
| P3-06 | Catalog/inventory screens against the API | `catalog.md`, `inventory.md` | todo | |
| P3-07 | Sales/refunds screens against the API | `sales.md`, `refunds.md` | todo | |
| P3-08 | Settings: currency, rounding, fiscal profile | `currency.md`, `fiscal.md` | todo | |
| P3-09 | Remove Dexie, backup import/export from the browser | `backup-restore.md` | todo | |
| P3-10 | All 12 E2E suites green against the server | roadmap §4 | todo | |

### Phase 4 — Operations

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P4-01 | Windows service wrapper (WinSW) + installer script | `backup-restore.md` | todo | |
| P4-02 | Data directory resolution; refuse network shares | roadmap §4 | todo | |
| P4-03 | Pre-migration backup + schema version guard | `backup-restore.md` | todo | |
| P4-04 | Nightly `VACUUM INTO` backups + retention | `backup-restore.md` | todo | |
| P4-05 | Manual backup download endpoint + admin screen | `backup-restore.md` | todo | |
| P4-06 | Restore procedure + verification command | `backup-restore.md` | todo | |
| P4-07 | Admin screens: users, roles, audit, sessions | `users-roles.md` | todo | |
| P4-08 | Fresh-VM rehearsal of the documented install | roadmap §4 | todo | |

### Phase 5 — Printing

| ID | Task | Spec/Ref | Status | Evidence |
|---|---|---|---|---|
| P5-01 | Agent: localhost HTTP server, token auth, `GET /health` | `printing.md` | todo | |
| P5-02 | ESC/POS renderer for receipts (58/80 mm) | `printing.md` | todo | |
| P5-03 | Paper cut + drawer kick | `printing.md` | todo | |
| P5-04 | Register printer config + agent discovery | `printing.md` | todo | |
| P5-05 | Browser-print fallback + cashier notice | `printing.md` | todo | |
| P5-06 | Reference-printer acceptance test | `printing.md` | todo | |

## Behaviour changes vs the Vue 2 app

Every intentional difference between the old app and v2 is recorded here. If a difference
is not listed, it is a bug.

| # | Area | Old behaviour | v2 behaviour | Reason |
|---|---|---|---|---|
| 1 | Storage | IndexedDB per browser | server SQLite | Data survives cleared browsers; multi-terminal |
| 2 | Offline | worked offline | selling blocked without server | Single source of truth |
| 3 | Money | floats + `toFixed(2)` | integer minor units | Rounding correctness |
| 4 | Stock | absolute overwrite | signed movement ledger | Auditability |
| 5 | Cashbox | one global box | per-register sessions + counts | Multi-terminal |
| 6 | Refunds | `refund_type` on the sale | separate numbered adjustment documents | Immutability |
| 7 | Auth | local password check | JWT sessions, roles, lockout | Multi-user |
| 8 | Products | goods only | goods + services | Non-physical sales |
| 9 | Printing | Electron thermal | browser print (Phase 5: agent) | Web-first |
| 10 | Backup | manual browser export | server-side automated + download | Reliability |

## Session log

Newest first. One line per session: date, what changed, what is next.

| Date | Summary | Next action |
|---|---|---|
| 2026-11-20 | Documentation set created: plan, 12 specs, context, 5 ADRs, AGENTS.md | `P0-01` |
