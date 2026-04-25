import { readSession } from "../state/session.js";
import { formatElapsed } from "../util/time.js";

export async function handleFocusStatus(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [{ type: "text", text: "No active focus session." }],
    };
  }

  const elapsed = formatElapsed(session.started_at);

  const lines = [
    `Task: ${session.task}`,
    `Intensity: ${session.intensity ?? "medium"}`,
    `Elapsed: ${elapsed} of ${session.time_box_minutes}min`,
  ];

  if (session.snapshot) {
    const snapshotAge = Math.round(
      (Date.now() - new Date(session.snapshot.at).getTime()) / 60_000,
    );
    lines.push(`Last activity: ${session.snapshot.last_action} (${snapshotAge}min ago)`);
  }

  lines.push(
    `Milestones: ${session.milestones.length}`,
    `Parked: ${session.parked_count}`,
    "",
    "Done criteria:",
    ...session.done_criteria.map((c) => `  - ${c}`),
  );

  return {
    content: [
      {
        type: "text",
        text: lines.join("\n"),
      },
    ],
  };
}
