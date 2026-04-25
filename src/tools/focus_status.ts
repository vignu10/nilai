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

  return {
    content: [
      {
        type: "text",
        text: [
          `Task: ${session.task}`,
          `Elapsed: ${elapsed} of ${session.time_box_minutes}min`,
          `Milestones: ${session.milestones.length}`,
          `Parked: ${session.parked_count}`,
          "",
          "Done criteria:",
          ...session.done_criteria.map((c) => `  - ${c}`),
        ].join("\n"),
      },
    ],
  };
}
