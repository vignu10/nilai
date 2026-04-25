---
name: focus-break
description: "Take a break during focus session. Use when prompted or when you need a pause."
argument-hint: "[--duration-minutes <min>] [--type pomodoro_25|pomodoro_45]"
user-invocable: true
---

Handle break timing during focus sessions. Records break time and schedules the next break.

Breaks are important for ADHD brains - hyperfocus can lead to burnout.

## Usage

- No arguments: Suggests a break (5 or 15 min based on session type)
- `--duration-minutes <min>`: Take a break of specific duration
- `--type pomodoro_25`: Use 5-minute break (after 25min work)
- `--type pomodoro_45`: Use 15-minute break (after 45min work)

Call the `focus_break` MCP tool with appropriate parameters.

Example: /focus-break --duration-minutes 10
