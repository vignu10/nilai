# Nilai

> _Nilai (நிலை, Tamil): state, stability, stance._

ADHD-friendly focus sessions for Claude Code. CLI skills + slash commands that help you ship what you intended to.

## The problem

Claude Code makes it frictionless to drift. One sentence takes you from "fix the auth bug" to "refactor the entire middleware" — and two hours later you can't reconstruct what actually shipped. This isn't a discipline failure. It's a medium failure: the impulse and the action are simultaneous in a chat-driven tool.

ADHD brains get hit hardest: you start multiple sessions, pick up your phone, come back hours later with no memory of what was happening. Nilai fixes this by making session state recoverable and drift detectable.

## Quick start

One command in your project directory:

```bash
npx @vignu10/nilai setup
```

That's it. This scaffolds the focus session files, installs hooks, and adds slash commands.

Done. Start a Claude Code session and tell it what you're working on. Nilai handles the rest.

### Individual commands

If you prefer step-by-step control:

```bash
npx @vignu10/nilai init              # Scaffold focus session files + slash commands
npx @vignu10/nilai install-hooks     # Install hooks (UserPromptSubmit, SessionStart, PostToolUse, Stop)
npx @vignu10/nilai update            # Update hooks, NILAI.md protocol, and skills to latest version
```

## What Nilai does

- **Forces concrete task articulation** before any work begins.
- **Detects scope drift** at the moment of drift, not in retrospect.
- **Honors tangential impulses** by capturing them in a parking lot (`LATER.md`) rather than suppressing them.
- **Makes progress visible** through verifiable milestones, not felt progress.
- **Surfaces time blindness** via explicit time boxes and end-of-session retros.
- **Recovers abandoned sessions** — if you leave and come back, Nilai shows you exactly where you were.
- **Auto-ends sessions** when you close Claude Code (Stop hook retro).

## Two ways to use it

### CLI commands (automatic)

Claude automatically runs `nilai <command>` via Bash based on the NILAI.md protocol loaded in your CLAUDE.md. No user action needed — Claude starts sessions, logs milestones, parks tangents, and ends with a retro on its own. You can also run any command directly in your terminal:

```bash
# Start a session with multiple criteria
nilai start "Add retry logic" \
  --criteria "Retries on transient failures" \
  --criteria "Exponential backoff with jitter" \
  --criteria "Tests pass" \
  --time 45 \
  --intensity high

# Or quick session with auto-generated criteria
nilai quick "Fix the header" --time 15

nilai status
nilai log "Added retry with exponential backoff"
nilai end
```

### Slash commands (user-invoked)

15 slash commands are installed to `.claude/skills/` for direct invocation in Claude Code:

| Command | What it does |
|---------|-------------|
| `/focus` | Umbrella — accepts subcommands or a task description |
| `/focus-start` | Start a session with task, criteria, and time box |
| `/focus-quick` | Quick session with minimal ceremony (25min default) |
| `/focus-status` | Check current session state |
| `/focus-end` | End session and generate a retro |
| `/focus-resume` | Pick up an archived session |
| `/focus-check` | Ask "is this action in scope?" |
| `/focus-park` | Park a tangent to `LATER.md` |
| `/focus-log` | Log a verifiable milestone |
| `/focus-progress` | Show criteria checklist + milestones |
| `/focus-pulse` | Check time usage |
| `/focus-scope-expand` | Deliberately expand scope |
| `/focus-sessions` | List all sessions for the project |
| `/focus-recent` | 7-day session history summary |
| `/focus-list-parked` | Review parked ideas |

### Additional commands

| Command | What it does |
|---------|-------------|
| `nilai skills` | List all available slash commands with descriptions |
| `nilai update` | Update hooks, NILAI.md protocol, and skill files to latest version |

Use `nilai update` after installing a new version of Nilai to get the latest protocol and skill definitions.

## Hooks (automatic, zero user action)

Nilai registers four Claude Code hooks that run without you doing anything:

| Hook | What it does |
|------|-------------|
| **SessionStart** | Orphan sweep — if you left an active session, surfaces it with last activity snapshot. "You were editing `auth.ts` — adding retry logic (47min ago)." |
| **UserPromptSubmit** | Injects active session context into every prompt so Claude knows what you're working on |
| **PostToolUse** | Auto-saves snapshots on file edits. Time nudges if >50% timebox elapsed with <50% criteria done. Scope drift flags if editing unrelated files. Session expiry after 30min idle. |
| **Stop** | Auto-ends the session with a retro when Claude Code closes |

