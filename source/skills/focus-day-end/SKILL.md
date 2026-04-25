---
name: focus-day-end
description: End day tracking and show full day summary with totals
user-invocable: true
---

End day tracking and display a comprehensive summary of your work day.

## When to use

Use at the end of your work day to:
- See total focused vs downtime vs idle time
- Review all sessions from the day
- Archive the day's data to `.focus/history/`

## What it shows

- Total focused time (hours and minutes)
- Total downtime (breaks, maintenance)
- Total idle time (gaps between sessions)
- List of all sessions with types and durations

## Archiving

Day summaries are archived to `.focus/history/YYYY-MM-DD.json` for future reference.

## Examples

- `/focus-day-end`

## CLI equivalent

```bash
nilai day-end
```

## Related

- Start day tracking: `/focus-day-start`
- Check day progress: `/focus-day-status`
