---
id: SPEC-004
title: Catalog (products, services, prices, taxes)
status: approved
updated: 2026-11-20
depends_on: [SPEC-000]
---

# Catalog

## 1. Purpose

Define what can be sold, how it is priced, how tax is determined, and how non-physical
items (services) are represented.

## 2. Actors

| Actor | Can do |
|---|---|
| Cashier | Read products and prices |
| Cashier | Create a customer (see `SPEC-009`) |
| Admin | Create/edit/deactivate products, prices, taxes, providers, coupons, routes |

## 3. Product kinds

| Kind | Stock | Price location | Sold from |
|---|---|---|---|
| `goods` | Tracked per inventory (or unlimited) | `inventory_product.price_minor` | The selected inventory |
| `service` | None | A **global** `inventory_product` row (`inventory_id = NULL`) | Everywhere |

A service is a product plus exactly one global price row. This keeps one pricing path and
one POS search path instead of a second catalogue.

Rules:

- Creating a `service` product creates its global price row in the same transaction.
- A service may never be attached to an inventory; the API rejects
  `422 service_cannot_be_stocked`.
- A service row has `unlimited_stock = 1` and `stock_milli = 0`; stock is irrelevant.
- Services never produce `stock_movement` rows.

## 4. Product rules

| Rule | Detail |
|---|---|
| Barcode | `codebar` unique across active products; case-sensitive, trimmed |
| Name | Required, 1–120 chars |
| Brand | Optional |
| Unit | Free text (`unidad`, `kg`, `hora`) |
| Description | Optional |
| Tax | `tax_id` nullable → store default tax |
| Deletion | Soft delete (`deleted_at`); products referenced by sales are never removed |
| Reactivation | Allowed; barcode uniqueness includes soft-deleted rows to prevent collisions |

## 5. Prices

- Prices are **canonical in NIO**, integer minor units.
- Goods may have a **different price per inventory** (same product, different location).
- Services have exactly one global price.
- **USD anchor** (optional, per product): a reference price in USD cents used to recompute
  the NIO price when the exchange rate moves. It is display/reference data; the invoice is
  always in NIO (see `currency.md`).
- Price changes are audited (`price.write`) and recorded with old and new values.
- Price changes never affect existing sales: sale lines snapshot the unit price.

## 6. Taxes

- `tax` is a catalogue of named rates: `name`, `rate_bp`, `active`.
- Typical rows: `IVA 15%` (`1500`), `Exento` (`0`).
- The store has a `default_tax_id`; a product may override it.
- Tax is computed **per line on the net amount after line discount**, then summed.
- The tax rate applied is snapshotted on the sale line.

## 7. Coupons

- A coupon is a **named discount preset**: `name`, `kind` (`percent`|`amount`),
  `value` (`_bp` or `_minor`), `active`.
- Applying a coupon at the sale is a discount: it counts against `discount_cap_bp` and
  requires `discount.create`.
- Coupons never stack with a manual discount on the same line; a sale-level coupon applies
  to the sale subtotal.
- Non-goals: codes, redemption limits, expiry dates, per-customer usage.

## 8. Providers and routes

- `provider`: name, email, phone. Soft delete.
- `product_provider`: link table with `active` flag.
- `route`: name, description, phone. Reference data only; no delivery logic in v2.

