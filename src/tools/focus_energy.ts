import type { Session } from "../state/session.js";
import { readSession, writeSession } from "../state/session.js";
import { calculateEnergyStats, getEnergyRecommendation, addEnergyEntry, type EnergyEntry } from "../state/energy.js";

function getTimeOfDay(date: Date): "morning" | "afternoon" | "evening" | "night" {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function inferTaskType(task: string): string {
  const keywords: Record<string, string[]> = {
    debug: ["fix", "bug", "error", "debug", "broken", "issue", "fails"],
    code_review: ["review", "refactor", "clean up", "improve", "optimize"],
    feature: ["add", "implement", "create", "build", "new"],
    test: ["test", "spec", "coverage", "mock"],
    docs: ["document", "readme", "comment", "docstring"],
  };

  const taskLower = task.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some((w) => taskLower.includes(w))) {
      return type;
    }
  }
  return "general";
}

function elapsedMinutes(startedAt: string): number {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 60_000);
}

export async function handleFocusEnergy(
  cwd: string,
  args: {
    action: "start" | "end" | "stats" | "recommend";
    level?: number; // 1-5
  },
): Promise<{ content: { type: "text"; text: string }[] }> {
  const session = await readSession(cwd);

  switch (args.action) {
    case "start":
      if (!session || args.level === undefined || args.level < 1 || args.level > 5) {
        return { content: [{ type: "text", text: "Usage: /focus-energy start <1-5>" }] };
      }
      session.energy_start = args.level;
      await writeSession(cwd, session);
      return { content: [{ type: "text", text: `Energy level recorded: ${args.level}/5` }] };

    case "end":
      if (!session || args.level === undefined || args.level < 1 || args.level > 5) {
        return { content: [{ type: "text", text: "Usage: /focus-energy end <1-5>" }] };
      }
      if (session.energy_start === undefined) {
        return { content: [{ type: "text", text: "No starting energy level recorded. Use /focus-energy start first." }] };
      }
      session.energy_end = args.level;
      await writeSession(cwd, session);

      // Save to energy history
      const entry: EnergyEntry = {
        session_id: session.id,
        date: new Date().toISOString().slice(0, 10),
        time_of_day: getTimeOfDay(new Date()),
        energy_start: session.energy_start,
        energy_end: args.level,
        task_type: inferTaskType(session.task),
        duration_minutes: elapsedMinutes(session.started_at),
        completed_criteria: session.milestones.length,
        total_criteria: session.done_criteria.length,
      };
      await addEnergyEntry(cwd, entry);

      return { content: [{ type: "text", text: `Session energy recorded. Start: ${session.energy_start}/5, End: ${args.level}/5` }] };

    case "stats": {
      const stats = await calculateEnergyStats(cwd);
      if (stats.total_entries === 0) {
        return { content: [{ type: "text", text: "No energy data yet. Track energy at session start/end." }] };
      }

      const lines = [
        `Energy Stats (${stats.total_entries} sessions)`,
        `Average start: ${stats.average_energy_start.toFixed(1)}/5`,
        `Average end: ${stats.average_energy_end.toFixed(1)}/5`,
        ``,
        `By time of day:`,
      ];

      for (const [time, energy] of Object.entries(stats.energy_by_time_of_day)) {
        lines.push(`  ${time}: ${energy.toFixed(1)}/5`);
      }

      lines.push(`\nBy task type:`);
      for (const [type, energy] of Object.entries(stats.energy_by_task_type)) {
        lines.push(`  ${type}: ${energy.toFixed(1)}/5`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }

    case "recommend": {
      if (!session) {
        return { content: [{ type: "text", text: "Start a session first." }] };
      }
      const taskType = inferTaskType(session.task);
      const rec = await getEnergyRecommendation(cwd, taskType, new Date());
      if (!rec) {
        return { content: [{ type: "text", text: "Not enough data for recommendations yet." }] };
      }
      return { content: [{ type: "text", text: rec }] };
    }

    default:
      return { content: [{ type: "text", text: "Usage: /focus-energy <start|end|stats|recommend>" }] };
  }
}
