---
id: SPEC-000
status: approved
updated: 2026-11-20
---

# Conventions

Cross-cutting rules every spec and every line of code follows. If a spec contradicts this
document, the spec is wrong — fix it here first.

## 1. Spec lifecycle

```yaml
---
id: SPEC-NNN
title: ...
status: draft | approved | implemented
depends_on: [SPEC-NNN]
---
```

- `draft` — being written; do not implement.
- `approved` — behaviour is agreed; safe to build.
- `implemented` — code and tests exist; changes require a spec change.

Rules:

1. **One spec per capability**, not per endpoint.
2. Every spec has a **Non-goals** section. It is not optional.
3. Acceptance criteria are testable statements. For critical specs they are numbered
   (`AC-1`) and referenced by tests.
4. When behaviour changes, the spec changes **in the same commit** as the code.
5. Specs describe behaviour, not implementation. Table names may appear; class names
   should not.

## 2. Naming

| Thing | Convention | Example |
|---|---|---|
| SQL columns | `snake_case` | `inventory_product_id` |
| JSON fields | `snake_case` (same as SQL) | `"inventory_product_id": 12` |
| TypeScript types | `PascalCase` | `SaleCommitRequest` |
| Functions | `camelCase` | `commitSale()` |
| DB tables | `snake_case`, singular | `sale`, `cash_session` |
| Permission strings | `resource.action` | `cash.close`, `stock.adjust` |
| Error codes | `snake_case` | `stock_conflict`, `session_closed` |
| Spec ids | `SPEC-00X` | `SPEC-005` |

`snake_case` in JSON is deliberate: the existing frontend already speaks it, and it keeps
one vocabulary from database to browser.

## 3. Money

- **Integer minor units**, field suffix `_minor`. `C$12.34` → `1234`.
- Both NIO and USD have exponent 2. A `currency` column accompanies every amount.
- **Never** store or compute money as a float. No `toFixed()` in business logic.
- Percentages are **basis points**, suffix `_bp`. `15%` → `1500`, `10%` → `1000`.
- Rounding of computed money is **half-up** to the minor unit, applied once at the point
  of specification (documented per field). Intermediate values stay integer where
  possible.
- Tax is computed per line on the discounted net line amount, then summed.
- The tax base never includes cash rounding.

Example:

```text
quantity_milli = 3000      (3 units)
unit_price_minor = 1234    (C$12.34)
line_net_minor = 3702      (C$37.02)
tax_rate_bp = 1500         (15%)
tax_minor = 555            (555.3 → 555, half-up)
line_total_minor = 4257
```

## 4. Quantities

- **Integer thousandths**, suffix `_milli`. `0.5 h` → `500`, `1.25 kg` → `1250`.
- Stock, sale quantities, and refund quantities all use `_milli`.
- Stock arithmetic is integer arithmetic. A negative result is a bug, not a rounding
  artifact.

## 5. Time

- All timestamps are **ISO-8601 UTC strings**: `2026-11-20T14:03:22.000Z`.
- Stored as `TEXT` in SQLite. No local time in the database.
- The store's timezone is a **presentation** concern, configured once and used only for
  grouping in reports (a "business day" boundary).
- `created_at` / `updated_at` on every table.

## 6. Identifiers

- Primary keys are SQLite `INTEGER PRIMARY KEY` (rowid alias), called `id`.
- External identifiers (idempotency, references) are UUID v4 strings.
- Sales additionally have a human `number` within a `document_series` (see `fiscal.md`).

## 7. Immutability

These tables are **append-only**: `sale`, `sale_item`, `payment`, `sale_adjustment`,
`sale_adjustment_item`, `cash_movement`, `cash_count`, `cash_session_float`,
`stock_movement`, `audit_log`.

Allowed exceptions, enforced by trigger:

| Table | Allowed mutation |
|---|---|
| `sale` | `status`, `voided_at`, `voided_by`, `void_reason` only |
| `cash_session` | `status`, `closed_at`, `closed_by` only |
| `document_series` | `next_number` only, monotonic |

Deleting a financial row is never allowed, not even by an admin.

## 8. Deletion

- **Master data** (`product`, `customer`, `provider`, `inventory`, `route`) uses
  `deleted_at` (nullable). Reads exclude soft-deleted rows by default.
- **Users** use `active = 0`, never removal.
- Nothing that a financial row references may be hard-deleted.

## 9. API

- Base path `/api/v1`.
- Stateless requests; identity from the httpOnly cookie.
- Every mutating endpoint requires a permission and writes an audit row.
- Content type `application/json`.

### Error envelope

```json
{
  "error": {
    "code": "stock_conflict",
    "message": "Stock insuficiente para 2 líneas",
    "details": { "lines": [{ "product_id": 42, "requested": 2000, "available": 1000 }] }
  }
}
```

| Status | When |
|---|---|
| 400 | Malformed body / failed schema validation |
| 401 | No session, expired token, invalid credentials |
| 403 | Authenticated but lacking permission, or cap exceeded |
| 404 | Unknown resource |
| 409 | State conflict: stock, duplicate submit, already closed, already voided |
| 422 | Semantically invalid but not a state conflict (e.g. negative discount) |
| 429 | Rate limit / lockout |
| 500 | Unexpected; never leaks internals |

`message` is **Spanish** (it may be shown to a cashier). `code` is stable and English.

### Pagination

`?limit=&offset=`; `limit` default 50, max 200. Response:

```json
{ "items": [], "total": 123, "limit": 50, "offset": 0 }
```

### Idempotency

Any endpoint that creates money-moving state accepts `client_uuid`. Replaying the same
`client_uuid` returns the original result with `200`, never a duplicate.

## 10. Testing

| Layer | Runner | Location |
|---|---|---|
| Server domain + DB | `bun test` | `server/tests/` |
| Frontend unit | Vitest 5 | `frontend/tests/unit/` |
| End-to-end | Playwright (Node) | `frontend/tests/e2e/` |

Rules:

1. Every acceptance criterion in a critical spec has at least one test.
2. Concurrency behaviour is tested with **two independent clients**, not mocked.
3. Tests never depend on the machine clock, locale, or timezone. Dates are injected.
4. A bug fix adds a regression test that fails before the fix.

## 11. Permissions

Strings are `resource.action`. Roles map to permission sets; the server checks
permissions, never roles, inside handlers.

Full catalogue and matrix: `users-roles.md`.

## 12. Audit

`audit_log` records:

```
id, created_at, user_id, action, entity, entity_id, details (JSON), ip, session_id
```

Mandatory for: login success/failure, user create/disable, role change, password/PIN
reset, session revoke, sale void, refund, discount above cap, stock adjustment, cash
count, cash close, settings change, fiscal profile change, backup export/restore.

## 13. Configuration snapshots

A sale stores an immutable `config_snapshot` containing everything needed to reproduce
it: exchange rate and source, rounding mode, tax rates applied, fiscal profile id,
accounting currency. Reprints and audits read the snapshot, never current settings.

## 14. Documentation rules

- `docs/` contains **Markdown only**. No code, OpenAPI files, scripts, or fixtures.
- Diagrams are Mermaid blocks inside the Markdown.
- The machine-readable API contract is generated from Zod schemas and served at
  `GET /api/v1/openapi.json`; it is never committed under `docs/`.
- `docs/migration/` is frozen history and must not be edited.

## 15. Definition of done

See `docs/plan/roadmap.md` §7. In short: spec approved, behaviour implemented, criteria
tested, typecheck/lint/tests green, `STATUS.md` updated.