## 9. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/products` | `product.read` | Search/paginate; filters `q`, `kind`, `inventory_id` |
| `GET` | `/products/:id` | `product.read` | Detail incl. prices per inventory |
| `POST` | `/products` | `product.write` | Create goods or service |
| `PATCH` | `/products/:id` | `product.write` | Edit product data |
| `DELETE` | `/products/:id` | `product.write` | Soft delete |
| `PUT` | `/products/:id/price` | `price.write` | Set price for an inventory (or global for a service) |
| `POST` | `/products/reprice` | `price.write` | Recompute NIO from USD anchor (preview/apply) |
| `GET` | `/taxes` | `product.read` | List rates |
| `POST` | `/taxes` | `product.write` | Create rate |
| `PATCH` | `/taxes/:id` | `product.write` | Edit rate |
| `GET` | `/providers` | `product.read` | List |
| `POST` | `/providers` | `product.write` | Create |
| `PATCH` | `/providers/:id` | `product.write` | Edit |
| `DELETE` | `/providers/:id` | `product.write` | Soft delete |
| `GET` | `/coupons` | `product.read` | List |
| `POST` | `/coupons` | `product.write` | Create |
| `PATCH` | `/coupons/:id` | `product.write` | Edit |
| `GET` | `/routes` | `product.read` | List |
| `POST` | `/routes` | `product.write` | Create |

### `POST /products` — service

```json
{
  "kind": "service",
  "name": "Reparación de pantalla",
  "unit": "hora",
  "tax_id": 1,
  "price_minor": 80000
}
```

Response `201` includes the created global price row.

### `POST /products/reprice`

```json
{ "apply": false, "inventory_id": 1 }
```

```json
{
  "rate_micro": 36624300,
  "changes": [
    { "product_id": 12, "old_price_minor": 45000, "new_price_minor": 46800 }
  ]
}
```

`apply: true` writes the changes and audits each one.

## 10. Data model

### `product`

`id`, `kind` (`goods`|`service`), `name`, `description`, `brand`, `codebar` (unique),
`unit`, `tax_id` FK null, `usd_anchor_minor` null, `deleted_at` null, `created_at`,
`updated_at`.

### `inventory_product`

`id`, `product_id` FK, `inventory_id` FK **null**, `price_minor`, `stock_milli`,
`lot`, `unlimited_stock` (0/1), `low_stock_threshold_milli` null, `deleted_at` null,
`created_at`, `updated_at`.

Unique `(product_id, inventory_id)` — where a NULL `inventory_id` means the single global
row for a service.

### `tax`

`id`, `name`, `rate_bp`, `active` (0/1), `created_at`, `updated_at`.

### `provider`, `product_provider`, `coupon`, `route`

See §8 and §7. All use `created_at`/`updated_at` and soft delete where referenced by
history.

## 11. Edge cases

| Case | Behaviour |
|---|---|
| Duplicate barcode | `409 barcode_taken` |
| Barcode reused by a soft-deleted product | Rejected; reactivate or change the code |
| Service added to an inventory | `422 service_cannot_be_stocked` |
| Price change on a product currently in a cart | The POS shows the change at preview/commit (see `sales.md`) |
| Product with sales is deleted | Soft delete only; it disappears from the catalogue but remains in history |
| Tax rate edited | Applies to new sales only; existing lines keep their snapshot |
| Negative or zero price | Rejected (`422 invalid_price`) |
| USD anchor without an exchange rate | Reprice is unavailable until a rate exists |

## 12. Acceptance criteria

- **AC-1** Creating a service creates exactly one `inventory_product` with
  `inventory_id = NULL` and `unlimited_stock = 1`.
- **AC-2** A service appears in POS search for every inventory.
- **AC-3** Selling a service creates no `stock_movement`.
- **AC-4** Two products cannot share a barcode.
- **AC-5** Deleting a product used by a sale keeps the sale detail intact and hides the
  product from the catalogue.
- **AC-6** Editing a tax rate does not change previously created sale lines.
- **AC-7** `POST /products/reprice` with `apply: false` changes nothing and lists the
  proposed prices.
- **AC-8** A cashier receives `403` on every write endpoint.

## 13. Non-goals

- Product categories, tags, or attributes.
- Variants (size/colour) — a variant is a separate product in v2.
- Supplier purchasing or cost tracking.
- Bundles/kits/BOM expansion.
- Images.
- Per-customer price lists.
- Multi-currency price lists (only NIO canonical + USD anchor).
