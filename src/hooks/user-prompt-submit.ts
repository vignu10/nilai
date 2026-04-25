import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import type { Session } from "../state/session.js";

export function handleUserPromptSubmit(cwd: string): void {
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

  // Check session expiry (>30min idle)
  const idleMinutes = computeIdleMinutes(session);
  if (idleMinutes > 30) {
    archiveAbandoned(cwd, sessionPath, session, "idle");
    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: `Previous session expired: "${session.task}" was abandoned after ${Math.round(idleMinutes)}min of inactivity. Call focus_status to check, or start fresh with focus_start.`,
      },
    };
    process.stdout.write(JSON.stringify(output));
    return;
  }

  const elapsed = Math.round(
    (Date.now() - new Date(session.started_at).getTime()) / 60_000,
  );

  const snapshotLine = session.snapshot
    ? `\nLast activity: ${session.snapshot.last_action} (${Math.round((Date.now() - new Date(session.snapshot.at).getTime()) / 60_000)}min ago)`
    : "";

  const output = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `Active focus session: "${session.task}". Elapsed: ${elapsed}m of ${session.time_box_minutes}m budget. ${session.milestones.length} milestones logged. ${session.parked_count} items parked.${snapshotLine}`,
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

function archiveAbandoned(
  cwd: string,
  sessionPath: string,
  session: Session,
  reason: "idle" | "user_ended" | "replaced",
): void {
  session.status = "abandoned";
  session.abandoned_at = new Date().toISOString();
  session.abandonment_reason = reason;

  const historyDir = resolve(cwd, ".focus", "history");
  try {
    const { mkdirSync } = require("node:fs");
    mkdirSync(historyDir, { recursive: true });
  } catch {
    // already exists
  }

  const archivePath = resolve(historyDir, `${session.id}.json`);
  writeFileSync(archivePath, JSON.stringify(session, null, 2), "utf-8");

  try {
    unlinkSync(sessionPath);
  } catch {
    // already gone
  }
}
