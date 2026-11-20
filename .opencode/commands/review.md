---
description: Read-only review of the current diff against its spec
agent: spec-review
---

Review the current changes.

Spec: $ARGUMENTS
If no spec is given, infer it from `docs/plan/STATUS.md` and say which one you used.

Focus on spec conformance and acceptance-criteria coverage, not style.

Diff (tracked files, staged and unstaged):

```diff
!`git diff HEAD`
```

Changed files:

```text
!`git diff HEAD --stat`
```

If the diff is empty, say so and stop.
