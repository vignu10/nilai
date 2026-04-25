---
name: focus-resume
description: "Resume a previously archived session. Carries over milestones and criteria, restarts the timer. Use when continuing work from a previous session."
argument-hint: "<session-id>"
user-invocable: true
---

Resume a previously archived focus session.

If `$ARGUMENTS` contains a session ID (YYYYMMDD-HHMMSS format), use it directly. Otherwise, run `nilai sessions` to list available sessions and ask the user which one to resume.

Run via Bash:

```bash
nilai resume SESSION_ID
```

The resumed session carries over:
- Previous milestones
- Done criteria
- Task description
- Timer restarts from zero

Report the resumed session details. No editorializing.
