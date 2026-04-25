# Nilai

> _Nilai (நிலை, Tamil): state, stability, stance._

ADHD-friendly focus sessions for Claude Code. An MCP server + companion that helps you ship what you intended to.

## The problem

Claude Code makes it frictionless to drift. One sentence takes you from "fix the auth bug" to "refactor the entire middleware" — and two hours later you can't reconstruct what actually shipped. This isn't a discipline failure. It's a medium failure: the impulse and the action are simultaneous in a chat-driven tool.

## What Nilai does

- **Forces concrete task articulation** before any work begins.
- **Detects scope drift** at the moment of drift, not in retrospect.
- **Honors tangential impulses** by capturing them in a parking lot (`LATER.md`) rather than suppressing them.
- **Makes progress visible** through verifiable milestones, not felt progress.
- **Surfaces time blindness** via explicit time boxes and end-of-session retros.

## How it works

Nilai gives Claude 10 `focus_*` tools and a companion file (`NILAI.md`) that teaches Claude when to use them:

| Tool | What it does |
|------|-------------|
| `focus_start` | Start a session — rejects vague tasks like "improve the codebase" |
| `focus_status` | Check current session state |
| `focus_check` | Ask "is this action in scope?" before acting |
| `focus_park` | Park a tangent to `LATER.md` instead of chasing it |
| `focus_log` | Log a verifiable milestone |
| `focus_progress` | Show criteria checklist + milestones |
| `focus_pulse` | Check time usage with a nudge if over budget |
| `focus_end` | End session and generate a retro |
| `focus_resume` | Pick up an archived session |
| `focus_list_parked` | Review parked ideas |

## Install

```bash
# 1. Install the package
npm install -g nilai

# 2. Initialize in your project
nilai init

# 3. Register the MCP server
claude mcp add nilai -- npx -y nilai-mcp

# 4. (Optional) Install the prompt hook
nilai install-hooks
```

Three steps, under two minutes to your first session.

## What `nilai init` does

- Creates `.focus/` directory (session state, gitignored)
- Creates `NILAI.md` with the focus protocol
- Creates or updates `CLAUDE.md` with `@NILAI.md` reference
- Updates `.gitignore` for session state

## Usage

Start a Claude Code session in your project. When you tell Claude what you want to work on, it will:

1. Ask you for a concrete task, done criteria, and a time box
2. Call `focus_start` to begin the session
3. Call `focus_check` before actions to stay on scope
4. Call `focus_park` when you mention tangents
5. Call `focus_log` at verifiable checkpoints
6. Call `focus_end` when you're done, showing a retro

### Example session

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

## State

Everything lives in your repo. No cloud, no accounts, no telemetry.

```
project-root/
├── .focus/
│   ├── session.json    # active session (gitignored)
│   └── history/        # archived sessions
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

## License

MIT
