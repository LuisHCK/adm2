---
status: living
updated: 2026-11-20
---

# Glossary

One vocabulary for the UI, the specs, the API, and the code. Spanish is the product
language; English is the code language. When a term appears in UI copy, use the Spanish
column verbatim.

## Money & cash

| Spanish (UI) | English (code/docs) | Meaning |
|---|---|---|
| Córdoba (C$) | NIO | Accounting currency |
| Dólar (US$) | USD | Tender currency, accepted at the official rate |
| Tipo de cambio | exchange rate | Official BCN rate |
| Efectivo | cash | Payment method |
| Cambio / vuelto | change | Money returned to the customer |
| Redondeo | rounding | Payment-level adjustment to a round amount |
| Caja | cash drawer / register | Physical drawer and its session |
| Apertura de caja | open cash session | Start of a drawer period |
| Fondo de caja | opening float | Cash placed in the drawer at open |
| Corte de caja | cash count | Counting the drawer; `partial` or `closing` |
| Corte parcial | partial count | Mid-shift count, session stays open |
| Cierre de caja | close cash session | Final count + session close |
| Retiro | withdrawal | Cash removed from the drawer |
| Diferencia | difference | Counted − expected |
| Arqueo | reconciliation | Comparing counted vs expected |
| Pago | payment | Money received from a customer |
| Crédito | store credit | Sale paid later; customer balance increases |
| Abono | credit payment | Customer pays down their balance |
| Nota de crédito | credit note | Numbered reversal document (**not used in v2 UI**) |

## Sales & documents

| Spanish (UI) | English | Meaning |
|---|---|---|
| Venta | sale | Commercial transaction |
| Comprobante de venta | sales receipt | What we print. **Never "factura".** |
| Factura | invoice | Fiscal document — out of scope for v2 |
| Línea | line item | One product/service in a sale |
| Descuento | discount | Applied per line or per sale |
| Subtotal | subtotal | Before discount and tax |
| Total | total | Final amount |
| Devolución | refund | Money returned after a sale |
| Anulación | void | Full reversal of a same-day sale error |
| Serie | series | Numbering series for documents |
| Correlativo | sequential number | Next number in a series |

## Catalog & inventory

| Spanish (UI) | English | Meaning |
|---|---|---|
| Producto | product | Physical good |
| Servicio | service | Non-physical sellable item |
| Inventario | inventory | A stock location |
| Existencia | stock | Quantity on hand |
| Movimiento | stock movement | Signed change to stock |
| Ajuste | adjustment | Manual stock correction with a reason |
| Ajuste por conteo | count adjustment | Correction after a physical count |
| Precio | price | Canonical price in NIO |
| Ancla USD | USD anchor | Optional USD reference price |
| Código de barras | barcode | Unique product code |
| Proveedor | provider | Supplier |
| Cliente | customer | Buyer (may carry credit) |
| Unidad de medida | unit of measure | `unidad`, `kg`, `hora`, … |
| Lote | lot | Batch identifier |

## People & access

| Spanish (UI) | English | Meaning |
|---|---|---|
| Usuario | user | Account |
| Administrador | admin | Full permissions |
| Cajero | cashier | Sales + own drawer |
| Rol | role | Named permission set |
| Permiso | permission | `resource.action` string |
| PIN | PIN | Short re-auth / approval code |
| Sesión | session | Authenticated login (auth) — distinct from cash session |
| Terminal / caja registradora | register | A POS workstation |
| Turno | shift | Informal: one cashier's working period |
| Aprobación | approval | Admin authorisation of a capped action |

## Fiscal (context only)

| Spanish | English | Meaning |
|---|---|---|
| DGI | DGI | Nicaraguan tax authority |
| RUC | RUC | Tax identification number |
| IVA | VAT / IVA | 15% standard rate |
| Cuota fija | fixed-quota regime | Simplified regime, no IVA |
| Régimen general | general regime | Standard IVA taxpayer |
| Pie de imprenta | printer's imprint | Fiscal invoice form data |
| Retención | withholding | Buyer withholds tax at payment (B2B) |

## Words we deliberately avoid in v2

| Avoid | Use instead | Why |
|---|---|---|
| Factura | Comprobante de venta | We are not an authorised fiscal system |
| Impresión fiscal | Impresión de comprobante | Same reason |
| Blockchain / sync | — | Not part of the design |
