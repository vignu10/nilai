import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import type { Session } from "../state/session.js";

export function handleStop(cwd: string): void {
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

  // Auto-end the session with a retro
  session.status = "ended";
  session.ended_at = new Date().toISOString();

  const elapsed = Math.round(
    (Date.now() - new Date(session.started_at).getTime()) / 60_000,
  );

  const retro = [
    `Session auto-ended: ${session.task}`,
    `Duration: ${elapsed}min (budgeted ${session.time_box_minutes}min)`,
    `Milestones: ${session.milestones.length}`,
    `Parked items: ${session.parked_count}`,
    "",
    session.milestones.length > 0
      ? "Milestones:\n" +
        session.milestones
          .map((m, i) => `  ${i + 1}. ${m.text}`)
          .join("\n")
      : "(no milestones logged)",
  ].join("\n");

  // Archive
  const historyDir = resolve(cwd, ".focus", "history");
  mkdirSync(historyDir, { recursive: true });
  const archivePath = resolve(historyDir, `${session.id}.json`);
  writeFileSync(archivePath, JSON.stringify(session, null, 2), "utf-8");

  try {
    unlinkSync(sessionPath);
  } catch {
    // already gone
  }

  const output = {
    hookSpecificOutput: {
      hookEventName: "Stop",
      additionalContext: retro,
    },
  };

  process.stdout.write(JSON.stringify(output));
}
