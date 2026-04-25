---
name: focus-status
description: "Check the current focus session status. Shows task, elapsed time, milestones, parked count, and done criteria. Use to check if a session is active or to see current progress."
user-invocable: true
---

Check the current focus session status.

Call the `focus_status` MCP tool. It returns:
- Task description
- Intensity level
- Elapsed time vs time box budget
- Last activity snapshot (if any)
- Milestone count
- Parked item count
- Done criteria list

Present the output as-is. No editorializing.

If no session is active, ask the user if they'd like to start one with `/focus-start` or `/focus-quick`.
