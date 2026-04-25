import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";
import { readHistory } from "../state/history.js";

export async function handleFocusResume(
  cwd: string,
  args: { session_id: string },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const existing = await readSession(cwd);
  if (existing && existing.status === "active") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Session already active: "${existing.task}". End it first with focus_end.`,
        },
      ],
    };
  }

  const old = await readHistory(cwd, args.session_id);
  if (!old) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `No archived session found with ID "${args.session_id}". Use focus_status to check current session.`,
        },
      ],
    };
  }

  const now = new Date();
  const id = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);

  const session: Session = {
    id,
    task: old.task,
    done_criteria: old.done_criteria,
    time_box_minutes: old.time_box_minutes,
    intensity: old.intensity ?? "medium",
    started_at: now.toISOString(),
    milestones: old.milestones,
    parked_count: old.parked_count,
    status: "active",
  };

  await writeSession(cwd, session);

  return {
    content: [
      {
        type: "text",
        text: [
          `Resumed: "${session.task}"`,
          `New session ID: ${session.id}`,
          `Previous milestones carried over: ${session.milestones.length}`,
          `Time box restarted: ${session.time_box_minutes}min`,
        ].join("\n"),
      },
    ],
  };
}
