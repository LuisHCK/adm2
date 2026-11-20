---
id: SPEC-005
title: Inventory and stock movements
status: approved
updated: 2026-11-20
depends_on: [SPEC-000, SPEC-004]
---

# Inventory and stock

## 1. Purpose

Track what is on hand, explain every change, and make overselling impossible under
concurrency.

## 2. Actors

| Actor | Can do |
|---|---|
| Cashier | Read stock; adjust stock with a reason |
| Admin | Create inventories, bulk import, any adjustment |

## 3. Model

Stock is a **ledger**, not a number you overwrite. The current quantity is the sum of
movements, kept denormalised on `inventory_product.stock_milli` for fast reads and
reconciled by a consistency check.

```text
inventory            a location ("Bodega", "Mostrador")
inventory_product    product + inventory + price + stock + lot
stock_movement       signed, append-only explanation of every change
```

A `service` has no inventory row behaviour: its global row exists only to hold a price.

## 4. Rules

| Rule | Detail |
|---|---|
| Never negative | A write that would go below zero fails with `409 insufficient_stock`, unless `allow_backorder` is granted |
| Backorder | Admin-only, requires a reason; recorded as a `backorder` movement |
| Unlimited stock | `unlimited_stock = 1` skips decrementing and is not a backorder |
| Soft delete | `inventory` and `inventory_product` are soft-deleted; ledger rows are never removed |
| Unit | Stock is in the product's unit; quantity precision is `_milli` (3 decimals) |
| Low stock | Optional per-item threshold; dashboard lists items at or below it |
| Uniqueness | One `inventory_product` per `(product_id, inventory_id)` |

## 5. Movement types

| `type` | Sign | Created by | Notes |
|---|---|---|---|
| `initial` | + | Opening an inventory item | First quantity |
| `import` | + | Bulk import | Adds stock with a price |
| `sale` | − | Sale commit | One per goods line |
| `refund` | + | Refund | Restores goods |
| `adjustment` | ± | Manual | Requires a reason code |
| `backorder` | − | Admin sale override | Explicit negative sale |

### Adjustment reasons (enum)

`count` (physical count correction), `damage`, `loss`, `expiry`, `correction`.

A free-text note is required for every adjustment; the enum classifies it for reports.

## 6. Operations

### 6.1 Create an inventory

`POST /inventories { name, location }` — admin.

### 6.2 Add a product to an inventory

`POST /inventories/:id/products { product_id, price_minor, stock_milli, lot? }`

Creates `inventory_product` and an `initial` movement in one transaction.

### 6.3 Bulk import

The UI flow is: select products → set price and stock per row → confirm.

`POST /inventories/:id/import`

```json
{ "items": [ { "product_id": 12, "price_minor": 45000, "stock_milli": 10000, "lot": null } ] }
```

- All-or-nothing: one transaction.
- If the product already exists in this inventory, the request fails with
  `409 already_in_inventory` unless `mode: "add_stock"` is sent, which creates an `import`
  movement instead of a new row.
- Services are rejected.

### 6.4 Adjust stock

`POST /inventory-products/:id/adjust`

```json
{ "delta_milli": -2000, "reason": "damage", "note": "botellas rotas" }
```

- `delta_milli` may be positive or negative; zero is invalid.
- A negative delta that would go below zero is rejected unless the caller has
  `stock.backorder` (admin-only).
- Writes one `adjustment` movement and an audit row.

### 6.5 Read stock

- `GET /inventories/:id/products` — paginated, with current stock and price.
- `GET /inventory-products/:id/movements` — the ledger for one item.
- `GET /reports/stock` — admin: totals, low stock, movement summary.

## 7. Consistency

The denormalised `stock_milli` must equal the sum of movements. A periodic check compares
them:

```sql
SELECT ip.id,
       ip.stock_milli,
       COALESCE(SUM(sm.quantity_milli), 0) AS ledger
  FROM inventory_product ip
  LEFT JOIN stock_movement sm ON sm.inventory_product_id = ip.id
 GROUP BY ip.id
HAVING ip.stock_milli <> ledger;
```

Any row returned is a defect. The check runs on server start (log-only) and is exposed as
`GET /admin/stock-consistency` for admins.

## 8. API

| Method | Path | Permission | Purpose |
|---|---|---|---|
| `GET` | `/inventories` | `stock.read` | List |
| `POST` | `/inventories` | `inventory.write` | Create |
| `PATCH` | `/inventories/:id` | `inventory.write` | Rename / deactivate |
| `GET` | `/inventories/:id/products` | `stock.read` | Items with stock and price |
| `POST` | `/inventories/:id/products` | `inventory.write` | Add one product |
| `POST` | `/inventories/:id/import` | `inventory.write` | Bulk import |
| `POST` | `/inventory-products/:id/adjust` | `stock.adjust` | Correct stock |
| `GET` | `/inventory-products/:id/movements` | `stock.read` | Ledger |
| `GET` | `/reports/stock` | `report.read` | Summary |
| `GET` | `/admin/stock-consistency` | `settings.read` | Ledger vs stored quantity |

No endpoint sets `stock_milli` directly. The only write paths are the ones above.

## 9. Data model

### `inventory`

`id`, `name`, `location`, `active` (0/1), `deleted_at` null, `created_at`, `updated_at`.

### `stock_movement`

`id`, `inventory_product_id` FK, `type`, `quantity_milli` (signed), `reference_type` null,
`reference_id` null, `reason` null, `note` null, `user_id` FK, `created_at`.

Append-only.

## 10. Edge cases

| Case | Behaviour |
|---|---|
| Import a product already in the inventory | `409` unless `mode: add_stock` |
| Import an empty list | `422 empty_import` |
| Adjust to exactly zero | Allowed |
| Adjust below zero without backorder | `409 insufficient_stock` |
| Sale and adjustment race | Both are serialised by `BEGIN IMMEDIATE`; one may conflict |
| Unlimited stock item sold | No movement is written |
| Product soft-deleted with stock | Hidden from POS; stock remains for the ledger |
| Two inventories hold the same product | Allowed; prices and stock are independent |

## 11. Acceptance criteria

- **AC-1** Adding a product to an inventory creates one `initial` movement with the same
  quantity.
- **AC-2** A sale decrements stock by the exact `_milli` amount and writes one `sale`
  movement per goods line.
- **AC-3** A refund restores stock and writes one `refund` movement.
- **AC-4** A negative adjustment that would breach zero is rejected for a cashier with
  `409 insufficient_stock`.
- **AC-5** Bulk import is all-or-nothing: one invalid row leaves stock unchanged.
- **AC-6** `GET /admin/stock-consistency` returns no rows on a healthy database.
- **AC-7** No endpoint exists that writes `stock_milli` without a movement.
- **AC-8** Selling an unlimited-stock item writes no movement.

## 12. Non-goals

- Stock transfers between inventories.
- Physical count sessions (a full stocktake workflow).
- Barcode-based receiving.
- Purchase orders, supplier invoices, or landed cost.
- Expiry/lot tracking beyond storing a `lot` string.
- Reservations or holds.
