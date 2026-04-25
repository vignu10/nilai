# Nilai — Product Requirements Document

**Version:** 0.1 (MVP)
**Status:** Draft for refinement
**Author:** Vignu

> _Nilai (நிலை, Tamil): state, stability, stance._

---

## 1. Problem

Claude Code is structurally hostile to ADHD developers in a way traditional IDEs are not. The chat interface removes the friction that produces natural stopping points: refactoring tangents, "while we're at it" rabbit holes, and tangential research are all one sentence away. Sessions run for hours generating felt-but-invisible progress, and the user often cannot reconstruct what actually shipped.

This is not a discipline failure. It is a medium failure: the impulse to drift and the action of drifting are functionally simultaneous in a chat-driven coding tool, so ADHD brains cannot catch themselves in the moment.

## 2. Goals

A tool that:

1. Forces concrete task articulation before any work begins.
2. Detects scope drift at the moment of drift, not in retrospect.
3. Honors tangential impulses by capturing rather than suppressing them.
4. Makes invisible progress visible through verifiable milestones.
5. Surfaces time blindness via explicit time boxes and end-of-session retros.

## 3. Non-goals (v1)

- Pomodoro timing or interval-based focus.
- Cross-session habit tracking, streaks, gamification.
- Team or shared focus sessions.
- Cloud sync, accounts, or telemetry.
- Coaching, motivation, or surveillance of "did the user actually focus?"
- Voice input, mobile, or non-Claude-Code clients in v1.

## 4. Users

**Primary.** Developers using Claude Code who self-identify with ADHD or executive-function challenges and are losing sessions to drift.

**Secondary.** Any developer who wants stricter session discipline. The tool is opinionated software; ADHD users feel the benefit most acutely, but the structure benefits anyone.

## 5. Core principles

1. **Friction at boundaries, not at work.** Once a session is active, Nilai stays silent. It only intervenes at session start, at scope-violation moments, and at session end.
2. **Honor the impulse, redirect the action.** Tangential thoughts are valuable; acting on them mid-session is the failure. The parking lot is the load-bearing mechanism.
3. **Verifiable over felt.** Milestones must be observable state changes. Subjective progress does not count.
4. **Quiet enforcement.** No moralizing, no productivity-coach tone. The companion CLAUDE.md instructs Claude to be matter-of-fact.
5. **State lives in the repo.** No daemon, no cloud. Plain JSON and Markdown that travel with the code.

## 6. Architecture

Three layers, each independently useful, compounding when combined:

| Layer                    | Role                                                 | Required?                                                              |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| MCP server (`nilai-mcp`) | Exposes 10 `focus_*` tools as primitives             | Yes                                                                    |
| CLAUDE.md companion      | Teaches Claude _when_ to call each tool              | Yes (without it, the tools exist but go uncalled at the right moments) |
| Claude Code hooks        | Automates scope-drift reminders on prompt submission | Optional, high leverage                                                |

### Architectural decision: why MCP, not hooks-only

A legitimate alternative is to skip the MCP server entirely and implement everything as Claude Code hooks plus shell scripts. We chose MCP for three reasons:

1. **Structured returns.** `focus_check` returns JSON the LLM can reason about. Hooks return text; harder to compose with reasoning.
2. **State ownership.** A single process writing `.focus/session.json` avoids races between concurrent hooks.
3. **Portability.** Same server works in any MCP-aware client (Claude Desktop, API), not just Claude Code.

The cost: higher install friction (one extra `claude mcp add` step). For users who prioritize zero-install, a hooks-only fork is a valid alternative path and an acceptable contribution to the project.

### State model

```
project-root/
├── .focus/
│   ├── session.json          # active session (gitignored)
│   └── history/              # archived sessions, one JSON per session
├── LATER.md                  # parked ideas, recency-first, committable
└── CLAUDE.md                 # companion instructions
```

`session.json` schema:

```ts
type Session = {
  id: string; // YYYYMMDD-HHMMSS
  task: string; // single concrete task
  done_criteria: string[]; // 1-5 verifiable conditions
  time_box_minutes: number; // 5-480
  intensity: "low" | "medium" | "high"; // ADHD guardrail strength
  started_at: string; // ISO timestamp
  milestones: { at: string; text: string }[];
  parked_count: number;
  status: "active" | "ended";
  ended_at?: string;
};
```

## 7. Tool surface (10 tools)

