---
id: SPEC-008
title: Customers and store credit
status: approved
updated: 2026-11-20
depends_on: [SPEC-003, SPEC-006, SPEC-007]
---

# Customers and credit

## 1. Purpose

Record customers, allow credit sales, and keep an exact, auditable balance for what each
customer owes.

## 2. Actors

| Actor | Can do |
|---|---|
| Cashier | Read customers, create a customer, take a payment |
| Admin | Everything, plus edit and deactivate customers |

## 3. Rules

| Rule | Detail |
|---|---|
| Name | Required, 1–120 chars |
| Contact | Email and phone optional; no format enforcement beyond length |
| Uniqueness | No uniqueness constraint on name; duplicates are allowed and expected |
| Deletion | Soft delete. A customer with any sale or payment cannot be removed |
| Credit | Only `sale_type = 'credit'` affects the balance |
| Balance | **Derived**, never stored (see §4) |
| Payments | Cash only in v2; each payment enters the acting register's drawer |
| Overpayment | Rejected with `422 overpayment` |
| Scope | Cashiers may see all customers (needed at the counter) |

## 4. Balance

```
balance = Σ credit sales' total_minor
        − Σ customer payments' amount_minor
        − Σ credit refunds' amount_minor
```

Computed by query, not stored. A stored balance is a cache that drifts; at this data volume
the query is cheap and the invariant is worth more.

`GET /customers/:id` returns `balance_minor` and the last movement date. A customer can
never have a negative balance (overpayment is rejected).

## 5. Operations

### 5.1 Credit sale

Created by `POST /sales` with `sale_type = 'credit'` and `customer_id`. In the sale
transaction the balance increases by `total_minor`. No cash movement, no rounding.

### 5.2 Payment (`abono`)

`POST /customers/:id/payments`

```json
{ "amount_minor": 50000, "currency": "NIO", "client_uuid": "9d2a…" }
```

- Requires an open cash session on the acting register (`409 cash_session_required`).
- `amount_minor > balance` → `422 overpayment`.
- Writes:
  1. a `customer_payment` row,
  2. a `cash_movement` of type `credit_payment` `+amount` (in the payment currency),
  3. an audit row.
- USD payments convert at the official rate and are recorded in both currencies.

### 5.3 Credit refund

A refund of a credit sale reduces the balance (`refunds.md`). It never pays cash. If the
refund would push the balance below zero, it is rejected (`422 balance_negative`) — the
customer must settle through a documented adjustment instead.

### 5.4 Customer statement

`GET /customers/:id/statement?from=&to=` returns credit sales, payments, and credit
refunds in date order with a running balance. Admin only (`report.read`); cashiers see the
current balance only.

## 6. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/customers` | `customer.read` | Search by name/phone, paginated |
| `GET` | `/customers/:id` | `customer.read` | Detail + balance |
| `POST` | `/customers` | `customer.create` | Create |
| `PATCH` | `/customers/:id` | `customer.write` | Edit |
| `DELETE` | `/customers/:id` | `customer.write` | Soft delete |
| `POST` | `/customers/:id/payments` | `customer.payment` | Register a payment |
| `GET` | `/customers/:id/payments` | `customer.read` | Payment history |
| `GET` | `/customers/:id/statement` | `report.read` | Statement with running balance |

## 7. Data model

### `customer`

`id`, `name`, `email` null, `phone_number` null, `address` null, `notes` null,
`deleted_at` null, `created_at`, `updated_at`.

### `customer_payment`

`id`, `customer_id` FK, `amount_minor`, `currency`, `rate_micro`, `amount_base_minor`,
`method` (`cash`), `cash_session_id` FK, `user_id` FK, `client_uuid` unique, `note` null,
`created_at`.

## 8. Edge cases

| Case | Behaviour |
|---|---|
| Credit sale without a customer | `422 customer_required` |
| Payment exceeding the balance | `422 overpayment` |
| Payment with no open cash session | `409 cash_session_required` |
| Customer deleted while owing money | Rejected (`409 customer_has_balance`) |
| Duplicate payment `client_uuid` | Replays the original, no double credit |
| Credit refund larger than the outstanding balance | `422 balance_negative` |
| Balance becomes zero | Allowed; the customer remains active |
| USD payment | Converted at the official rate; recorded with rate snapshot |

## 9. Acceptance criteria

- **AC-1** A credit sale of C$1,200 increases the balance by exactly 120000.
- **AC-2** A payment of C$500 decreases it by exactly 50000 and writes one
  `credit_payment` movement.
- **AC-3** A payment larger than the balance is rejected and changes nothing.
- **AC-4** Two simultaneous payments cannot overpay: one succeeds, one gets 422, balance
  is correct.
- **AC-5** The derived balance equals the statement's final running balance.
- **AC-6** A customer with any sale cannot be deleted.
- **AC-7** A duplicate payment `client_uuid` credits once.

## 10. Non-goals

- Credit limits or automatic blocking.
- Interest, late fees, or instalments.
- Customer-specific price lists.
- Statements sent by email or WhatsApp.
- Loyalty points or store-credit wallets.
- Merging duplicate customers.
