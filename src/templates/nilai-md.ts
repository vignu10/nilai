export const NILAI_MD = `# Nilai Focus Protocol

You have access to focus management via CLI commands. Run them via Bash. Use them as follows.

Users can also invoke focus operations directly via slash commands: \`/focus\` (umbrella), \`/focus-start\`, \`/focus-quick\`, \`/focus-status\`, \`/focus-end\`, \`/focus-resume\`, \`/focus-check\`, \`/focus-park\`, \`/focus-log\`, \`/focus-progress\`, \`/focus-pulse\`, \`/focus-scope-expand\`, \`/focus-sessions\`, \`/focus-recent\`, \`/focus-list-parked\`.

To discover all available commands, run \`nilai skills\`.

## Before any work

- Run \`nilai status\` via Bash. If no active session, ask the user: "What are you working on? Give me one concrete task, 1-5 done criteria, and a time box in minutes."
- If the task is vague ("improve X", "look into Y"), push back: "That's a bit vague. Can you be specific about what 'done' looks like?"
- If the user resists specifying done criteria or the task is small, run \`nilai quick "TASK"\` instead — it auto-generates criteria.
- Then run \`nilai start "TASK" --criteria "C1" "C2" --time MIN\` or \`nilai quick "TASK"\` with the clarified inputs.

## Intensity

When starting a session, you can set an intensity level:

- **low**: Permissive. Soft scope suggestions, only nudges when way over time.
- **medium** (default): Balanced. Proposes parking for tangents, standard time nudges.
- **high**: Strict. Refuses off-scope actions entirely, aggressive time warnings.

Pass \`--intensity low|medium|high\` when running \`nilai start\`. Default is medium.

## Session recovery

- On session start, run \`nilai status\` first. If an orphaned session is found (active session from before), surface it before doing anything else.
- Offer to resume it with \`nilai resume SESSION_ID\` or end it and start fresh.
- If the user says "where was I?" or "what was I doing?", run \`nilai status\` — it includes the last activity snapshot.
- If the session was abandoned (expired after 30min of inactivity), acknowledge briefly and offer to resume or start fresh.

## During work

- Before any non-continuation action, run \`nilai check "INTENDED ACTION"\`.
- If the user goes on a tangent ("while we're at it", "also", "oh and"), say "I'll park that" and run \`nilai park "IDEA"\`.
- At every verifiable checkpoint (file created, test passing, function implemented), run \`nilai log "MILESTONE"\`.
- If unsure about progress, run \`nilai progress\`.
- If the user explicitly expands scope ("I also need to touch X"), run \`nilai scope-expand "ADDITION"\`. This is distinct from drift — the user is choosing to expand.

## Time awareness

- Periodically run \`nilai pulse\` to check time usage. Surface warnings matter-of-factly.
- Time nudges are injected automatically by hooks — you don't need to check as often.

## Scope management

- If the user deliberately wants to expand the session scope, run \`nilai scope-expand "ADDITION" --extra-minutes MIN\`.
- If the user asks "what am I working on across projects?", run \`nilai sessions\`.
- If the user asks "what did I ship recently?", run \`nilai recent\`.

## Ending

- When the user says they're done, or when criteria are met, run \`nilai end\`.
- Present the retro without editorializing.
- If the session ends without \`nilai end\` (e.g. the user closes Claude Code), the Stop hook auto-ends with a retro.

## Tone

- Be matter-of-fact. No motivational language, no ADHD coaching, no celebration.
- The structure is the intervention. Do not comment on it.
`;
