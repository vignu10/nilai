# Contributing to Nilai

Thanks for your interest in contributing!

## Quick start

```bash
git clone https://github.com/vignu10/nilai.git
cd nilai
npm install
npm run build
npm test
```

## Development

```bash
npm run build    # Build to dist/
npm test         # Run tests (75 tests, vitest)
npm run lint     # TypeScript type check
```

## Testing locally

Link globally to test the CLI:

```bash
npm link
nilai init
nilai install-hooks
nilai quick "Test session"
nilai status
nilai end
```

## What to contribute

### Bug fixes
Open an issue first describing the bug, then submit a PR with the fix.

### New features
Check PRD.md section 15 for planned v0.3 features:
- Statusline integration
- Parallel queue mutex
- `nilai stats` command

### Hooks-only fork
Documented as a contribution opportunity in the PRD — a simplified version without slash commands.

## Commit style

Conventional commits. Keep messages concise.

Examples:
- `feat: add focus-downtime command`
- `fix: correct session expiry calculation`
- `docs: update installation instructions`

## Project structure

```
src/
├── cli.ts                 # CLI entry
├── hook.ts                # Hook router
├── cli/                   # CLI commands
├── hooks/                 # Hook handlers
├── tools/                 # Focus tool handlers
├── state/                 # Session, history, LATER.md
└── templates/             # NILAI.md template

source/
└── skills/                # Slash command definitions
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
