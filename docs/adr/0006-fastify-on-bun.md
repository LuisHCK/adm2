---
id: ADR-0006
status: accepted
date: 2026-11-20
---

# 0006 — Fastify on Bun

## Context

We chose Bun as the runtime (ADR-0001). Bun ships its own HTTP server (`Bun.serve`), and
frameworks that sit directly on it get its performance characteristics. Fastify runs on
Bun through the `node:http` compatibility layer.

At five terminals, throughput is irrelevant. What matters is that the server is boring,
predictable, and easy to debug on a customer's Windows machine.

## Decision

Use **Fastify 5** with:

| Plugin | Purpose |
|---|---|
| `@fastify/cookie` | httpOnly JWT + refresh cookie |
| `@fastify/static` | serve the built SPA |
| `@fastify/rate-limit` | login / PIN / approval throttling |
| `@fastify/helmet` | security headers |
| `fastify-type-provider-zod` | Zod schemas → validation + handler types |

No CORS plugin: the SPA is served from the same origin.

## Consequences

**Positive**

- Largest, best-documented Node HTTP ecosystem — easy to hire for and to debug.
- Zod integration types every handler and validates every request body.
- `@fastify/static` gives SPA fallback and correct cache headers with little code.
- The server code stays portable to Node if Bun ever fails us.

**Negative / accepted**

- Bun's HTTP performance is not realised. Explicitly accepted: not a requirement.
- Fastify on Bun is not an officially supported combination; a plugin that depends on
  Node stream internals could misbehave. Phase 0 verifies `@fastify/static` and
  `@fastify/cookie` specifically (roadmap Q4).
- Two compatibility layers (Fastify → node:http → Bun) to reason about in rare bugs.

## Verification

`docs/plan/STATUS.md` `P0-03` must demonstrate, under Bun:

1. a JSON POST with Zod validation and a typed handler;
2. a cookie set and read across requests;
3. a static file served with SPA fallback;
4. a rate-limited endpoint returning 429.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Hono | Better fit for `Bun.serve`, but a smaller ecosystem and less familiar to future maintainers |
| Elysia | Best Bun-native DX, but locks the server to Bun permanently |
| `Bun.serve` directly | Re-implements routing, validation, static files, cookies |
