---
status: reference
updated: 2026-11-20
verified: 2026-11-20
---

# Currency — legal context

Why v2 keeps one accounting currency and accepts dollars as tender. Requirements live in
`docs/specs/currency.md`.

> **Not legal advice.** Confirm with a Nicaraguan accountant.

## Two authorities, two rules

**DGI (tax).** Tax obligations are liquidated in córdobas at the **official BCN rate**.
Foreign-currency amounts are converted; the córdoba is the tax base.

**MIFIC / DIPRODEC (consumer protection), Ley 842 Art. 10:**

- **Num. 4** — prices must be expressed in **national currency**, taxes included.
- **Num. 5** — it is prohibited to **charge or invoice** in foreign currency. Exceptions:
  free zones, bonded warehouses, and a tourism carve-out (restaurants may *display* USD
  prices for reference, but payment is in córdobas at the official rate).
- **Num. 6** — the consumer **may pay in foreign currency** if both parties agree
  voluntarily, provided the provider **does not apply a rate lower than the official BCN
  rate for that day**.

Source: [Consortium Legal analysis of Ley 842](https://consortiumlegal.com/2023/03/14/nicaragua-derecho-de-consumidores-precio-en-cordobas-y-tasa-de-cambio/).

## What that means in one sentence

> **Invoice in córdobas. Accept dollars as payment. Show the dollar equivalent as
> information only. Never apply a rate below the official one.**

## The exchange rate

- Published by the **Banco Central de Nicaragua**:
  [official rate table](https://www.bcn.gob.ni/IRR/tipo_cambio_mensual/index.php).
- Historically the rate has been fixed for long periods (a crawling-peg policy set
  annually), so the value can be stable for months — but it is still the *official* rate
  for the day, and it can change.
- Never hardcode a rate. Never let a client supply one.

## Risk of getting it wrong

Applying a rate below the official one is an infringement with meaningful fines under
consumer-protection law. This is why:

- the rate is resolved **server-side**;
- every payment stores the rate used;
- stale rates are visible, and can be configured to block USD tender.

## Practical consequences for the product

| Rule | Implementation |
|---|---|
| Accounting currency is NIO | All ledgers, reports, tax |
| Prices canonical in NIO | Optional `usd_anchor` for repricing |
| USD is a tender, not a currency of record | `payment.currency` may be USD |
| Rate snapshot per payment | `rate_micro`, `rate_source`, `rate_effective_date` |
| Never re-value history | Reports convert using each sale's snapshot |
| Display currency is per store | Some stores may show a USD reference price |

## Tourism carve-out

Restaurants with INTUR certification may **display** prices in USD as an indication.
Payment is still in córdobas at the official rate. v2 models this as a per-store display
flag, with no effect on accounting. Whether a customer qualifies is their accountant's
call.
