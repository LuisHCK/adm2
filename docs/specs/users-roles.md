---
id: SPEC-002
title: Users, roles and permissions
status: approved
updated: 2026-11-20
depends_on: [SPEC-000, SPEC-001]
---

# Users, roles and permissions

## 1. Purpose

Define who may do what, and how that is enforced. Roles are the only thing the UI shows;
**permissions are what the server checks**.

## 2. Roles

Two roles ship in v2. They are stored as named permission sets, not as `if role === …`
branches, so a third role is data.

### `admin`

Every permission, no caps. Can manage users, settings, fiscal profile, backups, and
review differences.

### `cashier`

| Permission | Granted |
|---|---|
| `sale.create` | ✅ |
| `sale.read.own` | ✅ |
| `sale.read.all` | ⛔ |
| `sale.void` | ⛔ |
| `refund.create` | ✅ up to cap |
| `refund.approve` | ⛔ |
| `discount.create` | ✅ up to cap |
| `discount.approve` | ⛔ |
| `product.read` | ✅ |
| `product.write` | ⛔ |
| `price.write` | ⛔ |
| `stock.read` | ✅ |
| `stock.adjust` | ✅ with reason |
| `stock.backorder` | ⛔ |
| `inventory.write` | ⛔ |
| `customer.read` | ✅ |
| `customer.create` | ✅ |
| `customer.write` | ⛔ |
| `customer.payment` | ✅ |
| `cash.open` | ✅ |
| `cash.count` | ✅ |
| `cash.close` | ✅ |
| `cash.close.other` | ✅ |
| `register.write` | ⛔ |
| `report.read` | ⛔ |
| `report.read.own` | ✅ |
| `settings.read` | ⛔ |
| `settings.write` | ⛔ |
| `user.read` | ⛔ |
| `user.write` | ⛔ |
| `audit.read` | ⛔ |
| `backup.export` | ⛔ |
| `backup.restore` | ⛔ |

Notes:

- `sale.read.own` means sales they created **and** sales on registers they operated during
  the shift. Implementations may scope by `sale.user_id = :me`.
- `report.read.own` is a shift summary, not the full reports module.
- `cash.close.other` exists because any cashier may close a shared drawer (SPEC-003 §7).

## 3. Permission catalogue (canonical list)

```text
sale.create            sale.read.own          sale.read.all        sale.void
refund.create          refund.approve
discount.create        discount.approve
product.read           product.write          price.write
stock.read             stock.adjust           inventory.write       stock.backorder
customer.read          customer.create        customer.write        customer.payment
cash.open              cash.count             cash.close           cash.close.other
report.read            report.read.own
settings.read          settings.write
user.read              user.write
audit.read             backup.export          backup.restore
register.write
```

Rules:

1. The server checks **permissions**, never role names, inside handlers.
2. A missing permission returns `403 forbidden` with the permission name in `details`.
3. Permissions are loaded per request from the role definition, so a change takes effect
   immediately.
4. New permissions must be added here before being used in code.

## 4. Caps

Caps are **per store settings**, expressed in minor units and basis points:

| Setting | Default | Meaning |
|---|---|---|
| `refund_cap_minor` | `50000` (C$500.00) | Maximum refund a cashier may issue alone |
| `discount_cap_bp` | `1000` (10%) | Maximum discount a cashier may apply alone |

Above the cap, the action requires an approval token from a user with the matching
`*.approve` permission (SPEC-001 §4.5).

Caps are evaluated on the **NIO base amount** of the operation, regardless of the tender
currency.

## 5. User lifecycle

| Step | Rule |
|---|---|
| Create | Admin only. Requires name, username, role, temporary password |
| First login | `must_change_password = 1` forces a password change |
| Edit | Name, email, role. Changing role bumps `token_version` |
| Reset password | Admin sets a temporary password; `must_change_password = 1`; all sessions revoked |
| Set/reset PIN | Admin only for other users; a user may set their own with their password |
| Deactivate | `active = 0`; sessions revoked; **never deleted** |
| Reactivate | `active = 1`; a new login is required |

Usernames are unique case-insensitively; emails are unique when present.

## 6. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/users` | `user.read` | List (paginated) |
| `POST` | `/users` | `user.write` | Create |
| `PATCH` | `/users/:id` | `user.write` | Edit name/email/role/active |
| `POST` | `/users/:id/password` | `user.write` | Reset password |
| `POST` | `/users/:id/pin` | `user.write` | Set/reset PIN |
| `GET` | `/users/:id/sessions` | `user.write` | List auth sessions |
| `DELETE` | `/users/:id/sessions/:sid` | `user.write` | Revoke a session |
| `GET` | `/settings/caps` | `settings.read` | Read caps |
| `PATCH` | `/settings/caps` | `settings.write` | Update caps |

`GET /users` never returns `password_hash`, `pin_hash`, or `token_version`.

## 7. Audit requirements

Mandatory rows (see `00-conventions.md` §12): user create, role change, deactivate,
password reset, PIN set/reset, session revoke, approval granted, forbidden attempt on a
capped action.

Each row records the actor, the target user, and the changed fields — never secrets.

## 8. Edge cases

| Case | Behaviour |
|---|---|
| Admin demotes themselves to cashier while being the only admin | Rejected: `422 last_admin` |
| Admin deactivates themselves | Rejected: `422 last_admin` |
| Last active admin is deactivated by another admin | Rejected while they are the last |
| Username changed | Not supported in v2 (identity stability); recreate instead |
| Cashier tries an admin endpoint | `403` + audit row `forbidden` |
| Cap value raised/lowered | Applies to new operations only; past sales keep their snapshot |

## 9. Acceptance criteria

- **AC-1** A cashier calling `POST /products` receives `403` with permission
  `product.write`, and an audit row is written.
- **AC-2** A cashier may refund C$400 and not C$600 (with defaults); C$600 with a valid
  approval token succeeds and records both users.
- **AC-3** A cashier may apply a 9% discount and not an 11% discount.
- **AC-4** Deactivating a user immediately invalidates their access token.
- **AC-5** The system never allows zero active admins.
- **AC-6** `GET /users` responses contain no hash or token material.
- **AC-7** Changing a role takes effect on the target user's next request.

## 10. Non-goals

- Custom roles created in the UI (the model supports it; v2 does not expose it).
- Per-user permission overrides.
- Departments, teams, or manager hierarchies.
- Time-based or location-based access rules.
- SSO / external directories.
