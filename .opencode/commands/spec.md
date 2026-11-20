---
description: Draft or amend a spec — never implements it
agent: adm2
---

Draft or amend the specification for: $ARGUMENTS

Rules:

1. Follow the structure in `docs/specs/00-conventions.md` §1.
2. The new or amended spec must keep `status: draft`. Do not mark it `approved`; only the
   user can approve a spec.
3. Include the mandatory sections: Purpose, Actors, Business rules, API contracts, Data
   model, Edge cases, Acceptance criteria, **Non-goals**.
4. Acceptance criteria must be testable and stated as observable behaviour.
5. Reference `docs/context/` instead of restating legal or market background.
6. Check cross-references: spec ids, permission strings (must exist in
   `docs/specs/users-roles.md`), and ADR numbers.
7. Do **not** write code, migrations, or tests.
8. Finish with a short "Open questions" list, even if it is just "none".

After writing, report:

```md
## Spec
<file> — status: draft

## Changed
<files>

## Open questions
- <or "none">

## Next
Review the draft, then ask the user to approve it.
```