## Intensity levels

Every session has an intensity that controls how aggressive the ADHD guardrails are:

| Level | Scope checking | Time nudges | Use when |
|-------|---------------|-------------|----------|
| `low` | Soft-suggests parking, no pressure | Only when way over budget | Exploring, brainstorming |
| `medium` | Proposes parking for tangents (default) | Warns at 10% remaining, stalling at 30% | Normal focused work |
| `high` | Refuses off-scope actions entirely | Warns at 25% remaining, stalling at 15% | Deadline-driven, high-stakes |

Set intensity via CLI flag or tell Claude when starting:

```bash
# CLI
nilai start "Fix auth" --criteria "Login works" --time 30 --intensity high

# Or in conversation
Claude: Start a high-intensity session to fix the auth bug...
```

## Uninstall

```bash
npx @vignu10/nilai uninstall
```

This removes:
- `.focus/` directory (all session state)
- `NILAI.md`
- `@NILAI.md` reference from `CLAUDE.md`
- Nilai entries from `.gitignore`
- Nilai hooks from `.claude/settings.json`
- Slash commands from `.claude/skills/`

## What `nilai init` does

- Creates `.focus/` directory for session state (fully gitignored)
- Creates `.focus/history/` for archived sessions
- Creates `NILAI.md` with the focus protocol
- Creates or updates `CLAUDE.md` with `@NILAI.md` reference
- Updates `.gitignore` for `.focus/`, `.claude/skills/focus*/`, and `LATER.md`
- Installs 15 slash commands to `.claude/skills/`

## Example session

```
You: I need to add retry logic to the login API endpoint

Claude: Let me start a focus session.
→ /focus-start
Session started: "Add retry logic to login API"
Intensity: medium
Time box: 45 minutes
Done criteria: 3
  - Login endpoint returns 401 on transient failures
  - Retries up to 3 times with exponential backoff
  - Tests pass for retry behavior

You: oh also the header color is wrong

Claude: I'll park that.
→ /focus-park "Fix header color"
Parked: "Fix header color"
Parked items this session: 1

[... Claude edits src/api/login.ts, adds retry logic ...]

Claude: → Milestone logged: "Added retry logic to login endpoint"
Total milestones: 1

[... Claude writes tests, they pass ...]

Claude: → Milestone logged: "Tests pass for retry behavior with exponential backoff"
Total milestones: 2

You: done

Claude:
→ /focus-end

Session retro: Add retry logic to login API
Duration: 32min (budgeted 45min)
Milestones: 2
Parked items: 1

Criteria status:
  [x] Login endpoint returns 401 on transient failures
  [x] Retries up to 3 times with exponential backoff
  [x] Tests pass for retry behavior

Milestones:
  1. Added retry logic to login endpoint
  2. Tests pass for retry behavior with exponential backoff
```

### Session recovery example

```
(You left a session active yesterday. Today, you start a new Claude Code session.)

Nilai (via SessionStart hook): Previous session found: "Fix auth redirect" (14h ago).
Last activity: editing auth.ts (14h ago).
Resume with `nilai resume 20260425120000` or start fresh with `nilai start`.

You: /focus-resume 20260425120000

Resuming abandoned session.
Resumed: "Fix auth redirect"
New session ID: 20260426093000
Previous milestones carried over: 2
Time box restarted: 45min
Last activity: editing auth.ts
```

### Quick session with scope checking

```
You: Just need to fix the header color quickly

Claude: → /focus-quick "Fix header color" --time 15
Session started: "Fix header color"
Intensity: medium
Time box: 15 minutes
Done criteria: 3
  - Header color matches design spec
  - Color applies in both light and dark themes
  - No visual regressions on other components

You: Actually, while I'm here, could you refactor the button component too?

Claude: → /focus-check "Refactor button component"
That action is outside the current scope ("Fix header color").
I can:
- Park this idea for later: /focus-park "Refactor button component"
- End this session and start a new one for the refactor

You: Park it

Claude: → Parked: "Refactor button component"
Parked items this session: 1

[... Claude fixes header color ...]

Claude: → /focus-end
Session retro: Fix header color
Duration: 8min (budgeted 15min)
Milestones: 1
Parked items: 1

Criteria status:
  [x] Header color matches design spec
  [x] Color applies in both light and dark themes
  [ ] No visual regressions on other components

Unfinished criteria:
  - No visual regressions on other components

Milestones:
  1. Updated header color to match design spec
```

