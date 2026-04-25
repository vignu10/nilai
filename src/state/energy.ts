import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { energyPath, ensureFocusDirs } from "./paths.js";

export type EnergyEntry = {
  session_id: string;
  date: string; // YYYY-MM-DD for aggregation
  time_of_day: "morning" | "afternoon" | "evening" | "night";
  energy_start: number;
  energy_end: number;
  task_type: string; // inferred from task/template
  duration_minutes: number;
  completed_criteria: number;
  total_criteria: number;
};

export type EnergyStats = {
  average_energy_start: number;
  average_energy_end: number;
  energy_by_time_of_day: Record<string, number>;
  energy_by_task_type: Record<string, number>;
  completion_rate_by_energy: Record<number, number>; // energy level -> completion rate
  optimal_energy_for_task_type: Record<string, number>; // task type -> best energy level
  total_entries: number;
};

export async function readEnergyHistory(cwd: string): Promise<EnergyEntry[]> {
  const path = energyPath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as EnergyEntry[];
  } catch {
    return [];
  }
}

export async function writeEnergyHistory(cwd: string, entries: EnergyEntry[]): Promise<void> {
  ensureFocusDirs(cwd);
  const path = energyPath(cwd);
  await writeFile(path, JSON.stringify(entries, null, 2), "utf-8");
}

export async function addEnergyEntry(cwd: string, entry: EnergyEntry): Promise<void> {
  const entries = await readEnergyHistory(cwd);
  entries.push(entry);
  await writeEnergyHistory(cwd, entries);
}

export async function calculateEnergyStats(cwd: string): Promise<EnergyStats> {
  const entries = await readEnergyHistory(cwd);
  if (entries.length === 0) {
    return {
      average_energy_start: 0,
      average_energy_end: 0,
      energy_by_time_of_day: {},
      energy_by_task_type: {},
      completion_rate_by_energy: {},
      optimal_energy_for_task_type: {},
      total_entries: 0,
    };
  }

  const totalStart = entries.reduce((sum, e) => sum + e.energy_start, 0);
  const totalEnd = entries.reduce((sum, e) => sum + e.energy_end, 0);

  const byTimeOfDay: Record<string, number[]> = {};
  const byTaskType: Record<string, number[]> = {};
  const completionByEnergy: Record<number, { completed: number; total: number }[]> = {};

  for (const entry of entries) {
    if (!byTimeOfDay[entry.time_of_day]) byTimeOfDay[entry.time_of_day] = [];
    byTimeOfDay[entry.time_of_day].push(entry.energy_start);

    if (!byTaskType[entry.task_type]) byTaskType[entry.task_type] = [];
    byTaskType[entry.task_type].push(entry.energy_start);

    if (!completionByEnergy[entry.energy_start]) completionByEnergy[entry.energy_start] = [];
    completionByEnergy[entry.energy_start].push({
      completed: entry.completed_criteria,
      total: entry.total_criteria,
    });
  }

  const energyByTimeOfDay: Record<string, number> = {};
  for (const [key, values] of Object.entries(byTimeOfDay)) {
    energyByTimeOfDay[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const energyByTaskType: Record<string, number> = {};
  for (const [key, values] of Object.entries(byTaskType)) {
    energyByTaskType[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const completionRateByEnergy: Record<number, number> = {};
  for (const [energy, rates] of Object.entries(completionByEnergy)) {
    const totalCompleted = rates.reduce((sum, r) => sum + r.completed, 0);
    const totalPossible = rates.reduce((sum, r) => sum + r.total, 0);
    completionRateByEnergy[parseInt(energy)] = totalPossible > 0 ? totalCompleted / totalPossible : 0;
  }

  const optimalEnergyForTaskType: Record<string, number> = {};
  for (const entry of entries) {
    if (!optimalEnergyForTaskType[entry.task_type]) {
      const taskEntries = entries.filter((e) => e.task_type === entry.task_type);
      const avgCompletionByEnergy: Record<number, number> = {};
      for (const e of taskEntries) {
        if (!avgCompletionByEnergy[e.energy_start]) avgCompletionByEnergy[e.energy_start] = 0;
        avgCompletionByEnergy[e.energy_start] += e.completed_criteria / e.total_criteria;
      }
      for (const key of Object.keys(avgCompletionByEnergy)) {
        avgCompletionByEnergy[parseInt(key)] /= taskEntries.filter((e) => e.energy_start === parseInt(key)).length;
      }
      const bestEnergy = parseInt(Object.entries(avgCompletionByEnergy).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "3");
      optimalEnergyForTaskType[entry.task_type] = bestEnergy;
    }
  }

  return {
    average_energy_start: totalStart / entries.length,
    average_energy_end: totalEnd / entries.length,
    energy_by_time_of_day: energyByTimeOfDay,
    energy_by_task_type: energyByTaskType,
    completion_rate_by_energy: completionRateByEnergy,
    optimal_energy_for_task_type: optimalEnergyForTaskType,
    total_entries: entries.length,
  };
}

export async function getEnergyRecommendation(cwd: string, taskType: string, currentTime: Date): Promise<string | null> {
  const stats = await calculateEnergyStats(cwd);
  if (stats.total_entries < 3) return null;

  const hour = currentTime.getHours();
  const timeOfDay = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : hour >= 17 && hour < 21 ? "evening" : "night";

  const timeEnergy = stats.energy_by_time_of_day[timeOfDay];
  const taskEnergy = stats.optimal_energy_for_task_type[taskType];

  if (timeEnergy !== undefined && taskEnergy !== undefined) {
    return `Based on your patterns, you typically have ${timeEnergy.toFixed(1)}/5 energy in the ${timeOfDay}, and do ${taskType} work best at energy level ${taskEnergy}.`;
  }

  return null;
}
