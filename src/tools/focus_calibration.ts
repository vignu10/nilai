import type { Session } from "../state/session.js";
import { readSession } from "../state/session.js";
import { calculateCalibrationStats, getSuggestedTimebox } from "../state/calibration.js";
import { inferTaskType } from "../state/calibration.js";

function elapsedMinutes(startedAt: string): number {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 60_000);
}

export async function handleFocusCalibration(
  cwd: string,
  args: { action: "stats" | "suggest" },
): Promise<{ content: { type: "text"; text: string }[] }> {
  switch (args.action) {
    case "stats": {
      const stats = await calculateCalibrationStats(cwd);
      if (stats.total_sessions === 0) {
        return { content: [{ type: "text", text: "No calibration data yet. Start sessions with estimates." }] };
      }

      const lines = [
        `Time Estimation Accuracy (${stats.total_sessions} sessions)`,
        `Average error: ${stats.average_error_minutes > 0 ? "+" : ""}${Math.round(stats.average_error_minutes)}min (${Math.round(stats.average_error_percentage)}%)`,
        `Bias: ${stats.bias}`,
        stats.trending_error !== 0 ? `Trend: ${stats.trending_error > 0 ? "getting worse" : "improving"} by ${Math.abs(Math.round(stats.trending_error))}min` : "",
        ``,
        `By task type:`,
      ];

      for (const [type, data] of Object.entries(stats.error_by_task_type)) {
        lines.push(`  ${type}: ${data.avg_error > 0 ? "+" : ""}${Math.round(data.avg_error)}min avg error (${data.count} sessions)`);
      }

      return { content: [{ type: "text", text: lines.filter(Boolean).join("\n") }] };
    }

    case "suggest": {
      const session = await readSession(cwd);
      if (!session) {
        return { content: [{ type: "text", text: "Start a session first." }] };
      }

      const suggestion = await getSuggestedTimebox(cwd, session.task, session.time_box_minutes);
      return {
        content: [{
          type: "text",
          text: `Based on your history, this task might take ${suggestion.suggested}min. ` +
            `Confidence: ${suggestion.confidence}. ${suggestion.reasoning}`,
        }],
      };
    }

    default:
      return { content: [{ type: "text", text: "Usage: /focus-calibration <stats|suggest>" }] };
  }
}
