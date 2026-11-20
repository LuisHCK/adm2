---
status: reference
updated: 2026-11-20
---

# Market and customer profile

Who we build for, and what that implies. Not requirements — context for reading the
specs.

## Customer profile

- **Small retail stores in Nicaragua.** Usually one location, 1–5 POS terminals.
- **Windows 10/11 Pro** machines; sometimes consumer editions. Linux is desirable but not
  the default.
- Often **unregistered** with the DGI, or under the **cuota fija** regime. They do not
  issue fiscal invoices.
- Internet is usually available, but **grid power and connectivity are unreliable**.
  A store must keep selling during short outages — which is why the server is on-site.
- Cash is the dominant payment method; **US dollars are widely accepted** and often
  preferred for larger purchases.
- Owners are not sysadmins. The vendor installs and supports the server, often remotely.

## What they sell

- Physical goods with stock (typical minimarket / general store).
- **Services** or mixed catalogs: labor plus parts, repairs, hair salons, locksmiths.
  Services are sold from the same till but have no stock consequence.
- Some goods are priced with an implicit dollar reference (imported items), which is why
  the product model supports an optional `usd_anchor`.

## What they need from a POS

| Need | Why |
|---|---|
| Fast checkout, keyboard-driven | Queue at the counter |
| Silent receipt printing | A print dialog per sale is unusable |
| One drawer per terminal | Each cashier has their own |
| Cash counting and differences | Daily reconciliation |
| Credit to known customers | Very common in small stores |
| Stock that matches reality | Shrinkage and stockouts are the main pain |
| Multi-terminal consistency | Owner + 2–4 cashiers |
| Data that survives a cleared browser | The v1 failure mode |

## What they do **not** need (v2)

- Fiscal invoicing (see `nicaragua-fiscal.md`).
- Multi-store consolidation.
- Offline selling when the server is down.
- Purchasing, supplier orders, or full accounting.
- Loyalty programs or e-commerce.

## Operating constraints that shaped the design

| Constraint | Design consequence |
|---|---|
| Power cuts | `synchronous = FULL`; durable commits |
| No internet required to sell | On-site server; rates cached |
| Non-technical operators | Few settings; safe defaults; explicit messages in Spanish |
| Remote support | Single-artifact deployment, logs in a known path, backups downloadable |
| Unreliable LAN | Idempotent sale submission; explicit conflict messages |
| Owner not on site | Cashiers close drawers; admin reviews differences |

## Terminology

The product speaks **Spanish**. UI copy uses the glossary in `docs/context/glossary.md`,
which is the authority for terms such as *corte de caja*, *fondo*, *retiro*, and
*comprobante*.
