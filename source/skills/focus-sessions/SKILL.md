---
name: focus-sessions
description: "List all focus sessions for the current project: active, completed, and abandoned. Use when the user seems confused about what's running or asks 'what am I working on?'."
user-invocable: true
---

List all focus sessions for the current project.

Call the `focus_sessions` MCP tool. It returns:
- Active session details (if any): task, start time, time box, milestones, last activity
- Completed sessions: up to 5 most recent
- Abandoned sessions: up to 5 most recent

Present the output as-is. If the user wants to resume a session, use `/focus-resume <session-id>`.
