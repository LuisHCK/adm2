---
id: SPEC-010
title: Fiscal profile, documents and numbering
status: approved
updated: 2026-11-20
depends_on: [SPEC-004, SPEC-006, SPEC-007]
---

# Fiscal profile and documents

## 1. Purpose

Keep v2 legally safe as a **receipt** system while storing everything a future authorised
fiscal system would need. Background: `docs/context/nicaragua-fiscal.md`.

## 2. Principles

1. **Structure yes, claims no.** Store the fields; do not render what we are not authorised
   to print.
2. **Never the word "factura".** Not in the UI, templates, code, or manual.
3. **Numbering is continuous and unalterable**, per store and document type.
4. **Documents are append-only.** Corrections are new documents.
5. Capability is driven by `fiscal_profile`, not by build flags.

## 3. Fiscal profile

One row per installation.

| Column | Type | Notes |
|---|---|---|
| `id` | integer PK | Always 1 |
| `regime` | text | `none` \| `cuota_fija` \| `general` |
| `legal_name` | text null | Trading or legal name |
| `ruc` | text null | Tax id |
| `address` | text null | |
| `phone` | text null | |
| `tax_authorization_number` | text null | DGI system authorization; hidden by default |
| `show_fiscal_fields` | integer | 0 by default |
| `receipt_legend` | text null | Printed at the bottom |
| `updated_at` | text | |

### 3.1 Regimes

| Regime | Tax behaviour | Receipt |
|---|---|---|
| `none` | No tax lines; `tax_rate_bp = 0` | "Comprobante de venta" |
| `cuota_fija` | No IVA collected; `tax_rate_bp = 0` | "Comprobante de venta" |
| `general` | IVA 15% by default; tax broken out per line | "Comprobante de venta" + tax breakdown |

Rules:

- Changing the regime affects **new** sales only. Existing sales keep their snapshot.
- `none` and `cuota_fija` are indistinguishable in the schema but distinct in intent and
  reporting, so they remain separate values.
- The app must work with **no fiscal profile at all**; a missing row is equivalent to
  `regime = none`.

## 4. Document series

```
document_series:
  id, code ('A', 'R'), document_type ('sale' | 'refund'),
  prefix, next_number, active, created_at, updated_at
```

- Exactly one active series per `document_type`.
- Number assignment happens inside the sale/refund transaction (§5).
- The label is `{prefix}-{number padded to 7}`, e.g. `A-0001042`, `R-0000123`.
- Series are never renumbered or reused. Deactivating a series starts a new one at 1.

## 5. Numbering rules

```sql
UPDATE document_series
   SET next_number = next_number + 1
 WHERE id = :id
RETURNING next_number - 1 AS number;
```

- Gapless per store: a rolled-back transaction does not consume a number.
- A gap, once created, is never closed by reusing a number.
- If a store is later authorized, a **new series starting at 1** is created for fiscal
  documents; internal receipts keep their historical numbers.

## 6. Receipt content

Printed for every sale (Phase 5 renders it; browser print before that).

| Field | Shown when |
|---|---|
| Store name | always |
| Address / phone | when configured |
| Date and time | always |
| Document label (`A-0001042`) | always |
| Cashier name | always |
| Lines: name, qty, unit price, line total | always |
| Subtotal, discount | when non-zero |
| Tax breakdown by rate | `regime = general` |
| Rounding | when non-zero |
| Total | always |
| Payment method and amount tendered | always |
| Change | when non-zero |
| RUC / authorization number | **only** when `show_fiscal_fields = 1` **and** the value exists |
| Legend | when `receipt_legend` is set |

Rules:

- The receipt header says **"Comprobante de venta"**. Never "Factura", "Factura de
  crédito fiscal", or "Documento fiscal".
- Fiscal fields are **not rendered as empty boxes**. They are omitted entirely.
- A reprint uses the sale's `config_snapshot` and stored line snapshots, so it is identical
  to the original even after settings change.

## 7. Immutability and retention

- `sale` and `sale_adjustment` rows are never deleted.
- Only `sale.status` and its void columns may change (see `sales.md` §10).
- Retention: minimum **four years** (Nicaraguan general tax retention). v2 never purges.
- Backups (Phase 4) are part of satisfying the "daily backups" requirement of DT 09-2007.

## 8. Audit

Mandatory audit rows: fiscal profile change (with old/new values), series change, and any
change to `show_fiscal_fields` or `receipt_legend`.

## 9. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/settings/fiscal` | `settings.read` | Read profile |
| `PATCH` | `/settings/fiscal` | `settings.write` | Update profile |
| `GET` | `/document-series` | `settings.read` | List series and next numbers |
| `PATCH` | `/document-series/:id` | `settings.write` | Prefix / active only |

`next_number` is **not** editable through the API. Only the transactional assignment can
advance it.

## 10. Edge cases

| Case | Behaviour |
|---|---|
| No fiscal profile row | Treated as `regime = none` |
| `show_fiscal_fields = 1` but no RUC | The RUC line is omitted, not printed empty |
| Regime changed from general to none | New sales have no tax; old receipts are unchanged |
| Series deactivated with a next number pending | The new series starts at 1; the old label is never reused |
| Two sales racing for a number | Serialised by the transaction; numbers are unique and sequential |
| Receipt reprint after a tax change | Uses the sale snapshot; byte-identical amounts |

## 11. Acceptance criteria

- **AC-1** With `regime = none`, sale lines have `tax_rate_bp = 0` and no tax line is
  printed.
- **AC-2** With `regime = general`, a C$100 net line shows C$15 tax.
- **AC-3** 50 consecutive sales produce 50 consecutive labels with no gaps.
- **AC-4** A rolled-back sale does not advance `next_number`.
- **AC-5** With `show_fiscal_fields = 0`, the receipt contains no RUC or authorization text.
- **AC-6** No template, i18n string, or API response for receipts contains the word
  "factura".
- **AC-7** Changing the tax rate does not alter a previously stored receipt.
- **AC-8** `PATCH /settings/fiscal` writes an audit row with old and new values.

## 12. Non-goals

- Issuing fiscal invoices, credit notes, or any document with fiscal claims.
- DGI authorization workflow or SACFI integration.
- XML, digital signatures, or tax-authority APIs.
- Libro de ventas / Form 124 exports.
- Spanish technical and user manuals (needed only if authorization is pursued).
- Per-branch series (one store per install).
