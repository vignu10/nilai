export type Session = {
  id: string;
  task: string;
  done_criteria: string[];
  time_box_minutes: number;
  intensity: "low" | "medium" | "high";
  started_at: string;
  milestones: { at: string; text: string }[];
  parked_count: number;
  status: "active" | "ended";
  ended_at?: string;
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
