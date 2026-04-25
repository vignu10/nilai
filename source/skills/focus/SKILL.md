---
name: focus
description: "ADHD-friendly focus session management for Claude Code. Provides structured work sessions with time boxing, milestone tracking, and scope management. Use when starting work, checking progress, parking tangents, or ending a session. Accepts subcommands: start, quick, status, end, resume, check, park, log, progress, pulse, scope-expand, sessions, recent, list-parked."
argument-hint: "[start|quick|status|end|resume|check|park|log|progress|pulse|scope-expand|sessions|recent|list-parked]"
user-invocable: true
---

You have access to focus management via CLI commands. Use them as follows.

If `$ARGUMENTS` matches a subcommand below, execute that action directly. Otherwise, treat the arguments as a task description and offer to start a session.

To discover all available commands, run:

```bash
nilai skills
```

## Subcommands

| Subcommand | CLI command | What it does |
|-----------|------------|--------------|
| `start` | `nilai start <task> --criteria <c1> <c2> --time <min> [--intensity low\|medium\|high]` | Start a full session with criteria |
| `quick` | `nilai quick <task> [--time <min>]` | Quick session with auto-generated criteria |
| `status` | `nilai status` | Check current session state |
| `end` | `nilai end` | End session and show retro |
| `resume` | `nilai resume <session-id>` | Resume an archived session |
| `check` | `nilai check <action>` | Verify if an action is in scope |
| `park` | `nilai park <idea> [--why <reason>]` | Park a tangential idea to LATER.md |
| `log` | `nilai log <milestone>` | Log a verifiable milestone |
| `progress` | `nilai progress` | Show criteria checklist |
| `pulse` | `nilai pulse` | Check time usage |
| `scope-expand` | `nilai scope-expand <addition> [--extra-minutes <min>]` | Expand session scope |
| `sessions` | `nilai sessions` | List all sessions |
| `recent` | `nilai recent` | 7-day session summary |
| `list-parked` | `nilai list-parked` | Show parked ideas |

## Before any work

- Run `nilai status` via Bash. If no active session, ask the user: "What are you working on? Give me one concrete task, 1-5 done criteria, and a time box in minutes."
- If the task is vague ("improve X", "look into Y"), push back: "That's a bit vague. Can you be specific about what 'done' looks like?"
- If the user resists specifying done criteria or the task is small, offer `nilai quick` instead — it auto-generates criteria.
- Then run `nilai start` or `nilai quick` with the clarified inputs.

## Intensity

When starting a session, you can set an intensity level:

- **low**: Permissive. Soft scope suggestions, only nudges when way over time.
- **medium** (default): Balanced. Proposes parking for tangents, standard time nudges.
- **high**: Strict. Refuses off-scope actions entirely, aggressive time warnings.

Ask the user if they want a specific intensity, or default to medium.

## Session recovery

- On session start, run `nilai status` first. If an orphaned session is found (active session from before), surface it before doing anything else.
- Offer to resume it with `nilai resume <id>` or end it and start fresh.
- If the user says "where was I?" or "what was I doing?", run `nilai status` — it includes the last activity snapshot.
- If the session was abandoned (expired after 30min of inactivity), acknowledge briefly and offer to resume or start fresh.

## During work

- Before any non-continuation action, run `nilai check <action>` to verify scope.
- If the user goes on a tangent ("while we're at it", "also", "oh and"), say "I'll park that" and run `nilai park <idea>`.
- At every verifiable checkpoint (file created, test passing, function implemented), run `nilai log <milestone>`.
- If unsure about progress, run `nilai progress`.
- If the user explicitly expands scope ("I also need to touch X"), run `nilai scope-expand <addition>`. This is distinct from drift — the user is choosing to expand.

## Time awareness

- Periodically run `nilai pulse` to check time usage. Surface warnings matter-of-factly.
- Time nudges are injected automatically by hooks — you don't need to check as often.

## Scope management

- If the user deliberately wants to expand the session scope, run `nilai scope-expand <addition> [--extra-minutes <min>]`.
- If the user asks "what am I working on across projects?", run `nilai sessions`.
- If the user asks "what did I ship recently?", run `nilai recent`.

## Ending

- When the user says they're done, or when criteria are met, run `nilai end`.
- Present the retro without editorializing.
- If the session ends without `nilai end` (e.g. the user closes Claude Code), the Stop hook auto-ends with a retro.

## Tone

- Be matter-of-fact. No motivational language, no ADHD coaching, no celebration.
- The structure is the intervention. Do not comment on it.
