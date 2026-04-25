---
name: focus-check
description: "Check whether an intended action is in scope for the current session. Returns the task, criteria, and alignment guidance. Use before non-continuation actions to prevent scope drift."
argument-hint: "<intended action>"
user-invocable: true
---

Check whether an intended action aligns with the current focus session.

Use `$ARGUMENTS` as the intended action, or ask the user what they're about to do.

Run via Bash:

```bash
nilai check "INTENDED ACTION"
```

The response includes the current task, done criteria, and alignment guidance based on intensity level:
- **low**: Soft suggestion. Park if not closely related, but no pressure.
- **medium**: Judge alignment with criteria. If off-scope, propose `/focus-park` instead of acting.
- **high**: Do NOT act unless this directly advances a done criterion. Must park tangential items.

Follow the guidance. If off-scope, say "I'll park that" and run `nilai park "IDEA"` instead of acting.
