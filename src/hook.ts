import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Session } from "./state/session.js";

function main(): void {
  const cwd = process.cwd();
  const sessionPath = resolve(cwd, ".focus", "session.json");

  let session: Session | null = null;
  try {
    const data = readFileSync(sessionPath, "utf-8");
    session = JSON.parse(data);
  } catch {
    // no session — exit silently
    process.exit(0);
  }

  if (!session || session.status !== "active") {
    process.exit(0);
  }

  const elapsed = Math.round(
    (Date.now() - new Date(session.started_at).getTime()) / 60_000,
  );

  const output = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `Active focus session: "${session.task}". Elapsed: ${elapsed}m of ${session.time_box_minutes}m budget. ${session.milestones.length} milestones logged. ${session.parked_count} items parked.`,
    },
  };

  process.stdout.write(JSON.stringify(output));
}

main();
