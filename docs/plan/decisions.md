---
status: approved
updated: 2026-11-20
---

# Locked decisions

A decision lands here once it is settled. Each row says **what**, **why in one line**,
and **where the detail lives**. Rows are not edited after the fact; if a decision
changes, add a new row and mark the old one `superseded`.

## Product & scope

| # | Decision | Why | Detail |
|---|---|---|---|
| D01 | Self-hosted, one install per store | Small stores, no ops team, vendor installs remotely | `roadmap.md` §1 |
| D02 | Server is the single source of truth; no offline selling | Two terminals must not diverge | `sales.md` |
| D03 | 1–5 terminals, LAN only | Target segment | `context/market.md` |
| D04 | Web UI only; no native client | One codebase to maintain | `roadmap.md` §2 |
| D05 | Optional local print agent instead of a native app | Solves silent printing without a second UI | `printing.md` |
| D06 | No legacy IndexedDB migration | No backups exist; customers start clean | `roadmap.md` §2 |
| D07 | Internal receipts only; no fiscal invoices in v2 | Customers are unregistered or cuota fija | `fiscal.md` |

## Money & accounting

| # | Decision | Why | Detail |
|---|---|---|---|
| D08 | Accounting currency is NIO, always | Tax and legal base | `currency.md` |
| D09 | Money stored as integer minor units | Float rounding bugs | `00-conventions.md` §3 |
| D10 | Prices canonical in NIO; optional USD anchor | Stores price in córdobas, accept dollars | `currency.md` |
| D11 | USD accepted as tender at the official BCN rate | Legal requirement, real practice | `context/currency-rules.md` |
| D12 | Exchange rate resolved server-side only | A cashier must not choose the rate | `currency.md` |
| D13 | Cash rounding is a payment adjustment, never a price change | Legal price display + exact ledgers | `currency.md` §6 |
| D14 | Every sale snapshots its configuration | Reprints and audits must be reproducible | `sales.md` §7 |

## Data & consistency

| # | Decision | Why | Detail |
|---|---|---|---|
| D15 | Financial rows are append-only | Audit, fiscal retention | `00-conventions.md` §7 |
| D16 | Stock is a movement ledger, not a mutable number | Explainable inventory | `inventory.md` |
| D17 | No stock reservations | Simplicity; conflicts resolved at commit | `sales.md` §5 |
| D18 | Sale commit is one transaction with conditional decrements | Prevents overselling | `sales.md` §6 |
| D19 | `client_uuid` makes sale submission idempotent | LAN retries must not double-charge | `sales.md` §6 |
| D20 | Master data is soft-deleted, never removed | Sales reference it forever | `00-conventions.md` §8 |
| D21 | Users are deactivated, never deleted | Attribution must survive | `users-roles.md` §5 |

## Cash

| # | Decision | Why | Detail |
|---|---|---|---|
| D22 | Cash session belongs to a register, not a cashier | Several people share one drawer | `registers-cash.md` §2 |
| D23 | Counts are observations; they never change the ledger | Otherwise discrepancies vanish | `registers-cash.md` §6 |
| D24 | Partial ("corte") and closing counts in v1 | Handover accountability | `registers-cash.md` §6 |
| D25 | Any cashier may close any drawer | Owner is often off-site | `registers-cash.md` §7 |
| D26 | Counts are blind by default | Prevents fitting the count to the expected value | `registers-cash.md` §6 |

## Access

| # | Decision | Why | Detail |
|---|---|---|---|
| D27 | JWT access token in an httpOnly cookie | XSS cannot exfiltrate it | `auth.md` §3 |
| D28 | Refresh token is opaque, hashed, rotated | Revocation must be immediate | `auth.md` §3 |
| D29 | Two roles (admin, cashier) modelled as permission sets | A third role becomes data, not code | `users-roles.md` §2 |
| D30 | Sensitive actions above a cap need admin approval by PIN | Real-world till control without logout | `users-roles.md` §4 |
| D31 | Permissions enforced server-side only | UI checks are not security | `users-roles.md` §3 |

## Technical

| # | Decision | Why | Detail |
|---|---|---|---|
| D32 | Bun runtime, pinned 1.4.x | Built-in SQLite, hashing, single-file builds | `adr/0001-bun-runtime.md` |
| D33 | SQLite with WAL and `synchronous = FULL` | Power loss must not lose a sale | `adr/0002-sqlite-durability.md` |
| D34 | TypeScript backend; JS + JSDoc frontend | New code typed; no frontend rewrite | `adr/0003-ts-backend-js-frontend.md` |
| D35 | Modular monolith, one deployable process | Five terminals do not need services | `adr/0004-modular-monolith.md` |
| D36 | Hand-written SQL, no ORM | The critical query must stay explicit | `adr/0005-handwritten-sql.md` |
| D37 | Fastify on Bun | Continuity over raw throughput | `adr/0006-fastify-on-bun.md` |
| D38 | Single deployable artifact: server + embedded SPA | Installation and updates stay simple | `adr/0004-modular-monolith.md` |
| D39 | Server tests on `bun test`; frontend on Vitest; E2E on Node | Each tool on its reliable runtime | `00-conventions.md` §10 |

## Superseded

| # | Decision | Superseded by | Date |
|---|---|---|---|
| S01 | Node 26 LTS + yarn 1 only (from the Vue 3 migration) | D32 | 2026-11-20 |
| S02 | No TypeScript anywhere (migration decision D2) | D34 | 2026-11-20 |
