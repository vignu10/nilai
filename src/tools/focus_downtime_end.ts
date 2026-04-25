import { readSession, writeSession, deleteSession } from "../state/session.js";
import { archiveSession } from "../state/history.js";
import { elapsedMinutes } from "../util/time.js";
import { readDay, addSessionToDay } from "../state/day.js";

export async function handleFocusDowntimeEnd(
  cwd: string,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const session = await readSession(cwd);
  if (!session) {
    return {
      content: [{ type: "text", text: "No active downtime session to end." }],
    };
  }

  if (session.status !== "downtime") {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Current session is not a downtime session (status: ${session.status}). Use focus_end for regular sessions.`,
        },
      ],
    };
  }

  session.status = "ended";
  session.ended_at = new Date().toISOString();

  const elapsed = elapsedMinutes(session.started_at);
  const budget = session.downtime_max_minutes || session.time_box_minutes;
  const type = session.downtime_type || "break";

  const retro = [
    `Downtime session ended: ${type}`,
    `Duration: ${elapsed}min${budget ? ` (max was ${budget}min)` : ""}`,
    "",
    elapsed > budget ? `⚠️  Exceeded max duration by ${Math.round(elapsed - budget)}min` : "Within time limit",
  ].join("\n");

  await writeSession(cwd, session);
  await archiveSession(cwd, session);
  await deleteSession(cwd);

  const day = await readDay(cwd);
  if (day && !day.ended_at) {
    await addSessionToDay(cwd, session);
  }

  return {
    content: [{ type: "text", text: retro }],
  };
}
