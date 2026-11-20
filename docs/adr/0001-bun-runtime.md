---
id: ADR-0001
status: accepted
date: 2026-11-20
---

# 0001 — Bun as the server runtime

## Context

The server is self-hosted on the customer's Windows machine, installed and supported
remotely. Installation failures are expensive to diagnose. The previous app was
Node/Vue-CLI based; the migration target was Node 26 LTS.

Three operational needs dominate:

1. **No native module build step** on a store's PC.
2. **Durable SQLite** with sane concurrency primitives.
3. **A single artifact** to install and update.

## Decision

Use **Bun 1.4.x, pinned**, as the server runtime. Use its native facilities:

- `bun:sqlite` (no `better-sqlite3`)
- `Bun.password` (argon2id)
- `bun build --compile --target=bun-windows-x64` for the distributable
- `bun test` for server tests
- `bun install` as package manager

The frontend keeps its existing toolchain (Vite, Vitest) and Playwright stays on Node.

## Consequences

**Positive**

- No native modules on customer machines: SQLite and password hashing are built in.
- One `.exe` containing the server and the built SPA — dramatically simpler installs.
- `db.transaction(fn).immediate` maps directly onto the concurrency model we need.
- Cross-compiling a Windows binary from a developer Mac.

**Negative / accepted**

- Bun is not an LTS project; releases move fast. Mitigated by pinning.
- Some Node-API native modules do not work. The print agent therefore stays on Node.
- The ecosystem is smaller; a missing package means writing it.
- Windows **service hosting** is not solved by Bun — we still need WinSW/NSSM.
- Fastify runs through the `node:http` compatibility layer, so Bun's HTTP speed is not
  realised. Accepted: five terminals do not need throughput.

**Reversal cost.** Moderate. Domain and repository code is runtime-agnostic; the
runtime-specific surface is the SQLite driver, hashing, and the build step.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Node 26 + better-sqlite3 | Native builds on Windows; needs Node installed or SEA packaging |
| Node 26 + `node:sqlite` | Fewer built-ins; packaging story weaker |
| Deno | Less mature Windows story for this use case |

## Evidence

See `docs/plan/STATUS.md` `P0-01`…`P0-06` for the spike that validates this decision.
