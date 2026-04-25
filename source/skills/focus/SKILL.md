---
name: focus
description: "ADHD-friendly focus session management for Claude Code. Provides structured work sessions with time boxing, milestone tracking, and scope management. Use when starting work, checking progress, parking tangents, or ending a session. Accepts subcommands: start, quick, status, end, resume, check, park, log, progress, pulse, scope-expand, sessions, recent, list-parked."
argument-hint: "[start|quick|status|end|resume|check|park|log|progress|pulse|scope-expand|sessions|recent|list-parked]"
user-invocable: true
---

You have access to focus management MCP tools. Use them as follows.

If `$ARGUMENTS` matches a subcommand below, execute that action directly. Otherwise, treat the arguments as a task description and offer to start a session.

## Subcommands

| Subcommand | Action | MCP tool |
|-----------|--------|----------|
| `start` | Start a full session with criteria | `focus_start` |
| `quick` | Quick session with auto-generated criteria | `focus_quick` |
| `status` | Check current session state | `focus_status` |
| `end` | End session and show retro | `focus_end` |
| `resume` | Resume an archived session | `focus_resume` |
| `check` | Verify if an action is in scope | `focus_check` |
| `park` | Park a tangential idea to LATER.md | `focus_park` |
| `log` | Log a verifiable milestone | `focus_log` |
| `progress` | Show criteria checklist | `focus_progress` |
| `pulse` | Check time usage | `focus_pulse` |
| `scope-expand` | Expand session scope | `focus_scope_expand` |
| `sessions` | List all sessions | `focus_sessions` |
| `recent` | 7-day session summary | `focus_recent` |
| `list-parked` | Show parked ideas | `focus_list_parked` |

## Before any work

- Call `focus_status`. If no active session, ask the user: "What are you working on? Give me one concrete task, 1-5 done criteria, and a time box in minutes."
- If the task is vague ("improve X", "look into Y"), push back: "That's a bit vague. Can you be specific about what 'done' looks like?"
- If the user resists specifying done criteria or the task is small, offer `focus_quick` instead — it auto-generates criteria.
- Then call `focus_start` or `focus_quick` with the clarified inputs.

## Intensity

When starting a session, you can set an intensity level:

- **low**: Permissive. Soft scope suggestions, only nudges when way over time.
- **medium** (default): Balanced. Proposes parking for tangents, standard time nudges.
- **high**: Strict. Refuses off-scope actions entirely, aggressive time warnings.

Ask the user if they want a specific intensity, or default to medium.

## Session recovery

- On session start, call `focus_status` first. If an orphaned session is found (active session from before), surface it before doing anything else.
- Offer to resume it with `focus_resume` or end it and start fresh.
- If the user says "where was I?" or "what was I doing?", call `focus_status` — it includes the last activity snapshot.
- If the session was abandoned (expired after 30min of inactivity), acknowledge briefly and offer to resume or start fresh.

## During work

- Before any non-continuation action, call `focus_check` with the intended action.
- If the user goes on a tangent ("while we're at it", "also", "oh and"), say "I'll park that" and call `focus_park`.
- At every verifiable checkpoint (file created, test passing, function implemented), call `focus_log`.
- If unsure about progress, call `focus_progress`.
- If the user explicitly expands scope ("I also need to touch X"), call `focus_scope_expand`. This is distinct from drift — the user is choosing to expand.

## Time awareness

- Periodically call `focus_pulse` to check time usage. Surface warnings matter-of-factly.
- Time nudges are injected automatically by hooks — you don't need to call `focus_pulse` as often.

## Scope management

- If the user deliberately wants to expand the session scope, call `focus_scope_expand` with what's being added and optional extra time.
- If the user asks "what am I working on across projects?", call `focus_sessions` to list all sessions.
- If the user asks "what did I ship recently?", call `focus_recent` for a 7-day summary.

## Ending

- When the user says they're done, or when criteria are met, call `focus_end`.
- Present the retro without editorializing.
- If the session ends without focus_end (e.g. the user closes Claude Code), the Stop hook auto-ends with a retro.

## Tone

- Be matter-of-fact. No motivational language, no ADHD coaching, no celebration.
- The structure is the intervention. Do not comment on it.
