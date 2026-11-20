---
status: reference
updated: 2026-11-20
verified: 2026-11-20
---

# Nicaragua — fiscal context

Background for why v2 prints **comprobantes** and not **facturas**. This is research, not
requirements. Requirements live in `docs/specs/fiscal.md`.

> **Not legal advice.** Confirm every item here with a Nicaraguan *contador público
> autorizado* before printing anything that claims to be a fiscal document.

## The short version

Nicaragua is at **level 2** of fiscal invoicing: authorized systems that produce paper or
PDF documents. There is **no nationwide structured e-invoicing mandate** — no XML, no
Peppol, no real-time clearance, no digital signature requirement.

That means: no tax-authority integration in v2. But if the software issues *facturas*,
the software itself becomes something the DGI authorizes.

## Current status (verified 2026-11-20)

- Computerized invoicing requires **prior DGI authorization** under
  [Disposición Técnica No. 09-2007](https://nicaragua.justia.com/nacionales/disposiciones-tecnicas/requisitos-para-uso-de-sistemas-de-facturacion-computarizadas-jul-16-2007/gdoc/),
  processed through SACFI / VET.
- Authorization is **valid one year, renewed annually**, after a DGI inspection.
- DGI states the authorization covers the **system**, not the ranges of documents it
  issues.
- No nationwide XML/JSON/Peppol/signature/clearance requirement was found.
- General tax-record retention: **four years**.
- Standard IVA rate: **15%**, with a defined list of exemptions (education, health,
  financial, transport, etc.). Repair and general services are taxable.

Sources: [DGI SACFI guidance](https://www.dgi.gob.ni/getDoc/1035),
[DDD Invoices country guide (Oct 2026)](https://dddinvoices.com/learn/e-invoicing-nicaragua),
[Ley 822 consolidated text](https://www.unan.edu.ni/wp-content/uploads/LEY-822.pdf).

## What DT 09-2007 demands of a system

| Requirement | Clause | Consequence for software |
|---|---|---|
| Continuous, **unalterable** numbering; distinguish cash vs credit invoices | 1.7 | Server-assigned, gapless, never reused |
| Branches use consecutive numbering distinguished by **series** | 3.1 | One series per store + document type |
| Separate **IVA breakdown** | 1.9 | Tax computed per line |
| Buyer **RUC** where required | B2B | Optional buyer identification fields |
| DGI **authorization number** printed lower-right | Quinto | Nullable config, hidden until authorized |
| Later-day returns require a **credit note**, never annulment | 3.4 | Corrections are new numbered documents |
| Keep annulled documents stamped **ANULADO** | 1.10 | Append-only, no hard delete |
| Contingency: preprinted invoices with separate numbering | 3.3 | Paper fallback; not software |
| Backups of daily operations | 1.4 | Automated backups (Phase 4) |
| Access control by user and password | 1.3 | Auth + audit |
| Spanish technical and user manuals | 1.5 | A **deliverable** if we ever seek authorization |
| Notify DGI before modifying the system | 1.6 | A compliance process, not code |

## Why v2 ships receipts, not invoices

The target customers are small stores that often are **unregistered** or operate under
**cuota fija** (fixed quota, no IVA collected). They do not issue fiscal invoices today.

Therefore v2:

- prints a **"Comprobante de venta"** with no fiscal claims;
- stores the fields required for a future fiscal document, but never shows them;
- keeps numbering, immutability, and credit-note semantics so becoming compliant later is
  a configuration and process change, not a rewrite.

The one open question for the accountant: whether an internal receipt for an unregistered
or cuota-fija store needs any legend at all. See `roadmap.md` Q2.

## Withholding (not applicable to v2, but commonly misunderstood)

The 10% (professional/technical services by a natural person) and 2% (general services,
or services by a legal entity) retentions are obligations of the **payer**, not the
vendor. A store selling to a walk-in consumer withholds nothing. v2 needs no withholding
logic.

Sources: [DGI withholding FAQ](https://www.dgi.gob.ni/FAQ/otros.htm).

## If v2 ever adds fiscal documents

The work would be: Spanish technical + user manual, system registration data (provider
name, RUC, contact), DGI authorization number field, `factura` document types and series,
and a notification process for releases. The schema already carries the fields.
