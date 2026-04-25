import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Session } from "../state/session.js";
import { readDay, startDay, writeDay } from "../state/day.js";
import { updateIdleTime } from "../state/day.js";

export async function handleSessionStart(cwd: string): Promise<void> {
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

  // Smart day start: if no active day and first session before 10am, auto-start
  const messages: string[] = [];
  try {
    const day = await readDay(cwd);
    if (!day) {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 10) {
        const newDay = await startDay(cwd, true);
        messages.push(`Day tracking auto-started for ${newDay.date}. Use /focus-day-status to check progress.`);
      } else {
        messages.push("No active day tracking. Run /focus-day-start or start a session before 10am to auto-start.");
      }
    } else if (!day.ended_at) {
      // Update idle streak for existing day
      const updated = updateIdleTime(day);
      await writeDay(cwd, updated);
    }
  } catch {
    // Ignore day tracking errors
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

  message += ` Resume with \`nilai resume ${session.id}\` or start fresh with \`nilai start\`.`;

  if (messages.length > 0) {
    message = messages.join(" ") + " " + message;
  }

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
