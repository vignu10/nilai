import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";
import { readDay, addSessionToDay } from "../state/day.js";

export async function handleFocusDowntime(
  cwd: string,
  args: { type?: "break" | "maintenance" | "awaiting"; max_minutes?: number },
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const existing = await readSession(cwd);
  if (existing && (existing.status === "active" || existing.status === "downtime")) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Session already active: "${existing.task}" (started ${new Date(existing.started_at).toLocaleTimeString()}). End it first with focus_end or focus_downtime_end.`,
        },
      ],
    };
  }

  const now = new Date();
  const id = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);

  const session: Session = {
    id,
    task: args.type === "awaiting" ? "Awaiting input" : `${args.type || "Break"} time`,
    done_criteria: [],
    time_box_minutes: args.max_minutes || 60,
    intensity: "low",
    started_at: now.toISOString(),
    milestones: [],
    parked_count: 0,
    status: "downtime",
    downtime_type: args.type || "break",
    ...(args.max_minutes && { downtime_max_minutes: args.max_minutes }),
  };

  await writeSession(cwd, session);

  const lines = [
    `Downtime session started: "${session.task}"`,
    `Type: ${session.downtime_type}`,
    ...(session.downtime_max_minutes ? [`Max duration: ${session.downtime_max_minutes} minutes`] : []),
    `Editing files during downtime will trigger warnings.`,
  ];

  const day = await readDay(cwd);
  if (day && !day.ended_at) {
    await addSessionToDay(cwd, session);
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
