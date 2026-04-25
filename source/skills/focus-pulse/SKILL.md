---
name: focus-pulse
description: "Check time usage for the current session. Shows elapsed vs budgeted time with a nudge if over time, near the limit, or stalling. Use for periodic time checks."
user-invocable: true
---

Check time usage for the current focus session.

Call the `focus_pulse` MCP tool. It returns:
- Task description
- Elapsed time vs time box budget
- Time nudge (if applicable):
  - Over time: suggests ending the session
  - Near limit: warns about approaching the end
  - Stalling: flags no milestones with significant time elapsed

Surface warnings matter-of-factly. No urgency, no coaching.