| Tool                | Inputs                                  | Effect                                                        |
| ------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `focus_start`       | task, done_criteria[], time_box_minutes, intensity? | Creates session; rejects vague tasks. `intensity` defaults to `"medium"` |
| `focus_status`      | —                                       | Returns task, elapsed, milestones, parked count               |
| `focus_check`       | intended_action                         | Returns task + criteria + judgment instruction for the LLM    |
| `focus_park`        | idea, why_interesting?                  | Appends to LATER.md, increments parked_count                  |
| `focus_log`         | milestone                               | Appends to milestones[]; past-tense verifiable state          |
| `focus_progress`    | —                                       | Returns criteria + milestones                                 |
| `focus_pulse`       | —                                       | Elapsed/remaining + nudge if over, near deadline, or stalling |
| `focus_end`         | —                                       | Generates retro, archives session                             |
| `focus_resume`      | session_id                              | Reactivates an archived session, restarts timer               |
| `focus_list_parked` | —                                       | Returns LATER.md                                              |

## 8. Behavioral contract (CLAUDE.md companion)

The CLAUDE.md instructs Claude to:

- Call `focus_status` before any state-changing action; if no active session, ask the user for task + criteria + time box and call `focus_start`.
- If user task is vague, push back and ask for specificity instead of calling `focus_start` with doomed input.
- Before any non-continuation action, call `focus_check`. If off-scope, propose `focus_park` rather than act.
- Treat user tangents (`while we're at it`, `also`, `oh and`) with "I'll park that — confirm?" by default.
- Call `focus_log` at every verifiable checkpoint. Never at felt-progress moments.
- Maintain strict-but-quiet tone. No moralizing or ADHD-coaching language.

## 9. Hook layer

| Event              | Hook                                            | Status         |
| ------------------ | ----------------------------------------------- | -------------- |
| `UserPromptSubmit` | Inject active-session reminder into context     | v1             |
| `Stop`             | Auto-call `focus_end` and print retro           | v0.2           |
| `SessionStart`     | If active session exists, nudge to resume       | v0.2           |
| `PostToolUse`      | Flag edits to files outside inferred task scope | v0.3 candidate |

v1 ships `UserPromptSubmit` only; the rest follow once the v1 protocol is validated.

## 10. Vague-task validation

`focus_start` rejects tasks matching:

- **Vague verbs at start:** `improve`, `enhance`, `refactor`, `look into`, `explore`, `investigate`, `polish`, `clean up`, `review`, `consider`, `think about`, `understand`, `figure out`, `work on`, `deal with`, `handle`.
- **Vague nouns:** `stuff`, `things`, `the codebase`, `the app`, `the project`, `everything`.
- **Length:** fewer than 4 words.

Rejection includes a remediation hint, not just an error message. The validation list is hardcoded in v1 (configurability is creep).

## 11. Distribution

- npm package: `nilai`. Two binaries: `nilai` (CLI), `nilai-mcp` (server).
- `npx nilai init` drops CLAUDE.md companion and `.focus/` in the current project.
- `npx nilai install-hooks` registers the UserPromptSubmit hook in `.claude/settings.json`.
- `claude mcp add nilai -- npx -y nilai-mcp` registers the server.

Total install steps: 3. Time to first session: <2 minutes.

## 12. Open questions

1. **Block or advise?** Should `focus_check` ever block? _v1: always advise — discipline lives in CLAUDE.md, not in hard blocks._
2. **`LATER.md` git state?** _v1: committed by default; parked ideas are project artifacts. `.focus/session.json` is gitignored._
3. **`focus_extend`?** Or force end+restart to make budget extension deliberate? _v1: force end+restart._
4. **Configurable vague-verb list?** _v1: hardcoded._
5. **Subagent scope?** Does work done by a Claude Code subagent count toward the parent session? _v1: yes, all subagent work inherits the parent task._
6. **Hooks-only fork?** Maintain as a separate distribution? _v1: out of scope; document as a contribution opportunity._
7. **Race conditions in MCP handlers?** Smoke testing showed concurrent stdio requests can interleave state I/O. _v1: accept (real Claude Code usage is sequential). v0.2: add p-queue mutex on state ops._

## 13. Success criteria for v1

| Metric                                                                                                     | Target                                     |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Time to first session after install                                                                        | <2 minutes                                 |
| Fraction of vague prompts (`improve X`, `look into Y`) that result in concrete restatement or `focus_park` | >80%                                       |
| Fraction of started sessions that reach `focus_end`                                                        | >70% (helped by v0.2 Stop hook)            |
| Average parked items per session                                                                           | >1 (signals the parking lot UX is working) |
| User-reported "I knew what I shipped at session end"                                                       | qualitative, via README issue template     |

