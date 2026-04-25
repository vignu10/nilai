---
name: focus-end
description: "End the current focus session and generate a retrospective. Shows duration, criteria status, and milestones. Use when the user says they're done or criteria are met."
user-invocable: true
---

End the current focus session and generate a retrospective.

Call the `focus_end` MCP tool. It produces a retro including:
- Duration vs budgeted time
- Criteria status (checked off if milestones overlap)
- All logged milestones
- Parked item count

Present the retro output as-is. No celebration, no coaching, no editorializing.

If no session is active, report that and suggest `/focus-start`.
