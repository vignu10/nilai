---
name: focus-stuck
description: "Handle being stuck on a task. Use when prompted or when you're blocked."
argument-hint: "<investigate|park|split>"
user-invocable: true
---

Handle situations where you're stuck and not making progress.

## Options

- `investigate`: Explore what's blocking progress systematically
- `park`: Park the current task and move on to something else
- `split`: Break the task into smaller, manageable pieces

If you've been prompted by the stuck detector (no milestones for 15min), choose the option that best describes your situation.

Call the `focus_stuck` MCP tool with the chosen response.

Example: /focus-stuck split
