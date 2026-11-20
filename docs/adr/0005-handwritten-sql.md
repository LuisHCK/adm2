---
id: ADR-0005
status: accepted
date: 2026-11-20
---

# 0005 — Hand-written SQL, no ORM

## Context

The schema is small (under twenty tables), the queries are mostly simple, and one query is
critical to correctness:

```sql
UPDATE inventory_product
   SET stock_milli = stock_milli - :qty
 WHERE id = :id AND stock_milli >= :qty;
```

If zero rows change, the sale must fail with a conflict. An ORM that hides this behind a
model method makes the most important invariant in the system implicit.

The backend is JavaScript-adjacent (TypeScript) without a heavy type-generation pipeline,
which is where ORMs pay off most.

## Decision

- Use `bun:sqlite` prepared statements directly.
- SQL lives in `server/src/repositories/<aggregate>.ts`, one module per aggregate.
- Migrations are numbered `.sql` files applied in a transaction, tracked in
  `schema_migrations`.
- Rows are typed at the repository boundary and mapped to domain types.
- No query builder, no entity mapping, no lazy loading.

## Consequences

**Positive**

- The concurrency-critical statements are visible and reviewable.
- No N+1 surprises, no hidden transactions, no lazy-loading in request handlers.
- Migrations are plain SQL: portable, auditable, easy to review in a diff.
- Startup is fast and the dependency surface is tiny.

**Negative / accepted**

- More boilerplate mapping rows to objects.
- No automatic relation loading; joins are explicit.
- Schema changes require writing both the migration and the repository code.
- Type safety depends on discipline at the repository boundary — verified by tests.

## Rules

1. Every repository function takes/returns domain types, never raw `any`.
2. Parameter binding only. No string concatenation of values.
3. Reads that feed the UI may use a single joined query; no per-row queries in a loop.
4. Write paths use `BEGIN IMMEDIATE` and are owned by a service, never by a route.
5. `PRAGMA foreign_keys = ON` is verified at startup, not assumed.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Drizzle | Nice, but its value is TypeScript inference we barely use; adds a layer over the one query that must stay explicit |
| Prisma | Generates a client, its own engine binary, and a build step; heavy for five terminals |
| Kysely | Query-builder indirection without enough benefit at this size |
