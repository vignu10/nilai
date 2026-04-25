---
name: focus-unpark
description: Retrieve parked ideas from LATER.md to work on them
argument-hint: "[<number>]"
user-invocable: true
---

Retrieve and act on parked ideas from LATER.md.

## When to use

Use when you're ready to work on ideas that were previously parked:
- After finishing a focus session and wanting to address parked items
- When looking for the next task to work on
- To review what you've parked recently

## How it works

1. **Without arguments**: Lists all parked ideas (newest first) with index numbers
2. **With index number**: Removes that item from LATER.md and suggests starting a focus session for it

## Examples

- List all parked ideas: `/focus-unpark`
- Work on the first item: `/focus-unpark 1`
- Work on the third item: `/focus-unpark 3`

## CLI equivalent

```bash
nilai unpark           # List all parked ideas
nilai unpark 1         # Retrieve item #1
```

## Related

- Park an idea: `/focus-park`
- Start focus session: `/focus-start`
- Show parked items: `/focus-list-parked`