## 14. v0.2 — Session recovery and ADHD hooks

Targets the core ADHD pattern: start multiple sessions, get pulled away, return with no memory of what was happening.

### Hook layer (automatic, zero user action)

| Event | Hook | Behavior |
|---|---|---|
| `SessionStart` | Orphan sweep | Scan for sessions with `status: "active"` that haven't had a milestone in >30min. Surface them: "You left 2 sessions open: 'Fix auth redirect' (47min ago) and 'Add rate limiting' (2hr ago). Resume or end?" |
| `SessionStart` | Snapshot restore | If the new session's project has an orphaned session with a snapshot, show "You were editing `auth.ts:42` — adding retry logic to the login endpoint" before the user says anything. |
| `PostToolUse` | Snapshot auto-save | After each tool call, silently record `{ file, line, action_summary, timestamp }` into the session. This is the data that powers snapshot restore. |
| `PostToolUse` | Session expiry | If no tool calls in 30 minutes, auto-archive the session as `status: "abandoned"` with a brief summary of what happened. Prevents zombie sessions from accumulating. |

### State additions

```ts
type Session = {
  // ... existing fields ...
  snapshot?: {
    last_file: string;
    last_line: number | null;
    last_action: string;      // e.g. "editing auth.ts — adding retry logic"
    last_tool: string;        // e.g. "Edit"
    at: string;               // ISO timestamp
  };
  abandoned_at?: string;      // set by session expiry
  abandonment_reason?: "idle" | "user_ended" | "replaced";
};
```

Snapshot is overwritten on each `PostToolUse`, not appended — it's a single-slot buffer.

### Companion additions (CLAUDE.md)

The companion gains these rules for v0.2:

- On session start, always call `focus_status` first. If orphaned sessions exist, surface them before doing anything else.
- If user says something vague like "where was I?" or "what was I doing?", call `focus_status` and use the snapshot to reconstruct context.
- If session expiry fired (status is `abandoned`), acknowledge it briefly and offer to resume or start fresh.

### v0.2 success criteria

| Metric | Target |
|---|---|
| Fraction of abandoned sessions that get resumed within the same day | >40% |
| Users returning to a session can state what they were doing without scrolling transcript | qualitative |
| Snapshot accuracy (user agrees "yes that's what I was doing") | >80% |

---

## 15. v0.3 — Time awareness and scope management

### Automatic (hook-triggered)

| Event | Hook | Behavior |
|---|---|---|
| `PostToolUse` | Time nudge | If >50% of timebox elapsed with <50% of done_criteria met, inject quiet status: "35min elapsed on a 45min box. 1 of 4 criteria done." Not blocking — just visibility. |
| `PostToolUse` | Scope drift flag | Flag edits to files outside inferred task scope (original v0.3 candidate). |

### Companion-suggested tools (on-demand, CLAUDE.md instructs Claude when to offer)

| Tool | When Claude offers it | Effect |
|---|---|---|
| `focus_quick` | User gives a task but resists specifying done_criteria, or task is small enough that full ceremony is overhead | Stripped-down `focus_start`: prompts for task only, defaults timebox to 25min, auto-generates simple done_criteria. |
| `focus_sessions` | User seems confused about what's running, or asks "what am I working on?" | Lists all active sessions across projects on this machine. |
| `focus_scope_expand` | User explicitly expands scope ("I also need to touch the middleware") | Records the scope change, optionally adjusts timebox. Distinct from drift — the user is *choosing* to expand. |
| `focus_recent` | User asks "what did I ship this week?" or similar | Aggregates archived sessions with completion status. |

### Also in v0.3

- `Stop` hook for automatic retro on session close.
- `focus_extend` if open question 3 lands that way.
- Claude Code statusline showing live session state.
- p-queue mutex on state operations.
- Optional `nilai stats` CLI command summarizing recent session history.

---

## 17. Anti-features (explicit no's)

## 15. Anti-features (explicit no's)

- ❌ Streaks, badges, or any gamification.
- ❌ Notifications outside Claude Code's own UI.
- ❌ Cloud-hosted state or multi-device sync.
- ❌ AI-evaluated "focus quality" scores.
- ❌ Public leaderboards.
- ❌ Encouragement messages, motivational quotes, emoji parties on milestones.

The opinions are the product. Resist all requests to soften them.
