---
id: SPEC-009
title: Currency, exchange rates and rounding
status: approved
updated: 2026-11-20
depends_on: [SPEC-000, SPEC-003, SPEC-006]
---

# Currency

## 1. Purpose

Keep córdobas as the only accounting currency while accepting US dollars as cash, without
ever applying a rate below the official one.

Background and legal basis: `docs/context/currency-rules.md`.

## 2. Principles

1. **NIO is the accounting currency.** Every total, ledger, tax figure, and report.
2. **USD is tender only.** It is never a currency of record.
3. **The server resolves the rate.** A client may never supply one.
4. **History is never re-valued.** Each payment snapshots the rate and its source.

## 3. Exchange rate

### 3.1 Storage

`exchange_rate`:

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `base_currency` | text | `NIO` |
| `quote_currency` | text | `USD` |
| `rate_micro` | integer | NIO per 1 USD × 1,000,000 |
| `effective_date` | text | `YYYY-MM-DD` |
| `source` | text | `bcn` \| `manual` \| `carried_forward` |
| `created_by` | integer FK null | Null for `bcn` |
| `created_at` | text | |

Unique `(base_currency, quote_currency, effective_date)`.

`36.6243` is stored as `36624300`. Six decimals is enough for any realistic rate and avoids
floats entirely.

### 3.2 Resolution ladder

For a sale on date `D`:

```
1. rate for D, source = 'bcn'              → verified
2. rate for D, source = 'manual'           → verified
3. latest rate with effective_date < D     → carried_forward (flagged)
4. none                                    → no rate; USD tender blocked
```

The resolved rate and its source are written into the sale's `config_snapshot` and each
`payment` row.

### 3.3 Freshness policy

| Case | NIO sale | USD tender | Rate shown on receipt |
|---|---|---|---|
| Verified today | ✅ | ✅ | ✅ |
| Carried forward | ✅ | ✅ with warning | ✅ + "no verificado" |
| `require_daily_rate = 1` | ✅ | ⛔ `409 rate_unverified` | — |
| No rate at all | ✅ | ⛔ `409 rate_unavailable` | — |

`require_daily_rate` defaults to `0`, because the official rate is often fixed for long
periods. A store that wants strictness turns it on.

### 3.4 Fetching

- An admin may `POST /exchange-rates` to enter the rate manually.
- An admin may `POST /exchange-rates/refresh` to attempt a fetch from the BCN source.
- Fetch failure never breaks the app; it leaves the ladder at step 3.
- Automated daily fetching, when the server has internet, is Phase 4.

## 4. Display

| Setting | Values | Effect |
|---|---|---|
| `display_currency` | `NIO` (default) \| `USD` | Headline price in the POS |
| `show_usd_equivalent` | 0/1 | Show the converted amount as a secondary line |

When `display_currency = 'USD'`, the NIO amount is still shown next to it. This models the
INTUR tourism exception, where USD may be displayed but payment is in córdobas. Whether a
store qualifies is their accountant's decision.

**Receipts always show NIO.** A USD equivalent may be printed as information only.

## 5. Payments in USD

```
tendered_base_minor = round_half_up(tendered_minor × rate_micro / 1_000_000)
```

- The payment row stores `currency`, `tendered_minor`, `rate_micro`, `tendered_base_minor`.
- Change is returned in **NIO** in v2.
- The cash drawer receives `+USD` and gives `−NIO` (see `registers-cash.md`).
- An under-rate tender (a rate the client tries to supply) is impossible: the client cannot
  send `rate_micro`.

## 6. Cash rounding

Rounding is a **payment-level adjustment**, never a price change.

| Setting | Values | Default |
|---|---|---|
| `cash_rounding_mode` | `none`, `down`, `nearest_50`, `nearest_100` | `none` |
| `cash_rounding_currency` | `NIO` | `NIO` |

Modes operate on integer minor units: `nearest_50` rounds the cash due to the nearest
C$0.50, `nearest_100` to the nearest C$1.00.

Rules:

- Applies only to `sale_type = 'cash'`, and only to the cash portion due.
- `rounding_minor = rounded_due − total_minor` (signed).
- `total_minor` stays exact; the tax base is unaffected.
- Credit sales never round.
- The client must send `accept_rounding: true` when `rounding_minor != 0`.
- The receipt shows `Total`, `Redondeo`, and the cash amount.

> Open question Q1 (`roadmap.md`): whether rounding **up** is acceptable under Ley 842,
> which requires the displayed price to be the final price. Until the accountant answers,
> `nearest_50`/`nearest_100` are allowed but `down` is the conservative option.

## 7. Revaluation

Never. Reports convert each sale using its own snapshot:

```
report_total_nio = Σ round_half_up(amount_minor × rate_micro / 1_000_000)
```

Using today's rate to restate yesterday's sales is forbidden by design.

## 8. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/exchange-rates/today` | authenticated | Resolved rate + source + effective date |
| `GET` | `/exchange-rates` | `settings.read` | History, paginated |
| `POST` | `/exchange-rates` | `settings.write` | Enter a rate manually |
| `POST` | `/exchange-rates/refresh` | `settings.write` | Attempt a BCN fetch |
| `GET` | `/settings/currency` | `settings.read` | Display + rounding config |
| `PATCH` | `/settings/currency` | `settings.write` | Update config |

`GET /exchange-rates/today`:

```json
{
  "base": "NIO", "quote": "USD",
  "rate_micro": 36624300, "rate": "36.6243",
  "effective_date": "2026-11-20",
  "source": "bcn", "verified": true,
  "usd_tender_allowed": true
}
```

## 9. Data model

- `exchange_rate` (§3.1)
- settings keys: `display_currency`, `show_usd_equivalent`, `cash_rounding_mode`,
  `cash_rounding_currency`, `require_daily_rate`
- `sale.rate_micro`, `sale.rate_source`, `sale.rate_effective_date`
- `payment.currency`, `payment.rate_micro`

## 10. Edge cases

| Case | Behaviour |
|---|---|
| No rate exists, customer pays USD | `409 rate_unavailable`; the sale can proceed in NIO |
| Rate is stale and `require_daily_rate = 1` | `409 rate_unverified` |
| Client sends `rate_micro` | Ignored; the server uses its own |
| Rate changes mid-shift | New sales use the new rate; open carts re-resolve at preview/commit |
| Refund of a USD-tendered sale | Refunded in NIO at the **original** sale's rate snapshot |
| Credit payment in USD | Converted and recorded with its own snapshot |
| Rounding disabled mid-shift | Applies to new sales only |

## 11. Acceptance criteria

- **AC-1** A USD payment uses the server's rate and rejects any client-supplied rate.
- **AC-2** The payment row stores the rate and source used.
- **AC-3** With no rate, a NIO sale succeeds and a USD payment returns `409`.
- **AC-4** With `require_daily_rate = 1` and a carried-forward rate, USD tender returns
  `409 rate_unverified`.
- **AC-5** `nearest_50` on a C$331.20 total produces `rounding_minor = -20` (or the exact
  arithmetic for the configured mode) and leaves `total_minor` unchanged.
- **AC-6** A credit sale is never rounded.
- **AC-7** Reports convert each historical sale at its own snapshot, not the current rate.
- **AC-8** A refund uses the original sale's rate, not today's.

## 12. Non-goals

- Multiple foreign currencies beyond USD.
- Currency exchange between cashiers.
- Bank/card settlement reconciliation.
- Automatic daily BCN fetching in Phases 1–3 (Phase 4).
- Revaluing open credit balances when the rate moves.
