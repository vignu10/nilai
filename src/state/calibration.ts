import { readFile, writeFile } from "node:fs/promises";
import { calibrationPath, ensureFocusDirs } from "./paths.js";

export type EstimationRecord = {
  session_id: string;
  task: string;
  task_type: string; // inferred from keywords
  estimated_minutes: number;
  actual_minutes: number;
  intensity: "low" | "medium" | "high";
  completed_criteria: number;
  total_criteria: number;
  date: string;
};

export type CalibrationStats = {
  total_sessions: number;
  average_error_minutes: number;
  average_error_percentage: number;
  bias: "underestimate" | "overestimate" | "accurate";
  error_by_task_type: Record<string, { avg_error: number; count: number }>;
  error_by_intensity: Record<string, { avg_error: number; count: number }>;
  trending_error: number; // positive = getting worse, negative = improving
};

export async function readCalibrationHistory(cwd: string): Promise<EstimationRecord[]> {
  const path = calibrationPath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as EstimationRecord[];
  } catch {
    return [];
  }
}

export async function writeCalibrationHistory(cwd: string, records: EstimationRecord[]): Promise<void> {
  ensureFocusDirs(cwd);
  const path = calibrationPath(cwd);
  await writeFile(path, JSON.stringify(records, null, 2), "utf-8");
}

export async function addCalibrationRecord(cwd: string, record: EstimationRecord): Promise<void> {
  const records = await readCalibrationHistory(cwd);
  records.push(record);
  await writeCalibrationHistory(cwd, records);
}

export async function calculateCalibrationStats(cwd: string): Promise<CalibrationStats> {
  const records = await readCalibrationHistory(cwd);
  if (records.length === 0) {
    return {
      total_sessions: 0,
      average_error_minutes: 0,
      average_error_percentage: 0,
      bias: "accurate",
      error_by_task_type: {},
      error_by_intensity: {},
      trending_error: 0,
    };
  }

  const errors = records.map((r) => r.actual_minutes - r.estimated_minutes);
  const avgError = errors.reduce((a, b) => a + b, 0) / records.length;
  const avgErrorPercent = records.reduce((sum, r) => sum + Math.abs((r.actual_minutes - r.estimated_minutes) / r.estimated_minutes), 0) / records.length * 100;

  const bias: "underestimate" | "overestimate" | "accurate" = avgError > 5 ? "underestimate" : avgError < -5 ? "overestimate" : "accurate";

  const errorByTaskType: Record<string, { avg_error: number; count: number }> = {};
  const errorByIntensity: Record<string, { avg_error: number; count: number }> = {};

  for (const record of records) {
    if (!errorByTaskType[record.task_type]) {
      errorByTaskType[record.task_type] = { avg_error: 0, count: 0 };
    }
    errorByTaskType[record.task_type].avg_error += record.actual_minutes - record.estimated_minutes;
    errorByTaskType[record.task_type].count++;

    if (!errorByIntensity[record.intensity]) {
      errorByIntensity[record.intensity] = { avg_error: 0, count: 0 };
    }
    errorByIntensity[record.intensity].avg_error += record.actual_minutes - record.estimated_minutes;
    errorByIntensity[record.intensity].count++;
  }

  for (const key of Object.keys(errorByTaskType)) {
    errorByTaskType[key].avg_error /= errorByTaskType[key].count;
  }
  for (const key of Object.keys(errorByIntensity)) {
    errorByIntensity[key].avg_error /= errorByIntensity[key].count;
  }

  // Calculate trend: compare recent 5 sessions to previous 5
  let trendingError = 0;
  if (records.length >= 10) {
    const recent = records.slice(-5);
    const previous = records.slice(-10, -5);
    const recentAvgError = recent.reduce((sum, r) => sum + Math.abs(r.actual_minutes - r.estimated_minutes), 0) / recent.length;
    const previousAvgError = previous.reduce((sum, r) => sum + Math.abs(r.actual_minutes - r.estimated_minutes), 0) / previous.length;
    trendingError = recentAvgError - previousAvgError;
  }

  return {
    total_sessions: records.length,
    average_error_minutes: avgError,
    average_error_percentage: avgErrorPercent,
    bias,
    error_by_task_type: errorByTaskType,
    error_by_intensity: errorByIntensity,
    trending_error: trendingError,
  };
}

export async function getSuggestedTimebox(cwd: string, task: string, userEstimate?: number): Promise<{ suggested: number; confidence: string; reasoning: string }> {
  const records = await readCalibrationHistory(cwd);
  if (records.length < 3) {
    return {
      suggested: userEstimate ?? 25,
      confidence: "low",
      reasoning: "Not enough data yet. Need at least 3 completed sessions with estimates.",
    };
  }

  const taskType = inferTaskType(task);
  const relevantRecords = records.filter((r) => r.task_type === task_type);

  if (relevantRecords.length < 2) {
    const avgError = records.reduce((sum, r) => sum + (r.actual_minutes - r.estimated_minutes), 0) / records.length;
    const base = userEstimate ?? 25;
    return {
      suggested: Math.max(5, Math.round(base + avgError)),
      confidence: "medium",
      reasoning: `Based on all sessions, you tend to ${avgError > 0 ? "underestimate" : "overestimate"} by ${Math.abs(Math.round(avgError))} minutes on average.`,
    };
  }

  const avgErrorForType = relevantRecords.reduce((sum, r) => sum + (r.actual_minutes - r.estimated_minutes), 0) / relevantRecords.length;
  const base = userEstimate ?? relevantRecords.reduce((sum, r) => sum + r.actual_minutes, 0) / relevantRecords.length;

  return {
    suggested: Math.max(5, Math.round(base + avgErrorForType * 0.5)),
    confidence: relevantRecords.length >= 5 ? "high" : "medium",
    reasoning: `For ${taskType} tasks, you typically ${avgErrorForType > 0 ? "underestimate" : "overestimate"} by ${Math.abs(Math.round(avgErrorForType))} minutes based on ${relevantRecords.length} similar sessions.`,
  };
}

function inferTaskType(task: string): string {
  const keywords: Record<string, string[]> = {
    debug: ["fix", "bug", "error", "debug", "broken", "issue", "fails", "crash"],
    code_review: ["review", "refactor", "clean up", "improve", "optimize", "simplify"],
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

export type TaskType = ReturnType<typeof inferTaskType>;
