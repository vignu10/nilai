---
name: focus-scope-expand
description: "Deliberately expand the scope of the current session. Use when the user explicitly says they need to do more ('I also need to touch X'). Records the scope change and optionally extends the timebox."
argument-hint: "<scope addition>"
user-invocable: true
---

Expand the scope of the current focus session.

Use `$ARGUMENTS` as the scope addition. Ask if they want extra time added to the timebox.

Run via Bash:

```bash
nilai scope-expand "ADDITION" --extra-minutes 30
```

The `--extra-minutes` flag is optional (0-240). This is distinct from scope drift — the user is deliberately choosing to expand.
