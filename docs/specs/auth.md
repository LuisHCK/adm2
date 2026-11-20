---
id: SPEC-001
title: Authentication and sessions
status: approved
updated: 2026-11-20
depends_on: [SPEC-000]
---

# Authentication and sessions

## 1. Purpose

Authenticate people to a store server, keep them authenticated without asking for a
password on every sale, and make revocation immediate.

This spec covers **auth sessions** (a login). Cash sessions (a drawer period) are
`SPEC-003`.

## 2. Actors

| Actor | Can do |
|---|---|
| Anyone on the LAN | First-run setup, if no user exists |
| User | Log in, refresh, log out, change password, set PIN, approve with PIN if admin |
| Admin | Everything above, plus reset another user's password/PIN, list and revoke sessions |

## 3. Tokens

### Access token — JWT

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Lifetime | 15 minutes |
| Storage | httpOnly cookie `adm2_access`, `Path=/`, `SameSite=Lax` |
| `Secure` | Only when the server runs with TLS |
| Claims | `sub` (user id), `sid` (auth session id), `role`, `tv` (token version), `iat`, `exp` |

The browser never reads the token. No token is ever returned in a JSON body.

### Refresh token — opaque

| Property | Value |
|---|---|
| Format | 32 random bytes, base64url |
| Lifetime | 7 days, sliding with rotation |
| Storage | httpOnly cookie `adm2_refresh`, `Path=/api/v1/auth`, `SameSite=Lax` |
| Server side | only a SHA-256 hash is stored in `auth_session` |
| Rotation | every successful refresh issues a new token and invalidates the old hash |

Refresh-token **reuse** (presenting an already-rotated token) is treated as theft:
the whole session family is revoked and an audit row is written.

### Validation on every request

1. Verify signature and `exp`.
2. Load the user; reject if `active = 0`.
3. Reject if `user.token_version != tv`.
4. Load the auth session; reject if `revoked_at` is not null or expired.
5. Load role and permissions **from the database** (not from the claim) so role changes
   take effect immediately.

### Signing secret

Generated at first run (32 bytes) and stored in `<data_dir>/secret.key`, or supplied by
`ADM2_JWT_SECRET`. Rotating it invalidates every session, which is the intended
break-glass behaviour.

## 4. Business rules

### 4.1 First-run setup

- `POST /auth/setup` succeeds **only if `user` has zero rows**.
- The check and the insert happen in one `BEGIN IMMEDIATE` transaction; a concurrent
  second call fails with `409 setup_complete`.
- Creates the first user with role `admin`, plus the store name.
- Returns a normal authenticated session.

### 4.2 Login

- Accepts `username` **or** `email`, case-insensitive.
- On success: create `auth_session`, set both cookies, reset the failure counter, answer
  with the user profile.
- On failure: generic `401 invalid_credentials`. Never reveal whether the user exists.
- If `must_change_password = 1`, the session is created but every endpoint except
  `GET /auth/me` and `POST /auth/password` returns `403 password_change_required`.

### 4.3 Lockout

| Scope | Threshold | Lock |
|---|---|---|
| Username | 5 failures in 15 min | 15 min |
| IP | 20 failures in 15 min | 15 min |

- Counters live in `auth_attempt`, so a restart does not reset them.
- Locked logins return `429` with `retry_after` seconds in `details`.
- Failed and locked attempts are audited; the password is never logged.

### 4.4 PIN

- 4–6 digits, unique per user, hashed with `Bun.password` (argon2id).
- Rejects trivially weak values: all-identical, ascending/descending runs.
- Used for two things: quick re-auth and approval of capped actions (§4.5).
- 5 wrong attempts locks the PIN for 5 minutes for that user + register.
- A PIN never replaces a password for a new session; it unlocks an existing one after
  idle lock.

### 4.5 Approval of capped actions

Some actions exceed a cashier's cap (`refund.create` above `refund_cap_minor`,
`discount.create` above `discount_cap_bp`). Those are approved without logging out:

```
POST /auth/approvals
{ "pin": "1234", "permission": "refund.create", "amount_minor": 120000 }
→ 200 { "approval_token": "<JWT>", "expires_in": 120 }
```

- The approver must hold the permission **without** the cap (i.e. an admin).
- `approval_token`: 2 minutes, single use, claims `sub` (approver), `perm`, `limit_minor`,
  `jti`.
- The capped endpoint accepts `approval_token` in the body; the server verifies scope,
  expiry, and that the amount is within the approved limit, then marks the `jti` used.
- Every approval writes an audit row naming both users.

### 4.6 Logout, revocation, deactivation

- `POST /auth/logout` revokes the current auth session and clears both cookies.
- Admin revocation: delete/revoke an auth session by id.
- Deactivating a user (`active = 0`) additionally increments `token_version`, which
  invalidates every access token immediately, and revokes all their auth sessions.