## State

Everything lives in your repo. No cloud, no accounts, no telemetry.

```
project-root/
├── .focus/              # all gitignored
│   ├── session.json    # active session (includes snapshot)
│   └── history/        # archived sessions (ended + abandoned)
├── .claude/skills/     # slash commands (gitignored)
├── LATER.md            # parked ideas (gitignored)
├── NILAI.md            # focus protocol for Claude
└── CLAUDE.md           # references @NILAI.md
```

## Principles

- **Friction at boundaries, not at work.** Once a session is active, Nilai stays silent.
- **Honor the impulse, redirect the action.** The parking lot is the load-bearing mechanism.
- **Verifiable over felt.** Milestones must be observable state changes.
- **Quiet enforcement.** No moralizing, no coaching, no celebration.
- **State lives in the repo.** Plain JSON and Markdown.

## Anti-features

- No streaks, badges, or gamification.
- No notifications outside Claude Code.
- No cloud state or multi-device sync.
- No AI-evaluated "focus quality" scores.
- No encouragement messages or emoji parties.

The opinions are the product.

## Troubleshooting

### Permission denied when running npx

```bash
# Clear npx cache and retry
npx clear-npx-cache
npx @vignu10/nilai setup
```

### Claude ignores the focus commands

Make sure `NILAI.md` exists in your project root and `CLAUDE.md` references it with `@NILAI.md`. Run `npx @vignu10/nilai init` to set this up.

### Session state stuck / corrupted

Delete the session file to start fresh:

```bash
rm .focus/session.json
```

Archived sessions in `.focus/history/` are safe to keep or delete.

### Hooks not firing

Re-run `npx @vignu10/nilai install-hooks` and check `.claude/settings.json` has entries for `UserPromptSubmit`, `SessionStart`, `PostToolUse`, and `Stop`.

### Skills out of date or missing features

Run `npx @vignu10/nilai update` to refresh hooks, NILAI.md protocol, and skill files to the latest version.

## Contributing

Contributions are welcome. To get started:

```bash
git clone https://github.com/vignu10/nilai.git
cd nilai
npm install
```

### Development commands

```bash
npm run build        # Build to dist/
npm test             # Run all tests (75 tests, vitest)
npm run lint         # TypeScript type check
```

### Testing locally

Link globally to test the CLI:

```bash
npm link
nilai init
nilai install-hooks
nilai quick "Test session"
nilai status
nilai end
```

### Project structure

```
src/
  cli.ts                 # CLI entry (init, setup, update, uninstall, and focus commands)
  hook.ts                # Hook router (dispatches by event type)
  cli/                   # CLI command implementations
    init.ts              # Initialize .focus/, NILAI.md, CLAUDE.md, skills, gitignore
    install-hooks.ts     # Register hooks in .claude/settings.json
    install-skills.ts    # Install skill files to .claude/skills/
    update.ts            # Update hooks, NILAI.md, and skills
    uninstall.ts         # Remove all Nilai artifacts
    dispatch.ts          # Focus subcommand routing
    run-tool.ts          # Handler result adapter
  hooks/                 # Hook handlers
    user-prompt-submit.ts  # Inject session context, check expiry
    session-start.ts       # Orphan sweep — surface abandoned sessions
    post-tool-use.ts       # Snapshot save, time nudge, scope drift, expiry
    stop.ts                # Auto-end with retro
  tools/                 # Focus tool handlers (shared by CLI and hooks)
    focus_start.ts
    focus_quick.ts
    focus_status.ts
    focus_end.ts
    focus_resume.ts
    focus_check.ts
    focus_park.ts
    focus_log.ts
    focus_progress.ts
    focus_pulse.ts
    focus_scope_expand.ts
    focus_sessions.ts
    focus_recent.ts
    focus_list_parked.ts
  state/                 # Session, history, LATER.md read/write
  templates/             # NILAI.md template
source/
  skills/                # 15 slash command skill definitions
    focus/SKILL.md       # Umbrella skill
    focus-start/SKILL.md # Individual skills (focus-start, focus-quick, etc.)
    ...
```

### What to contribute

- **Bug fixes** — open an issue first, then PR
- **v0.3 features** — see PRD.md section 15 (statusline, p-queue mutex, `nilai stats`)
- **Hooks-only fork** — documented as a contribution opportunity in the PRD

### Commit style

Conventional commits. Keep messages concise — describe the change, not the process.

## License

MIT
