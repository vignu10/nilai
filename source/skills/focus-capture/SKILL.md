---
name: focus-capture
description: "Quick capture inbox for thoughts without breaking focus. Use when you have an idea but want to stay on task."
argument-hint: "<thought>"
user-invocable: true
---

Capture a thought, idea, or tangent without breaking focus. The thought is saved to CAPTURE.md for later processing.

This is different from `/focus-park` which is for items outside current scope. Use `/focus-capture` for quick thoughts, ideas, or reminders you want to process later.

## When to Use

- Random idea you don't want to forget
- Thought unrelated to current task but worth capturing
- Reminder for something to do later
- Brain dump to get it out of your head

## What Happens

1. Thought is added to `.focus/capture.json`
2. Thought is appended to `CAPTURE.md` with timestamp
3. Associated with current session if one is active
4. You stay focused and continue working

## Usage

/focus-capture "Check if the API has rate limiting"
/focus-capture "Look into WebSockets for real-time updates"

Call the `focus_capture` MCP tool with the thought text.
