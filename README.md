# Nilai

> _Nilai (நிலை, Tamil): state, stability, stance._

ADHD-friendly focus sessions for Claude Code. An MCP server + companion that helps you ship what you intended to.

## The problem

Claude Code makes it frictionless to drift. One sentence takes you from "fix the auth bug" to "refactor the entire middleware" — and two hours later you can't reconstruct what actually shipped. This isn't a discipline failure. It's a medium failure: the impulse and the action are simultaneous in a chat-driven tool.

ADHD brains get hit hardest: you start multiple sessions, pick up your phone, come back hours later with no memory of what was happening. Nilai fixes this by making session state recoverable and drift detectable.

## Quick start

One command in your project directory:

```bash
npx @vignu10/nilai setup
```

That's it. This registers the MCP server, scaffolds the focus session files, and installs hooks.

Done. Start a Claude Code session and tell it what you're working on. Nilai handles the rest.

### Individual commands

If you prefer step-by-step control:

```bash
npx @vignu10/nilai init              # Scaffold focus session files
claude mcp add nilai -- npx -y -p @vignu10/nilai nilai-mcp   # Register MCP server
npx @vignu10/nilai install-hooks     # Install hooks (UserPromptSubmit, SessionStart, PostToolUse, Stop)
```

## What Nilai does

- **Forces concrete task articulation** before any work begins.
- **Detects scope drift** at the moment of drift, not in retrospect.
- **Honors tangential impulses** by capturing them in a parking lot (`LATER.md`) rather than suppressing them.
- **Makes progress visible** through verifiable milestones, not felt progress.
- **Surfaces time blindness** via explicit time boxes and end-of-session retros.
- **Recovers abandoned sessions** — if you leave and come back, Nilai shows you exactly where you were.
- **Auto-ends sessions** when you close Claude Code (Stop hook retro).

## How it works

Nilai gives Claude 14 `focus_*` tools and a companion file (`NILAI.md`) that teaches Claude when to use them:

### Session lifecycle

| Tool | What it does |
|------|-------------|
| `focus_start` | Start a session — rejects vague tasks. Supports intensity levels: `low` (permissive), `medium` (default), `high` (strict) |
| `focus_quick` | Start a quick session with minimal ceremony — task only, auto-generates criteria, 25min default |
| `focus_status` | Check current session state, including last activity snapshot |
| `focus_end` | End session and generate a retro |
| `focus_resume` | Pick up an archived or abandoned session |
| `focus_sessions` | List all sessions for the project (active, completed, abandoned) |
| `focus_recent` | 7-day session history summary — "what did I ship?" |

### Scope and focus

| Tool | What it does |
|------|-------------|
| `focus_check` | Ask "is this action in scope?" before acting |
| `focus_park` | Park a tangent to `LATER.md` instead of chasing it |
| `focus_scope_expand` | Deliberately expand scope with optional timebox extension |
| `focus_log` | Log a verifiable milestone |
| `focus_progress` | Show criteria checklist + milestones |
| `focus_pulse` | Check time usage with a nudge if over budget |
| `focus_list_parked` | Review parked ideas |

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

Tell Claude the intensity when starting: "Start a high-intensity session for..."

## Uninstall

```bash
npx @vignu10/nilai uninstall
```

This removes:
- `.focus/` directory (all session state)
- `NILAI.md`
- `@NILAI.md` reference from `CLAUDE.md`
- Nilai hooks from `.claude/settings.json`
- MCP server registration (`claude mcp remove nilai`)

## What `nilai init` does

- Creates `.focus/` directory (session state, fully gitignored)
- Creates `NILAI.md` with the focus protocol
- Creates or updates `CLAUDE.md` with `@NILAI.md` reference
- Updates `.gitignore` for session state

## Example session

