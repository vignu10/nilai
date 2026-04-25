---
name: focus-intensity
description: Change the intensity level of the current focus or downtime session
argument-hint: "<low|medium|high>"
user-invocable: true
---

Change the intensity level of the current session to adjust how aggressively Nilai enforces focus and manages scope.

## When to use

Use when you realize mid-session that the current intensity level isn't matching your needs:
- Switch to **high** when approaching a deadline or getting distracted
- Switch to **low** when brainstorming or exploring
- Switch to **medium** for balanced focus (default)

## Intensity levels

- **low**: Permissive
  - Soft-suggests parking for tangents, no pressure
  - Time warnings only when way over budget
  - Use when: Exploring, brainstorming, creative work

- **medium**: Balanced (default)
  - Proposes parking for tangents
  - Warns at 10% time remaining
  - Use when: Normal focused work

- **high**: Strict
  - Refuses off-scope actions entirely
  - Warns at 25% time remaining
  - Use when: Deadline-driven, high-stakes, easily distracted

## Examples

- Switch to high intensity: `/focus-intensity high`
- Relax to low intensity: `/focus-intensity low`
- Return to default: `/focus-intensity medium`

## CLI equivalent

```bash
nilai intensity high
```

## Related

- Start session with intensity: `/focus-start <task> --criteria <c> --time 30 --intensity high`
- Check current session: `/focus-status`
