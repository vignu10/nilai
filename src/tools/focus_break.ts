import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";

export async function handleFocusBreak(
  cwd: string,
  args: { duration_minutes?: number; type?: "pomodoro_25" | "pomodoro_45" | "custom" },
): Promise<{ content: { type: "text"; text: string }[] }> {
  const session = await readSession(cwd);
  if (!session || session.status !== "active") {
    return { content: [{ type: "text", text: "No active session." }] };
  }

  const breakDuration = args.duration_minutes ?? (args.type === "pomodoro_25" ? 5 : 15);
  const now = new Date();

  // Record break
  if (!session.breaks_taken) session.breaks_taken = [];
  session.breaks_taken.push({
    timestamp: now.toISOString(),
    duration_minutes: breakDuration,
  });

  // Schedule next break based on type
  const interval = args.type === "pomodoro_25" ? 25 : args.type === "pomodoro_45" ? 45 : 45;
  session.next_break_at = new Date(now.getTime() + interval * 60_000).toISOString();
  session.break_type = args.type ?? "custom";

  await writeSession(cwd, session);

  const nextBreakTime = new Date(session.next_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return {
    content: [{
      type: "text",
      text: `Break recorded (${breakDuration}min). Next break at ${nextBreakTime}.`,
    }],
  };
}
