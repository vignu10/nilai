export type Snapshot = {
  last_file: string;
  last_line: number | null;
  last_action: string;
  last_tool: string;
  at: string;
};

export type Session = {
  id: string;
  task: string;
  done_criteria: string[];
  time_box_minutes: number;
  intensity: "low" | "medium" | "high";
  started_at: string;
  milestones: { at: string; text: string }[];
  parked_count: number;
  status: "active" | "downtime" | "ended" | "abandoned";
  ended_at?: string;
  snapshot?: Snapshot;
  abandoned_at?: string;
  abandonment_reason?: "idle" | "user_ended" | "replaced";
  scope_expansions?: { at: string; description: string; new_timebox?: number }[];
  // Downtime-specific fields (present when status === "downtime")
  downtime_type?: "break" | "maintenance" | "awaiting";
  downtime_max_minutes?: number;
  downtime_warned_at?: string;
  // Energy tracking fields
  energy_start?: number; // 1-5 scale at session start
  energy_end?: number; // 1-5 scale at session end
  // Estimation calibration fields
  estimated_minutes?: number; // Original user estimate if different from time_box
  estimation_confidence?: "high" | "medium" | "low"; // User's confidence in estimate
  // Template tracking
  template_id?: string; // Reference to template used (if any)
  // Stuck detection state
  last_milestone_at?: string; // Timestamp of last milestone for stuck detection
  stuck_prompted_at?: string; // Last time we asked if user is stuck
  stuck_responses?: { timestamp: string; response: string }[]; // Track stuck responses
  // Break reminder state
  break_type?: "pomodoro_25" | "pomodoro_45" | "custom";
  breaks_taken?: { timestamp: string; duration_minutes: number }[];
  next_break_at?: string; // ISO timestamp for next scheduled break
  break_prompted_at?: string; // Last time we prompted for break
};

import { readFile, writeFile, unlink } from "node:fs/promises";
import { sessionPath, ensureFocusDirs } from "./paths.js";

export async function readSession(cwd: string): Promise<Session | null> {
  const path = sessionPath(cwd);
  try {
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

export async function writeSession(cwd: string, session: Session): Promise<void> {
  ensureFocusDirs(cwd);
  const path = sessionPath(cwd);
  await writeFile(path, JSON.stringify(session, null, 2), "utf-8");
}

export async function deleteSession(cwd: string): Promise<void> {
  const path = sessionPath(cwd);
  try {
    await unlink(path);
  } catch {
    // already gone
  }
}

export function assertActive(session: Session | null): Session {
  if (!session || session.status !== "active") {
    throw new Error("No active focus session. Start one with focus_start.");
  }
  return session;
}
