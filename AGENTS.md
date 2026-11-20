# AGENTS.md

Instructions for AI coding agents working in this repository. Follow the nearest
`AGENTS.md` in the directory tree; explicit user instructions override this file.

## What this project is

ADM2 is a point-of-sale and inventory system for small stores in Nicaragua. A **local
server** (self-hosted, one per store) owns the data; 1–5 browsers on the store LAN are
clients. There is no offline mode: without the server, a terminal cannot sell.

Two states exist in this repository right now:

- **v1** — the current browser-only Vue 3 app (`src/`, IndexedDB). Working and shipped.
- **v2** — the target architecture described in `docs/`. Not implemented yet.

Do not assume a capability exists because a spec describes it. Check `docs/plan/STATUS.md`.

## Read before working

1. `docs/plan/STATUS.md` — current phase, task, next action
2. `docs/plan/roadmap.md` — phases and exit criteria
3. `docs/specs/00-conventions.md` — cross-cutting technical rules
4. The **one spec** for the capability you are changing

Do not read the entire `docs/` tree. Do not start coding before the relevant spec is
`approved`.

## Commands

Target commands for v2 (available once the corresponding phase exists):

```bash
bun install              # install dependencies
bun run dev              # server + frontend dev
bun test                 # server tests
bun run typecheck        # tsc --noEmit (Bun does NOT type-check)
bun run build            # frontend build + server bundle
bun build --compile --target=bun-windows-x64 server/src/index.ts --outfile adm2-server
yarn test                # frontend unit tests (Vitest)
yarn test:e2e            # Playwright E2E (runs on Node)
```

Until Phase 1 lands, the existing commands still apply: `yarn dev`, `yarn test`,
`yarn build`, `yarn test:e2e`, `yarn lint`.

Always run before finishing a task: `bun run typecheck`, `bun test`, `yarn test`,
`yarn lint` (where they exist).

## Non-negotiable rules

**Money**

- Integers only. Money in minor units (`_minor`), quantities in thousandths (`_milli`),
  percentages in basis points (`_bp`).
- Never use floats for money. Never `toFixed()` in business logic.
- Round half-up, once, at the point specified in the spec.

**Data**

- `domain/` is pure: no database, HTTP, clock, or filesystem access.
- Financial tables are append-only. Never `DELETE` a sale, payment, movement, count, or
  adjustment. Never `UPDATE` one except the whitelisted status columns
  (`docs/specs/00-conventions.md` §7).
- Master data is soft-deleted. Users are deactivated, never deleted.
- Every mutating endpoint writes an `audit_log` row.

**Authority**

- The server is the only authority on price, tax, stock, totals, and the exchange rate.
  A client-supplied value for any of these is a bug.
- Stock decrements use a conditional `UPDATE ... WHERE stock >= ?` inside a transaction.
  Never read-then-write.
- Every write transaction uses `BEGIN IMMEDIATE`.

**Security**

- Permissions are checked server-side, by permission string. Never by role name.
- JWT lives in an httpOnly cookie. Never put a token in `localStorage` or a JSON body.
- Never log or return passwords, PINs, tokens, or hashes.
- Bind the print agent to `127.0.0.1` only.

**Language and wording**

- The UI is Spanish; code, comments, specs, and commits are English.
- **Never print or use the word "factura"** in receipts, UI, or code. It is "Comprobante de
  venta". We are not an authorised fiscal system.

## Code conventions

- **Server**: TypeScript, `strict`. No `any`; use `unknown` and narrow.
- **Frontend**: JavaScript + JSDoc. Do not convert files to TypeScript.
- JSON and SQL use `snake_case`; TypeScript types use `PascalCase`; functions `camelCase`.
- Public request/response shapes are Zod schemas in `shared/` — the single source of both
  validation and types.
- Hand-written SQL only (no ORM). SQL lives in `server/src/repositories/`.
- `routes → services → domain`; `services → repositories → db`. `domain/` imports nothing
  from the other layers and never imports Fastify.
- No `SELECT *` in application queries; list columns explicitly.

## Testing

- Server: `bun test` in `server/tests/`.
- Frontend: Vitest in `frontend/tests/unit/`.
- E2E: Playwright in `frontend/tests/e2e/`, run with Node.
- Every acceptance criterion in a critical spec (auth, users-roles, registers-cash, sales,
  refunds, customers-credit, currency, fiscal) has at least one test.
- Concurrency behaviour is tested with two independent clients, not mocks.
- Tests must not depend on the machine clock, timezone, or locale. Inject dates.
- A bug fix adds a regression test that fails before the fix.

## Workflow

1. Read the spec. If it is `draft`, do not implement it.
2. Move exactly one task to `in_progress` in `docs/plan/STATUS.md`.
3. Implement, including tests for the acceptance criteria.
4. If behaviour must differ from the spec, change the spec **in the same commit** and note
   why.
5. Update `docs/plan/STATUS.md`: task → `done`, evidence, new next action.
6. Run the full check list above.

A session that ends without updating `STATUS.md` is incomplete.

## Documentation rules

- `docs/` is Markdown only. No code, schemas, OpenAPI files, or fixtures.
- Diagrams are Mermaid blocks.
- The machine-readable API contract is generated from Zod and served at
  `GET /api/v1/openapi.json`; never commit it under `docs/`.
- `docs/migration/` is frozen history. Do not edit or add files there.
- Plans describe order and risk; specs describe behaviour; ADRs record irreversible
  decisions. Do not mix them.

## Tooling

- **Do not invoke Postman or generic API-engineering skills.** The Postman mandate does not
  apply to this repository: contracts are defined in `docs/specs/`, implemented with Zod,
  and served at `/api/v1/openapi.json`.
- Use Context7 for library documentation (Bun, Fastify, Zod, Vue, SQLite).
- Use the `opencode` skill for questions about OpenCode itself.

## Repository map (target)

```text
server/src/domain/         pure business rules
server/src/repositories/   SQL, one module per aggregate
server/src/services/       orchestration + transactions
server/src/routes/         HTTP handlers (Fastify)
server/src/auth/           tokens, permissions, PIN
server/src/db/             connection, pragmas, migrations
server/migrations/         numbered .sql files
shared/                    Zod contracts, constants
frontend/                  Vue 3 app (JS + JSDoc)
agent/                     optional print agent (Node) — Phase 5
docs/                      plan, specs, context, ADRs
```

## Do not

- Add an ORM, a query builder, or an API client generator.
- Introduce offline writes, sync, or local business data in the browser.
- Call `bun:sqlite` from anything outside `server/src/repositories/` or `server/src/db/`.
- Trust a client-supplied price, total, tax, stock, or exchange rate.
- Change `synchronous`, `journal_mode`, or `foreign_keys` pragmas.
- Store money as a float, or quantities as floats.
- Use the word "factura", or print an empty fiscal field.
- Delete or update a financial row outside the whitelisted status columns.
- Rewrite the frontend to TypeScript as part of an unrelated task.
- Edit `docs/migration/`.
- Commit generated artifacts (`dist/`, `openapi.json`, compiled binaries).