- Password or PIN change increments `token_version` **except** for the current session,
  which is re-issued.

### 4.7 Idle lock

The server does not expire sessions on idle; the access token's 15-minute lifetime plus
the refresh flow is the mechanism. The frontend implements an idle lock screen that
requires the PIN (fast path) or password.

## 5. API

All paths are under `/api/v1`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/auth/setup` | none | `{ required: true\|false }` |
| `POST` | `/auth/setup` | none | Create first admin |
| `POST` | `/auth/login` | none | Authenticate |
| `POST` | `/auth/refresh` | refresh cookie | Rotate tokens |
| `POST` | `/auth/logout` | access | Revoke current session |
| `GET` | `/auth/me` | access | Profile + permissions |
| `POST` | `/auth/password` | access | Change own password |
| `POST` | `/auth/pin` | access | Set/replace own PIN (requires password) |
| `POST` | `/auth/unlock` | access | Re-auth with PIN after idle |
| `POST` | `/auth/approvals` | admin | Mint an approval token |
| `GET` | `/auth/sessions` | access | Own active sessions |
| `DELETE` | `/auth/sessions/:id` | access | Revoke own session |

### `POST /auth/login`

```json
{ "username": "ana", "password": "…", "register_id": 2 }
```

`register_id` is optional; when present it binds the auth session to that register (used
to warn before closing a shared drawer).

Response `200`:

```json
{
  "user": { "id": 3, "name": "Ana", "username": "ana", "role": "cashier" },
  "permissions": ["sale.create", "cash.open", "cash.close"],
  "register_id": 2
}
```

### `GET /auth/me`

```json
{
  "user": { "id": 3, "name": "Ana", "username": "ana", "role": "cashier" },
  "permissions": ["sale.create", "cash.open", "cash.close"],
  "store": { "name": "Pulpería Central" },
  "must_change_password": false
}
```

## 6. Data model

### `user`

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `name` | text | Display name |
| `username` | text | Unique, case-insensitive |
| `email` | text null | Unique when present |
| `password_hash` | text | argon2id |
| `pin_hash` | text null | argon2id |
| `role` | text | `admin` \| `cashier` |
| `active` | integer | 0/1, default 1 |
| `token_version` | integer | default 1 |
| `must_change_password` | integer | 0/1 |
| `created_at`, `updated_at` | text | ISO-8601 UTC |

### `auth_session`

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `user_id` | integer FK | |
| `register_id` | integer FK null | Bound at login |
| `refresh_hash` | text | SHA-256 of the refresh token |
| `family_id` | text | Shared by rotations; used for reuse detection |
| `device_label` | text null | User agent summary |
| `ip` | text null | |
| `created_at`, `last_used_at`, `expires_at` | text | |
| `revoked_at` | text null | |

### `auth_attempt`

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `kind` | text | `login` \| `pin` |
| `identifier` | text | Username or user id |
| `ip` | text | |
| `success` | integer | 0/1 |
| `at` | text | |

## 7. Edge cases

| Case | Behaviour |
|---|---|
| Two setup calls race | One wins; other gets `409 setup_complete` |
| Refresh with a rotated token | Revoke the family; `401 session_revoked` |
| Access token valid but user disabled | `401` (rejected at step 2) |
| Role changed mid-session | Takes effect on the next request (role read from DB) |
| Server clock jumps | Access tokens may expire early; refresh recovers |
| Cookie blocked by browser | The app shows "cookies required" instead of looping |
| `must_change_password` user calls a normal endpoint | `403 password_change_required` |
| Admin approves their own capped action | Allowed only if they hold the uncapped permission; audited |

## 8. Acceptance criteria

- **AC-1** On a fresh database, `GET /auth/setup` returns `{required: true}`; after setup,
  `{required: false}` and `POST /auth/setup` returns `409`.
- **AC-2** A valid login sets both cookies with `HttpOnly`; no token appears in the body.
- **AC-3** Five wrong passwords for one username within 15 minutes return `429` on the
  sixth, even after a server restart.
- **AC-4** `POST /auth/refresh` returns a new refresh token and invalidates the old one.
- **AC-5** Replaying an old refresh token revokes the family and returns `401`.
- **AC-6** Setting `active = 0` makes the next request with an existing access token
  return `401`.
- **AC-7** A cashier changing their password invalidates their other sessions but not the
  current one.
- **AC-8** An approval token for `refund.create` cannot be reused, and cannot be used for
  a discount.
- **AC-9** A user with `must_change_password = 1` cannot reach any endpoint except
  `/auth/me` and `/auth/password`.
- **AC-10** No response or log line contains a password, PIN, or refresh token.

## 9. Non-goals

- OAuth, SSO, LDAP, or external identity providers.
- Password reset by email (no outbound email in v2).
- Two-factor authentication.
- Public self-registration.
- Per-endpoint API keys or machine tokens (the print agent has its own token,
  see `printing.md`).
