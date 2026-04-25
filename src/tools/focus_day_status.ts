import { readDay, updateIdleTime } from "../state/day.js";
import { writeDay } from "../state/day.js";

export async function handleFocusDayStatus(
  cwd: string,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  const day = await readDay(cwd);
  if (!day) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "No active day tracking. Start a day with /focus-day-start.",
        },
      ],
    };
  }

  const updated = updateIdleTime(day);
  if (updated.current_idle_streak_minutes !== day.current_idle_streak_minutes) {
    await writeDay(cwd, updated);
  }

  const focusedHours = Math.floor(updated.total_focused_minutes / 60);
  const focusedMins = updated.total_focused_minutes % 60;
  const downtimeHours = Math.floor(updated.total_downtime_minutes / 60);
  const downtimeMins = updated.total_downtime_minutes % 60;
  const idleHours = Math.floor(updated.total_idle_minutes / 60);
  const idleMins = updated.total_idle_minutes % 60;
  const currentIdleHours = Math.floor(updated.current_idle_streak_minutes / 60);
  const currentIdleMins = updated.current_idle_streak_minutes % 60;

  const lines = [
    `Day progress for ${updated.date}:`,
    "",
    `Focused: ${focusedHours}h ${focusedMins}m`,
    `Downtime: ${downtimeHours}h ${downtimeMins}m`,
    `Idle: ${idleHours}h ${idleMins}m`,
    `Current idle streak: ${currentIdleHours}h ${currentIdleMins}m`,
    "",
    `Sessions: ${updated.sessions.length}`,
    ...updated.sessions.slice(-5).map(
      (s) =>
        `  ${s.type === "focused" ? "🎯" : "☕"} ${s.type}: ${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m${s.task ? ` — "${s.task}"` : ""}`,
    ),
    ...(updated.sessions.length > 5 ? [`  ... and ${updated.sessions.length - 5} more sessions`] : []),
  ];

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
