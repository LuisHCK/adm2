---
description: Finish the current task — run checks, update STATUS.md, report
agent: adm2
---

Finish the current task following the finish protocol of the `adm2` agent.

Current state:

```text
!`git rev-parse --abbrev-ref HEAD && git status --short`
```

Steps:

1. Run every check that exists:
   `bun run typecheck`, `bun test`, `yarn test`, `yarn lint`.
2. Confirm spec coverage for every acceptance criterion of the current task. Any AC
   without a test must be listed as `waived` with a reason, or the task is not done.
3. Update `docs/plan/STATUS.md`: task → `done` with evidence, new next action, and a
   one-line session log entry.
4. If behaviour differs from the spec, update the spec in the same commit. If it does not,
   state that explicitly.
5. Report using the output format defined in `.opencode/agents/adm2.md`.

Do not push. Do not start the next task.
