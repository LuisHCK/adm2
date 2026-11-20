---
id: ADR-0003
status: accepted
date: 2026-11-20
---

# 0003 — TypeScript backend, JS + JSDoc frontend

## Context

The frontend is a working Vue 3 app written in JavaScript with JSDoc. Rewriting it in
TypeScript would touch every file and risk the behaviour we just stabilised. The backend
does not exist yet, so its language choice costs nothing today.

An earlier migration decision (D2) chose "no TypeScript" to avoid a large mechanical
rewrite during the Vue 2 → Vue 3 port. That constraint applied to the frontend.

## Decision

- **Server**: TypeScript, `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **Frontend**: unchanged — JavaScript + JSDoc.
- **Contracts**: Zod schemas in `shared/`, which are the single source of runtime
  validation and static types.
- The frontend consumes those contracts through JSDoc `import()` types.
- `tsc --noEmit` runs in CI because Bun transpiles TypeScript without type-checking it.

## Consequences

**Positive**

- New code, especially money and concurrency paths, is type-checked.
- Zod gives one schema for validation and types — no drift.
- The frontend gets editor-level typing at the API boundary with zero rewrite.
- The split is honest: typed where it is cheap, untyped where rewriting is expensive.

**Negative / accepted**

- Two languages in the repo. Editors and tools must handle both.
- `tsc` is a separate CI step; forgetting it means type errors ship silently.
- Shared types are compile-time only; the frontend still needs runtime validation of
  responses at trust boundaries (server is trusted, so minimal).
- `checkJs` stays **off** globally; turning it on would surface hundreds of pre-existing
  errors and turn migration into cleanup.

## Rules that follow

1. No `any` in new server code. Use `unknown` + narrowing.
2. Public request/response shapes are Zod schemas, never hand-written interfaces.
3. Generated OpenAPI (`GET /api/v1/openapi.json`) is derived from Zod; it is not authored.
4. Frontend JSDoc types point at `shared/`, not at duplicated local typedefs.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| TypeScript everywhere | Large mechanical rewrite of a working frontend |
| JavaScript everywhere | Money/stock rules are where types pay off most |
| TypeScript via JSDoc in the backend | Weaker guarantees for less benefit on new code |
