---
description: Cold start — report where the project stands and what to do next
agent: adm2
---

Cold start. **Do not modify files and do not run mutating commands.**

1. Read `docs/plan/STATUS.md`, `AGENTS.md`, and `docs/specs/00-conventions.md`.
2. Identify the next task: the `in_progress` one, otherwise the first `todo` in the
   current phase.
3. Read only the spec for that task.
4. Report, in this exact shape:

```md
## Position
Phase: <n> — <name>  (<status>)
Task: <ID> — <title>

## Spec
<file> — status: <draft|approved|implemented>
Depends on: <specs>

## Next action
<one concrete sentence>

## Blocking questions
- <or "none">

## Working tree
Branch: <branch>
<clean | n changed files>
```

5. Stop after reporting. Do not start the task.
