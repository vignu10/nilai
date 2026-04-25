---
name: focus-scope-expand
description: "Deliberately expand the scope of the current session. Use when the user explicitly says they need to do more ('I also need to touch X'). Records the scope change and optionally extends the timebox."
argument-hint: "<scope addition>"
user-invocable: true
---

Expand the scope of the current focus session.

Use `$ARGUMENTS` as the scope addition. Ask if they want extra time added to the timebox.

Call the `focus_scope_expand` MCP tool with:
- `addition`: what's being added to the scope
- `extra_minutes`: optional extra time to add (0-240)

This is distinct from scope drift — the user is deliberately choosing to expand. The tool:
- Updates the task description to include the addition
- Optionally extends the timebox
- Adds a new done criterion if there's room (max 5)
