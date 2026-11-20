---
status: approved
updated: 2026-11-20
---

# ADM2 v2 — Roadmap

This document is the **plan**: what we build, in what order, and how we know a phase is
finished. It deliberately contains no API details and no business rules — those live in
`docs/specs/`.

Read `docs/plan/STATUS.md` first if you are resuming work.

## 1. What we are building

ADM2 today is a browser-only POS/inventory app (Vue 3, IndexedDB). It works, but the
browser is the source of truth: clearing site data destroys a store's history, and two
terminals cannot share data.

**v2 is the same product, self-hosted, with a server as the single source of truth.**

- One server per store, installed by the vendor on the store's own machine.
- 1–5 terminals on the store LAN, using a browser.
- Central SQLite database, automated backups, multi-user with roles.
- No offline mode: if the server is unreachable, the terminal cannot sell.
- Web-first. No Electron/Capacitor client. A small optional print agent is Phase 5.

## 2. Non-goals for v2

- Offline-first sync, conflict resolution, or local writes on the client.
- Multi-store / multi-tenant hosting. One install = one store.
- Cloud deployment, Kubernetes, Postgres.
- Structured e-invoicing (XML, signing, tax-authority providers).
- Work orders, repair-shop intake, item custody, deposits.
- Card payments, loyalty, purchasing/supplier orders.
- Native desktop or mobile app shells.

## 3. Target repository layout

```text
frontend/     today's src/ — Vue 3, JS + JSDoc
server/       Bun + Fastify + TypeScript + SQLite
shared/       contracts and constants shared by server and frontend
agent/        optional local print agent (Node) — Phase 5
docs/         this documentation set
```

`src/` becomes `frontend/` in Phase 1. The existing `tests/e2e/` moves under
`frontend/tests/e2e/` at the same time.

## 4. Phases

Each phase has **exit criteria**. A phase is not done because the code compiles; it is
done when the criteria are demonstrated and recorded in `STATUS.md`.

### Phase 0 — Stack spike (0.5–1 day)

Prove the runtime and the durability model before writing application code.

Tasks: `P0-01` … `P0-06`.

**Exit criteria**

1. `bun install`, `bun test`, `bun run typecheck` succeed on a clean checkout.
2. Fastify boots under Bun and serves a JSON health endpoint.
3. `@fastify/cookie` and `@fastify/static` work (they touch headers/streams).
4. `bun build --compile --target=bun-windows-x64` produces an `.exe`.
5. On a real Windows 10/11 machine: run as a service, write a row, **cut the power**,
   restart, and the row is still there with `synchronous = FULL`.
6. SQLite rejects an FK violation (`foreign_keys = ON` is actually applied).

If 4–5 fail, stop and re-evaluate the runtime before Phase 1.

### Phase 1 — Domain port to TypeScript

Port the business rules out of Vue components into `server/src/domain`, using the
existing Vitest suite (67 tests) as the specification.

Tasks: `P1-01` … `P1-08`.

**Exit criteria**

1. Money, tax, cart totals, discounts, refunds, customer credit, dashboard aggregates
   exist as pure functions with no I/O.
2. The ported rules pass tests derived from the current behaviour; every intentional
   behaviour change is listed in `STATUS.md` with its reason.
3. `frontend/` still builds and all 12 E2E suites still pass against the old app.
4. No Dexie import inside `server/src/domain`.

### Phase 2 — Server core

SQLite schema, migrations, repositories, the transactional endpoints, auth, first-run
setup.

Tasks: `P2-01` … `P2-14`.

**Exit criteria**

1. Migrations apply from an empty database and are idempotent on re-run.
2. Sale commit is atomic; concurrent oversell returns exactly one success and one 409.
3. Duplicate `client_uuid` charges once and replays the original sale.
4. Refunds reverse stock, cash, and credit correctly; caps require approval.
5. Cash sessions open, count (partial and closing), and close; expected balances are
   computed server-side and reconcile per currency.
6. Auth: setup, login, refresh rotation, logout, lockout, PIN, session revocation.
7. Every mutating endpoint enforces permissions server-side and writes an audit row.

### Phase 3 — Frontend cutover

