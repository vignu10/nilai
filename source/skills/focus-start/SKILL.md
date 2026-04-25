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

Then run via Bash:

```bash
nilai start "TASK" --criteria "C1" "C2" "C3" --time 30 --intensity medium
```

If the user resists specifying done criteria, suggest `/focus-quick` instead.

## Tone

Matter-of-fact. No celebration when the session starts. The structure is the intervention.
