---
name: focus-resume
description: "Resume a previously archived session. Carries over milestones and criteria, restarts the timer. Use when continuing work from a previous session."
argument-hint: "<session-id>"
user-invocable: true
---

Resume a previously archived focus session.

If `$ARGUMENTS` contains a session ID (YYYYMMDD-HHMMSS format), use it directly. Otherwise, call `focus_sessions` to list available sessions and ask the user which one to resume.

Call the `focus_resume` MCP tool with:
- `session_id`: the ID of the archived session

The resumed session carries over:
- Previous milestones
- Done criteria
- Task description
- Timer restarts from zero

Report the resumed session details. No editorializing.
