---
name: focus-quick
description: "Start a quick focus session with minimal ceremony. Auto-generates done criteria and defaults to 25 minutes. Use when the user gives a task but doesn't want full session setup."
argument-hint: "<task description>"
user-invocable: true
---

Start a quick focus session with minimal ceremony. Use `$ARGUMENTS` as the task if provided, otherwise ask the user what they're working on.

The task must be at least a few words — push back if it's too short.

Then run via Bash:

```bash
nilai quick "TASK"
```

Optional: append `--time <minutes>` to override the default 25-minute timebox.

Quick sessions auto-generate two done criteria:
1. "{task} — the core change works"
2. "No regressions in existing behavior"

No ceremony. Start working immediately after the session is created.
