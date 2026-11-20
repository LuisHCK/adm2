---
id: SPEC-007
title: Refunds and voids
status: approved
updated: 2026-11-20
depends_on: [SPEC-003, SPEC-005, SPEC-006, SPEC-002]
---

# Refunds

## 1. Purpose

Return money and stock for a completed sale **without editing it**, in a way that stays
auditable and can later become a fiscal credit note.

## 2. Actors

| Actor | Can do |
|---|---|
| Cashier | Refund up to `refund_cap_minor`, with a reason |
| Admin | Any refund; approve above-cap refunds by PIN |
| Admin | Void a sale from the current session (`sales.md` §10) |

## 3. Principles

1. A sale is never edited. A refund is a **new document** linked to it.
2. A refund has its own series and number (`R-0000123`), assigned atomically.
3. Refunds are append-only. A mistaken refund is corrected by another refund and a note,
   not by deletion.
4. Stock is restored only for `goods` lines with tracked stock.
5. Refunds never restore cash rounding; they refund the exact value of the returned lines.

## 4. Rules

| Rule | Detail |
|---|---|
| Quantity limit | Σ refunded quantity per sale line ≤ sold quantity |
| Multiple refunds | Allowed until the quantity is exhausted |
| Partial line | A refund may return part of a line (e.g. 1 of 3 units) |
| Tax | Refunded tax is the line's `tax_minor` share, prorated by quantity, recomputed half-up |
| Discount | The line's allocated discount is respected; refund uses `line_net_minor` share |
| Cash refund | Writes a `refund` cash movement `−amount` in NIO |
| Credit refund | Reduces the customer's balance by `amount`, never pays cash |
| Reason | Free text, required, 3–200 chars |
| Approval | Above `refund_cap_minor` requires an approval token with `refund.approve` |
| Closed session | Allowed; the refund enters the **currently open** session of the acting register |
| No open session | `409 cash_session_required` for a cash refund |
| Voided sale | `409 sale_voided` — a void already reversed everything |

### 4.1 Refund amount

For a returned quantity `q` from a sale line:

```
ratio        = q / sold_quantity
net_minor    = round_half_up(line_net_minor × ratio)
tax_minor    = round_half_up(line_tax_minor × ratio)
amount_minor = net_minor + tax_minor
```

The last refund of a line uses the **remaining** amounts, so partial refunds always sum
exactly to the original line total.

### 4.2 Cap evaluation

- Compared against the **NIO base amount** of the refund.
- `amount_minor ≤ refund_cap_minor` → allowed for `refund.create`.
- Above → `403 cap_exceeded` unless a valid `approval_token` for `refund.create` covers
  the amount.
- The approving user is stored on the adjustment.

## 5. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `POST` | `/sales/:id/refunds` | `refund.create` | Create a refund |
| `GET` | `/sales/:id/refunds` | sale read scope | List refunds for a sale |
| `GET` | `/refunds/:id` | sale read scope | Detail |

### Request

```json
{
  "client_uuid": "b21e…",
  "reason": "producto defectuoso",
  "items": [ { "sale_item_id": 501, "quantity_milli": 1000 } ],
  "refund_type": "cash",
  "approval_token": null
}
```

`refund_type` is `cash` or `credit` and must match the original sale type:
- original `cash` → `cash` only (`422 refund_type_mismatch`)
- original `credit` → `credit` only

### Response `201`

```json
{
  "refund": {
    "id": 88, "number": "R-0000123", "sale_id": 1042,
    "amount_minor": 41400, "refund_type": "cash",
    "approved_by": 1, "created_by": 3, "created_at": "..."
  },
  "sale": { "id": 1042, "refunded_minor": 41400, "remaining_minor": 289800 }
}
```

## 6. Stock and cash effects

In one `BEGIN IMMEDIATE` transaction:

1. Validate quantities against `sold − already refunded`.
2. Insert `sale_adjustment` and `sale_adjustment_item` rows.
3. Restore stock for goods lines with tracked stock (`refund` movement).
4. Cash refund: `cash_movement` `−amount` in the acting register's open session.
   Credit refund: decrease the customer's derived balance (ledger entry).
5. Assign the refund number from the `refund` series.
6. Audit row.

## 7. Data model

### `sale_adjustment`

`id`, `sale_id` FK, `series_id` FK, `number` integer, `number_label` text, `kind`
(`refund`), `refund_type` (`cash`|`credit`), `amount_minor`, `tax_minor`, `net_minor`,
`reason`, `created_by` FK, `approved_by` FK null, `cash_session_id` FK null,
`client_uuid` unique, `created_at`.

### `sale_adjustment_item`

`id`, `sale_adjustment_id` FK, `sale_item_id` FK, `quantity_milli`, `amount_minor`,
`tax_minor`.

## 8. Edge cases

| Case | Behaviour |
|---|---|
| Refund more than sold | `422 quantity_exceeded` |
| Refund a line twice until exhausted | Allowed; the last one uses the remainder |
| Refund the same `client_uuid` twice | Second returns the original refund (`200`) |
| Refund a voided sale | `409 sale_voided` |
| Refund on a closed session, none open now | `409 cash_session_required` |
| Refund a service | Allowed; no stock movement |
| Refund with a different type than the sale | `422 refund_type_mismatch` |
| Cash drawer insufficient to pay the refund | Allowed; drawer may go negative and is flagged |
| Refund of a 100%-discounted line | `amount_minor = 0` is rejected (`422 zero_refund`) |
| Employee tries a refund above cap without approval | `403 cap_exceeded`, audited |

## 9. Acceptance criteria

- **AC-1** A partial refund of 1 of 3 units restores exactly that quantity and refunds the
  proportional amount.
- **AC-2** Two partial refunds of the same line sum exactly to the original line total.
- **AC-3** A cash refund writes one `refund` movement and reduces the drawer expectation.
- **AC-4** A credit refund reduces the customer balance and writes no cash movement.
- **AC-5** Above the cap, the request fails without an approval token and succeeds with
  one, recording both users.
- **AC-6** Refund numbers are sequential and gapless within the `refund` series.
- **AC-7** Replaying the same `client_uuid` does not create a second refund.
- **AC-8** A refund of a voided sale is rejected.
- **AC-9** A service refund writes no stock movement.

## 10. Non-goals

- Exchanges (refund + new sale) as a single document.
- Store credit as a wallet/tender (credit is a customer balance, not a voucher).
- Refunding to a payment method other than the original type.
- Fiscal credit notes (`nota de crédito`) — the document shape exists; the wording does not
  appear in v2.
- Refund approval queues or workflows across sessions.
