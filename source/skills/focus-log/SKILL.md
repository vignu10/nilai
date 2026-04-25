---
name: focus-log
description: "Log a verifiable milestone for the current session. Only use at observable state changes — file created, test passing, function implemented. Not for felt-progress."
argument-hint: "<milestone description>"
user-invocable: true
---

Log a verifiable milestone for the current focus session.

Use `$ARGUMENTS` as the milestone, or describe the observable state change that just happened.

Call the `focus_log` MCP tool with:
- `milestone`: past-tense description of an observable state change (at least 3 words)

Examples of good milestones:
- "Added retry logic to login endpoint"
- "Fixed the off-by-one error in pagination"
- "All auth tests passing"

The milestone must be at least 3 words and describe something observable. Vague milestones will be rejected.
