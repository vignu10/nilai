---
name: focus-park
description: "Park a tangential idea to LATER.md for later review. Use when the user mentions something interesting but off-task — 'while we're at it', 'also', 'oh and'. Captures the impulse without acting on it."
argument-hint: "<idea to park>"
user-invocable: true
---

Park a tangential idea to LATER.md for later review.

Use `$ARGUMENTS` as the idea, or ask the user what to park.

Say "I'll park that" and run via Bash:

```bash
nilai park "IDEA" --why "OPTIONAL REASON"
```

The `--why` flag is optional — use it to capture why the idea is worth revisiting.

No session is required to be active, but parking only increments the counter during an active session.
