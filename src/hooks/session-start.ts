import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Session } from "../state/session.js";

export function handleSessionStart(cwd: string): void {
  const sessionPath = resolve(cwd, ".focus", "session.json");

  let session: Session | null = null;
  try {
    const data = readFileSync(sessionPath, "utf-8");
    session = JSON.parse(data);
  } catch {
    process.exit(0);
  }

  if (!session || session.status !== "active") {
    process.exit(0);
  }

  const idleMinutes = computeIdleMinutes(session);
  const idleStr = idleMinutes < 60
    ? `${Math.round(idleMinutes)}min`
    : `${Math.floor(idleMinutes / 60)}h ${Math.round(idleMinutes % 60)}m`;

  let message = `Previous session found: "${session.task}" (${idleStr} ago).`;

  if (session.snapshot) {
    const snapshotAge = Math.round(
      (Date.now() - new Date(session.snapshot.at).getTime()) / 60_000,
    );
    message += ` Last activity: ${session.snapshot.last_action} (${snapshotAge}min ago).`;
  }

  message += ` Resume with focus_resume ${session.id} or start fresh with focus_start.`;

  const output = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message,
    },
  };

  process.stdout.write(JSON.stringify(output));
}

function computeIdleMinutes(session: Session): number {
  const lastActivity = session.snapshot?.at
    ?? session.milestones.at(-1)?.at
    ?? session.started_at;
  return (Date.now() - new Date(lastActivity).getTime()) / 60_000;
}
