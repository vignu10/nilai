---
name: focus-start
description: "Start a focused work session with a concrete task, done criteria, and time box. Use when beginning new work or when the user wants to define what 'done' looks like before starting."
argument-hint: "<task description>"
user-invocable: true
---

Start a focused work session. If `$ARGUMENTS` is provided, use it as the task description.

Ask the user for anything not provided:

1. **Task**: One concrete task (at least 4 words, not vague like "improve X" or "explore Y"). Push back if vague.
2. **Done criteria**: 1-5 verifiable conditions. Each must describe an observable outcome (at least 3 words).
3. **Time box**: Minutes (5-480). Default to 25 if unsure.
4. **Intensity** (optional): `low` (permissive), `medium` (default, balanced), or `high` (strict).
5. **Template** (optional): Use a predefined template for common patterns. Ask if they want to use one.
6. **Energy level** (optional): Ask for starting energy (1-5) for tracking patterns.
7. **Break reminders** (optional): Enable Pomodoro-style breaks (25min or 45min intervals).

Then run via Bash:

```bash
nilai start "TASK" --criteria "C1" "C2" "C3" --time 30 --intensity medium
```

Or with new features via MCP:
```bash
Call focus_start with:
- task: the task string
- done_criteria: array of criteria strings
- time_box_minutes: the time budget
- intensity: the chosen level (or omit for medium default)
- template_id: template ID if using one
- energy_start: starting energy level (1-5) if provided
- enable_breaks: true if enabling break reminders
- break_type: "pomodoro_25" or "pomodoro_45"
```

If the user resists specifying done criteria, suggest `/focus-quick` or a template instead.

## Templates

Available templates (run `/focus-template list` to see all):
- `debug-standard`: Debug sessions (45min, high intensity, no breaks)
- `code-review-quick`: Quick code reviews (30min, medium intensity, 25min breaks)
- `feature-development`: Building features (90min, medium intensity, 45min breaks)

## Tone

Matter-of-fact. No celebration when the session starts. The structure is the intervention.
