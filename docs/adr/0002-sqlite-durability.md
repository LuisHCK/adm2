---
id: ADR-0002
status: accepted
date: 2026-11-20
---

# 0002 — SQLite with WAL and `synchronous = FULL`

## Context

One store, 1–5 terminals, a single server. The workload is a few hundred writes per day
and a handful of concurrent readers. Data is financial: a lost sale is a real loss, and
grid power is unreliable.

The usual SQLite advice — WAL + `synchronous = NORMAL` — explicitly allows the **last
committed transactions to be lost** on power failure (the database stays consistent).

## Decision

SQLite, one file, with these pragmas set at connection open:

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
```

All write transactions use `BEGIN IMMEDIATE` (`.immediate` in `bun:sqlite`) so the write
lock is taken up front and `SQLITE_BUSY` on commit is avoided.

No ORM (see ADR-0005). Migrations are numbered SQL files applied inside a transaction.

## Consequences

**Positive**

- A completed sale survives a power cut.
- `BEGIN IMMEDIATE` plus conditional `UPDATE … WHERE stock >= ?` gives correct concurrency
  without an application lock.
- Backups are a file copy / `VACUUM INTO`; restore is documented and testable.
- `foreign_keys = ON` makes the schema's relationships real.

**Negative / accepted**

- `FULL` costs an fsync per commit. Irrelevant at this volume; measurable only in
  synthetic benchmarks.
- Single writer. Fine for five terminals; every write is sub-millisecond.
- The data directory must be on a **local disk**. The server must refuse network shares —
  SQLite locking over SMB/CIFS is unsafe.
- Schema changes require a migration and a pre-migration backup.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| `synchronous = NORMAL` | Can lose the last committed sale on power loss |
| Postgres | Operational burden for a single-store install; no benefit at this scale |
| LiteFS / rqlite | Distributed concerns we explicitly do not have |
| Hosted database | Requires internet, contradicts on-site requirement |

## Notes

`busy_timeout` alone is not a concurrency strategy; it is a safety net. Correctness comes
from `BEGIN IMMEDIATE` and conditional updates.
