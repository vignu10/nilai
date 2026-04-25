---
name: focus-downtime
description: Start a downtime/break session to track time away from focused work
argument-hint: "[--type break|maintenance|awaiting] [--max-minutes <N>]"
user-invocable: true
---

Start a downtime session to track breaks, maintenance time, or waiting periods.

## When to use

Use when you're taking a break from focused work but still want to track your time:
- After completing a focus session and taking a break
- Doing maintenance tasks (email, admin, planning)
- Awaiting input from others before continuing

## How it works

1. Creates a downtime session that tracks time separately from focused work
2. Warns if you edit files during downtime
3. Warns at 80% of max duration if set
4. Adds to day tracking if active

## Arguments

- `--type`: Type of downtime
  - `break` (default): Personal break time
  - `maintenance`: Administrative/maintenance tasks
  - `awaiting`: Waiting for input/dependencies
- `--max-minutes`: Optional maximum duration in minutes

## Examples

- Take a 15-minute break: `/focus-downtime --type break --max-minutes 15`
- Track maintenance time: `/focus-downtime --type maintenance`
- Start with defaults: `/focus-downtime`

## CLI equivalent

```bash
nilai downtime --type break --max-minutes 15
```

## Related

- End downtime: `/focus-downtime-end`
- Start focus session: `/focus-start`
- Check day progress: `/focus-day-status`