```
You: I need to add retry logic to the login API endpoint

Claude: Let me start a focus session.
→ focus_start("Add retry logic to login API", ["Login endpoint returns 401 on transient failures", "Retries up to 3 times with exponential backoff", "Tests pass for retry behavior"], 45)

You: oh also the header color is wrong

Claude: I'll park that.
→ focus_park("Fix header color")

You: done

Claude:
→ focus_end()

Session retro: Add retry logic to login API
Duration: 32min (budgeted 45min)
Milestones: 3
Parked items: 1

Criteria status:
  [x] Login endpoint returns 401 on transient failures
  [x] Retries up to 3 times with exponential backoff
  [x] Tests pass for retry behavior
```

### Session recovery example

```
(You left 47 minutes ago. You start a new Claude Code session.)

Nilai: Previous session found: "Fix auth redirect" (47min ago).
Last activity: editing auth.ts (47min ago).
Resume with focus_resume 20260425-120000 or start fresh with focus_start.

You: resume that

Claude:
→ focus_resume("20260425-120000")
Resuming abandoned session: "Fix auth redirect"
Last activity: editing auth.ts — adding retry logic
```

## State

Everything lives in your repo. No cloud, no accounts, no telemetry.

```
project-root/
├── .focus/              # all gitignored
│   ├── session.json    # active session (includes snapshot)
│   └── history/        # archived sessions (ended + abandoned)
├── LATER.md            # parked ideas (committed)
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

### MCP error: Connection closed

The MCP server crashed or couldn't start. Fix:

```bash
# Check if the server starts
claude mcp list

# If failed, remove and re-register
claude mcp remove nilai
claude mcp add nilai -- npx -y -p @vignu10/nilai nilai-mcp

# Then restart your Claude Code session
```

If it still fails, test the server directly:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | npx -y -p @vignu10/nilai nilai-mcp
```

If you see a JSON response, the server works — the issue is your Claude Code registration. If it errors, check your Node.js version (`node >= 20`).

### Permission denied when running npx

```bash
# Clear npx cache and retry
npx clear-npx-cache
npx @vignu10/nilai setup
```

### Tools not showing up in Claude Code

The MCP server needs to be registered before starting a Claude Code session. If you registered it mid-session:

1. Exit the session (`/exit` or Ctrl+C)
2. Start a new session — tools load on session start

### Claude ignores the focus tools

Make sure `NILAI.md` exists in your project root and `CLAUDE.md` references it with `@NILAI.md`. Run `npx @vignu10/nilai init` to set this up.

### Session state stuck / corrupted

Delete the session file to start fresh:

```bash
rm .focus/session.json
```

Archived sessions in `.focus/history/` are safe to keep or delete.

### Hooks not firing

Re-run `npx @vignu10/nilai install-hooks` and check `.claude/settings.json` has entries for `UserPromptSubmit`, `SessionStart`, `PostToolUse`, and `Stop`.

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
npm run dev          # Run MCP server with tsx (no build needed)
npm test             # Run all tests (75 tests, vitest)
npm run lint         # TypeScript type check
```

### Testing locally

Register the local build with Claude Code:

```bash
claude mcp add nilai -- node /path/to/nilai/dist/server.js
```

Or link globally to test the CLI:

```bash
npm link
nilai init
nilai install-hooks
```

### Project structure

```
src/
  server.ts              # MCP server entry point
  cli.ts                 # CLI entry (init, install-hooks, uninstall)
  hook.ts                # Hook router (dispatches by event type)
  hooks/                 # Hook handlers
    user-prompt-submit.ts
    session-start.ts     # Orphan sweep + snapshot restore
    post-tool-use.ts     # Snapshot save + time nudge + scope drift + expiry
    stop.ts              # Auto-end with retro
  tools/                 # 14 focus_* tool handlers
  state/                 # Session, history, LATER.md read/write
  validation/            # Vague-task detection
  util/                  # Time formatting and nudges
  cli/                   # CLI command implementations
  templates/             # NILAI.md template
```

### What to contribute

- **Bug fixes** — open an issue first, then PR
- **v0.3 features** — see PRD.md section 15 (statusline, p-queue mutex, `nilai stats`)
- **Hooks-only fork** — documented as a contribution opportunity in the PRD

### Commit style

Conventional commits. Keep messages concise — describe the change, not the process.

## License

MIT
