import { readDay, endDay } from "../state/day.js";

export async function handleFocusDayEnd(
  cwd: string,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  try {
    const day = await endDay(cwd);
    const focusedHours = Math.floor(day.total_focused_minutes / 60);
    const focusedMins = day.total_focused_minutes % 60;
    const downtimeHours = Math.floor(day.total_downtime_minutes / 60);
    const downtimeMins = day.total_downtime_minutes % 60;
    const idleHours = Math.floor(day.total_idle_minutes / 60);
    const idleMins = day.total_idle_minutes % 60;

    const lines = [
      `Day summary for ${day.date}:`,
      "",
      `Focused: ${focusedHours}h ${focusedMins}m (${day.total_focused_minutes} minutes)`,
      `Downtime: ${downtimeHours}h ${downtimeMins}m (${day.total_downtime_minutes} minutes)`,
      `Idle: ${idleHours}h ${idleMins}m (${day.total_idle_minutes} minutes)`,
      "",
      `Sessions: ${day.sessions.length}`,
      ...day.sessions.map(
        (s) =>
          `  ${s.type === "focused" ? "🎯" : "☕"} ${s.type}: ${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m${s.task ? ` — "${s.task}"` : ""}`,
      ),
      "",
      `Day archived to .focus/history/${day.date}.json`,
    ];

    return {
      content: [{ type: "text", text: lines.join("\n") }],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : "Failed to end day tracking",
        },
      ],
    };
  }
}