The frontend talks to the API. Dexie is removed. Terminal/register selection, login,
and the offline block are implemented.

Tasks: `P3-01` … `P3-10`.

**Exit criteria**

1. No IndexedDB business data remains; the browser stores only app shell + register id.
2. All 12 E2E suites pass against the server-backed app.
3. Losing the server connection blocks selling with an explicit message, and does not
   lose a completed sale.
4. Session expiry mid-cart preserves the cart.
5. A sale conflict shows which lines changed and lets the cashier fix them.

### Phase 4 — Operations

Installer, service hosting, backups, migrations guard, restore procedure, audit and
admin screens.

Tasks: `P4-01` … `P4-08`.

**Exit criteria**

1. Fresh Windows VM: install → first-run setup → sale → nightly backup → restore,
   performed by following the documented steps only.
2. A pre-migration backup is taken automatically before every schema migration.
3. The server refuses to start on an unknown schema version.
4. Data directory outside the install directory; the server refuses a network share.

### Phase 5 — Printing

Optional local print agent, ESC/POS receipts, drawer kick, browser-print fallback.

Tasks: `P5-01` … `P5-06`.

**Exit criteria**

1. Receipt prints with no browser dialog when the agent is present.
2. Paper cut and cash drawer kick work on the reference printer.
3. With no agent, the app falls back to browser print with an explicit notice.
4. Agent binds to `127.0.0.1` and requires the register token.

## 5. Risks

| Risk | Trigger that tells you it materialised | Mitigation |
|---|---|---|
| Wrong accounting detail discovered late (rounding, tax base) | Accountant flags a rule after Phase 2 | Specs isolate money rules; `config_snapshot` keeps history reproducible |
| Bun instability on a customer Windows box | Crash, service restart loop, data lock | Phase 0 spike on real hardware; pinned version; Node fallback is possible but not built |
| Power loss losing a sale | Missing sale after outage | `synchronous = FULL`; Phase 0 power-cut test |
| Concurrency bug overselling | Stock goes negative | Atomic conditional decrement; two-terminal test in Phase 2 |
| Frontend rewrite creeping in | "While we're here" PRs | Specs + non-goals; cutover is Phase 3 only |
| Scope creep into e-invoicing | A customer asks for "facturas" | Fiscal spec keeps v2 as internal receipts |
| Doc/code drift | Spec describes behaviour code no longer has | Spec change ships with code change |

## 6. Open questions

Blocking nothing today, but must be answered before the phase noted.

| # | Question | Needed before | Owner |
|---|---|---|---|
| Q1 | Accountant: is rounding **up** acceptable under Ley 842? | Phase 2 (sales) | User |
| Q2 | Accountant: does a "Comprobante de venta" for an unregistered/cuota-fija store need a legend? | Phase 3 (receipts) | User |
| Q3 | Bun for package management across the whole monorepo, or server only? | Phase 1 | User |
| Q4 | Fastify plugin compatibility under Bun (`@fastify/static`, `@fastify/cookie`) | Phase 0 | Spike |
| Q5 | Code-signing certificate budget for the Windows installer | Phase 4 | User |

## 7. Definition of done (per task)

1. Spec exists and is `approved` (or the task is infrastructure, listed in `STATUS.md`).
2. Code implements the spec's rules; no undocumented behaviour.
3. Acceptance criteria have tests, or a written waiver.
4. `bun run typecheck`, `bun test`, `yarn test` (frontend), `yarn lint` pass.
5. `docs/plan/STATUS.md` updated: task moved to Done, next action set.
6. If behaviour changed, the spec changed in the same commit.

## 8. Document index

| Document | Purpose |
|---|---|
| `docs/plan/STATUS.md` | Where work stands; how to resume |
| `docs/plan/roadmap.md` | This file |
| `docs/plan/decisions.md` | Locked decisions and where they are recorded |
| `docs/specs/00-conventions.md` | Cross-cutting technical conventions |
| `docs/specs/*.md` | One spec per capability |
| `docs/context/*.md` | Business, legal, and market background |
| `docs/adr/*.md` | Why irreversible choices were made |
| `AGENTS.md` | Instructions for AI coding agents |
