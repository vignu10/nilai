import { readSession } from "../state/session.js";
import { listHistory } from "../state/history.js";

export async function handleFocusSessions(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const active = await readSession(cwd);
  const history = await listHistory(cwd);

  const lines: string[] = [];

  if (active && active.status === "active") {
    lines.push(`Active session (this project):`);
    lines.push(`  Task: ${active.task}`);
    lines.push(`  Started: ${active.started_at.slice(0, 16).replace("T", " ")}`);
    lines.push(`  Time box: ${active.time_box_minutes}min`);
    lines.push(`  Milestones: ${active.milestones.length}`);
    if (active.snapshot) {
      lines.push(`  Last activity: ${active.snapshot.last_action}`);
    }
    lines.push("");
  }

  const ended = history.filter((s) => s.status === "ended");
  const abandoned = history.filter((s) => s.status === "abandoned");

  if (ended.length > 0) {
    lines.push(`Completed sessions: ${ended.length}`);
    for (const s of ended.slice(0, 5)) {
      lines.push(`  ${s.id} — ${s.task} (${s.milestones.length} milestones)`);
    }
    if (ended.length > 5) {
      lines.push(`  ... and ${ended.length - 5} more`);
    }
    lines.push("");
  }

  if (abandoned.length > 0) {
    lines.push(`Abandoned sessions: ${abandoned.length}`);
    for (const s of abandoned.slice(0, 5)) {
      const snapshotInfo = s.snapshot ? ` — last: ${s.snapshot.last_action}` : "";
      lines.push(`  ${s.id} — ${s.task}${snapshotInfo}`);
    }
    if (abandoned.length > 5) {
      lines.push(`  ... and ${abandoned.length - 5} more`);
    }
    lines.push("");
  }

  if (!active && history.length === 0) {
    lines.push("No sessions found in this project.");
  }

  return {
    content: [
      {
        type: "text",
        text: lines.join("\n").trimEnd(),
      },
    ],
  };
}
