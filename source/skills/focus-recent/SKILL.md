---
name: focus-recent
description: "Show a 7-day summary of focus session activity: completed vs abandoned count, time spent, and session summaries. Use when the user asks 'what did I ship this week?' or similar."
user-invocable: true
---

Show a 7-day summary of focus session activity.

Call the `focus_recent` MCP tool. It returns:
- Total sessions and time spent in the last 7 days
- Completed vs abandoned breakdown
- Up to 10 recent session summaries with timestamps and milestone counts

Present the output as-is. No editorializing.
