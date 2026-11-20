---
id: ADR-0004
status: accepted
date: 2026-11-20
---

# 0004 — Modular monolith, one deployable artifact

## Context

The product is installed on a single store server, used by 1–5 browsers on a LAN. It has
clear internal boundaries (auth, catalog, inventory, sales, cash, fiscal) but no
independent scaling, deployment, or team-ownership needs.

## Decision

**One process, one database, one artifact.** Internal modules are separated by directory
and dependency direction, not by network calls:

```text
server/src/
  domain/         pure rules, no I/O
  repositories/   SQLite access, one module per aggregate
  services/       orchestration + transactions
  routes/         HTTP handlers
  auth/           tokens, permissions, PIN
  db/             connection, pragmas, migrations
```

Dependency direction: `routes → services → domain`, `services → repositories → db`.
`domain` imports nothing from the other layers.

The built SPA is **served by the same process**. One origin, one install.

## Consequences

**Positive**

- One artifact to install, update, back up, and support.
- No CORS, no cross-origin cookies, no service discovery.
- Transactions can span any business operation without distributed coordination.
- Debugging is a single log stream.

**Negative / accepted**

- A crash affects the whole store — mitigated by running as a supervised service.
- Deployment granularity is all-or-nothing. Acceptable: releases are infrequent.
- Module boundaries must be enforced by review and lint, not by the network.

## Boundaries that must not be violated

| Rule | Reason |
|---|---|
| `domain/` has no imports from `db/`, `repositories/`, `routes/`, or Fastify | Keeps rules testable and portable |
| `routes/` never executes SQL | All access through repositories/services |
| One transaction per business operation, opened in `services/` | Atomicity |
| No module imports another module's repository | Cross-aggregate access goes through services |

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Separate frontend/backend deployments | Two things to install, CORS, version skew |
| Microservices | No scaling need; adds failure modes |
| Serverless | Requires internet; contradicts on-site |
| Separate worker process | No background workload that justifies it (backups can run in-process) |
