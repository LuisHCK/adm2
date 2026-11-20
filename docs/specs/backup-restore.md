---
id: SPEC-012
title: Backup and restore
status: approved
updated: 2026-11-20
depends_on: [SPEC-000]
phase: 4
---

# Backup and restore

## 1. Purpose

Make the store's data independent of any browser, any single disk failure, and any bad
release. This is the direct answer to the v1 failure mode: clearing a browser destroyed the
business.

## 2. Data directory

```text
<data_dir>/            (Windows: C:\ProgramData\ADM2  |  Linux: /var/lib/adm2)
  adm2.sqlite          live database
  adm2.sqlite-wal      WAL
  adm2.sqlite-shm
  secret.key           JWT signing key
  backups/
    adm2-20261120-020000.sqlite
    pre-migration-0007-20261120-031500.sqlite
  logs/
    server.log
```

Rules:

- The data directory is **outside** the install directory, so updates never touch it.
- It must be on a **local disk**. The server refuses to start if the path resolves to a
  network share (`\\`, `//`, mapped drive, or an SMB/CIFS mount). SQLite locking over a
  network filesystem is unsafe.
- `secret.key` is part of the backup set: a restored database without it invalidates
  sessions (acceptable) but must be present for new logins to work.

## 3. Backup types

| Type | Trigger | Retention | Purpose |
|---|---|---|---|
| `nightly` | scheduler, default 02:00 local | last 30 | Routine recovery |
| `pre_migration` | automatically before any schema migration | last 10 | Undo a bad upgrade |
| `manual` | admin action | until deleted | Before known-risky operations |

## 4. Mechanism

- Use `VACUUM INTO '<path>'` on the live database. It produces a consistent, compacted
  copy without stopping the server and without corrupting WAL state.
- File name: `adm2-YYYYMMDD-HHmmss.sqlite`; migrations use
  `pre-migration-<version>-YYYYMMDD-HHmmss.sqlite`.
- The backup file is **not** encrypted in v2. Protect the data directory with OS
  permissions.

### 4.1 Verification (mandatory)

After writing, each backup is verified before it counts as successful:

1. Open it read-only.
2. `PRAGMA integrity_check` must return `ok`.
3. `SELECT COUNT(*) FROM sale` must be ≥ the live count at the start of the backup.
4. `PRAGMA user_version` must match the expected schema version.

A failed verification is logged as an error and surfaced on the admin dashboard. Silent
backup failure is treated as no backup.

## 5. Schedule and failure handling

- The scheduler runs in-process; no external cron.
- If the server was off at the scheduled time, the backup runs on the next start.
- A **missed nightly backup for more than 48 h** raises a dashboard warning.
- Disk-space check: if free space is below `backup_min_free_mb` (default 500), skip with a
  warning rather than fill the disk.

## 6. Restore

Documented procedure, no UI button in v2 (restoring over a live database is dangerous):

```
1. Stop the ADM2 service.
2. Copy the current database to a safe name (never delete it first).
3. Copy the chosen backup to <data_dir>/adm2.sqlite.
4. Remove stale adm2.sqlite-wal and adm2.sqlite-shm.
5. Start the service; the server runs integrity_check on boot.
6. Verify: log in, open the last sale, check the cash session totals.
```

The server **refuses to start** if:

- `integrity_check` fails,
- the schema version is unknown or newer than the binary supports.

It offers a clear log message with the path of the pre-migration backup.

## 7. API and settings

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/backup/status` | `backup.export` | Last success, last failure, next run, size |
| `GET` | `/backup/list` | `backup.export` | Available backups (name, size, date, verified) |
| `POST` | `/backup` | `backup.export` | Create now and stream the file |
| `GET` | `/backup/:name` | `backup.export` | Download an existing backup |
| `GET`/`PATCH` | `/settings/backup` | `settings.write` | Schedule, retention, min free space |

Download streams the file with `Content-Disposition: attachment`. It never exposes other
paths, and the file name is validated against the backup directory listing.

## 8. Edge cases

| Case | Behaviour |
|---|---|
| Backup while a sale is committing | `VACUUM INTO` sees a consistent snapshot |
| Disk full during backup | Fail loudly, delete the partial file, keep the previous backups |
| Backup file corrupted later | Verification at creation; a restore still runs `integrity_check` |
| Data directory moved | Config value only; the server refuses a network path |
| Restore with a newer schema | Server refuses to start (`schema_too_new`) |
| Restore missing `secret.key` | Logins fail until a new key is generated; data is intact |
| Two backups at once | Serialised by a mutex; the second waits or is skipped |
| Clock change (DST) | Scheduler uses local time; a duplicate run is skipped by name collision |

## 9. Acceptance criteria

- **AC-1** A nightly backup exists after the scheduled time and passes the four checks.
- **AC-2** A pre-migration backup is written before any successful migration.
- **AC-3** Restoring a backup into a fresh data directory produces a working server with
  the expected sale count.
- **AC-4** The server refuses to start when `integrity_check` fails.
- **AC-5** The server refuses to start on an unknown or newer schema version.
- **AC-6** The server refuses a data directory on a network share.
- **AC-7** Retention keeps exactly the configured number of nightly backups.
- **AC-8** A failed backup is visible on the dashboard and does not delete older backups.
- **AC-9** Downloading a backup requires `backup.export` and cannot escape the backup
  directory.

## 10. Non-goals

- Point-in-time recovery or WAL archiving.
- Cloud/off-site backup automation (documented as an operator procedure).
- Encryption of backup files.
- Restore from the UI (documented procedure only).
- Backing up the frontend build (it is reproducible from the repository).
