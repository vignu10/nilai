---
name: focus-park
description: "Park a tangential idea to LATER.md for later review. Use when the user mentions something interesting but off-task — 'while we're at it', 'also', 'oh and'. Captures the impulse without acting on it."
argument-hint: "<idea to park>"
user-invocable: true
---

Park a tangential idea to LATER.md for later review.

Use `$ARGUMENTS` as the idea, or ask the user what to park.

Call the `focus_park` MCP tool with:
- `idea`: the tangential idea to park
- `why_interesting`: optional — why it's worth coming back to

Say "I'll park that" and then call the tool.

No session is required to be active, but parking only increments the counter during an active session.
