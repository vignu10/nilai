import { readSession } from "../state/session.js";
import { elapsedMinutes, getNudge } from "../util/time.js";

export async function handleFocusPulse(cwd: string): Promise<{
  content: { type: "text"; text: string }[];
}> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return {
      content: [
        { type: "text", text: "No active focus session. Start one with focus_start." },
      ],
    };
  }

  const elapsed = elapsedMinutes(session.started_at);
  const nudge = getNudge(
    session.started_at,
    session.time_box_minutes,
    session.milestones.length,
  );

  return {
    content: [
      {
        type: "text",
        text: [
          `Task: ${session.task}`,
          `${elapsed}m of ${session.time_box_minutes}m elapsed.`,
          nudge,
        ].join("\n"),
      },
    ],
  };
}
